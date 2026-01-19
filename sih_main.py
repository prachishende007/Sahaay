from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import sih_crud
from sih_database import SessionLocal
from sih_models import Complaint
from sih_schemas import ComplaintResponse
from sih_supabase import supabase

# ------------------ FastAPI App ------------------
app = FastAPI(title="SIH Backend API")

# ------------------ CORS ------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# ------------------ Create Complaint ------------------
@app.post("/complaints/", response_model=ComplaintResponse)
def create_complaint(
    description: str = Form(...),
    lat: float = Form(...),
    lon: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1️⃣ Create complaint in DB
    new_complaint = sih_crud.create_complaint(
        db=db,
        description=description,
        lat=lat,
        lon=lon,
        media_url=None
    )

    # 2️⃣ Upload media to Supabase
    file_ext = file.filename.split(".")[-1]
    file_name = f"{new_complaint.id}.{file_ext}"
    file_bytes = file.file.read()
    bucket = "Sahaay_Complaints-Media"

    try:
        supabase.storage.from_(bucket).upload(
            file_name,
            file_bytes,
            {"content-type": file.content_type}
        )
    except Exception as e:
        db.delete(new_complaint)
        db.commit()
        raise HTTPException(status_code=500, detail="Media upload failed")

    # 3️⃣ Public URL
    public_url = supabase.storage.from_(bucket).get_public_url(file_name)
    new_complaint.media_url = public_url

    # 4️⃣ Auto category
    desc = description.lower()
    if "road" in desc or "pothole" in desc:
        new_complaint.category = "Road Issue"
    elif "water" in desc:
        new_complaint.category = "Water Supply"
    else:
        new_complaint.category = "Other"

    db.commit()
    db.refresh(new_complaint)
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
    resolved = db.query(Complaint).filter(Complaint.status == "resolved").count()
    in_progress = db.query(Complaint).filter(Complaint.status == "in_progress").count()

    by_category = {}
    for cat in ["Road Issue", "Water Supply", "Other"]:
        by_category[cat] = db.query(Complaint).filter(Complaint.category == cat).count()

    return {
        "total": total,
        "resolved": resolved,
        "in_progress": in_progress,
        "by_category": by_category
    }
