document.addEventListener('DOMContentLoaded', function () {
    flatpickr("#deadline", {
        dateFormat: "Y-m-d",
        locale: "en"
    });
});

function openTaskCardModal(type, MainOrSubTaskId = null) {
    var form = document.getElementById('addTaskCardForm');
    var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addTaskModal'));
    var subjectSelectContainer = document.getElementById('subject-select-container');
    var modalTitle = document.getElementById('modal_title');
    var mainTaskIdInput = document.getElementById('main_task_id');
    var subTaskIdInput = document.getElementById('sub_task_id');

    if (form) {
        if (type === 'main') {
            form.action = '/add_main_tasks';
            subjectSelectContainer.style.display = 'block';
            modalTitle.innerText = 'Add The Main Task';
        } else if (type === 'sub') {
            form.action = '/add_sub_tasks';
            subjectSelectContainer.style.display = 'none';
            mainTaskIdInput.value = MainOrSubTaskId;
            modalTitle.innerText = 'Add Sub Task';
        } else if (type === 'edit_main_task') {
            form.action = '/edit_main_task';
            subjectSelectContainer.style.display = 'block';
            mainTaskIdInput.value = MainOrSubTaskId;
            modalTitle.innerText = 'Edit Main Task';
        } else if (type === 'edit_sub_task') {
            form.action = '/edit_sub_task';
            subjectSelectContainer.style.display = 'none';
            subTaskIdInput.value = MainOrSubTaskId;
            modalTitle.innerText = 'Edit Sub Task';
        }
    }
    myModal.show();
}

async function toggleSubTaskDone(subTaskId) {
    try {
        const response = await fetch('/toggle_sub_task_done/' + subTaskId, {
            method: 'POST',
        });

        const data = await response.json();

        if (data.success) {
            const card = document.getElementById('sub-task-card-' + subTaskId);
            const checkbox = document.getElementById('sub-task-check-' + subTaskId);
            if (data.new_status) {
                card.classList.add('done-card');
                checkbox.classList.add('form-check-input-checked');
            } else {
                card.classList.remove('done-card');
                checkbox.classList.remove('form-check-input-checked');
            }
            location.reload();
        }

        else {
            alert('Failed to update sub-task status. Please try again.');
            const checkbox = document.getElementById('sub-task-check-' + subTaskId);
            const isCompleted = checkbox.checked;
            checkbox.checked = !isCompleted;
        }
    } catch (error) {
        console.error('Error toggling sub-task status:', error);
    }
}

async function markAsDone(mainTaskId) {
    try {
        const response = await fetch('/mark_task_as_done/' + mainTaskId, {
            method: 'POST',
        });

        const data = await response.json();

        if (data.success) {
            const btn = document.getElementById('mark-as-done-btn-' + mainTaskId);
            const btnText = document.getElementById('btn-text-' + mainTaskId);
            if (data.new_status) {

                btn.classList.add('done-btn-active');
                btnText.innerText = 'Mark as Undone';
            }
            else {
                btnText.innerText = 'Mark as Done';
                btn.classList.remove('done-btn-active');
            }
            location.reload();
        }

    } catch (error) {
        console.error('Error marking task as done:', error);
    }
}