from flask import Blueprint, request, jsonify, session, redirect, url_for, flash
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db, supabase, cloudinary
import cloudinary.uploader

user_bp = Blueprint('user', __name__)

@user_bp.route('/change_username', methods=['POST'])
def change_username():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    new_username = request.form['new_username']
    if not new_username:
        return redirect(url_for('home.index'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET username = ? WHERE id = ?", (new_username, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Database error: {e}")
    return redirect(url_for('home.index'))

@user_bp.route('/change_password', methods=['POST'])
def change_password():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))

    current_password = request.form['current_password']
    new_password = request.form['new_password']
    confirm_new_password = request.form['confirm_password']

    if not current_password or not new_password or not confirm_new_password:
        return redirect(url_for('home.index'))

    if new_password != confirm_new_password:
        return redirect(url_for('home.index'))

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT password_hash FROM users WHERE id = ?", (session['user_id'],))
        stored_password_hash = cursor.fetchone()[0]

        if not check_password_hash(stored_password_hash, current_password):
            return redirect(url_for('home.index'))

        new_hashed_password = generate_password_hash(new_password)
        cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hashed_password, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Database error: {e}")
    return redirect(url_for('home.index'))

@user_bp.route('/change_email', methods=['POST'])
def change_email():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    new_email = request.form['new_email']
    if not new_email:
        return redirect(url_for('home.index'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET email = ? WHERE id = ?", (new_email, session['user_id']))
        conn.commit()
        cursor.close()
        flash('Email changed successfully!', 'success')
    except Exception as e:
        print(f"Database error: {e}")
    return redirect(url_for('home.index'))

@user_bp.route('/delete_account', methods=['POST'])
def delete_account():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM subjects WHERE user_id = ?", (session['user_id'],))
        subjects = cursor.fetchall()
        for subject in subjects:
            subject_id = subject[0]
            cursor.execute("SELECT file_name FROM files WHERE subject_id = ? AND user_id = ?", (subject_id, session['user_id']))
            files = cursor.fetchall()
            for file in files:
                supabase.storage.from_("files").remove([f"{subject_id}/{file[0]}"])

        cursor.execute("DELETE FROM sub_tasks WHERE user_id = ?", (session['user_id'],))
        cursor.execute("DELETE FROM main_tasks WHERE user_id = ?", (session['user_id'],))
        cursor.execute("DELETE FROM study_sessions WHERE user_id = ?", (session['user_id'],))
        cursor.execute("DELETE FROM files WHERE user_id = ?", (session['user_id'],))
        cursor.execute("DELETE FROM subjects WHERE user_id = ?", (session['user_id'],))
        cursor.execute("DELETE FROM users WHERE id = ?", (session['user_id'],))
        conn.commit()
        cursor.close()
        session.clear()
        return redirect(url_for('auth.logout'))
    except Exception as e:
        print(f"Database error: {e}")

    return redirect(url_for('auth.logout'))

@user_bp.route('/upload_profile_picture', methods=['POST'])
def upload_profile_picture():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401

    try:
        file = request.files.get('pfp')
        if not file:
            return jsonify({'success': False, 'message': 'No file provided'}), 400
        
        file_bytes = file.read()
        upload_result = cloudinary.uploader.upload(
            file_bytes,
            folder="users_pfps",
            transformation=[
                {"width": 250, "height": 250, "crop": "fill", "gravity": "face"}
            ]
        )
        pfp_url = upload_result['secure_url']
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET profile_picture = ? WHERE id = ?", (pfp_url, session['user_id']))
        conn.commit()
        cursor.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        print(f"Error uploading profile picture: {e}")
        return jsonify({'success': False}), 500
