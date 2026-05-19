
import os
import pika
import json
import time
import psycopg2

# --- Configuration ---
RABBITMQ_URL = os.environ.get('RABBITMQ_URL', 'amqp://localhost')
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgres://user:password@localhost:5434/cropic_db')
QUEUE_NAME = 'fusion_queue'
DLQ_NAME = 'fusion_dlq'
DLX_NAME = 'fusion_dlx'

# --- Database Connection ---
def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

import requests

# --- Real External APIs ---
def get_real_weather_data(latitude, longitude):
    print(f"[API] Fetching real weather for {latitude}, {longitude} from Open-Meteo...")
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json().get('current', {})
        return {
            "temperature_c": data.get('temperature_2m'),
            "humidity_percent": data.get('relative_humidity_2m'),
            "precipitation_mm_24h": data.get('precipitation'),
            "wind_speed_kmh": data.get('wind_speed_10m'),
            "source": "Open-Meteo"
        }
    except Exception as e:
        print(f"Error fetching weather: {e}")
        return {"error": "Weather service unavailable"}

def get_mock_satellite_data(latitude, longitude, growth_stage):
    print(f"[Mock API] Fetching satellite data for {latitude}, {longitude}, {growth_stage}...")
    time.sleep(1) # Simulate network delay
    return {
        "ndvi": 0.6 + (latitude % 1) * 0.3, # Normalized Difference Vegetation Index
        "evi": 0.4 + (longitude % 1) * 0.2,  # Enhanced Vegetation Index
        "cloud_cover_percent": 10 + (latitude * longitude % 1) * 20,
        "last_capture_date": "2025-10-25"
    }

# --- Main Worker Logic ---
def process_message(channel, method, properties, body):
    """Callback function to process a message from the queue."""
    submission_id = None
    try:
        message = json.loads(body)
        submission_id = message.get('submission_id')

        if not submission_id:
            print("Malformed message received. Discarding.")
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        print(f"[Submission {submission_id}] Data Fusion started.")

        conn = None
        try:
            conn = get_db_connection()
            cur = conn.cursor()

            # 1. Fetch submission details and analysis results
            cur.execute(
                'SELECT user_id, latitude, longitude, growth_stage, analysis_result_json FROM submissions WHERE id = %s',
                (submission_id,)
            )
            submission_data = cur.fetchone()

            if not submission_data:
                print(f"[Submission {submission_id}] Submission not found in DB. Discarding.")
                channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                return

            user_id, latitude, longitude, growth_stage, analysis_result_json = submission_data

            # 2. Call external APIs
            weather_data = get_real_weather_data(latitude, longitude)
            satellite_data = get_mock_satellite_data(latitude, longitude, growth_stage)

            # 3. Aggregate and perform final assessment (mock for now)
            aggregated_analysis = {
                "ml_analysis": analysis_result_json,
                "weather": weather_data,
                "satellite": satellite_data,
                "summary": f"Crop {analysis_result_json.get('crop')} at {growth_stage} stage. Disease: {analysis_result_json.get('disease')} with {analysis_result_json.get('confidence')*100:.2f}% confidence."
            }
            final_assessment = {
                "overall_health_score": 0.85, # Mock score
                "recommendations": ["Monitor closely", "Consider nutrient application"]
            }

            # 4. Insert into fused_reports table
            cur.execute(
                'INSERT INTO fused_reports (submission_id, user_id, latitude, longitude, growth_stage, aggregated_analysis, weather_data, satellite_data, final_assessment) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)',
                (submission_id, user_id, latitude, longitude, growth_stage, json.dumps(aggregated_analysis), json.dumps(weather_data), json.dumps(satellite_data), json.dumps(final_assessment))
            )

            # 5. Update submission status to FUSED
            cur.execute(
                'UPDATE submissions SET status = %s WHERE id = %s',
                ('FUSED', submission_id)
            )

            conn.commit()
            cur.close()
            conn.close()
            print(f"[Submission {submission_id}] Data Fusion completed and saved to fused_reports.")

            # 6. Acknowledge the message
            channel.basic_ack(delivery_tag=method.delivery_tag)
            print(f"[Submission {submission_id}] Processing finished successfully.")

        except (Exception, psycopg2.Error) as db_error:
            print(f"[Submission {submission_id}] Database or processing error: {db_error}")
            if conn:
                conn.rollback()
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False) # Send to DLQ

    except json.JSONDecodeError:
        print("Failed to decode message body. Discarding (sending to DLQ).")
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False) # Send to DLQ

def main():
    """Connects to RabbitMQ and starts consuming messages."""
    connection = None
    while True:
        try:
            print("Connecting to RabbitMQ...")
            connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
            channel = connection.channel()

            # Declare the Dead-Letter Exchange and Queue for fusion_queue
            channel.exchange_declare(exchange=DLX_NAME, exchange_type='direct', durable=True)
            channel.queue_declare(queue=DLQ_NAME, durable=True)
            channel.queue_bind(queue=DLQ_NAME, exchange=DLX_NAME, routing_key=QUEUE_NAME)

            # Declare the main fusion queue with dead-lettering configuration
            queue_args = {
                "x-dead-letter-exchange": DLX_NAME,
                "x-dead-letter-routing-key": QUEUE_NAME
            }
            channel.queue_declare(queue=QUEUE_NAME, durable=True, arguments=queue_args)
            
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
