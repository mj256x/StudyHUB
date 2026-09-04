document.addEventListener('DOMContentLoaded', function () {
    flatpickr("#deadline", {
        dateFormat: "Y-m-d",
        locale: "en"
    });
});

function MainTaskCard(isDone, mainTaskId) {
    const mainTaskCard = document.getElementById('main-task-card-' + mainTaskId);
    const mainTaskHeader = document.getElementById('main-task-header-' + mainTaskId);
    const mainTaskFooter = document.getElementById('main-task-footer-' + mainTaskId);
    const mainTaskDoneBtn = document.getElementById('mark-as-done-btn-' + mainTaskId);
    const mainTaskDoneSvg = document.getElementById('main-done-svg-' + mainTaskId);
    const mainTaskBtnText = document.getElementById('btn-text-' + mainTaskId);
    const mainTaskDotsBtn = document.getElementById('dots-btn-' + mainTaskId);
    const mainTaskAddSubTaskBtn = document.getElementById('add-sub-task-btn-' + mainTaskId);
    const mainTaskShowSubTasksBtn = document.getElementById('show-sub-tasks-btn-' + mainTaskId);
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
        mainTaskShowSubTasksBtn.classList.add('done-btn-active');
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
        mainTaskShowSubTasksBtn.classList.remove('done-btn-active');
        mainTaskAddSubTaskBtn.classList.remove('done-btn-active');
    }
}

function SubTasksCards(isDone, mainTaskId) {
    const subTaskCards = document.querySelectorAll(`[data-sub-task-main-task-id="${mainTaskId}"]`);
    subTaskCards.forEach(card => {
        const subTaskId = card.getAttribute('data-sub-task-id');
        const sub_card = document.getElementById('sub-task-card-' + subTaskId);
        const sub_doneSvg = document.getElementById('sub-done-svg-' + subTaskId);
        const subTaskText = document.getElementById('sub-task-text-' + subTaskId);
        const subTaskDotsBtn = document.getElementById('sub-task-dots-btn-' + subTaskId);
        if (isDone) {
            sub_card.classList.add('done-card');
            sub_doneSvg.classList.add('done-text');
            sub_doneSvg.classList.add('mark-done-svg-1');
            subTaskText.classList.add('done-text');
            subTaskText.style.textDecoration = 'line-through';
            subTaskDotsBtn.classList.add('done-dots-btn');
        }
        else {
            sub_card.classList.remove('done-card');
            sub_doneSvg.classList.remove('done-text');
            sub_doneSvg.classList.remove('mark-done-svg-1');
            subTaskText.classList.remove('done-text');
            subTaskText.style.textDecoration = 'none';
            subTaskDotsBtn.classList.remove('done-dots-btn');
        }
    });
}

async function toggleSubTaskDone(subTaskId, mainTaskId) {
    try {
        const response = await fetch('/toggle_sub_task_done/' + subTaskId, {
            method: 'POST',
        });

        const data = await response.json();

        if (data.success) {
            const card = document.getElementById('sub-task-card-' + subTaskId);
            const sub_doneSvg = document.getElementById('sub-done-svg-' + subTaskId);
            const subTaskText = document.getElementById('sub-task-text-' + subTaskId);
            const subTaskDotsBtn = document.getElementById('sub-task-dots-btn-' + subTaskId);
            if (data.new_status) {
                card.classList.add('done-card');
                sub_doneSvg.classList.add('done-text');
                sub_doneSvg.classList.add('mark-done-svg-1');
                subTaskText.classList.add('done-text');
                subTaskText.style.textDecoration = 'line-through';
                subTaskDotsBtn.classList.add('done-dots-btn');
            } else {
                card.classList.remove('done-card');
                sub_doneSvg.classList.remove('done-text');
                sub_doneSvg.classList.remove('mark-done-svg-1');
                subTaskText.classList.remove('done-text');
                subTaskText.style.textDecoration = 'none';
                subTaskDotsBtn.classList.remove('done-dots-btn');
            }
            if (data.main_task_status) {
                MainTaskCard(true, mainTaskId);
            }
            else {
                MainTaskCard(false, mainTaskId);
            }
        }
    } catch (error) {
        console.error('Error toggling sub-task status:', error);
    }
}

async function toggleMainTaskDone(mainTaskId) {
    try {
        const response = await fetch('/mark_task_as_done/' + mainTaskId, {
            method: 'POST',
        });

        const data = await response.json();

        if (data.success) {
            if (data.new_status) {
                MainTaskCard(true, mainTaskId);
                SubTasksCards(true, mainTaskId);
            }
            else {
                MainTaskCard(false, mainTaskId);
                SubTasksCards(false, mainTaskId);
            }
        }

    } catch (error) {
        console.error('Error marking task as done:', error);
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
                MainTaskCard(true, mainTaskId);
            }
            else {
                MainTaskCard(false, mainTaskId);
            }
        }
    } catch (error) {
        console.error('Error deleting sub-task:', error);
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
            subjectSelectContainer.required = true;
            modalTitle.innerText = 'Add a Main Task';
        } else if (type === 'sub') {
            form.action = '/add_sub_tasks/' + MainTaskId;
            subjectSelectContainer.style.display = 'none';
            subjectSelectContainer.disabled = true;
            subjectSelectContainer.required = false;
            modalTitle.innerText = 'Add a Sub Task';
        }
    }
    showModal('addTaskModal');
}

function renameTask(type, MainSubTaskId, currentName) {
    const renameModalLabel = document.getElementById('renameModalLabel');
    const form = document.getElementById('renameForm');
    const inputField = document.getElementById('rename_input');
    inputField.value = currentName;
    if (form) {
        if (type === 'main') {
            form.action = '/rename_main_task/' + MainSubTaskId;
            renameModalLabel.innerText = 'Rename Main Task';
            inputField.setAttribute('name', 'new_main_task_name');
        } else if (type === 'sub') {
            form.action = '/rename_sub_task/' + MainSubTaskId;
            renameModalLabel.innerText = 'Rename Sub Task';
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
    const formattedDeadline = currentDeadline ? currentDeadline.toString().trim().split(' ')[0].split('T')[0] : '';
    inputField.value = formattedDeadline;
    flatpickr(inputField, {
        dateFormat: "Y-m-d",
        locale: "en",
        defaultDate: formattedDeadline || undefined
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
    highOption.disabled = false;
    mediumOption.disabled = false;
    lowOption.disabled = false;
    highOption.selected = false;
    mediumOption.selected = false;
    lowOption.selected = false;
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
    const subjects = document.querySelectorAll('.subjects-options');
    subjects.forEach(subject => {
        subject.disabled = false;
        subject.selected = false;
        subject.hidden = false;
    });
    subjects.forEach(subject => {
        if (subject.value === currentSubjectId) {
            subject.selected = true;
            subject.disabled = true;
            subject.hidden = true;
        }
    });
    showModal('changeTaskSubjectModal');
}


document.getElementById('changeTaskSubjectForm').addEventListener('submit', function (event) {
    const subjects = document.querySelectorAll('.subjects-options');
    subjects.forEach(subject => {
        if (subject.disabled && subject.selected) {
            event.preventDefault();
            return false;
        }
    });
});

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
                });
                btn.setAttribute('data-active', 'true');
                btn.classList.add('done-btn-active');
                doneTasksIcon.classList.add('done-text');
                doneTasksText.classList.add('done-text');
                doneTasksText.innerText = "Show All Tasks";
            }
        } catch (error) {
            console.error('Error fetching done tasks:', error);
        }
    }
    else {
        const tasksCards = document.querySelectorAll('[data-task-id]');
        tasksCards.forEach(card => {
            card.style.display = 'block';
        });
        btn.setAttribute('data-active', 'false');
        btn.classList.remove('done-btn-active');
        doneTasksIcon.classList.remove('done-text');
        doneTasksText.classList.remove('done-text');
        doneTasksText.innerText = "Show Done Tasks";
    }
}

function filterBySubject(subjectId, btn) {
    let currentActive = btn.getAttribute('data-active') === 'true';
    let newActive = !currentActive;
    const cards = document.querySelectorAll('[data-task-subject-id]');
    const dropdownMenu = btn.closest('.dropdown-menu');
    if (dropdownMenu) {
        const subjectButtons = dropdownMenu.querySelectorAll('.dropdown-item');
        subjectButtons.forEach(button => {
            button.classList.remove('dropdown-item-selected');
            button.setAttribute('data-active', 'false');
        });
    }
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
        btn.classList.add('dropdown-item-selected');
    } else {
        cards.forEach(card => {
            card.style.display = 'block';
        });
        btn.setAttribute('data-active', 'false');
        btn.classList.remove('dropdown-item-selected');
    }
}

function filterByPriority(type, priority, btn, mainTaskId = null) {
    let currentActive = btn.getAttribute('data-active') === 'true';
    let newActive = !currentActive;
    const dropdownMenu = btn.closest('.dropdown-menu');
    if (dropdownMenu) {
        const filterButtons = dropdownMenu.querySelectorAll('.priority-filter-btn, .deadline-filter-btn');
        filterButtons.forEach(button => {
            button.classList.remove('dropdown-item-selected');
            button.setAttribute('data-active', 'false');
        });
    }

    if (newActive) {
        if (type === 'main') {
            const mainCards = document.querySelectorAll('[data-task-priority]');
            mainCards.forEach(card => {
                const cardPriority = card.getAttribute('data-task-priority');
                if (cardPriority && cardPriority.toLowerCase() === priority) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        } else if (type === 'sub') {
            const subCards = document.querySelectorAll(`[data-sub-task-main-task-id="${mainTaskId}"]`);
            subCards.forEach(card => {
                const cardPriority = card.getAttribute('data-sub-task-priority');
                if (cardPriority && cardPriority.toLowerCase() === priority) {
                    card.style.setProperty('display', 'flex', 'important');
                } else {
                    card.style.setProperty('display', 'none', 'important');
                }
            });
        }
        btn.setAttribute('data-active', 'true');
        btn.classList.add('dropdown-item-selected');
    } else {
        if (type === 'main') {
            const mainCards = document.querySelectorAll('[data-task-priority]');
            mainCards.forEach(card => {
                card.style.display = 'block';
            });
        } else if (type === 'sub') {
            const subCards = document.querySelectorAll(`[data-sub-task-main-task-id="${mainTaskId}"]`);
            subCards.forEach(card => {
                card.style.removeProperty('display');
            });
        }
        btn.setAttribute('data-active', 'false');
        btn.classList.remove('dropdown-item-selected');
    }
}

function getDeadlineStatus(deadlineStr) {
    if (!deadlineStr || typeof deadlineStr !== 'string' || deadlineStr.trim() === '') {
        return {
            diffDays: null,
            isToday: false,
            isTomorrow: false,
            isThisWeek: false,
            isOverdue: false,
            isUpcoming: false
        };
    }

    const datePart = deadlineStr.trim().split(' ')[0].split('T')[0];
    const parts = datePart.split('-');
    if (parts.length !== 3) {
        return {
            diffDays: null,
            isToday: false,
            isTomorrow: false,
            isThisWeek: false,
            isOverdue: false,
            isUpcoming: false
        };
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return {
            diffDays: null,
            isToday: false,
            isTomorrow: false,
            isThisWeek: false,
            isOverdue: false,
            isUpcoming: false
        };
    }

    const taskDate = new Date(year, month, day);
    taskDate.setHours(0, 0, 0, 0);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);

    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return {
        diffDays: diffDays,
        isToday: diffDays === 0,
        isTomorrow: diffDays === 1,
        isThisWeek: diffDays >= 0 && diffDays <= 7,
        isOverdue: diffDays < 0,
        isUpcoming: diffDays >= 0,
        taskDate: taskDate
    };
}

function filterByDeadline(type, filterType, btn, mainTaskId = null) {
    let currentActive = btn.getAttribute('data-active') === 'true';
    let newActive = !currentActive;
    const dropdownMenu = btn.closest('.dropdown-menu');
    if (dropdownMenu) {
        const filterButtons = dropdownMenu.querySelectorAll('.priority-filter-btn, .deadline-filter-btn');
        filterButtons.forEach(button => {
            button.classList.remove('dropdown-item-selected');
            button.setAttribute('data-active', 'false');
        });
    }

    if (newActive) {
        if (type === 'main') {
            const mainCards = document.querySelectorAll('[data-task-deadline]');
            mainCards.forEach(card => {
                const deadline = card.getAttribute('data-task-deadline');
                const status = getDeadlineStatus(deadline);
                let matches = false;
                if (filterType === 'today') matches = status.isToday;
                else if (filterType === 'tomorrow') matches = status.isTomorrow;
                else if (filterType === 'this-week') matches = status.isThisWeek;
                else if (filterType === 'overdue') matches = status.isOverdue;
                else if (filterType === 'upcoming') matches = status.isUpcoming;

                if (matches) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        } else if (type === 'sub') {
            const subCards = document.querySelectorAll(`[data-sub-task-main-task-id="${mainTaskId}"]`);
            subCards.forEach(card => {
                const deadline = card.getAttribute('data-sub-task-deadline');
                const status = getDeadlineStatus(deadline);
                let matches = false;
                if (filterType === 'today') matches = status.isToday;
                else if (filterType === 'tomorrow') matches = status.isTomorrow;
                else if (filterType === 'this-week') matches = status.isThisWeek;
                else if (filterType === 'overdue') matches = status.isOverdue;
                else if (filterType === 'upcoming') matches = status.isUpcoming;

                if (matches) {
                    card.style.setProperty('display', 'flex', 'important');
                } else {
                    card.style.setProperty('display', 'none', 'important');
                }
            });
        }
        btn.setAttribute('data-active', 'true');
        btn.classList.add('dropdown-item-selected');
    } else {
        if (type === 'main') {
            const mainCards = document.querySelectorAll('[data-task-deadline]');
            mainCards.forEach(card => {
                card.style.display = 'block';
            });
        } else if (type === 'sub') {
            const subCards = document.querySelectorAll(`[data-sub-task-main-task-id="${mainTaskId}"]`);
            subCards.forEach(card => {
                card.style.removeProperty('display');
            });
        }
        btn.setAttribute('data-active', 'false');
        btn.classList.remove('dropdown-item-selected');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const priorityCards = document.querySelectorAll('.priority-icon');
    priorityCards.forEach(card => {
        const priority = card.textContent.trim().toLowerCase();
        if (priority === 'high') {
            card.style.backgroundColor = '#00a339c3';
            card.style.color = '#1eed4e';
            card.style.borderColor = '#3ef469';
        }
        else if (priority === 'medium') {
            card.style.backgroundColor = '#FEF3C7';
            card.style.color = '#92400E';
            card.style.borderColor = '#ffcc00';
        }
        else if (priority === 'low') {
            card.style.backgroundColor = '#ffb8b8';
            card.style.color = '#991B1B';
            card.style.borderColor = '#ea2828';
        }
    });

    const deadlineIcons = document.querySelectorAll('.deadline-icon');
    deadlineIcons.forEach(icon => {
        const textSpan = icon.querySelector('span');
        const text = textSpan ? textSpan.textContent.trim() : icon.textContent.trim();
        const status = getDeadlineStatus(text);
        if (status.isOverdue) {
            icon.classList.add('overdue');
        } else if (status.isToday) {
            icon.classList.add('today');
        }
    });
});
