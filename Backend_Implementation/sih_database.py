#Step 1 - Import Required pacages
import os  #helps your backend interact with the system safely and dynamically without hardcoding paths or secrets.
from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

#Step 2 - Load the database url
load_dotenv()  #Now Python can read .env where we have stored the database link

DATABASE_URL = os.getenv(" 'https://rgejpuecsrsdepoxkhaw.supabase.co'")  # Reads database url from .env

#Step3 - create a database engine

#The engine is like a bridge between Python and the database.

#SQLAlchemy’s create_engine does this.

engine = create_engine(
   DATABASE_URL,
   connect_args={"check_same_thread":False} # this is only for sql lite
   if "sqlite" in DATABASE_URL 
   else{} # this statement will automatically ignore sqlite when we switch to postgres
   
  )

# step 4 - Setup a Session
# A session is like a pen you use to write on the database.

# Every time you want to add/get data, you open a session, do operations, then commit or rollback.

SessionLocal = sessionmaker (
  autocommit = False, #Don't auto save changes
  autoflush = False,  #Don't auto sync changes before commit
  bind = engine  #which engine to use
)

#Step 5 - Setup a base class for models
# SQLAlchemy models (tables) inherit from a base class.

# Base keeps track of all tables we create.

Base = declarative_base()







