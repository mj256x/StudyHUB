document.addEventListener('DOMContentLoaded', function () {
    flatpickr("#deadline", {
        dateFormat: "Y-m-d",
        locale: "en"
    });
});

function toggleMainTaskDone(isDone, mainTaskId) {
    const mainTaskCard = document.getElementById('main-task-card-' + mainTaskId);
    const mainTaskHeader = document.getElementById('main-task-header-' + mainTaskId);
    const mainTaskFooter = document.getElementById('main-task-footer-' + mainTaskId);
    const mainTaskDoneBtn = document.getElementById('mark-as-done-btn-' + mainTaskId);
    const mainTaskDoneSvg = document.getElementById('done-svg-' + mainTaskId);
    const mainTaskBtnText = document.getElementById('btn-text-' + mainTaskId);
    const mainTaskDotsBtn = document.getElementById('dots-btn-' + mainTaskId);
    const mainTaskAddSubTaskBtn = document.getElementById('add-sub-task-btn-' + mainTaskId);
    if (isDone) {
        mainTaskCard.classList.add('done-border');
        mainTaskCard.classList.add('done-all-card');
        mainTaskHeader.classList.add('done-border-bottom');
        mainTaskFooter.classList.add('done-border-top');
        mainTaskDoneBtn.classList.add('done-btn-active');
        mainTaskDoneSvg.classList.add('done-text');
        mainTaskBtnText.classList.add('done-text');
        mainTaskBtnText.innerText = 'Mark as Undone';
        mainTaskDotsBtn.classList.add('done-dots-btn');
        mainTaskAddSubTaskBtn.classList.add('done-btn-active');
    } else {
        mainTaskCard.classList.remove('done-border');
        mainTaskCard.classList.remove('done-all-card');
        mainTaskHeader.classList.remove('done-border-bottom');
        mainTaskFooter.classList.remove('done-border-top');
        mainTaskDoneBtn.classList.remove('done-btn-active');
        mainTaskDoneSvg.classList.remove('done-text');
        mainTaskBtnText.classList.remove('done-text');
        mainTaskBtnText.innerText = 'Mark as Done';
        mainTaskDotsBtn.classList.remove('done-dots-btn');
        mainTaskAddSubTaskBtn.classList.remove('done-btn-active');
    }
}

async function deleteSubTask(subTaskId, mainTaskId) {
    try {
        const response = await fetch('/delete_sub_task/' + subTaskId, {
            method: 'POST',
        });
        const data = await response.json();
        if (data.success) {
            const card = document.getElementById('sub-task-card-' + subTaskId);
            if (card) {
                card.remove();
            }
            if (data.main_task_status) {
                toggleMainTaskDone(true, mainTaskId);
            }
            else {
                toggleMainTaskDone(false, mainTaskId);
            }
        }
    } catch (error) {
        console.error('Error deleting sub-task:', error);
    }
}

async function toggleSubTaskDone(subTaskId, mainTaskId) {
    try {
        const response = await fetch('/toggle_sub_task_done/' + subTaskId, {
            method: 'POST',
        });

        const data = await response.json();

        if (data.success) {
            const card = document.getElementById('sub-task-card-' + subTaskId);
            const doneSvg = document.getElementById('done-svg-' + subTaskId);
            const subTaskText = document.getElementById('sub-task-text-' + subTaskId);
            const subTaskDotsBtn = document.getElementById('sub-task-dots-btn-' + subTaskId);
            if (data.new_status) {
                card.classList.add('done-card');
                doneSvg.classList.add('done-text');
                doneSvg.classList.add('mark-done-svg-1');
                subTaskText.classList.add('done-text');
                subTaskText.style.textDecoration = 'line-through';
                subTaskDotsBtn.classList.add('done-dots-btn');
            } else {
                card.classList.remove('done-card');
                doneSvg.classList.remove('done-text');
                doneSvg.classList.remove('mark-done-svg-1');
                subTaskText.classList.remove('done-text');
                subTaskText.classList.remove('done-text');
                subTaskText.style.textDecoration = 'none';
                subTaskDotsBtn.classList.remove('done-dots-btn');
            }
            if (data.main_task_status) {
                toggleMainTaskDone(true, mainTaskId);
            }
            else {
                toggleMainTaskDone(false, mainTaskId);
            }
        }
    } catch (error) {
        console.error('Error toggling sub-task status:', error);
    }
}


function openTaskCardModal(type, MainTaskId = null) {
    const form = document.getElementById('addTaskCardForm');
    const subjectSelectContainer = document.getElementById('subject-select');
    const modalTitle = document.getElementById('task_modal_title');

    if (form) {
        if (type === 'main') {
            form.action = '/add_main_tasks';
            subjectSelectContainer.style.display = 'block';
            subjectSelectContainer.disabled = false;
            modalTitle.innerText = 'Add a Main Task';
        } else if (type === 'sub') {
            form.action = '/add_sub_tasks/' + MainTaskId;
            subjectSelectContainer.style.display = 'none';
            subjectSelectContainer.disabled = true;
            modalTitle.innerText = 'Add a Sub Task';
        }
    }
    showModal('addTaskModal');
}


async function markAsDone(mainTaskId) {
    try {
        const response = await fetch('/mark_task_as_done/' + mainTaskId, {
            method: 'POST',
        });

        const data = await response.json();

        if (data.success) {
            if (data.new_status) {
                toggleMainTaskDone(true, mainTaskId);
            }
            else {
                toggleMainTaskDone(false, mainTaskId);
            }
            location.reload();
        }

    } catch (error) {
        console.error('Error marking task as done:', error);
    }
}

function renameTask(type, MainSubTaskId, currentName) {
    const renameModalLabel = document.getElementById('renameModalLabel');
    renameModalLabel.textContent = 'Rename Sub Task:';
    const form = document.getElementById('renameForm');
    const inputField = document.getElementById('rename_input');
    inputField.value = currentName;
    if (form) {
        if (type === 'main') {
            form.action = '/rename_main_task/' + MainSubTaskId;
            inputField.setAttribute('name', 'new_main_task_name');
        } else if (type === 'sub') {
            form.action = '/rename_sub_task/' + MainSubTaskId;
            inputField.setAttribute('name', 'new_sub_task_name');
        }
    }
    showModal('renameModal');
}

function changeDeadline(type, MainSubTaskId, currentDeadline) {
    const form = document.getElementById('changeDeadlineForm');
    if (form) {
        if (type === 'main') {
            form.action = '/change_main_task_deadline/' + MainSubTaskId;
        } else if (type === 'sub') {
            form.action = '/change_sub_task_deadline/' + MainSubTaskId;
        }
    }
    const inputField = document.getElementById('new_deadline_input');
    inputField.value = currentDeadline;
    flatpickr(inputField, {
        dateFormat: "Y-m-d",
        locale: "en"
    });
    showModal('changeDeadlineModal');
}

function changePriority(type, MainSubTaskId, currentPriority) {
    const form = document.getElementById('changePriorityForm');
    if (form) {
        if (type === 'main') {
            form.action = '/change_main_task_priority/' + MainSubTaskId;
        } else if (type === 'sub') {
            form.action = '/change_sub_task_priority/' + MainSubTaskId;
        }
    }
    const highOption = document.getElementById('high-option');
    const mediumOption = document.getElementById('medium-option');
    const lowOption = document.getElementById('low-option');
    if (currentPriority === 'High') {
        highOption.selected = true;
        highOption.disabled = true;
    } else if (currentPriority === 'Medium') {
        mediumOption.selected = true;
        mediumOption.disabled = true;
    } else if (currentPriority === 'Low') {
        lowOption.selected = true;
        lowOption.disabled = true;
    }
    showModal('changePriorityModal');
}

function changeTaskSubject(MainTaskId, currentSubjectId) {
    const form = document.getElementById('changeTaskSubjectForm');
    if (form) {
        form.action = '/change_main_task_subject/' + MainTaskId;
    }
    const subjects = document.querySelectorAll('option[id="subject-option"]');
    subjects.forEach(subject => {
        if (subject.value === currentSubjectId) {
            subject.selected = true;
            subject.disabled = true;
        }
    });
    showModal('changeTaskSubjectModal');
}

async function doneButtonDisabled(mainTaskId) {
    try {
        const response = await fetch('/main_task_sub_tasks_num/' + mainTaskId, {
            method: 'GET',
        });
        const data = await response.json();
        const doneButton = document.getElementById('mark-as-done-btn-' + mainTaskId);
        if (data.success) {
            if (data.sub_tasks_num == 0) {
                doneButton.classList.add('disabled-btn');
            } else {
                doneButton.classList.remove('disabled-btn');
            }
        }
    } catch (error) {
        console.error('Error checking done button status:', error);
    }
}

async function showDoneTasks(btn) {
    let currentActive = btn.getAttribute('data-active') === 'true';
    let newActive = !currentActive;
    const doneTasksIcon = document.getElementById('done-tasks-icon');
    const doneTasksText = document.getElementById('done-tasks-text');
    if (newActive) {
        try {
            const response = await fetch('/get_done_tasks', {
                method: 'GET',
            });
            const data = await response.json();
            if (data.success && data.tasks) {
                const tasksCards = document.querySelectorAll('[data-task-id]');
                tasksCards.forEach(card => {
                    const taskId = card.getAttribute('data-task-id');
                    const isDone = data.tasks[taskId];
                    if (isDone) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                    btn.setAttribute('data-active', 'true');
                    btn.classList.add('done-btn-active');
                    doneTasksIcon.classList.add('done-text');
                    doneTasksText.classList.add('done-text');
                    doneTasksText.innerText = "Show All Tasks";
                });
            }
        } catch (error) {
            console.error('Error fetching done tasks:', error);
        }
    }
    else {
        const tasksCards = document.querySelectorAll('[data-task-id]');
        tasksCards.forEach(card => {
            card.style.display = 'block';
            btn.setAttribute('data-active', 'false');
            btn.classList.remove('done-btn-active');
            doneTasksIcon.classList.remove('done-text');
            doneTasksText.classList.remove('done-text');
            doneTasksText.innerText = "Show Done Tasks";
        });
    }
}

function filterBySubject(subjectId, btn) {
    let currentActive = btn.getAttribute('data-active') === 'true';
    let newActive = !currentActive;
    const cards = document.querySelectorAll('[data-task-subject-id]');
    if (newActive) {
        cards.forEach(card => {
            const cardSubjectId = card.getAttribute('data-task-subject-id');
            if (cardSubjectId === subjectId) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        btn.setAttribute('data-active', 'true');
        const subjectButtons = document.querySelectorAll('.dropdown-item');
        subjectButtons.forEach(button => {
            button.classList.remove('dropdown-item-selected');
        });
        btn.classList.add('dropdown-item-selected');
    } else {
        cards.forEach(card => {
            card.style.display = 'block';
        });
        btn.setAttribute('data-active', 'false');
        const subjectButtons = document.querySelectorAll('.dropdown-item');
        subjectButtons.forEach(button => {
            button.classList.remove('dropdown-item-selected');
        });
        btn.classList.remove('dropdown-item-selected');
    }
}

function filterByPriority(priority, btn) {
    let currentActive = btn.getAttribute('data-active') === 'true';
    let newActive = !currentActive;
    const cards = document.querySelectorAll('[data-task-priority]');
    if (newActive) {
        cards.forEach(card => {
            const cardPriority = card.getAttribute('data-task-priority');
            if (cardPriority.toLocaleLowerCase() === priority) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        btn.setAttribute('data-active', 'true');
        const subjectButtons = document.querySelectorAll('.dropdown-item');
        subjectButtons.forEach(button => {
            button.classList.remove('dropdown-item-selected');
        });
        btn.classList.add('dropdown-item-selected');
    } else {
        cards.forEach(card => {
            card.style.display = 'block';
        });
        btn.setAttribute('data-active', 'false');
        const subjectButtons = document.querySelectorAll('.dropdown-item');
        subjectButtons.forEach(button => {
            button.classList.remove('dropdown-item-selected');
        });
        btn.classList.remove('dropdown-item-selected');
    }
}

