let timerInterval = null;

document.getElementById('sessionForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/start_session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject),
        });
        const data = await response.json();

        if (data.success) {
            const pomodoroBtn = document.getElementById('pomodoro-btn');
            const timerDisplay = document.getElementById('timer-display');

            if (pomodoroBtn && timerDisplay) {
                pomodoroBtn.dataset.sessionActive = 'true';
                pomodoroBtn.dataset.initialDuration = formObject.period;
                pomodoroBtn.dataset.startTimestamp = (Date.now() / 1000).toString();
                pomodoroBtn.style.display = 'flex';
                initializePomodoro();
            }
            this.reset();
        }
    }
    catch (error) {
        console.error('Error submitting session form:', error);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const pomodoroBtn = document.getElementById('pomodoro-btn');
    if (pomodoroBtn && pomodoroBtn.dataset.sessionActive === 'true' && pomodoroBtn.dataset.initialDuration && pomodoroBtn.dataset.startTimestamp) {
        pomodoroBtn.style.display = 'flex';
        initializePomodoro();
    }
    setupPomodoroControls();
});

function initializePomodoro() {
    const pomodoroBtn = document.getElementById('pomodoro-btn');

    let initialDurationMinutes = parseInt(pomodoroBtn.dataset.initialDuration, 10);
    let startTimestamp = parseFloat(pomodoroBtn.dataset.startTimestamp);
    let currentTime = Date.now() / 1000;
    let elapsedTimeSeconds = currentTime - startTimestamp;
    let totalSessionDurationSeconds = initialDurationMinutes * 60;

    window.totalSecondsLeft = Math.max(0, Math.floor(totalSessionDurationSeconds - elapsedTimeSeconds));

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    updateDisplay();

    timerInterval = setInterval(() => {
        if (window.totalSecondsLeft > 0) {
            window.totalSecondsLeft--;
            updateDisplay();
        } else {
            clearInterval(timerInterval);
            sessionEnded();
        }
    }, 1000);
}

function updateDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    if (!timerDisplay) return;

    const remainingSeconds = Math.max(0, Math.floor(window.totalSecondsLeft || 0));
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function setupPomodoroControls() {
    const addTimeBtn = document.getElementById('add-time-btn');
    const endSessionBtn = document.getElementById('end-session-btn');

    if (addTimeBtn) {
        addTimeBtn.addEventListener('click', async () => {
            const addedMinutes = 5;
            try {
                const response = await fetch('/update_session_duration', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ added_time: addedMinutes }),
                });
                const data = await response.json();
                if (data.success) {
                    window.totalSecondsLeft += addedMinutes * 60;
                    updateDisplay();
                }
            } catch (error) {
                console.error('Error adding time:', error);
            }
        });
    }

    if (endSessionBtn) {
        endSessionBtn.addEventListener('click', async () => {
            await sessionEnded();
        });
    }
}

async function sessionEnded() {
    const pomodoroBtn = document.getElementById('pomodoro-btn');
    if (timerInterval) clearInterval(timerInterval);

    try {
        let startTimestamp = parseFloat(pomodoroBtn.dataset.startTimestamp);
        let currentTime = Date.now() / 1000;
        let elapsedTimeSeconds = Math.max(0, currentTime - startTimestamp);
        let elapsedMinutes = Math.round(elapsedTimeSeconds / 60);

        const response = await fetch('/session_ended', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elapsed_minutes: elapsedMinutes }),
        });
        const data = await response.json();
        if (data.success) {
            pomodoroBtn.dataset.sessionActive = 'false';
            pomodoroBtn.style.display = 'none';
            document.getElementById('session-duration').textContent = elapsedMinutes;
            document.getElementById('session-subject').textContent = data.subject_name;
            document.getElementById('session-title').textContent = data.session_name;
            showModal('sessionEndedModal');
        }
    }
    catch (error) {
        console.error('Error ending session:', error);
    }
}

function renameSessionModal(sessionId, sessionTitle) {
    var form = document.getElementById('renameSessionForm');
    if (form) {
        form.action = '/rename_session/' + sessionId;
    }

    var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('renameSessionModal'));
    document.getElementById('session_title').value = sessionTitle;
    myModal.show();
}

function deleteSession() {
    var form = document.getElementById('renameSessionForm');
    if (form) {
        form.action = '/delete_session/' + form.action.split('/').pop();
        form.submit();
    }
}