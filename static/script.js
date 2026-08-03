
setTimeout(function () {
    const flashMessage = document.getElementById('flash');
    if (flashMessage) {
        flashMessage.style.display = 'none';
    }
}, 3000);

document.addEventListener('DOMContentLoaded', function () {
    const progressBars = document.querySelectorAll('.progress-bar');

    progressBars.forEach(bar => {
        const progress = parseInt(bar.getAttribute('aria-valuenow')) || 0;

        if (progress <= 25) {
            bar.classList.add('progress-danger');
        } else if (progress <= 50) {
            bar.classList.add('progress-warning');
        }
        else if (progress <= 75) {
            bar.classList.add('progress-nearly-success');
        } else {
            bar.classList.add('progress-success');
        }
    });
});

async function downloadFile(fileUrl, fileName) {
    try {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    }
    catch (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download file. Please try again later.');
    }
}

function moveORcopyFileToAnotherFolder(fileId, action) {
    document.getElementById('fileIdInput').value = fileId;

    var form = document.getElementById('moveCopyForm');
    var submitBtn = document.getElementById('moveCopyBtn');

    if (action === 'move') {
        form.action = '/move_file';
        submitBtn.innerText = 'Move File';
    } else if (action === 'copy') {
        form.action = '/copy_file';
        submitBtn.innerText = 'Copy File';
    }

    var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('moveORcopyFileModal'));
    myModal.show();
}

async function toggleDone(fileId) {
    try {
        const response = await fetch('/toggle_done/' + fileId, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
            const card = document.getElementById('file-card-' + fileId);
            const btnText = document.getElementById('btn-text-' + fileId);
            const doneBtn = document.getElementById('done-btn-' + fileId);

            if (data.new_status) {
                card.classList.add('done-card');
                btnText.innerText = 'Mark as Undone';
                doneBtn.classList.add('done-btn-active');
            } else {
                card.classList.remove('done-card');
                btnText.innerText = 'Mark as Done';
                doneBtn.classList.remove('done-btn-active');
            }
        } else {
            alert('Failed to mark file as done/undone. Please try again later.');
        }
    } catch (error) {
        console.error('Error toggling done status:', error);
    }
}

function renameSubject(subjectId, currentName) {
    var form = document.getElementById('renameSubjectForm');
    if (form) {
        form.action = '/rename_subject/' + subjectId;
    }

    var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('renameSubjectModal'));
    var inputField = document.getElementById('rename_subject_input');
    inputField.value = currentName;
    myModal.show();
}

async function toggleFavorite(subjectId, btnElement) {
    try {
        const response = await fetch('/add_to_favorite/' + subjectId, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
            const svg = btnElement.querySelector('.favorite-icon');
            const textSpan = btnElement.querySelector('.favorite-text');

            if (data.new_status) {
                svg.classList.add('favorite-btn');
                textSpan.innerText = 'Remove from Favorites';
            } else {
                svg.classList.remove('favorite-btn');
                textSpan.innerText = 'Add to Favorites';
            }
        } else {
            alert('Failed to update favorite status.');
        }
    } catch (error) {
        console.error('Error toggling favorite status:', error);
    }
}

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
            subjectSelectContainer.style.display = 'block'; // Show subject dropdown for tasks
            modalTitle.innerText = 'Add The Main Task';
        } else if (type === 'sub') {
            form.action = '/add_sub_tasks';
            subjectSelectContainer.style.display = 'none'; // Show subject dropdown for sub-tasks
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
            checkbox.checked = !isCompleted; // Revert the checkbox on failure
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

function startNewSession() {
    var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('sessionModal'));
    myModal.show();
}

document.addEventListener('DOMContentLoaded', function () {
    const pomodoroBtn = document.getElementById('pomodoro-btn');
    if (pomodoroBtn && pomodoroBtn.dataset.sessionActive === 'true' && pomodoroBtn.dataset.initialDuration && pomodoroBtn.dataset.startTimestamp) {
        pomodoroBtn.style.display = 'flex';
        initializePomodoro();
    }
});

function showPomodoroBtnAndInitialize(initialDuration, startTimestamp) {
    const pomodoroBtn = document.getElementById('pomodoro-btn');
    if (pomodoroBtn) {
        pomodoroBtn.dataset.initialDuration = initialDuration;
        pomodoroBtn.dataset.startTimestamp = startTimestamp;
        pomodoroBtn.dataset.sessionActive = 'true';
        pomodoroBtn.style.display = 'flex';
        initializePomodoro();
    }
}

function initializePomodoro() {
    const timerDisplay = document.getElementById('timer-display');
    const addTimeBtn = document.getElementById('add-time-btn');
    const endSessionBtn = document.getElementById('end-session-btn');
    const pomodoroBtn = document.getElementById('pomodoro-btn');

    let initialDurationMinutes = parseInt(pomodoroBtn.dataset.initialDuration, 10);
    let startTimestamp = parseFloat(pomodoroBtn.dataset.startTimestamp); // Unix timestamp

    let currentTime = Date.now() / 1000; // Current Unix timestamp in seconds
    let elapsedTimeSeconds = currentTime - startTimestamp;
    let totalSessionDurationSeconds = initialDurationMinutes * 60;

    let totalSeconds = Math.max(0, Math.floor(totalSessionDurationSeconds - elapsedTimeSeconds));

    let timerInterval;

    function updateDisplay() {
        const remainingSeconds = Math.max(0, Math.floor(totalSeconds));
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds--;
                updateDisplay();
            } else if (totalSeconds <= 0) {
                clearInterval(timerInterval);
                sessionEnded();
            }
        }, 1000);
    }

    function getElapsedMinutes() {
        const currentTime = Date.now() / 1000;
        const elapsedTimeSeconds = Math.max(0, currentTime - startTimestamp);
        return elapsedTimeSeconds / 60;
    }

    async function sessionEnded() {
        try {
            const response = await fetch('/session_ended', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ elapsed_minutes: getElapsedMinutes() }),
            });
            const data = await response.json();
            if (data.success) {
                pomodoroBtn.dataset.sessionActive = 'false';
                pomodoroBtn.style.display = 'none';
                var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('sessionEndedModal'));
                myModal.show();
            }
        }
        catch (error) {
            console.error('Error ending session:', error);
        }
    }

    addTimeBtn.addEventListener('click', async () => {
        const addedMinutes = 5;
        try {
            const response = await fetch('/update_session_duration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ added_time: addedMinutes }),
            });
            const data = await response.json();
            if (data.success) {
                totalSeconds += addedMinutes * 60;
                updateDisplay();
            }
        } catch (error) {
            console.error('Error adding time:', error);
        }
    });

    endSessionBtn.addEventListener('click', async () => {
        await sessionEnded();
    });

    updateDisplay();
    startTimer();
}