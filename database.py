import os
import pyodbc
from flask import g
from supabase import create_client, Client
import cloudinary
from dotenv import load_dotenv

load_dotenv()

cloudinary.config (
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

def db_connection():
    driver = "ODBC Driver 18 for SQL Server"
    server = os.getenv('DB_SERVER')
    database = os.getenv('DB_DATABASE')
    username = os.getenv('DB_USERNAME')
    password = os.getenv('DB_PASSWORD')
    
    conn_str = f"DRIVER={{{driver}}};SERVER={server},1433;DATABASE={database};UID={username};PWD={password};Encrypt=yes;TrustServerCertificate=yes;Connection Timeout=30;"
    
    return pyodbc.connect(conn_str)

def get_db():
    if 'db' not in g:
        g.db = db_connection()
    return g.db
