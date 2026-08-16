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