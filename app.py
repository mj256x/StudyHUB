import os
import pyodbc
from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY')

def db_connection():
    conn_str = (
        f"DRIVER={os.getenv('DB_DRIVER')};"
        f"SERVER={os.getenv('DB_SERVER')};"
        f"DATABASE={os.getenv('DB_DATABASE')};"
        f"UID={os.getenv('DB_USERNAME')};"
        f"PWD={os.getenv('DB_PASSWORD')};"
        "Encrypt=yes;"
        "TrustServerCertificate=no;"
        "Connection Timeout=30;"
    )
    return pyodbc.connect(conn_str)

@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('register'))
    return render_template('index.html')

# User login
@app.route('/login', methods=['GET', 'POST'])
def login():
    # Check if user is already logged in
    if 'user_id' in session:
        return redirect(url_for('index'))
    # Handle login form submission
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']

        if not username or not password or not email:
            flash('Please enter all fields', 'danger')
            return redirect(url_for('login'))
        # Fetch user from database
        try:
            conn = db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id, password_hash, email FROM users WHERE username = ?", (username,))
            user = cursor.fetchone()
            cursor.close()
            conn.close()
        except Exception as e:
            flash('Error occurred while fetching user data, Please try refreshing the page.', 'danger')
            print(f"Database error: {e}")
            return redirect(url_for('login'))
        # Verify password and email
        if user and check_password_hash(user.password_hash, password) and email == user.email:
            session['user_id'] = user.id
            return redirect(url_for('index'))
        else:
            flash('Invalid username, email, or password', 'danger')

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
            conn = db_connection()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)", (username, password_hash, email))
            conn.commit()
            cursor.close()
            conn.close()
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



if __name__ == '__main__':
    app.run(debug=True)