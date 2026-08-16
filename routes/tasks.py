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
        flash('Task added successfully!', 'success')
    except Exception as e:
        print(f"Error adding task: {e}")
        flash('Error occurred while adding task. Please try again.', 'danger')    
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/add_sub_tasks', methods=['POST'])
def add_sub_tasks():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    task_title = request.form['task_title']
    deadline = request.form['deadline']
    main_task_id = request.form['main_task_id']
    priority = request.form['priority']

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO sub_tasks (title, deadline, user_id, main_task_id, priority) VALUES (?, ?, ?, ?, ?)", (task_title, deadline, session['user_id'], main_task_id, priority))
        conn.commit()
        cursor.close()
        flash('Sub-task added successfully!', 'success')
    except Exception as e:
        print(f"Error adding sub-task: {e}")
        flash('Error occurred while adding sub-task. Please try again.', 'danger')

    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/edit_sub_task', methods=['POST'])
def edit_sub_task():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    sub_task_id = request.form['sub_task_id']
    task_title = request.form['task_title']
    deadline = request.form['deadline']
    priority = request.form['priority']

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE sub_tasks SET title = ?, deadline = ?, priority = ? WHERE id = ? AND user_id = ?", (task_title, deadline, priority, sub_task_id, session['user_id']))
        conn.commit()
        cursor.close()
        flash('Sub-task updated successfully!', 'success')
    except Exception as e:
        print(f"Error updating sub-task: {e}")
        flash('Error occurred while updating sub-task. Please try again.', 'danger')

    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/edit_main_task', methods=['POST'])
def edit_main_task():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    main_task_id = request.form['main_task_id']
    task_title = request.form['task_title']
    deadline = request.form['deadline']
    subject_id = request.form['subject_id']
    priority = request.form['priority']

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE main_tasks SET title = ?, deadline = ?, subject_id = ?, priority = ? WHERE id = ? AND user_id = ?", (task_title, deadline, subject_id, priority, main_task_id, session['user_id']))
        conn.commit()
        cursor.close()
        flash('Main task updated successfully!', 'success')
    except Exception as e:
        print(f"Error updating main task: {e}")
        flash('Error occurred while updating main task. Please try again.', 'danger')

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
        flash('Main task and its sub-tasks deleted successfully!', 'success')
    except Exception as e:
        print(f"Error deleting main task: {e}")
        flash('Error occurred while deleting main task. Please try again.', 'danger')
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/delete_sub_task/<int:sub_task_id>', methods=['POST'])
def delete_sub_task(sub_task_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT main_task_id FROM sub_tasks WHERE id = ? AND user_id = ?", (sub_task_id, session['user_id']))
        main_task_id = cursor.fetchone()
        cursor.execute("DELETE FROM sub_tasks WHERE id = ? AND user_id = ?", (sub_task_id, session['user_id']))
        cursor.execute("SELECT is_completed FROM sub_tasks WHERE main_task_id = ? AND user_id = ?", (main_task_id[0], session['user_id']))
        sub_tasks_status = cursor.fetchall()
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
            else:
                cursor.execute("UPDATE main_tasks SET is_completed = 0 WHERE id = ? AND user_id = ?", (main_task_id[0], session['user_id']))
        conn.commit()
        cursor.close()
        flash('Sub-task deleted successfully!', 'success')
    except Exception as e:
        print(f"Error deleting sub-task: {e}")
        flash('Error occurred while deleting sub-task. Please try again.', 'danger')
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/toggle_sub_task_done/<int:sub_task_id>', methods=['POST'])
def toggle_sub_task_done(sub_task_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT is_completed FROM sub_tasks WHERE id = ? AND user_id = ?", (sub_task_id, session['user_id']))
        card_status = cursor.fetchone()
        if not card_status:
            return jsonify({'success': False, 'message': 'Sub-task not found'}), 404

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
        else:
            cursor.execute("UPDATE main_tasks SET is_completed = 0 WHERE id in (SELECT main_task_id FROM sub_tasks WHERE id = ?) AND user_id = ?", (sub_task_id, session['user_id']))
        conn.commit()
        cursor.close()
        return jsonify({'success': True, 'new_status': new_status})
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
        if not task_status:
            return jsonify({'success': False, 'message': 'Main task not found'}), 404

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
