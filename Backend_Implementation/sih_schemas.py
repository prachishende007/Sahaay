from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# BaseModel → all Pydantic schemas inherit from this.

# Optional → allows some fields to be empty.

class ComplaintCreate(BaseModel):
  description:str
  lat:float
  lon:float
  media_url: str  # required now
  category: Optional[str] = None
  
#   User must provide description, lat, and lon.

# They don’t provide id, status, or created_at → those are generated automatically.

class ComplaintResponse(BaseModel):
    id: str
    description: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    media_url: str  # required
    assigned_to: Optional[str] = None
    feedback_rating: Optional[float] = None
    feedback_comment: Optional[str] = None
    category: Optional[str] = None

    class Config:
        from_attributes = True
    
#     API returns everything, including id, status, and created_at.

# orm_mode = True → allows Pydantic to work directly with SQLAlchemy objects.

