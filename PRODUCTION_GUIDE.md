# 🌍 Krishi-Sanrakshan: FREE Hybrid Deployment Guide

This is the simplified **"No Credit Card"** guide to host your app permanently for free.

---

## 1. Prerequisites (Free & No Credit Card)
1.  **Database:** [Neon.tech](https://neon.tech/) (Free Postgres)
2.  **Queue:** [CloudAMQP](https://www.cloudamqp.com/) (Free RabbitMQ)
3.  **Backend:** [Hugging Face Spaces](https://huggingface.co/spaces) (Free Docker Hosting)
4.  **Frontend:** [Vercel](https://vercel.com/) (Free Web Hosting)

---

## 2. Step-by-Step Instructions

### Step A: Initialize the Database (Neon)
1. Create a project on Neon.
2. Run the SQL from `crop_backend/db/init.sql` in their SQL Editor.
3. Save your `DATABASE_URL`.

### Step B: Create the Queue (CloudAMQP)
1. Create a "Little Lemur" instance.
2. Save your `AMQP URL` (starts with `amqps://`).

### Step C: Deploy Backend (Hugging Face Spaces)
1. Go to [Hugging Face Spaces](https://huggingface.co/new-space).
2. **Name:** `krishi-backend`
3. **SDK:** Select **Docker**.
4. **Template:** Blank.
5. **Privacy:** Public.
6. Once created, go to **Settings -> Variables and Secrets**.
7. Add these **Secrets**:
    *   `DATABASE_URL`: (Your Neon URL)
    *   `RABBITMQ_URL`: (Your CloudAMQP URL)
    *   `ML_API_URL`: `http://localhost:8001`
8. Upload your code or connect your GitHub. Hugging Face will find the `crop_backend/monolith/Dockerfile` (you may need to move it to the root or tell HF where it is).

### Step D: Deploy Frontends (Vercel)
1.  **Dashboard:** Root `dashboard`. 
    *   `NEXT_PUBLIC_API_URL`: (The URL Hugging Face gives you for port 8002)
2.  **Farmer App:** Root `app`.
    *   `VITE_API_URL`: (The URL Hugging Face gives you for port 3000)

---

## 🚀 Why this works?
By using the **Monolith** folder I created, you run all 4 backend services in **one** free space. No need for multiple Koyeb apps or credit cards.
