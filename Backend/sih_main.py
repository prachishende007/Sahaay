from fastapi import (
    FastAPI, Depends, HTTPException,
    UploadFile, File, Form, BackgroundTasks
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import os
import shutil

import sih_crud
from sih_database import SessionLocal
from sih_models import Complaint
from sih_schemas import ComplaintResponse
from sih_supabase import supabase
from ml.yolo_service import detect_on_image

# ------------------ App ------------------
app = FastAPI(title="SIH Backend API")

# ------------------ CORS ------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ Upload Dir ------------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ------------------ DB Dependency ------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ------------------ Root ------------------
@app.get("/")
def root():
    return {"message": "SIH Backend is running"}

# ------------------ Health ------------------
@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "details": str(e)}

# ------------------ Background ML Task ------------------
def run_ml_and_update(db_session_factory, complaint_id: str, image_path: str):
    db = db_session_factory()
    try:
        detections = detect_on_image(image_path)
        print("🧠 ML DETECTIONS:", detections)

        labels = [d["label"].lower() for d in detections]

        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            return

        if "pothole" in labels:
            complaint.category = "Road Issue"
        elif "garbage" in labels:
            complaint.category = "Garbage Issue"
        elif "fallentrees" in labels:
            complaint.category = "Fallen Tree"
        else:
            complaint.category = "Other"

        db.commit()

    finally:
        db.close()
        if os.path.exists(image_path):
            os.remove(image_path)

# ------------------ Create Complaint ------------------
@app.post("/complaints/", response_model=ComplaintResponse)
def create_complaint(
    lat: float = Form(...),
    lon: float = Form(...),
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    # 1️⃣ Create DB entry
    new_complaint = sih_crud.create_complaint(
        db=db,
        lat=lat,
        lon=lon,
        media_url=None
    )

    # 2️⃣ Validate file
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ["jpg", "jpeg", "png"]:
        raise HTTPException(
            status_code=400,
            detail="Only JPG and PNG images are supported"
        )

    file_name = f"{new_complaint.id}.{file_ext}"
    file_bytes = file.file.read()

    local_path = os.path.join(UPLOAD_DIR, file_name)
    with open(local_path, "wb") as f:
        f.write(file_bytes)

    # 3️⃣ Upload to Supabase
    bucket = "Sahaay_Complaints-Media"
    try:
        supabase.storage.from_(bucket).upload(
            file_name,
            file_bytes,
            {"content-type": file.content_type}
        )
    except Exception:
        db.delete(new_complaint)
        db.commit()
        raise HTTPException(status_code=500, detail="Media upload failed")

    # 4️⃣ Save public URL
    new_complaint.media_url = (
        supabase.storage.from_(bucket).get_public_url(file_name)
    )

    # 5️⃣ Initial category (fast response)
    new_complaint.category = "processing"
    db.commit()
    db.refresh(new_complaint)

    # 6️⃣ Run ML asynchronously
    background_tasks.add_task(
        run_ml_and_update,
        SessionLocal,
        new_complaint.id,
        local_path
    )

    return new_complaint

# ------------------ Get Complaint ------------------
@app.get("/complaints/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: str, db: Session = Depends(get_db)):
    complaint = sih_crud.get_complaint(db, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint

# ------------------ Get All Complaints ------------------
@app.get("/complaints/", response_model=list[ComplaintResponse])
def get_all_complaints(db: Session = Depends(get_db)):
    return sih_crud.get_all_complaints(db)

# ------------------ Update Status ------------------
@app.patch("/complaints/{complaint_id}/status", response_model=ComplaintResponse)
def update_status(
    complaint_id: str,
    status: str = Form(...),
    db: Session = Depends(get_db)
):
    valid_status = ["submitted", "in_review", "in_progress", "resolved"]
    if status.lower() not in valid_status:
        raise HTTPException(status_code=400, detail="Invalid status")

    complaint = sih_crud.get_complaint(db, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.status = status.lower()
    db.commit()
    db.refresh(complaint)
    return complaint

# ------------------ Assign Complaint ------------------
@app.patch("/complaints/{complaint_id}/assign", response_model=ComplaintResponse)
def assign_complaint(
    complaint_id: str,
    staff_id: str = Form(...),
    db: Session = Depends(get_db)
):
    complaint = sih_crud.get_complaint(db, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.assigned_to = staff_id
    db.commit()
    db.refresh(complaint)
    return complaint

# ------------------ Add Feedback ------------------
@app.post("/complaints/{complaint_id}/feedback", response_model=ComplaintResponse)
def add_feedback(
    complaint_id: str,
    rating: float = Form(...),
    comment: str = Form(...),
    db: Session = Depends(get_db)
):
    complaint = sih_crud.get_complaint(db, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.feedback_rating = rating
    complaint.feedback_comment = comment
    db.commit()
    db.refresh(complaint)
    return complaint

# ------------------ Analytics ------------------
@app.get("/analytics/summary")
def analytics_summary(db: Session = Depends(get_db)):
    total = db.query(Complaint).count()
    resolved = db.query(Complaint).filter(
        Complaint.status == "resolved"
    ).count()
    in_progress = db.query(Complaint).filter(
        Complaint.status == "in_progress"
    ).count()

    by_category = {}
    for cat in ["Road Issue", "Garbage Issue", "Fallen Tree", "Other"]:
        by_category[cat] = (
            db.query(Complaint)
            .filter(Complaint.category == cat)
            .count()
        )

    return {
        "total": total,
        "resolved": resolved,
        "in_progress": in_progress,
        "by_category": by_category
    }

# ------------------ Detect Image (Debug Only) ------------------
@app.post("/detect-image")
def detect_image(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    detections = detect_on_image(file_path)

    if os.path.exists(file_path):
        os.remove(file_path)

    return {"detections": detections}
