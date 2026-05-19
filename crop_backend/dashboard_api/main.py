
import os
import json
import psycopg2
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# --- Configuration ---
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgres://user:password@localhost:5434/cropic_db')

# --- Database Connection ---
def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

# --- Pydantic Models for Response ---
class FusedReportBase(BaseModel):
    id: int
    submission_id: int
    user_id: int
    latitude: float
    longitude: float
    growth_stage: Optional[str]
    aggregated_analysis: dict
    weather_data: dict
    satellite_data: dict
    final_assessment: dict
    created_at: str # Will be ISO formatted string

class ReportMapItem(BaseModel):
    id: int
    submission_id: int
    latitude: float
    longitude: float
    status: str
    overall_health_score: Optional[float]

class AlertItem(BaseModel):
    id: int
    submission_id: int
    latitude: float
    longitude: float
    alert_level: str
    summary: str

# --- Routes ---
@app.get('/')
def health_check():
    return {"status": "Dashboard API is running."}

class StatusUpdate(BaseModel):
    status: str

class AssessmentUpdate(BaseModel):
    overall_health_score: float
    recommendations: List[str]

@app.put('/alerts/{submission_id}/status')
def update_alert_status(submission_id: int, update: StatusUpdate):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        # In a real app, alerts might have their own table, but here we update the submission status
        cur.execute(
            "UPDATE submissions SET status = %s WHERE id = %s",
            (update.status, submission_id)
        )
        conn.commit()
        return {"message": "Status updated successfully"}
    except Exception as e:
        print(f"Error updating alert status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if conn:
            conn.close()

@app.put('/reports/{submission_id}/assessment')
def update_report_assessment(submission_id: int, update: AssessmentUpdate):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "UPDATE fused_reports SET final_assessment = %s WHERE submission_id = %s",
            (json.dumps(update.model_dump()), submission_id)
        )
        conn.commit()
        return {"message": "Assessment updated successfully"}
    except Exception as e:
        print(f"Error updating assessment: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if conn:
            conn.close()

@app.get('/reports', response_model=List[FusedReportBase])
def get_all_reports(skip: int = 0, limit: int = 100):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT fr.id, fr.submission_id, fr.user_id, fr.latitude, fr.longitude, fr.growth_stage, fr.aggregated_analysis, fr.weather_data, fr.satellite_data, fr.final_assessment, fr.created_at, s.status FROM fused_reports fr JOIN submissions s ON fr.submission_id = s.id ORDER BY fr.created_at DESC OFFSET %s LIMIT %s",
            (skip, limit)
        )
        reports = []
        for row in cur.fetchall():
            report_dict = {
                "id": row[0],
                "submission_id": row[1],
                "user_id": row[2],
                "latitude": float(row[3]),
                "longitude": float(row[4]),
                "growth_stage": row[5],
                "aggregated_analysis": row[6],
                "weather_data": row[7],
                "satellite_data": row[8],
                "final_assessment": row[9],
                "created_at": row[10].isoformat(),
                "status": row[11] # Include status from submissions table
            }
            reports.append(report_dict)
        return reports
    except Exception as e:
        print(f"Error fetching reports: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if conn:
            conn.close()

@app.get('/reports/map', response_model=List[ReportMapItem])
def get_map_reports():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT fr.id, fr.submission_id, fr.latitude, fr.longitude, s.status, (fr.final_assessment->>'overall_health_score')::float FROM fused_reports fr JOIN submissions s ON fr.submission_id = s.id WHERE fr.latitude IS NOT NULL AND fr.longitude IS NOT NULL ORDER BY fr.created_at DESC"
        )
        map_items = []
        for row in cur.fetchall():
            map_items.append({
                "id": row[0],
                "submission_id": row[1],
                "latitude": float(row[2]),
                "longitude": float(row[3]),
                "status": row[4],
                "overall_health_score": row[5]
            })
        return map_items
    except Exception as e:
        print(f"Error fetching map reports: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if conn:
            conn.close()

@app.get('/reports/{submission_id}', response_model=FusedReportBase)
def get_report_by_submission_id(submission_id: int):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT fr.id, fr.submission_id, fr.user_id, fr.latitude, fr.longitude, fr.growth_stage, fr.aggregated_analysis, fr.weather_data, fr.satellite_data, fr.final_assessment, fr.created_at, s.status FROM fused_reports fr JOIN submissions s ON fr.submission_id = s.id WHERE fr.submission_id = %s",
            (submission_id,)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Report not found")
        
        report_dict = {
            "id": row[0],
            "submission_id": row[1],
            "user_id": row[2],
            "latitude": float(row[3]),
            "longitude": float(row[4]),
            "growth_stage": row[5],
            "aggregated_analysis": row[6],
            "weather_data": row[7],
            "satellite_data": row[8],
            "final_assessment": row[9],
            "created_at": row[10].isoformat(),
            "status": row[11]
        }
        return report_dict
    except Exception as e:
        print(f"Error fetching report {submission_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if conn:
            conn.close()

@app.get('/alerts', response_model=List[AlertItem])
def get_alerts(min_health_score: float = 0.7, skip: int = 0, limit: int = 100):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT fr.id, fr.submission_id, fr.latitude, fr.longitude, (fr.final_assessment->>'overall_health_score')::float, fr.aggregated_analysis->>'summary' FROM fused_reports fr WHERE (fr.final_assessment->>'overall_health_score')::float < %s ORDER BY fr.created_at DESC OFFSET %s LIMIT %s",
            (min_health_score, skip, limit)
        )
        alerts = []
        for row in cur.fetchall():
            alerts.append({
                "id": row[0],
                "submission_id": row[1],
                "latitude": float(row[2]),
                "longitude": float(row[3]),
                "alert_level": "HIGH" if row[4] < 0.5 else "MEDIUM", # Simple mock logic
                "summary": row[5]
            })
        return alerts
    except Exception as e:
        print(f"Error fetching alerts: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if conn:
            conn.close()
