from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('home.index'))
    
    if request.method == 'POST':
        try:
            username_email = request.form['username']
            password = request.form['password']

            if not username_email or not password:
                return redirect(url_for('auth.login'))
            
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT id, password_hash FROM users WHERE username = ? OR email = ?", (username_email, username_email))
            user = cursor.fetchone()
            cursor.close()
        except Exception as e:
            print(f"Database error: {e}")
            return redirect(url_for('auth.login'))
        
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            return redirect(url_for('home.index'))
        else:
            return redirect(url_for('auth.login'))
        
    return render_template('login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if 'user_id' in session:
        return redirect(url_for('home.index'))
    
    if request.method == 'POST':

        try:
            username = request.form['username']
            email = request.form['email']
            password = request.form['password']
            confirm_password = request.form['confirm_password']
            if not username or not password or not confirm_password or not email:
                return redirect(url_for('auth.register'))
            if password != confirm_password:
                return redirect(url_for('auth.register'))
            
            password_hash = generate_password_hash(password)
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email))
            if cursor.fetchone():
                return redirect(url_for('auth.register'))
            cursor.execute("INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)", (username, password_hash, email))
            conn.commit()
            cursor.close()
        except Exception as e:
            print(f"Database error: {e}")
            return redirect(url_for('auth.register'))
        
        return redirect(url_for('auth.login'))

    return render_template('register.html')

@auth_bp.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('study_session', None)
    flash('Logged out successfully!', 'success')
    return redirect(url_for('auth.login'))
