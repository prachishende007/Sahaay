#Step 1

from sqlalchemy import Column, String, Text, Float, DateTime
from sih_database import Base
import uuid
import datetime

#Step1 - Description

# Column → defines each column in the table.

# String, Text, Float, DateTime → types for the columns.

# Base → comes from sih_database.py (all models must inherit this).

# uuid → to generate unique IDs.

# datetime → to store timestamps (when complaint was created).

# Step 2 - Defining the Models

class Complaint(Base):
  __tablename__ = "complaints"  #Table name in database
  
  id = Column(String, primary_key = True, default = lambda:str(uuid.uuid4()) )
  description = Column(Text, nullable = False)
  lat = Column(Float, nullable=False)
  lon = Column(Float, nullable = False)
  category = Column(String, nullable=True)

  status = Column(String, default= "submitted")
  created_at = Column(DateTime, default = datetime.datetime.utcnow)
  media_url = Column(String, nullable=True)  # NEW field
  assigned_to = Column(String, nullable=True)  # staff_id
  
  feedback_rating = Column(Float, nullable=True)
  feedback_comment = Column(Text, nullable=True)

  

  
#   Explanation:

# id → unique complaint ID (UUID string).

# description → details of complaint.

# lat + lon → location coordinates.

# status → default is "submitted".

# created_at → timestamp when complaint was added.

