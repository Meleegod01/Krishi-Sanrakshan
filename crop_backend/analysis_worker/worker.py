
import os
import pika
import json
import time
import requests
import psycopg2

# --- Configuration ---
RABBITMQ_URL = os.environ.get('RABBITMQ_URL', 'amqp://localhost')
ML_API_URL = os.environ.get('ML_API_URL', 'http://localhost:8001')
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgres://user:password@localhost:5434/cropic_db')
QUEUE_NAME = 'submission_queue'
DLQ_NAME = 'submission_dlq'
DLX_NAME = 'submission_dlx'

FUSION_QUEUE_NAME = 'fusion_queue'
FUSION_DLQ_NAME = 'fusion_dlq'
FUSION_DLX_NAME = 'fusion_dlx'

# --- Database Connection ---
def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

# --- Main Worker Logic ---
def process_message(channel, method, properties, body):
    """Callback function to process a message from the queue."""
    submission_id = None
    try:
        message = json.loads(body)
        submission_id = message.get('submission_id')
        file_path = message.get('file_path')

        if not submission_id or not file_path:
            print("Malformed message received. Discarding.")
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        print(f"[Submission {submission_id}] Processing started for file: {file_path}")

        # 1. Call the ML service for analysis
        try:
            print(f"[Submission {submission_id}] Calling ML service...")
            ml_response = requests.post(f"{ML_API_URL}/analyze", json={"file_path": file_path})
            ml_response.raise_for_status()
            analysis_result = ml_response.json()
            print(f"[Submission {submission_id}] Analysis received.")
            status = 'COMPLETED'
            result_json = json.dumps(analysis_result)

        except requests.RequestException as e:
            print(f"[Submission {submission_id}] Error calling ML service: {e}. Marking as FAILED.")
            status = 'FAILED'
            result_json = json.dumps({"error": "Failed to analyze image.", "details": str(e)})

        # 2. Save result to DB
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            'UPDATE submissions SET status = %s, analysis_result_json = %s WHERE id = %s',
            (status, result_json, submission_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        print(f"[Submission {submission_id}] Database updated with status: {status}")

        # 3. Acknowledge the message
        channel.basic_ack(delivery_tag=method.delivery_tag)
        print(f"[Submission {submission_id}] Processing finished successfully.")

        # 4. If analysis was successful, send message to data fusion queue
        if status == 'COMPLETED':
            fusion_message = {"submission_id": submission_id}
            channel.basic_publish(
                exchange='', # Use the default exchange
                routing_key=FUSION_QUEUE_NAME, # Route directly to the fusion queue
                body=json.dumps(fusion_message),
                properties=pika.BasicProperties(delivery_mode=2) # Make message persistent
            )
            print(f"[Submission {submission_id}] Sent to fusion queue.")

    except json.JSONDecodeError:
        print("Failed to decode message body. Discarding (sending to DLQ).")
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    except (Exception, psycopg2.Error) as e:
        print(f"An unexpected error occurred for submission {submission_id}: {e}")
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def main():
    """Connects to RabbitMQ and starts consuming messages."""
    connection = None
    while True:
        try:
            print("Connecting to RabbitMQ...")
            connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
            channel = connection.channel()

            # Declare the Dead-Letter Exchange and Queue for submission_queue
            channel.exchange_declare(exchange=DLX_NAME, exchange_type='direct', durable=True)
            channel.queue_declare(queue=DLQ_NAME, durable=True)
            channel.queue_bind(queue=DLQ_NAME, exchange=DLX_NAME, routing_key=QUEUE_NAME)

            # Declare the main submission queue with dead-lettering configuration
            queue_args = {
                "x-dead-letter-exchange": DLX_NAME,
                "x-dead-letter-routing-key": QUEUE_NAME
            }
            channel.queue_declare(queue=QUEUE_NAME, durable=True, arguments=queue_args)

            # Declare the Dead-Letter Exchange and Queue for fusion_queue
            channel.exchange_declare(exchange=FUSION_DLX_NAME, exchange_type='direct', durable=True)
            channel.queue_declare(queue=FUSION_DLQ_NAME, durable=True)
            channel.queue_bind(queue=FUSION_DLQ_NAME, exchange=FUSION_DLX_NAME, routing_key=FUSION_QUEUE_NAME)

            # Declare the main fusion queue with dead-lettering configuration
            fusion_queue_args = {
                "x-dead-letter-exchange": FUSION_DLX_NAME,
                "x-dead-letter-routing-key": FUSION_QUEUE_NAME
            }
            channel.queue_declare(queue=FUSION_QUEUE_NAME, durable=True, arguments=fusion_queue_args)
            
            print(f"Worker is waiting for messages in queue: '{QUEUE_NAME}'. To exit press CTRL+C")

            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=QUEUE_NAME, on_message_callback=process_message)

            channel.start_consuming()

        except pika.exceptions.AMQPConnectionError as e:
            print(f"RabbitMQ connection failed: {e}. Retrying in 5 seconds...")
            if connection and not connection.is_closed:
                connection.close()
            time.sleep(5)
        except Exception as e:
            print(f"An unexpected error occurred in main loop: {e}. Restarting...")
            if connection and not connection.is_closed:
                connection.close()
            time.sleep(5)

if __name__ == '__main__':
    main()
