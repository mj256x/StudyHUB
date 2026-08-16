document.addEventListener('DOMContentLoaded', function () {
    loadDashboardStats();
    loadDashboardTasks();
});

function loadDashboardStats() {
    fetch('/dashboard_stats')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('total-subjects').textContent = data.total_subjects;
                document.getElementById('pending-tasks').textContent = data.pending_tasks;
                if (data.total_minutes === 0 && data.total_subjects === 0 && data.pending_tasks === 0) {
                    document.getElementById('new-user-message').style.display = 'block';
                }
                if (data.total_minutes < 60) {
                    document.getElementById('study-time').textContent = data.total_minutes;
                    document.getElementById('min-hour').textContent = 'minutes';
                } else {
                    document.getElementById('study-time').textContent = Math.floor(data.total_minutes / 60);
                    document.getElementById('min-hour').textContent = 'hours';
                }
            }
        })
        .catch(error => console.error('Error loading stats:', error));
}

async function loadDashboardTasks() {
    try {
        const response = await fetch('/dashboard_tasks');
        const data = await response.json();

        const todayList = document.getElementById('today-tasks-list');
        const tomorrowList = document.getElementById('tomorrow-tasks-list');
        const todaySection = document.getElementById('today-tasks');
        const tomorrowSection = document.getElementById('tomorrow-tasks');
        const noTasksMsg = document.getElementById('no-tasks-message');
        const template = document.getElementById('task-item-template');

        todayList.querySelectorAll('.task-item').forEach(el => el.remove());
        tomorrowList.querySelectorAll('.task-item').forEach(el => el.remove());
        document.getElementById('no-tasks-message-1').style.display = 'none';
        document.getElementById('no-tasks-message-2').style.display = 'none';

        if (!data.success || !data.tasks || data.tasks.length === 0) {
            noTasksMsg.style.display = 'block';
            todaySection.style.display = 'none';
            tomorrowSection.style.display = 'none';
            return;
        } else {
            todaySection.style.display = 'block';
            tomorrowSection.style.display = 'block';
            noTasksMsg.style.display = 'none';
        }

        const todayTasks = data.tasks.filter(t => t.is_today && (t.priority === 'High' || t.priority === 'Medium'));
        const tomorrowTasks = data.tasks.filter(t => t.is_tomorrow && (t.priority === 'High' || t.priority === 'Medium'));

        const displayTasks = (tasks, container) => {
            tasks.forEach(task => {
                const clone = template.content.cloneNode(true);
                clone.querySelector('.task-title').textContent = task.title;
                const badge = clone.querySelector('.task-badge');
                badge.textContent = task.priority;
                badge.className = `badge ${task.priority === 'High' ? 'bg-warning' : 'bg-info'}`;
                clone.querySelector('.task-item').style.backgroundColor = task.priority === 'High' ? '#fff3cd' : '#e7f3ff';
                const button = clone.querySelector('.mark-done-btn');
                button.addEventListener('click', () => markTaskDone(task.id));
                container.appendChild(clone);
            });
        };

        if (todayTasks.length > 0) {
            displayTasks(todayTasks, todayList);
        } else {
            document.getElementById('no-tasks-message-1').style.display = 'block';
        }

        if (tomorrowTasks.length > 0) {
            displayTasks(tomorrowTasks, tomorrowList);
        }
        else {
            document.getElementById('no-tasks-message-2').style.display = 'block';
        }
    }
    catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function markTaskDone(taskId) {
    try {
        const response = await fetch('/toggle_dashboard_task/' + taskId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
            location.reload();
        }
    } catch (error) {
        console.error('Error marking task as done:', error);
    }
}

function showAddSubjectModal() {
    var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addFolderModal'));
    myModal.show();
}