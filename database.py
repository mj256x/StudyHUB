import os
from psycopg2 import pool
from flask import g
from supabase import create_client, Client
import cloudinary
from dotenv import load_dotenv

load_dotenv(override=True)

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

connection_pool = pool.ThreadedConnectionPool(
    minconn=1,
    maxconn=10,
    dsn=os.getenv('DATABASE_URL'),
    keepalives=1,
    keepalives_idle=30,
    keepalives_interval=10,
    keepalives_count=5
)

def get_db():
    if 'db' not in g:
        g.db = connection_pool.getconn()
    
    # Detect stale connections and swap them out before use
    conn = g.db
    try:
        conn.cursor().execute("SELECT 1")
    except Exception:
        connection_pool.putconn(conn, close=True)
        g.db = connection_pool.getconn()

    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        connection_pool.putconn(db)

def init_app(app):
    app.teardown_appcontext(close_db)