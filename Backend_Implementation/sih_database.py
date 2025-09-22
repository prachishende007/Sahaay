#Step 1 - Import Required pacages
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

#Step 2 - Load the database url
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

#Step 3 - create a database engine
# CORRECTED ENGINE CREATION
connect_args = {}
# The check for DATABASE_URL being None is a safety measure
if DATABASE_URL and "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)

# step 4 - Setup a Session
SessionLocal = sessionmaker (
    autocommit=False,
    autoflush=False,
    bind=engine
)

#Step 5 - Setup a base class for models
Base = declarative_base()
Base.metadata.create_all(bind=engine)