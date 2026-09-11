function loadDashboardStats() {
    fetch('/dashboard_stats')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('total-subjects').textContent = data.total_subjects;
                document.getElementById('pending-tasks').textContent = data.pending_tasks;
                if (data.total_minutes === 0 && data.total_subjects === 0 && data.pending_tasks === 0) {
                    document.getElementById('new-user-message').style.setProperty('display', 'flex', 'important');
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

async function markMainTaskDone(taskId) {
    try {
        const response = await fetch('/mark_task_as_done/' + taskId,
            {
                method: 'POST',
            }
        );
        const data = await response.json();
        if (data.success) {
            document.querySelectorAll('.task-card').forEach(el => el.remove());
            loadDashboardTasks();
        }
    }
    catch (error) {
        console.error('Error marking task as done:', error);
    }
}

async function deleteMainTask(taskId) {
    try {
        const response = await fetch('/delete_main_task/' + taskId,
            {
                method: 'POST',
            }
        );
        const data = await response.json();
        if (data.success) {
            document.querySelectorAll('.task-card').forEach(el => el.remove());
            loadDashboardTasks();
        }
    }
    catch (error) {
        console.error('Error deleting task:', error);
    }
}

async function loadDashboardTasks() {
    const todaySection = document.getElementById('today-tasks');
    const tomorrowSection = document.getElementById('tomorrow-tasks');
    const noTasksMsg = document.getElementById('no-tasks-message');
    todaySection.style.setProperty('display', 'none', 'important');
    tomorrowSection.style.setProperty('display', 'none', 'important');
    noTasksMsg.style.setProperty('display', 'none', 'important');
    try {
        const response = await fetch('/dashboard_tasks',
            {
                method: 'GET',
            }
        );
        const data = await response.json();


        if (data.success) {
            if (data.tasks.length === 0) {
                console.log('No tasks found');
                noTasksMsg.style.setProperty('display', 'flex', 'important');
                todaySection.style.setProperty('display', 'none', 'important');
                tomorrowSection.style.setProperty('display', 'none', 'important');
            }
            else {
                noTasksMsg.style.setProperty('display', 'none', 'important');
                todaySection.style.setProperty('display', 'flex', 'important');
                tomorrowSection.style.setProperty('display', 'flex', 'important');
                setUpTasks(data.tasks, todaySection, tomorrowSection);
                checkTasksCards();
            }
        }

    }
    catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function checkTasksCards() {
    const todayPendingTasks = document.querySelector('.accordion-body.today-pending-tasks-body');
    const todayCompletedTasks = document.querySelector('.accordion-body.today-completed-tasks-body');
    const tomorrowPendingTasks = document.querySelector('.accordion-body.tomorrow-pending-tasks-body');
    const tomorrowCompletedTasks = document.querySelector('.accordion-body.tomorrow-completed-tasks-body');
    if (todayPendingTasks.querySelectorAll('.task-card').length === 0) {
        todayPendingTasks.innerHTML = noTasksMessage();
    }
    if (todayCompletedTasks.querySelectorAll('.task-card').length === 0) {
        todayCompletedTasks.innerHTML = noTasksMessage();
    }
    if (tomorrowPendingTasks.querySelectorAll('.task-card').length === 0) {
        tomorrowPendingTasks.innerHTML = noTasksMessage();
    }
    if (tomorrowCompletedTasks.querySelectorAll('.task-card').length === 0) {
        tomorrowCompletedTasks.innerHTML = noTasksMessage();
    }
}

function noTasksMessage() {
    return `<div class="msg">
                <i class="fas fa-check-circle" style="font-size: 2rem; color: #359b54;"></i>
                <span class="fw-bold">No tasks scheduled!</span>
            </div>`;
}


function setUpTasks(tasks, todaySection, tomorrowSection) {
    document.querySelectorAll('.accordion-body').forEach(body => body.innerHTML = '');
    tasks.forEach(task => {
        if (task.is_today) {
            if (task.is_completed) {
                todaySection.querySelector('.accordion-body.today-completed-tasks-body').innerHTML += createTaskCard(task, true);
            } else {
                todaySection.querySelector('.accordion-body.today-pending-tasks-body').innerHTML += createTaskCard(task, false);
            }
        }
        else if (task.is_tomorrow) {
            if (task.is_completed) {
                tomorrowSection.querySelector('.accordion-body.tomorrow-completed-tasks-body').innerHTML += createTaskCard(task, true);
            } else {
                tomorrowSection.querySelector('.accordion-body.tomorrow-pending-tasks-body').innerHTML += createTaskCard(task, false);
            }
        }
    });
}

function createTaskCard(task, isCompleted) {
    const priorityColors = {
        high: ['#00a339c3', '#1eed4e', '#3ef469'],
        medium: ['#FEF3C7', '#92400E', '#ffcc00'],
        low: ['#ffb8b8', '#991B1B', '#ea2828']
    };
    const colors = priorityColors[String(task.priority).trim().toLowerCase()];

    const isDone = isCompleted ? 'done-card' : '';
    const doneSvg = isCompleted ? 'done-text mark-done-svg-1' : '';

    return `
                    <div class="task-card ${isDone}" id="task-card-${task.id}">
                        <div class="d-flex align-items-center justify-content-center gap-3" style="width: 100%;">
                            <span>${task.title}</span>
                            <span class="priority-icon" style="${colors ? `background-color: ${colors[0]}; color: ${colors[1]}; border-color: ${colors[2]};` : ''}">${task.priority}</span>
                        </div>
                        <div class="d-flex align-items-center justify-content-center gap-3" style="width: 100%;">
                        <button class="custom-btn" onclick="markMainTaskDone(${task.id})">
                            <svg width="22px" height="22px"
                                class="mark-done-svg ${doneSvg}"
                                viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </button>
                        <button class="custom-delete-btn" onclick="deleteMainTask(${task.id})">
                                <svg class="custom-delete-icon" width="22px" height="22px" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                    d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                </svg>
                        </button>
                        </div>
                    </div>`;
}

document.addEventListener('DOMContentLoaded', function () {
    const newUserMessage = document.getElementById('new-user-message');
    if (newUserMessage == null) {
        loadDashboardStats();
        loadDashboardTasks();
    }

});