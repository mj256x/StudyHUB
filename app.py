import os
from flask import Flask, g, session
from database import get_db
from dotenv import load_dotenv

from routes.home import home_bp
from routes.auth import auth_bp
from routes.user import user_bp
from routes.tasks import tasks_bp
from routes.subjects import subjects_bp
from routes.sessions import sessions_bp

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY')

app.register_blueprint(home_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(tasks_bp)
app.register_blueprint(subjects_bp)
app.register_blueprint(sessions_bp)


@app.teardown_appcontext
def close_db(error):
    db = g.pop('db', None)
    if db is not None:
        try:
            db.close()
        except Exception as e:
            print(f"Error closing database connection: {e}")

@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.context_processor
def inject_subjects():
    if 'user_id' in session:
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT name, id FROM subjects WHERE user_id = ?", (session['user_id'],))
            Subjects = cursor.fetchall()
            cursor.execute("SELECT username, email, FORMAT(updated_at, 'dd MMM yyyy'), profile_picture FROM users WHERE id = ?", (session['user_id'],))
            user_info = cursor.fetchone()
            cursor.execute("SELECT DISTINCT subjects.name, subjects.id FROM subjects JOIN main_tasks ON subjects.id = main_tasks.subject_id WHERE subjects.user_id = ?", (session['user_id'],))            
            main_tasks_subjects = cursor.fetchall()
            cursor.close()
            return dict(Subjects=Subjects, user_info=user_info, main_tasks_subjects=main_tasks_subjects)
        except Exception as e:
            print(f"Error fetching subjects for context processor: {e}")
            return dict(Subjects=[], user_info=None, main_tasks_subjects=[])
    return dict(Subjects=[], user_info=None, main_tasks_subjects=[])

if __name__ == '__main__':
    app.run(debug=True)