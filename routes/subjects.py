from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from database import get_db, supabase
from math import floor

subjects_bp = Blueprint('subjects', __name__)


# Subjects Routes

@subjects_bp.route('/subjects')
def subjects():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, favorite, is_completed FROM subjects WHERE user_id = ?", (session['user_id'],))
        subjects_data = cursor.fetchall()
            
        subjects = []
        for subject in subjects_data:
            subject_id = subject[0]
            cursor.execute("SELECT COUNT(*) FROM files WHERE subject_id = ? AND user_id = ?", (subject_id, session['user_id']))
            files_num = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM files WHERE subject_id = ? AND user_id = ? AND is_completed = 1", (subject_id, session['user_id']))
            completed_files = cursor.fetchone()[0]
            progress = 0
            if files_num > 0:
                progress = floor(int((completed_files / files_num) * 100))
            subjects.append((subject[0], subject[1], subject[2], subject[3], progress, files_num))
        cursor.close()
    except Exception as e:
        print(f"Database error: {e}")
        subjects = []
    return render_template('subjects.html', subjects=subjects)

@subjects_bp.route('/add_subject', methods=['POST'])
def add_subject():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    subject_name = request.form.get('subject_name')
    if not subject_name:
        return redirect(url_for('subjects.subjects'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO subjects (name, user_id) VALUES (?, ?)", (subject_name, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:       
        print(f"Database error: {e}")
    return redirect(url_for('subjects.subjects'))

@subjects_bp.route('/reset_progress/<int:subject_id>', methods=['POST'])
def reset_progress(subject_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE files SET is_completed = 0 WHERE subject_id = ? AND user_id = ?", (subject_id, session['user_id']))
        cursor.execute("UPDATE subjects SET is_completed = 0 WHERE id = ? AND user_id = ?", (subject_id, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Database error: {e}")
    return redirect(url_for('subjects.subjects'))

@subjects_bp.route('/rename_subject/<int:subject_id>', methods=['POST'])
def rename_subject(subject_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    new_name = request.form['new_subject_name']
    if not new_name:
        return redirect(url_for('subjects.subjects'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE subjects SET name = ? WHERE id = ? AND user_id = ?", (new_name, subject_id, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Database error: {e}")
    return redirect(url_for('subjects.subjects'))

@subjects_bp.route('/toggle_completed/<int:subject_id>', methods=['POST'])
def toggle_completed(subject_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT is_completed FROM subjects WHERE id = ? AND user_id = ?", (subject_id, session['user_id']))
        current_status = cursor.fetchone()
        new_status = not current_status[0]
        cursor.execute("UPDATE subjects SET is_completed = ? WHERE id = ? AND user_id = ?", (new_status, subject_id, session['user_id']))
        if new_status:
            cursor.execute("UPDATE files SET is_completed = 1 WHERE subject_id = ? AND user_id = ?", (subject_id, session['user_id']))
        else:
            cursor.execute("UPDATE files SET is_completed = 0 WHERE subject_id = ? AND user_id = ?", (subject_id, session['user_id']))
        conn.commit()
        cursor.close()
        return jsonify({'success': True, 'new_status': new_status})
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({'success': False, 'message': 'Database error'}), 500

@subjects_bp.route('/add_to_favorite/<int:subject_id>', methods=['POST'])
def add_to_favorite(subject_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT favorite FROM subjects WHERE id = ? AND user_id = ?", (subject_id, session['user_id']))
        subject_favorite = cursor.fetchone()
        new_favorite_status = not subject_favorite[0]
        cursor.execute("UPDATE subjects SET favorite = ? WHERE id = ? AND user_id = ?", (new_favorite_status, subject_id, session['user_id']))
        conn.commit()
        cursor.close()
        return jsonify({'success': True, 'new_status': new_favorite_status})
    except Exception as e:
        print(f"Error toggling favorite status: {e}")
        return jsonify({'success': False, 'message': 'Database error'}), 500

@subjects_bp.route('/delete_subject/<int:subject_id>', methods=['POST'])
def delete_subject(subject_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
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
    except Exception as e:
        print(f"Database error: {e}")
    return redirect(url_for('subjects.subjects'))


@subjects_bp.route('/get_completed_subjects')
def get_completed_subjects():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, is_completed FROM subjects WHERE user_id = ?", (session['user_id'],))
        subjects_status = cursor.fetchall()
        cursor.close()
        return jsonify({'success': True, 'subjects': {row[0]: row[1] for row in subjects_status}})
    except Exception as e:
        print(f"Error fetching completed subjects: {e}")
        return jsonify({'success': False, 'message': 'Database error'}), 500

@subjects_bp.route('/get_favorite_subjects')
def get_favorite_subjects():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, favorite FROM subjects WHERE user_id = ?", (session['user_id'],))
        subjects_status = cursor.fetchall()
        cursor.close()
        return jsonify({'success': True, 'subjects': {row[0]: row[1] for row in subjects_status}})
    except Exception as e:
        print(f"Error fetching favorite subjects: {e}")
        return jsonify({'success': False, 'message': 'Database error'}), 500

@subjects_bp.route('/delete_all_subjects', methods=['POST'])
def delete_all_subjects():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT subject_id, file_name FROM files WHERE user_id = ?", (session['user_id'],))
        files = cursor.fetchall()
        for file in files:
            subject_id = file[0]
            file_name = file[1]
            supabase.storage.from_("files").remove([f"{subject_id}/{file_name}"])
        cursor.execute("DELETE FROM files WHERE user_id = ?", (session['user_id'],))
        cursor.execute("DELETE FROM subjects WHERE user_id = ?", (session['user_id'],))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Database error: {e}")
    return redirect(url_for('subjects.subjects'))

# Subject Files Routes

@subjects_bp.route('/subject_files/<int:subject_id>')
def subject_files(subject_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT file_name, file_url, id, is_completed, subject_id FROM files WHERE subject_id = ? AND user_id = ?", (subject_id, session['user_id']))
        files = cursor.fetchall()
        cursor.execute("SELECT name FROM subjects WHERE id = ? AND user_id = ?", (subject_id, session['user_id']))
        subject_name = cursor.fetchone()
        cursor.execute("SELECT name, id FROM subjects WHERE user_id = ?", (session['user_id'],))
        all_subjects = cursor.fetchall()
        cursor.close()
    except Exception as e:
        print(f"Database error: {e}")
        return redirect(url_for('subjects.subjects'))
    return render_template('subject_files.html', files=files, subject_name=subject_name, subject_id=subject_id, all_subjects=all_subjects)


@subjects_bp.route('/upload_file/<int:subject_id>', methods=['POST'])
def upload_file(subject_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    file = request.files.get('file')

    if len(file.filename) > 30:
        return redirect(url_for('subjects.subject_files', subject_id=subject_id))
    try:
        filename = f"{subject_id}/{file.filename}"
        supabase.storage.from_("files").upload(
            path=filename,
            file=file.read(),
            file_options={"content-type": file.content_type}
        )
        
        file_url = supabase.storage.from_("files").get_public_url(filename)
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO files (subject_id, file_name, file_url, user_id) VALUES (?, ?, ?, ?)",
                (subject_id, file.filename, file_url, session['user_id']))
        conn.commit()
        cursor.close()        
    except Exception as e:
        print(f'Error occurred while uploading file: {e}')
    return redirect(url_for('subjects.subject_files', subject_id=subject_id))

@subjects_bp.route('/toggle_done/<int:file_id>', methods=['POST'])
def toggle_done(file_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT is_completed FROM files WHERE id = ? AND user_id = ?", (file_id, session['user_id']))
        file_status = cursor.fetchone()
        new_status = not file_status[0]
        cursor.execute("UPDATE files SET is_completed = ? WHERE id = ? AND user_id = ?", (new_status, file_id, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Error updating file status: {e}")
    return jsonify({'success': True, 'new_status': new_status})

@subjects_bp.route('/move_file/<int:file_id>', methods=['POST'])
def move_file(file_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    new_subject_id = request.form.get('new_subject_id')
        
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT file_name, subject_id FROM files WHERE id = ? AND user_id = ?", (file_id, session['user_id']))
        file_record = cursor.fetchone()            
        file_name = file_record[0]
        old_subject_id = file_record[1]
        old_path = f"{old_subject_id}/{file_name}"
        new_path = f"{new_subject_id}/{file_name}"
        supabase.storage.from_("files").move(old_path, new_path)
        new_file_url = supabase.storage.from_("files").get_public_url(new_path)
        cursor.execute("UPDATE files SET subject_id = ?, file_url = ? WHERE id = ? AND user_id = ?",
                        (new_subject_id, new_file_url, file_id, session['user_id']))
        conn.commit()
        cursor.close()
        return redirect(url_for('subjects.subject_files', subject_id=old_subject_id))
    except Exception as e:
        print(f"Error moving file: {e}")
        return redirect(url_for('subjects.subject_files', subject_id=old_subject_id))

@subjects_bp.route('/copy_file/<int:file_id>', methods=['POST'])
def copy_file(file_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
        
    new_subject_id = request.form.get('new_subject_id')    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT file_name, subject_id FROM files WHERE id = ? AND user_id = ?", (file_id, session['user_id']))
        file_record = cursor.fetchone()
        file_name = file_record[0]
        old_subject_id = file_record[1]
        old_path = f"{old_subject_id}/{file_name}"
        new_path = f"{new_subject_id}/{file_name}"
        supabase.storage.from_("files").copy(old_path, new_path)
        new_file_url = supabase.storage.from_("files").get_public_url(new_path)
        cursor.execute("INSERT INTO files (subject_id, file_name, file_url, user_id) VALUES (?, ?, ?, ?)",
                    (new_subject_id, file_name, new_file_url, session['user_id']))
        conn.commit()
        cursor.close()
        return redirect(url_for('subjects.subject_files', subject_id=old_subject_id))
    except Exception as e:
        print(f"Error copying file: {e}")
        return redirect(url_for('subjects.subject_files', subject_id=old_subject_id))
    
@subjects_bp.route('/delete_file/<int:file_id>', methods=['POST'])
def delete_file(file_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT file_name, subject_id FROM files WHERE id = ? AND user_id = ?", (file_id, session['user_id']))
        file_record = cursor.fetchone()
        file_name = file_record[0]
        subject_id = file_record[1]
        supabase.storage.from_("files").remove([f"{subject_id}/{file_name}"])
        cursor.execute("DELETE FROM files WHERE id = ? AND user_id = ?", (file_id, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Error deleting file: {e}")
    return redirect(url_for('subjects.subject_files', subject_id=subject_id))

@subjects_bp.route('/delete_all_files/<int:subject_id>', methods=['POST'])
def delete_all_files(subject_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT file_name FROM files WHERE subject_id = ? AND user_id = ?", (subject_id, session['user_id']))
        files = cursor.fetchall()
        for file in files:
            supabase.storage.from_("files").remove([f"{subject_id}/{file[0]}"])
        cursor.execute("DELETE FROM files WHERE subject_id = ? AND user_id = ?", (subject_id, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Error deleting all files: {e}")
    return redirect(url_for('subjects.subject_files', subject_id=subject_id))

@subjects_bp.route('/get_completed_files/<int:subject_id>')
def get_completed_files(subject_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, is_completed FROM files WHERE subject_id = ? AND user_id = ?", (subject_id, session['user_id']))
        files = cursor.fetchall()
        cursor.close()
        return jsonify({'success': True, 'files': {row[0]: row[1] for row in files}})
    except Exception as e:
        print(f"Error fetching completed files: {e}")
        return jsonify({'success': False, 'message': 'Error fetching completed files'}), 500