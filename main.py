from fastapi import FastAPI, Form, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Enable CORS for frontend (React localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
complaints = []

class Complaint(BaseModel):
    id: int
    title: str
    category: str
    status: str
    lat: float
    lng: float

@app.post("/complaints", status_code=status.HTTP_201_CREATED)
async def create_complaint(
    category: str = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
):
    complaint = Complaint(
        id=len(complaints) + 1,
        title=f"{category} Issue",
        category=category,
        status="Pending",
        lat=lat,
        lng=lng
    )
    complaints.append(complaint)
    return {"status": "success", "complaint": complaint.dict()}

@app.get("/complaints", response_model=List[Complaint])
def get_complaints():
    return complaints

@app.get("/analytics")
def get_analytics():
    pending_count = sum(1 for c in complaints if c.status.lower() == "pending")
    resolved_count = len(complaints) - pending_count
    categories = {}
    for c in complaints:
        categories[c.category] = categories.get(c.category, 0) + 1
    return {
        "total": len(complaints),
        "pending": pending_count,
        "resolved": resolved_count,
        "categories": categories,
    }
