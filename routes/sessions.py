from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from database import get_db
import time

sessions_bp = Blueprint('sessions', __name__)


@sessions_bp.route('/start_session', methods=['POST'])
def start_session():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    
    try:
        data = request.get_json(silent=True) or {}
        session_title = data.get('session_title')
        period = data.get('period')
        subject_id = data.get('subject_id')
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO study_sessions (session_name, duration_minutes, subject_id, user_id) VALUES (?, ?, ?, ?)",
                            (session_title, period, subject_id, session['user_id']))
        conn.commit()
        cursor.execute("SELECT id FROM study_sessions WHERE session_name = ? AND duration_minutes = ? AND user_id = ?", (session_title, period, session['user_id']))
        session_id = cursor.fetchone()[0]
        session['study_session'] = {'id': session_id, 'initial_duration': int(period), 'start_timestamp': time.time()}
        cursor.close()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error starting session: {e}")
        return jsonify({'success': False, 'message': 'Database error'}), 500

@sessions_bp.route('/update_session_duration', methods=['POST'])
def update_session_duration():
    if 'user_id' not in session or 'study_session' not in session:
        return jsonify({'success': False, 'message': 'Authentication or session required'}), 401

    try:
        data = request.get_json()
        added_time = data.get('added_time')
        if not added_time:
            return jsonify({'success': False, 'message': 'Invalid data'}), 400
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE study_sessions SET duration_minutes = duration_minutes + ? WHERE id = ? AND user_id = ?",
                    (added_time, session['study_session']['id'], session['user_id']))
        conn.commit()
        session['study_session']['initial_duration'] += added_time
        session.modified = True
        cursor.close()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error updating session duration: {e}")
        return jsonify({'success': False, 'message': 'Database error'}), 500

@sessions_bp.route('/session_ended', methods=['POST'])
def session_ended():
    if 'user_id' not in session or 'study_session' not in session:
        return jsonify({'success': False, 'message': 'Authentication or session required'}), 401
    try:
        data = request.get_json(silent=True) or {}
        elapsed_minutes = data.get('elapsed_minutes')

        if elapsed_minutes is None:
            return jsonify({'success': False, 'message': 'Invalid data'}), 400

        study_session = session.get('study_session')
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM subjects WHERE id in (SELECT subject_id FROM study_sessions WHERE id = ? AND user_id = ?)", (study_session['id'], session['user_id']))
        subject_name = cursor.fetchone()[0]
        cursor.execute("SELECT session_name FROM study_sessions WHERE id = ? AND user_id = ?", (study_session['id'], session['user_id']))
        session_name = cursor.fetchone()[0]
        cursor.execute(
            "UPDATE study_sessions SET duration_minutes = ? WHERE id = ? AND user_id = ?",
            (elapsed_minutes, study_session['id'], session['user_id'])
        )
        conn.commit()
        cursor.close()
        session.pop('study_session', None)
        return jsonify(
            {'success': True,
            'subject_name': subject_name,
            'session_name': session_name}
            )
    except Exception as e:
        print(f"Error ending session: {e}")
        return jsonify({'success': False}), 500

@sessions_bp.route('/sessions_history')
def sessions_history():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT subjects.id, subjects.name, study_sessions.id, study_sessions.session_name, study_sessions.duration_minutes, FORMAT(study_sessions.session_date,  'dd MMM yyyy HH:mm') AS session_date FROM study_sessions JOIN subjects ON study_sessions.subject_id = subjects.id WHERE study_sessions.user_id = ? ORDER BY session_date DESC", (session['user_id'],))
        sessions = cursor.fetchall()
        cursor.close()
    except Exception as e:
        print(f"Error fetching sessions: {e}")
        sessions = []
    return render_template('sessions_history.html', sessions=sessions)

@sessions_bp.route('/rename_session/<int:session_id>', methods=['POST'])
def rename_session(session_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))

    new_name = request.form['session_title']
    if not new_name:
        flash('Please enter a valid session name.', 'danger')
        return redirect(url_for('sessions.sessions_history'))

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE study_sessions SET session_name = ? WHERE id = ? AND user_id = ?", (new_name, session_id, session['user_id']))
        conn.commit()
        cursor.close()
        flash('Session renamed successfully!', 'success')
    except Exception as e:
        flash('Error occurred while renaming session.', 'danger')
        print(f"Database error: {e}")

    return redirect(url_for('sessions.sessions_history'))

@sessions_bp.route('/delete_session/<int:session_id>', methods=['POST'])
def delete_session(session_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM study_sessions WHERE id = ? AND user_id = ?", (session_id, session['user_id']))
        conn.commit()
        cursor.close()
        flash('Session deleted successfully!', 'success')
    except Exception as e:
        flash('Error occurred while deleting session.', 'danger')
        print(f"Database error: {e}")

    return redirect(url_for('sessions.sessions_history'))

@sessions_bp.route('/clear_sessions_history', methods=['POST'])
def clear_sessions_history():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM study_sessions WHERE user_id = ?", (session['user_id'],))
        conn.commit()
        cursor.close()
        flash('All sessions history cleared successfully!', 'success')
    except Exception as e:
        flash('Error occurred while clearing sessions history.', 'danger')
        print(f"Database error: {e}")

    return redirect(url_for('sessions.sessions_history'))