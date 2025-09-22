from fastapi import FastAPI, Depends, HTTPException, Header, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from uuid import uuid4
import os
import sih_crud
from sih_database import SessionLocal, Base
from sih_models import Complaint
from sih_schemas import ComplaintCreate, ComplaintResponse

# ------------------ FastAPI App ------------------
app = FastAPI(title="SIH Backend API")

# ------------------ CORS ------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for dev
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

# ------------------ Upload Directory ------------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ------------------ Complaint Submission ------------------
@app.post("/complaints/", response_model=ComplaintResponse)
async def create_complaint(
    description: str = Form(...),
    lat: float = Form(...),
    lon: float = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    # Step 1: create complaint in DB
    new_complaint = sih_crud.create_complaint(db, description, lat, lon, media_url=None)

    # Step 2: handle file upload
    if file:
        file_ext = file.filename.split(".")[-1]
        file_name = f"{uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        new_complaint.media_url = f"/{UPLOAD_DIR}/{file_name}"
        db.commit()
        db.refresh(new_complaint)

    # Step 3: AI placeholder for category
    desc_lower = description.lower()
    if "road" in desc_lower or "pothole" in desc_lower:
        new_complaint.category = "Road Issue"
    elif "water" in desc_lower:
        new_complaint.category = "Water Supply"
    else:
        new_complaint.category = "Other"
    db.commit()
    db.refresh(new_complaint)

    return new_complaint

# ------------------ Get Complaint ------------------
@app.get("/complaints/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: str, db: Session = Depends(get_db)):
    db_complaint = sih_crud.get_complaint(db, complaint_id)
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return db_complaint

# ------------------ Get All Complaints ------------------
@app.get("/complaints/", response_model=list[ComplaintResponse])
def get_all_complaints(db: Session = Depends(get_db)):
    return sih_crud.get_all_complaints(db)

# ------------------ Update Status ------------------
@app.patch("/complaints/{complaint_id}/status", response_model=ComplaintResponse)
def update_status(complaint_id: str, status: str = Form(...), db: Session = Depends(get_db)):
    valid_status = ["submitted", "in_review", "in_progress", "resolved"]
    if status.lower() not in valid_status:
        raise HTTPException(status_code=400, detail="Invalid status")
    db_complaint = sih_crud.get_complaint(db, complaint_id)
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    db_complaint.status = status.lower()
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

# ------------------ Assign Complaint ------------------
@app.patch("/complaints/{complaint_id}/assign", response_model=ComplaintResponse)
def assign_complaint(complaint_id: str, staff_id: str = Form(...), db: Session = Depends(get_db)):
    db_complaint = sih_crud.get_complaint(db, complaint_id)
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    db_complaint.assigned_to = staff_id
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

# ------------------ Add Feedback ------------------
@app.post("/complaints/{complaint_id}/feedback", response_model=ComplaintResponse)
def add_feedback(complaint_id: str, rating: float = Form(...), comment: str = Form(...), db: Session = Depends(get_db)):
    db_complaint = sih_crud.get_complaint(db, complaint_id)
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    db_complaint.feedback_rating = rating
    db_complaint.feedback_comment = comment
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

# ------------------ Analytics Summary ------------------
@app.get("/analytics/summary")
def analytics_summary(db: Session = Depends(get_db)):
    total = db.query(Complaint).count()
    resolved = db.query(Complaint).filter(Complaint.status == "resolved").count()
    in_progress = db.query(Complaint).filter(Complaint.status == "in_progress").count()
    by_category = {}
    for cat in ["Road Issue", "Water Supply", "Other"]:
        by_category[cat] = db.query(Complaint).filter(Complaint.category == cat).count()
    return {"total": total, "resolved": resolved, "in_progress": in_progress, "by_category": by_category}
