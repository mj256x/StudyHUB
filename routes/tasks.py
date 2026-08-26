from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from database import get_db

tasks_bp = Blueprint('tasks', __name__)


@tasks_bp.route('/tasks')
def tasks():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT name, id FROM subjects WHERE user_id = ?", (session['user_id'],))
        subjects = cursor.fetchall()
        cursor.execute("SELECT id, title, deadline, subject_id, priority, is_completed FROM main_tasks WHERE user_id = ?", (session['user_id'],))
        main_tasks = cursor.fetchall()
        cursor.execute("SELECT id, title, deadline, main_task_id, priority, is_completed FROM sub_tasks WHERE user_id = ?", (session['user_id'],))
        sub_tasks = cursor.fetchall()
        cursor.close()
    except Exception as e:
        print(f"Error fetching subjects: {e}")
        subjects = []
        main_tasks = []
        sub_tasks = []
    return render_template('tasks.html', subjects=subjects, main_tasks=main_tasks, sub_tasks=sub_tasks)

@tasks_bp.route('/main_task_sub_tasks_num/<int:main_task_id>')
def main_task_sub_tasks_num(main_task_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM sub_tasks WHERE main_task_id = ? AND user_id = ?", (main_task_id, session['user_id']))
        sub_tasks_num = cursor.fetchone()[0]
        cursor.close()
        return jsonify({'success': True, 'sub_tasks_num': sub_tasks_num})
    except Exception as e:
        print(f"Error fetching sub-tasks count: {e}")
        return jsonify({'success': False, 'message': 'Database error'}), 500



@tasks_bp.route('/add_main_tasks', methods=['POST'])
def add_main_tasks():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    task_title = request.form['task_title']
    deadline = request.form['deadline']
    subject_id = request.form['subject_id']        
    priority = request.form['priority']
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO main_tasks (title, deadline, user_id, subject_id, priority) VALUES (?, ?, ?, ?, ?)", (task_title, deadline, session['user_id'], subject_id, priority))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Error adding task: {e}")
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/add_sub_tasks/<int:main_task_id>', methods=['POST'])
def add_sub_tasks(main_task_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    task_title = request.form['task_title']
    deadline = request.form['deadline']
    priority = request.form['priority']
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO sub_tasks (title, deadline, user_id, main_task_id, priority) VALUES (?, ?, ?, ?, ?)", (task_title, deadline, session['user_id'], main_task_id, priority))
        cursor.execute("UPDATE main_tasks SET is_completed = 0 WHERE id = ? AND user_id = ?", (main_task_id, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Error adding sub-task: {e}")
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/rename_sub_task/<int:sub_task_id>', methods=['POST'])
def rename_sub_task(sub_task_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    new_title = request.form['new_sub_task_name']
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE sub_tasks SET title = ? WHERE id = ? AND user_id = ?", (new_title, sub_task_id, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Error renaming sub-task: {e}")
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/rename_main_task/<int:main_task_id>', methods=['POST'])
def rename_main_task(main_task_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    new_title = request.form['new_main_task_name']
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE main_tasks SET title = ? WHERE id = ? AND user_id = ?", (new_title, main_task_id, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Error renaming main task: {e}")
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/change_sub_task_deadline/<int:sub_task_id>', methods=['POST'])
def change_sub_task_deadline(sub_task_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    new_deadline = request.form['new_deadline']
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE sub_tasks SET deadline = ? WHERE id = ? AND user_id = ?", (new_deadline, sub_task_id, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Error changing deadline: {e}")
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/change_main_task_deadline/<int:main_task_id>', methods=['POST'])
def change_main_task_deadline(main_task_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))

    new_deadline = request.form['new_deadline']
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE main_tasks SET deadline = ? WHERE id = ? AND user_id = ?", (new_deadline, main_task_id, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Error changing main task deadline: {e}")
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/change_sub_task_priority/<int:sub_task_id>', methods=['POST'])
def change_sub_task_priority(sub_task_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    new_priority = request.form['new_priority']
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE sub_tasks SET priority = ? WHERE id = ? AND user_id = ?", (new_priority, sub_task_id, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Error changing sub-task priority: {e}")
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/change_main_task_priority/<int:main_task_id>', methods=['POST'])
def change_main_task_priority(main_task_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    new_priority = request.form['new_priority']
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE main_tasks SET priority = ? WHERE id = ? AND user_id = ?", (new_priority, main_task_id, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Error changing main task priority: {e}")
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/change_main_task_subject/<int:main_task_id>', methods=['POST'])
def change_main_task_subject(main_task_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))

    new_subject_id = request.form['new_subject_id']
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE main_tasks SET subject_id = ? WHERE id = ? AND user_id = ?", (new_subject_id, main_task_id, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Error changing main task subject: {e}")
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/delete_main_task/<int:main_task_id>', methods=['POST'])
def delete_main_task(main_task_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sub_tasks WHERE main_task_id = ? AND user_id = ?", (main_task_id, session['user_id']))
        cursor.execute("DELETE FROM main_tasks WHERE id = ? AND user_id = ?", (main_task_id, session['user_id']))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Error deleting main task: {e}")
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/delete_sub_task/<int:sub_task_id>', methods=['POST'])
def delete_sub_task(sub_task_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT main_task_id FROM sub_tasks WHERE id = ? AND user_id = ?", (sub_task_id, session['user_id']))
        main_task_id = cursor.fetchone()
        cursor.execute("DELETE FROM sub_tasks WHERE id = ? AND user_id = ?", (sub_task_id, session['user_id']))
        cursor.execute("SELECT is_completed FROM sub_tasks WHERE main_task_id = ? AND user_id = ?", (main_task_id[0], session['user_id']))
        sub_tasks_status = cursor.fetchall()
        main_task_status = False
        if not sub_tasks_status:
            cursor.execute("UPDATE main_tasks SET is_completed = 0 WHERE id = ? AND user_id = ?", (main_task_id[0], session['user_id']))
        else:
            all_completed = True
            for status in sub_tasks_status:
                if not status[0]:
                    all_completed = False
                    break
            if all_completed == True:
                cursor.execute("UPDATE main_tasks SET is_completed = 1 WHERE id = ? AND user_id = ?", (main_task_id[0], session['user_id']))
                main_task_status = True
            else:
                cursor.execute("UPDATE main_tasks SET is_completed = 0 WHERE id = ? AND user_id = ?", (main_task_id[0], session['user_id']))
        conn.commit()
        cursor.close()
        return jsonify({'success': True, 'message': 'Sub-task deleted successfully.', 'main_task_status': main_task_status})
    except Exception as e:
        print(f"Error deleting sub-task: {e}")
        return jsonify({'success': False, 'message': 'Error occurred while deleting sub-task. Please try again.'}), 500

@tasks_bp.route('/toggle_sub_task_done/<int:sub_task_id>', methods=['POST'])
def toggle_sub_task_done(sub_task_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT is_completed FROM sub_tasks WHERE id = ? AND user_id = ?", (sub_task_id, session['user_id']))
        card_status = cursor.fetchone()
        new_status = not card_status[0]
        cursor.execute("UPDATE sub_tasks SET is_completed = ? WHERE id = ? AND user_id = ?", (new_status, sub_task_id, session['user_id']))
        cursor.execute("SELECT is_completed FROM sub_tasks WHERE main_task_id in (SELECT main_task_id FROM sub_tasks WHERE id = ?) AND user_id = ?", (sub_task_id, session['user_id']))
        sub_tasks_status = cursor.fetchall()
        all_completed = True
        for status in sub_tasks_status:
            if not status[0]:
                all_completed = False
        if all_completed == True:
            cursor.execute("UPDATE main_tasks SET is_completed = 1 WHERE id in (SELECT main_task_id FROM sub_tasks WHERE id = ?) AND user_id = ?", (sub_task_id, session['user_id']))
            main_task_status = True
        else:
            cursor.execute("UPDATE main_tasks SET is_completed = 0 WHERE id in (SELECT main_task_id FROM sub_tasks WHERE id = ?) AND user_id = ?", (sub_task_id, session['user_id']))
            main_task_status = False
        conn.commit()
        cursor.close()
        return jsonify({'success': True, 'new_status': new_status, 'main_task_status': main_task_status})
    except Exception as e:
        print(f"Error updating sub-task status: {e}")
        return jsonify({'success': False, 'message': 'Database error'}), 500

@tasks_bp.route('/mark_task_as_done/<int:main_task_id>', methods=['POST'])
def mark_task_as_done(main_task_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT is_completed FROM main_tasks WHERE id = ? AND user_id = ?", (main_task_id, session['user_id']))
        task_status = cursor.fetchone()
        new_status = not task_status[0]
        cursor.execute("UPDATE main_tasks SET is_completed = ? WHERE id = ? AND user_id = ?", (new_status, main_task_id, session['user_id']))
        if new_status == True:
            cursor.execute("UPDATE sub_tasks SET is_completed = 1 WHERE main_task_id = ? AND user_id = ?", (main_task_id, session['user_id']))
        else:
            cursor.execute("UPDATE sub_tasks SET is_completed = 0 WHERE main_task_id = ? AND user_id = ?", (main_task_id, session['user_id']))
        conn.commit()
        cursor.close()
        return jsonify({'success': True, 'new_status': new_status})
    except Exception as e:
        print(f"Error updating main task status: {e}")
        return jsonify({'success': False, 'message': 'Database error'}), 500

@tasks_bp.route('/delete_all_tasks', methods=['POST'])
def delete_all_tasks():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sub_tasks WHERE user_id = ?", (session['user_id'],))
        cursor.execute("DELETE FROM main_tasks WHERE user_id = ?", (session['user_id'],))
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Error deleting all tasks: {e}")
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/get_done_tasks')
def get_done_tasks():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, is_completed FROM main_tasks WHERE user_id = ?", (session['user_id'],))
        tasks = cursor.fetchall()
        cursor.close()
        return jsonify({'success': True, 'tasks': {task[0]: task[1] for task in tasks}})
    except Exception as e:
        print(f"Error fetching done tasks: {e}")
        return jsonify({'success': False, 'message': 'Database error'}), 500
