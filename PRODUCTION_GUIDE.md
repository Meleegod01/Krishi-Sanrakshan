# 🌍 Krishi-Sanrakshan: Hybrid Deployment Guide

This guide contains the environment variables and settings you need to host the project online for free.

---

## 1. Database (Neon.tech)
**Action:** Create a Postgres project on [Neon.tech](https://neon.tech/).
*   **Initialization:** Run the SQL from `crop_backend/db/init.sql` in the Neon SQL Editor.
*   **Variable to Save:** `DATABASE_URL` (e.g., `postgres://user:pass@host/neondb?sslmode=require`)

## 2. Message Queue (CloudAMQP)
**Action:** Create a "Little Lemur" instance on [CloudAMQP](https://www.cloudamqp.com/).
*   **Variable to Save:** `RABBITMQ_URL` (e.g., `amqps://user:pass@host/vhost`)

---

## 3. Backend Services (Koyeb)
You need to deploy these 4 services on [Koyeb](https://www.koyeb.com/).

### Service A: Ingestion API
*   **Context Dir:** `crop_backend/ingestion_api`
*   **Variables:**
    *   `DATABASE_URL`: (From Neon)
    *   `RABBITMQ_URL`: (From CloudAMQP)
    *   `SECRET_KEY`: (A random long string for JWT)

### Service B: Dashboard API
*   **Context Dir:** `crop_backend/dashboard_api`
*   **Variables:**
    *   `DATABASE_URL`: (From Neon)

### Service C: ML Service
*   **Context Dir:** `crop_backend/ml_service`
*   **Variables:** *None required for mock version.*

### Service D: Analysis Worker
*   **Context Dir:** `crop_backend/analysis_worker`
*   **Variables:**
    *   `DATABASE_URL`: (From Neon)
    *   `RABBITMQ_URL`: (From CloudAMQP)
    *   `ML_API_URL`: (The URL of Service C above)

---

## 4. Frontends (Vercel)
Deploy these using the [Vercel Dashboard](https://vercel.com/).

### Frontend A: Official Dashboard
*   **Root Directory:** `dashboard`
*   **Framework:** Next.js
*   **Variables:**
    *   `NEXT_PUBLIC_API_URL`: (The public URL of Service B / Dashboard API)

### Frontend B: Farmer App
*   **Root Directory:** `app`
*   **Framework:** Vite
*   **Variables:**
    *   `VITE_API_URL`: (The public URL of Service A / Ingestion API)

---

## 🚀 Deployment Checklist
1. [ ] Push this entire project to a **GitHub Repository**.
2. [ ] Connect Neon and CloudAMQP first.
3. [ ] Deploy the 4 Koyeb services.
4. [ ] Deploy the 2 Vercel frontends last (so you have the API URLs ready).
