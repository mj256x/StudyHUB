import os
import pyodbc
from flask import Flask, render_template, request, redirect, url_for, session, flash, g
from supabase import create_client, Client
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY')

url: str = os.getenv('SUPABASE_URL')
key: str = os.getenv('SUPABASE_KEY')
supabase: Client = create_client(url, key)

def db_connection():
    driver = "ODBC Driver 18 for SQL Server"
    server = os.getenv('DB_SERVER')
    database = os.getenv('DB_DATABASE')
    username = os.getenv('DB_USERNAME')
    password = os.getenv('DB_PASSWORD')
    
    conn_str = f"DRIVER={{{driver}}};SERVER={server},1433;DATABASE={database};UID={username};PWD={password};Encrypt=yes;TrustServerCertificate=yes;Connection Timeout=30;"
    
    return pyodbc.connect(conn_str)

# Database connection management
def get_db():
    if 'db' not in g:
        g.db = db_connection()
    return g.db

# Close the database connection at the end of each request
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

@app.route('/')
def homepage():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('homepage.html')

@app.route('/index')
def index():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('index.html')

# User login
@app.route('/login', methods=['GET', 'POST'])
def login():
    # Check if user is already logged in
    if 'user_id' in session:
        return redirect(url_for('index'))
    # Handle login form submission
    if request.method == 'POST':
        username_email = request.form['username']
        password = request.form['password']

        if not username_email or not password:
            flash('Please enter both username/email and password', 'danger')
            return redirect(url_for('login'))
        # Fetch user from database
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT id, password_hash FROM users WHERE username = ? OR email = ?", (username_email, username_email))
            user = cursor.fetchone()
            cursor.close()
        except Exception as e:
            flash('Error occurred while fetching user data, Please try refreshing the page.', 'danger')
            print(f"Database error: {e}")
            return redirect(url_for('login'))
        # Verify password
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            return redirect(url_for('index'))
        else:
            flash('Invalid username/email or password', 'danger')

    return render_template('login.html')

# User registration
@app.route('/register', methods=['GET', 'POST'])
def register():
    # Check if user is already logged in
    if 'user_id' in session:
        return redirect(url_for('index'))
    # Handle registration form submission
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        # Validate input
        if not username or not password or not confirm_password or not email:
            flash('Please fill out all fields', 'danger')
            return redirect(url_for('register'))
        if password != confirm_password:
            flash('Passwords do not match', 'danger')
            return redirect(url_for('register'))

        # Hash the password
        password_hash = generate_password_hash(password)

        # Insert the new user into the database
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email))
            if cursor.fetchone():
                flash('Username or email already exists', 'danger')
                return redirect(url_for('register'))
            cursor.execute("INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)", (username, password_hash, email))
            conn.commit()
            cursor.close()
        except Exception as e:
            flash('Error occurred while registering user, Please try again.', 'danger')
            print(f"Database error: {e}")
            return redirect(url_for('register'))
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

# User logout
@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('Logged out successfully!', 'success')
    return redirect(url_for('login'))

@app.route('/subjects', methods=['GET', 'POST'])
def subjects():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    if request.method == 'POST':
        subject_name = request.form['subject_name']
        if not subject_name:
            flash('Please enter a subject name', 'danger')
            return redirect(url_for('subjects'))
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO subjects (name, user_id) VALUES (?, ?)", (subject_name, session['user_id']))
            conn.commit()
            cursor.close()
            flash('Subject added successfully!', 'success')
        except Exception as e:       
            flash('Error occurred while adding subject, Please try again.', 'danger')
            print(f"Database error: {e}")
        return redirect(url_for('subjects'))
    else:
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT id, name FROM subjects WHERE user_id = ?", (session['user_id'],))
            subjects = cursor.fetchall()
            cursor.close()
        except Exception as e:
            flash('Error occurred while fetching subjects, Please try refreshing the page.', 'danger')
            print(f"Database error: {e}")
            subjects = []
        return render_template('subjects.html' , subjects=subjects)
    
@app.route('/subjects_files/<int:subject_id>')
def subject_files(subject_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT file_name, file_url, id FROM files WHERE subject_id = ? AND user_id = ?", (subject_id, session['user_id']))
        files = cursor.fetchall()
        cursor.execute("SELECT name FROM subjects WHERE id = ? AND user_id = ?", (subject_id, session['user_id']))
        subject = cursor.fetchone()
        cursor.execute("SELECT name, id FROM subjects WHERE user_id = ?", (session['user_id'],))
        all_subjects = cursor.fetchall()
        cursor.close()
        if not files:
            flash('No files found for this subject, please upload some files.', 'danger')
    except Exception as e:
        flash('Error occurred while fetching subject files, Please try refreshing the page.', 'danger')
        print(f"Database error: {e}")
        return redirect(url_for('subjects'))
    return render_template('subject_files.html', files=files, subject=subject, subject_id=subject_id, all_subjects=all_subjects)


@app.route('/upload_file/<int:subject_id>', methods=['POST'])
def upload_file(subject_id):
    file = request.files['file']
    if not file:
        flash('No file selected!', 'danger')
        return redirect(request.url)
        
    if len(file.filename) > 40:
        flash('File name is too long. Try to rename it first.', 'danger')
        return redirect(request.url)

    try:
        filename = f"{subject_id}/{file.filename}"
        supabase.storage.from_("files").upload(
            path=filename,
            file=file.read(),
            file_options={"content-type": file.content_type}
        )
        
    except Exception as e:
        flash(f'Error uploading file: {e}', 'danger')

    file_url = supabase.storage.from_("files").get_public_url(filename)

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO files (subject_id, file_name, file_url, user_id) VALUES (?, ?, ?, ?)",
                   (subject_id, file.filename, file_url, session['user_id']))
        conn.commit()
        cursor.close()        
        flash('File uploaded successfully!', 'success')
    except Exception as e:
        flash(f'Error occurred while uploading file: {e}', 'danger')

    return redirect(url_for('subject_files', subject_id=subject_id))


@app.route('/delete_subject/<int:subject_id>', methods=['POST'])
def delete_subject(subject_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT file_name FROM files WHERE subject_id = ? AND user_id = ?", (subject_id, session['user_id']))
        files = cursor.fetchall()
        for file in files:
            supabase.storage.from_("files").remove([f"{subject_id}/{file[0]}"])
        cursor.execute("DELETE FROM subjects WHERE id = ? AND user_id = ?", (subject_id, session['user_id']))
        conn.commit()
        cursor.close()
        flash('Subject deleted successfully!', 'success')
    except Exception as e:
        flash('Error occurred while deleting subject, Please try again.', 'danger')
        print(f"Database error: {e}")

    return redirect(url_for('subjects'))

@app.route('/edit_subject/<int:subject_id>', methods=['POST'])
def edit_subject(subject_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    new_name = request.form['new_name']
    if not new_name:
        flash('Please enter a new subject name', 'danger')
        return redirect(url_for('subjects'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE subjects SET name = ? WHERE id = ? AND user_id = ?", (new_name, subject_id, session['user_id']))
        conn.commit()
        cursor.close()
        flash('Subject updated successfully!', 'success')
    except Exception as e:
        flash('Error occurred while updating subject, Please try again.', 'danger')
        print(f"Database error: {e}")
    return redirect(url_for('subjects'))

@app.route('/move_file', methods=['POST'])
def move_file():
    if 'user_id' not in session:
        return redirect(url_for('login'))
        
    file_id = request.form.get('file_id')
    new_subject_id = request.form.get('new_subject_id')
    
    if not file_id or not new_subject_id:
        flash('Invalid file or subject selected.', 'danger')
        return redirect(url_for('subjects'))
        
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT file_name, subject_id FROM files WHERE id = ? AND user_id = ?", (file_id, session['user_id']))
        file_record = cursor.fetchone()
        
        if not file_record:
            flash('File not found.', 'danger')
            return redirect(url_for('subjects'))
            
        file_name = file_record[0]
        old_subject_id = file_record[1]
        
        old_path = f"{old_subject_id}/{file_name}"
        new_path = f"{new_subject_id}/{file_name}"
        if old_path != new_path:
            supabase.storage.from_("files").move(old_path, new_path)
        else:
            flash('File is already in the selected subject.', 'danger')
            return redirect(url_for('subject_files', subject_id=old_subject_id))
        
        new_file_url = supabase.storage.from_("files").get_public_url(new_path)
        
        cursor.execute("UPDATE files SET subject_id = ?, file_url = ? WHERE id = ? AND user_id = ?",
                       (new_subject_id, new_file_url, file_id, session['user_id']))
        conn.commit()
        cursor.close()
        
        flash('File moved successfully!', 'success')
        return redirect(url_for('subject_files', subject_id=old_subject_id))
    except Exception as e:
        flash('Error occurred while moving the file. Please try again.', 'danger')
        print(f"Error moving file: {e}")
        return redirect(url_for('subjects_files', subject_id=old_subject_id))

@app.route('/profile')
def profile():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('profile.html')

@app.route('/sessions')
def sessions():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('sessions.html')

@app.route('/tasks')
def tasks():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('tasks.html')

if __name__ == '__main__':
    app.run(debug=True)