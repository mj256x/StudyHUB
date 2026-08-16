from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from database import get_db, supabase

subjects_bp = Blueprint('subjects', __name__)

@subjects_bp.route('/subjects', methods=['GET', 'POST'])
def subjects():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    if request.method == 'POST':
        subject_name = request.form['subject_name']
        if not subject_name:
            flash('Please enter a subject name', 'danger')
            return redirect(url_for('subjects.subjects'))
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
        return redirect(url_for('subjects.subjects'))
    else:
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, favorite FROM subjects WHERE user_id = ?", (session['user_id'],))
            subjects_data = cursor.fetchall()
            
            subjects = []
            for sub in subjects_data:
                subject_id = sub[0]
                cursor.execute("SELECT COUNT(*) FROM files WHERE subject_id = ? AND user_id = ?", (subject_id, session['user_id']))
                files_num = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM files WHERE subject_id = ? AND user_id = ? AND is_completed = 1", (subject_id, session['user_id']))
                completed_files = cursor.fetchone()[0]
                
                progress = 0
                if files_num > 0:
                    progress = int((completed_files / files_num) * 100)
                    
                subjects.append((sub[0], sub[1], sub[2], progress))
                
            cursor.close()
        except Exception as e:
            flash('Error occurred while fetching subjects, Please try refreshing the page.', 'danger')
            print(f"Database error: {e}")
            subjects = []
        return render_template('subjects.html', subjects=subjects)
    
@subjects_bp.route('/subjects_files/<int:subject_id>')
def subject_files(subject_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT file_name, file_url, id, is_completed FROM files WHERE subject_id = ? AND user_id = ?", (subject_id, session['user_id']))
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
        return redirect(url_for('subjects.subjects'))
    return render_template('subject_files.html', files=files, subject=subject, subject_id=subject_id, all_subjects=all_subjects)


@subjects_bp.route('/upload_file/<int:subject_id>', methods=['POST'])
def upload_file(subject_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))

    file = request.files.get('file')
    if not file:
        flash('No file selected!', 'danger')
        return redirect(url_for('subjects.subject_files', subject_id=subject_id))
    
    if len(file.filename) > 40:
        flash('File name is too long. Try to rename it first.', 'danger')
        return redirect(url_for('subjects.subject_files', subject_id=subject_id))

    try:
        filename = f"{subject_id}/{file.filename}"
        supabase.storage.from_("files").upload(
            path=filename,
            file=file.read(),
            file_options={"content-type": file.content_type}
        )
        
    except Exception as e:
        flash(f'Error uploading file: {e}', 'danger')
        return redirect(url_for('subjects.subject_files', subject_id=subject_id))

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

    return redirect(url_for('subjects.subject_files', subject_id=subject_id))


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
        flash('Subject deleted successfully!', 'success')
    except Exception as e:
        flash('Error occurred while deleting subject, Please try again.', 'danger')
        print(f"Database error: {e}")

    return redirect(url_for('subjects.subjects'))

@subjects_bp.route('/rename_subject/<int:subject_id>', methods=['POST'])
def rename_subject(subject_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))

    new_name = request.form['new_subject_name']
    if not new_name:
        flash('Please enter a valid subject name.', 'danger')
        return redirect(url_for('subjects.subjects'))

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE subjects SET name = ? WHERE id = ? AND user_id = ?", (new_name, subject_id, session['user_id']))
        conn.commit()
        cursor.close()
        flash('Subject renamed successfully!', 'success')
    except Exception as e:
        flash('Error occurred while renaming subject.', 'danger')
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
        conn.commit()
        cursor.close()
        flash('Subject progress reset successfully!', 'success')
    except Exception as e:
        flash('Error occurred while resetting subject progress.', 'danger')
        print(f"Database error: {e}")
    return redirect(url_for('subjects.subjects'))

@subjects_bp.route('/move_file', methods=['POST'])
def move_file():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
        
    file_id = request.form.get('file_id')
    new_subject_id = request.form.get('new_subject_id')
    
    if not file_id or not new_subject_id:
        flash('Invalid file or subject selected.', 'danger')
        return redirect(url_for('subjects.subjects'))
        
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT file_name, subject_id FROM files WHERE id = ? AND user_id = ?", (file_id, session['user_id']))
        file_record = cursor.fetchone()
        
        if not file_record:
            flash('File not found.', 'danger')
            return redirect(url_for('subjects.subjects'))
            
        file_name = file_record[0]
        old_subject_id = file_record[1]
        
        old_path = f"{old_subject_id}/{file_name}"
        new_path = f"{new_subject_id}/{file_name}"
        if old_path != new_path:
            supabase.storage.from_("files").move(old_path, new_path)
        else:
            flash('File is already in the selected subject.', 'danger')
            return redirect(url_for('subjects.subject_files', subject_id=old_subject_id))
        
        new_file_url = supabase.storage.from_("files").get_public_url(new_path)
        
        cursor.execute("UPDATE files SET subject_id = ?, file_url = ? WHERE id = ? AND user_id = ?",
                    (new_subject_id, new_file_url, file_id, session['user_id']))
        conn.commit()
        cursor.close()
        
        flash('File moved successfully!', 'success')
        return redirect(url_for('subjects.subject_files', subject_id=old_subject_id))
    except Exception as e:
        flash('Error occurred while moving the file. Please try again.', 'danger')
        print(f"Error moving file: {e}")
        return redirect(url_for('subjects.subject_files', subject_id=old_subject_id))

@subjects_bp.route('/copy_file', methods=['POST'])
def copy_file():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
        
    file_id = request.form.get('file_id')
    new_subject_id = request.form.get('new_subject_id')
    
    if not file_id or not new_subject_id:
        flash('Invalid file or subject selected.', 'danger')
        return redirect(url_for('subjects.subjects'))
        
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT file_name, subject_id FROM files WHERE id = ? AND user_id = ?", (file_id, session['user_id']))
        file_record = cursor.fetchone()
        
        if not file_record:
            flash('File not found.', 'danger')
            return redirect(url_for('subjects.subjects'))
            
        file_name = file_record[0]
        old_subject_id = file_record[1]
        
        old_path = f"{old_subject_id}/{file_name}"
        new_path = f"{new_subject_id}/{file_name}"
        if old_path != new_path:
            supabase.storage.from_("files").copy(old_path, new_path)
        else:
            flash('File is already in the selected subject.', 'danger')
            return redirect(url_for('subjects.subject_files', subject_id=old_subject_id))
        
        new_file_url = supabase.storage.from_("files").get_public_url(new_path)
        
        cursor.execute("INSERT INTO files (subject_id, file_name, file_url, user_id) VALUES (?, ?, ?, ?)",
                    (new_subject_id, file_name, new_file_url, session['user_id']))
        conn.commit()
        cursor.close()
        
        flash('File copied successfully!', 'success')
        return redirect(url_for('subjects.subject_files', subject_id=old_subject_id))
    except Exception as e:
        flash('Error occurred while copying the file. Please try again.', 'danger')
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
        if not file_record:
            flash('File not found.', 'danger')
            return redirect(url_for('subjects.subjects'))
        
        file_name = file_record[0]
        subject_id = file_record[1]
        
        supabase.storage.from_("files").remove([f"{subject_id}/{file_name}"])
        
        cursor.execute("DELETE FROM files WHERE id = ? AND user_id = ?", (file_id, session['user_id']))
        conn.commit()
        cursor.close()
        
        flash('File deleted successfully!', 'success')
    except Exception as e:
        flash('Error occurred while deleting the file. Please try again.', 'danger')
        print(f"Error deleting file: {e}")
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
        if not file_status:
            flash('File not found.', 'danger')
            return jsonify({'success': False, 'message': 'File not found'}), 404
        new_status = not file_status[0]
        cursor.execute("UPDATE files SET is_completed = ? WHERE id = ? AND user_id = ?", (new_status, file_id, session['user_id']))
        conn.commit()
        cursor.close()
        flash('File status updated successfully!', 'success')
    except Exception as e:
        flash('Error occurred while updating file status. Please try again.', 'danger')
        print(f"Error updating file status: {e}")
    return jsonify({'success': True, 'new_status': new_status})

@subjects_bp.route('/add_to_favorite/<int:subject_id>', methods=['POST'])
def add_to_favorite(subject_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
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