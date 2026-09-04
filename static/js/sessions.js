let timerInterval = null;

function createSessionRow(sessionData) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const nowDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
    const tableBody = document.querySelector('.table-body');
    const activeSession = document.querySelector('.active-session');
    const isDisabled = (activeSession && activeSession.dataset.active === 'true') ? 'disabled-btn' : '';
    const newRow = `
                <tr>
                    <td>
                        ${sessionData[0]}
                    </td>
                    <td>
                        <div class="d-flex flex-row justify-content-between align-items-center gap-2">
                            <span>${sessionData[1]}</span>
                            <div class="d-flex flex-row justify-content-between align-items-center gap-2">
                                <button type="button" class="rename-btn"
                                        onclick="renameSession('renameModal', '${sessionData[3]}', '${sessionData[1]}')">
                                    <svg width="22px" height="22px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 20H21M3.00003 20H4.67457C5.16376 20 5.40835 20 5.63852 19.9447C5.84259 19.8957 6.03768 19.8149 6.21663 19.7053C6.41846 19.5816 6.59141 19.4086 6.93732 19.0627L19.5001 6.49998C20.3285 5.67156 20.3285 4.32841 19.5001 3.49998C18.6716 2.67156 17.3285 2.67156 16.5001 3.49998L3.93729 16.0627C3.59139 16.4086 3.41843 16.5816 3.29475 16.7834C3.18509 16.9624 3.10428 17.1574 3.05529 17.3615C3.00003 17.5917 3.00003 17.8363 3.00003 18.3255V20Z"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                                <button type="button"
                                    class="custom-delete-btn ${isDisabled}"
                                    onclick="deleteSession('${sessionData[3]}', this)"
                                    onmouseenter="checkActiveSession(this, '${sessionData[3]}')">
                                    <svg class="custom-delete-icon" width="22px" height="22px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex flex-row justify-content-between align-items-center gap-2">
                            <span>${sessionData[2]}</span>
                            <div class="progress" role="progressbar" aria-label="Animated striped example" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 75%"></div>
                        </div>
                        </div>
                    </td>
                    <td>${nowDateTime}</td>
                </tr>
                `;
    tableBody.insertAdjacentHTML('beforeend', newRow);
}

async function deleteSession(sessionId, btn) {
    try {
        const response = await fetch('/delete_session/' + sessionId, {
            method: 'POST',
        });
        const data = await response.json();
        if (data.success) {
            const row = btn.closest('tr');
            if (row) {
                row.remove();
            }
        }
    } catch (error) {
        console.error('Error deleting session:', error);
    }
}


function renameSession(modalId, sessionId, currentTitle) {
    const form = document.getElementById('renameForm');
    if (form) {
        form.action = '/rename_session/' + sessionId;
        const input = document.getElementById('rename-input');
        if (input) {
            input.value = currentTitle;
            input.setAttribute('name', 'new_session_title');
        }
        const renameModalLabel = document.getElementById('renameModalLabel');
        if (renameModalLabel) {
            renameModalLabel.textContent = 'Rename Session';
        }
        showModal(modalId);
    }
}


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
    const activeSessionTimer = document.getElementById('pomodoro-timer');
    if (!timerDisplay || !activeSessionTimer) return;

    const remainingSeconds = Math.max(0, Math.floor(window.totalSecondsLeft || 0));
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    activeSessionTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function setupPomodoroControls() {
    const addTimeBtn = document.getElementById('add-time-btn');
    const endSessionBtn = document.getElementById('end-session-btn');
    const addBtn = document.getElementById('add-btn');
    const endBtn = document.getElementById('end-btn');

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

    if (addBtn) {
        addBtn.addEventListener('click', async () => {
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

    if (endBtn) {
        endBtn.addEventListener('click', async () => {
            await sessionEnded();
        });
    }
}

async function sessionEnded() {
    const pomodoroBtn = document.getElementById('pomodoro-btn');
    const activeSessionCard = document.querySelector('.active-session');
    const inactiveSessionCard = document.querySelector('.inactive-session');
    const startSessionBtn = document.getElementById('start-session-btn');
    const deleteSessionBtn = document.querySelector('.custom-delete-btn.disabled-btn');
    const clearSessionsBtn = document.getElementById('clear-sessions');
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
            clearSessionsBtn.classList.remove('disabled-btn');
            deleteSessionBtn.classList.remove('disabled-btn');
            startSessionBtn.classList.remove('disabled-btn');
            pomodoroBtn.dataset.sessionActive = 'false';
            activeSessionCard.dataset.active = 'false';
            activeSessionCard.style.setProperty('display', 'none', 'important');
            inactiveSessionCard.style.setProperty('display', 'flex', 'important');
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
            const sessionData = [
                data.subject_name,
                formObject.session_title,
                formObject.period,
                data.session_id
            ];
            const clearSessionsBtn = document.getElementById('clear-sessions');
            if (clearSessionsBtn) {
                clearSessionsBtn.classList.add('disabled-btn');
            }
            const startSessionBtn = document.getElementById('start-session-btn');
            if (startSessionBtn) {
                startSessionBtn.classList.add('disabled-btn');
            }
            const activeSessionCard = document.querySelector('.active-session');
            const inactiveSessionCard = document.querySelector('.inactive-session');
            if (inactiveSessionCard && activeSessionCard) {
                inactiveSessionCard.style.setProperty('display', 'none', 'important');
                activeSessionCard.style.setProperty('display', 'flex', 'important');
                activeSessionCard.dataset.active = 'true';
            }
            const currentSessionTitle = document.querySelector('.current-session-title');
            if (currentSessionTitle) {
                currentSessionTitle.textContent = formObject.session_title;
            }
            const pomodoroBtn = document.getElementById('pomodoro-btn');
            if (pomodoroBtn) {
                pomodoroBtn.dataset.sessionActive = 'true';
                pomodoroBtn.dataset.initialDuration = formObject.period;
                pomodoroBtn.dataset.startTimestamp = (Date.now() / 1000).toString();
                pomodoroBtn.style.display = 'flex';
                initializePomodoro();
            }
            createSessionRow(sessionData);
            this.reset();
        }
    }
    catch (error) {
        console.error('Error submitting session form:', error);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    let totalDuration = document.getElementById('total-duration').dataset.totalDuration;
    if (totalDuration) {
        if (totalDuration < 60) {
            document.getElementById('total-duration').textContent = totalDuration + ' minutes';
        } else {
            const hours = Math.floor(totalDuration / 60);
            const minutes = totalDuration % 60;
            document.getElementById('total-duration').textContent = hours + ' hours ' + minutes + ' minutes';
        }
    }

    const activeSessionCard = document.querySelector('.active-session');
    const inactiveSessionCard = document.querySelector('.inactive-session');
    if (inactiveSessionCard && activeSessionCard && activeSessionCard.dataset.active === 'true') {
        inactiveSessionCard.style.setProperty('display', 'none', 'important');
        activeSessionCard.style.setProperty('display', 'flex', 'important');
    }
    else if (inactiveSessionCard && activeSessionCard.dataset.active === 'false') {
        inactiveSessionCard.style.setProperty('display', 'flex', 'important');
        activeSessionCard.style.setProperty('display', 'none', 'important');
    }

    const pomodoroBtn = document.getElementById('pomodoro-btn');
    if (pomodoroBtn && pomodoroBtn.dataset.sessionActive === 'true' && pomodoroBtn.dataset.initialDuration && pomodoroBtn.dataset.startTimestamp) {
        pomodoroBtn.style.display = 'flex';
        initializePomodoro();
    }
    setupPomodoroControls();
});