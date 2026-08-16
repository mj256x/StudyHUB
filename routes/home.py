from flask import Blueprint, render_template, redirect, url_for, session, jsonify
from database import get_db
from datetime import datetime, timedelta

home_bp = Blueprint('home', __name__)

@home_bp.route('/')
def newUser():
    if 'user_id' in session:
        return redirect(url_for('home.index'))
    return redirect(url_for('auth.register'))

@home_bp.route('/index')
def index():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM main_tasks WHERE user_id = ? AND is_completed = 0", (session['user_id'],))
        tasks = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM subjects WHERE user_id = ?", (session['user_id'],))
        subjects = cursor.fetchone()[0]
        cursor.close()
    except Exception as e:
        print(f"Error fetching pending tasks: {e}")
        tasks = 0
        subjects = 0

    new_user = 'true' if tasks == 0 and subjects == 0 else 'false'

    return render_template('index.html', new_user=new_user)


# Dashboard endpoints for index page features
@home_bp.route('/dashboard_stats', methods=['GET'])
def dashboard_stats():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Get total active subjects
        cursor.execute("SELECT COUNT(*) FROM subjects WHERE user_id = ?", (session['user_id'],))
        total_subjects = cursor.fetchone()[0]
        
        # Get pending tasks
        cursor.execute("SELECT COUNT(*) FROM main_tasks WHERE user_id = ? AND is_completed = 0", (session['user_id'],))
        pending_tasks = cursor.fetchone()[0]
        
        # Get total study time
        cursor.execute("SELECT ISNULL(SUM(duration_minutes), 0) FROM study_sessions WHERE user_id = ?", (session['user_id'],))
        total_minutes = cursor.fetchone()[0]
        
        cursor.close()
        
        return jsonify({
            'success': True,
            'total_subjects': total_subjects,
            'pending_tasks': pending_tasks,
            'total_minutes': total_minutes,
        })
    except Exception as e:
        print(f"Error fetching dashboard stats: {e}")
        return jsonify({'success': False, 'message': 'Database error'}), 500

@home_bp.route('/dashboard_tasks', methods=['GET'])
def dashboard_tasks():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Get tasks due today or tomorrow (only incomplete ones)
        # Priority order: High (1) > Medium (2) > Low (3)
        cursor.execute("""
            SELECT 
                id, title, deadline, subject_id, is_completed, priority
            FROM main_tasks 
            WHERE user_id = ? 
            AND is_completed = 0
            AND CAST(deadline AS DATE) IN (CAST(GETDATE() AS DATE), CAST(DATEADD(DAY, 1, GETDATE()) AS DATE))
            ORDER BY 
                CAST(deadline AS DATE) ASC,
                CASE 
                    WHEN priority = 'High' THEN 1
                    WHEN priority = 'Medium' THEN 2
                    WHEN priority = 'Low' THEN 3
                    ELSE 4
                END ASC
        """, (session['user_id'],))
        tasks = cursor.fetchall()
        
        # Format tasks data
        tasks_data = []
        today = datetime.now().date()
        
        for task in tasks:
            deadline_str = str(task[2])  # Convert to string to handle different types
            
            try:
                # Try to parse the deadline - it could be in format "YYYY-MM-DD HH:MM:SS" or just "YYYY-MM-DD"
                if ' ' in deadline_str:
                    deadline_date = datetime.strptime(deadline_str.split()[0], '%Y-%m-%d').date()
                else:
                    deadline_date = datetime.strptime(deadline_str, '%Y-%m-%d').date()
                
                is_today = deadline_date == today
                is_tomorrow = deadline_date == (today + timedelta(days=1))
            except Exception as parse_error:
                print(f"Error parsing deadline '{deadline_str}': {parse_error}")
                is_today = False  # Default to tomorrow if parsing fails
                is_tomorrow = False
            
            tasks_data.append({
                'id': task[0],
                'title': task[1],
                'deadline': deadline_str,
                'subject_id': task[3],
                'is_completed': task[4],
                'priority': task[5],
                'is_today': is_today,
                'is_tomorrow': is_tomorrow
            })
        
        cursor.close()
        
        return jsonify({
            'success': True,
            'tasks': tasks_data
        })
    except Exception as e:
        print(f"Error fetching dashboard tasks: {e}")
        return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500

@home_bp.route('/toggle_dashboard_task/<int:task_id>', methods=['POST'])
def toggle_dashboard_task(task_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE main_tasks SET is_completed = 1 WHERE id = ? AND user_id = ?", (task_id, session['user_id']))
        conn.commit()
        cursor.close()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error toggling task completion: {e}")
        return jsonify({'success': False, 'message': 'Database error'}), 500