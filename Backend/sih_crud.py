from sqlalchemy.orm import Session
from sih_models import Complaint
import uuid

# Session → to interact with the database.

# Complaint → our model (table).

# uuid → to generate unique complaint IDs.
def create_complaint(db: Session, description: str = "", lat: float = 0.0, lon: float = 0.0, media_url: str = None, category: str = None):

    new_complaint = Complaint(
        id=str(uuid.uuid4()),
        # description=description,
        lat=lat,
        lon=lon,
        media_url=media_url,
        category=None  # Always None initially
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    return new_complaint

#   Creates a new complaint.

# Adds it to the DB.

# Commits (saves) changes.

# Refresh gets the new complaint back (with ID and created_at).

def get_complaint(db: Session, complaint_id: str):
    return db.query(Complaint).filter(Complaint.id == complaint_id).first()

# Finds a complaint by its ID.

def get_all_complaints(db: Session):
    return db.query(Complaint).all()
  
  # Returns a list of all complaints.

