let timerInterval = null;
let subjects_list = [];

function createSessionRow(sessionData) {
    const now = new Date();
    const year = now.getFullYear();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const nowDateTime = `${day} ${monthNames[now.getMonth()]} ${year} ${hours}:${minutes}`;
    const tableBody = document.querySelector('.table-body');
    const activeSession = document.querySelector('.active-session');
    const isDisabled = (activeSession && activeSession.dataset.active === 'true') ? 'disabled-btn' : '';
    const isActive = (activeSession && activeSession.dataset.active === 'true') ? 'active-progress' : '';
    const newRow = `
                <tr class="session-row">
                    <td class="subject-name">
                        ${sessionData[0]}
                    </td>
                    <td class="session-title">
                        <div class="d-flex flex-row justify-content-between align-items-center gap-2">
                            <span>${sessionData[1]}</span>
                            <span class="active-badge">
                                <span class="dot active"></span>
                                <span class="text">Active</span>
                            </span>
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
                        <div class="progress position-relative" role="progressbar" aria-label="Animated striped example" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" data-session-full-period="${sessionData[4]}" data-session-duration="${sessionData[2]}">
                            <div class="progress-bar progress-bar-striped progress-bar-animated ${isActive}"></div>
                            <span class="progress-text"></span>
                        </div>
                    </td>
                    <td class="session-date">${nowDateTime}</td>
                </tr>
                `;
    if (tableBody) {
        tableBody.insertAdjacentHTML('afterbegin', newRow);
    }
    const sessionSearchInput = document.getElementById('sessionSearch');
    if (sessionSearchInput && sessionSearchInput.value.trim() !== '') {
        sessionSearchInput.value = '';
    }
    getSubjects();
    renderSubjectsMenu();
    resetFilter();
    updateSessionTable(1);
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
                getSubjects();
                renderSubjectsMenu();
                updateSessionTable(1);
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
    updateSessionProgressBar();

    timerInterval = setInterval(() => {
        if (window.totalSecondsLeft > 0) {
            window.totalSecondsLeft--;
            updateDisplay();
            updateSessionProgressBar();
        } else {
            clearInterval(timerInterval);
            sessionEnded();
        }
    }, 1000);
}

function updateSessionProgressBar() {
    const progressBar = document.querySelector('.progress-bar.active-progress');
    if (!progressBar) return;
    let totalDurationMinutes = parseInt(progressBar.parentElement.getAttribute('data-session-full-period')) || 0;
    let elapsedMinutes = totalDurationMinutes - Math.ceil(window.totalSecondsLeft / 60);
    let progressPercentage = (elapsedMinutes / totalDurationMinutes) * 100;
    progressBar.style.setProperty('width', `${progressPercentage}%`);
    progressBar.parentElement.querySelector('.progress-text').textContent = `${elapsedMinutes} / ${totalDurationMinutes}`;
}

function updateDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    const activeSessionTimer = document.getElementById('pomodoro-timer');

    const remainingSeconds = Math.floor(window.totalSecondsLeft || 0);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    if (timerDisplay) {
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    if (activeSessionTimer) {
        activeSessionTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

async function addTimeToSession() {
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
            const activeProgressBar = document.querySelector('.progress-bar.active-progress');
            if (activeProgressBar) {
                activeProgressBar.parentElement.setAttribute('data-session-full-period', parseInt(activeProgressBar.parentElement.getAttribute('data-session-full-period')) + addedMinutes);
            }
            updateDisplay();
            updateSessionProgressBar();
        }
    } catch (error) {
        console.error('Error adding time:', error);
    }
}

function setupPomodoroControls() {
    const addTimeBtn = document.getElementById('add-time-btn');
    const endSessionBtn = document.getElementById('end-session-btn');
    const addBtn = document.getElementById('add-btn');
    const endBtn = document.getElementById('end-btn');

    if (addTimeBtn) {
        addTimeBtn.addEventListener('click', addTimeToSession);
    }

    if (addBtn) {
        addBtn.addEventListener('click', addTimeToSession);
    }

    if (endSessionBtn) {
        endSessionBtn.addEventListener('click', sessionEnded);
    }

    if (endBtn) {
        endBtn.addEventListener('click', sessionEnded);
    }
}

async function sessionEnded() {
    const pomodoroBtn = document.getElementById('pomodoro-btn');
    const activeSessionCard = document.querySelector('.active-session');
    const inactiveSessionCard = document.querySelector('.inactive-session');
    const startSessionBtn = document.getElementById('start-session-btn');
    const deleteSessionBtn = document.querySelector('.custom-delete-btn.disabled-btn');
    const clearSessionsBtn = document.getElementById('clear-sessions');
    const activeProgressBar = document.querySelector('.progress-bar.active-progress');
    const activeBadge = document.querySelector('.active-badge');

    if (timerInterval) clearInterval(timerInterval);

    try {
        let startTimestamp = parseFloat(pomodoroBtn.dataset.startTimestamp);
        let currentTime = Date.now() / 1000;
        let elapsedTimeSeconds = currentTime - startTimestamp;
        let elapsedMinutes = Math.floor(elapsedTimeSeconds / 60);

        const response = await fetch('/session_ended', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elapsed_minutes: elapsedMinutes }),
        });

        const data = await response.json();
        if (data.success) {
            resetFilter();
            updateSessionTable(1);
            activeBadge?.style.setProperty('display', 'none', 'important');
            activeProgressBar?.classList.remove('active-progress');
            clearSessionsBtn?.classList.remove('disabled-btn');
            deleteSessionBtn?.classList.remove('disabled-btn');
            startSessionBtn?.classList.remove('disabled-btn');
            if (activeSessionCard && inactiveSessionCard) {
                activeSessionCard.dataset.active = 'false';
                activeSessionCard.style.setProperty('display', 'none', 'important');
                inactiveSessionCard.style.setProperty('display', 'flex', 'important');
            }
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

const perPage = 3;

function updateSessionTable(page) {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const totalPages = document.getElementById('totalPages');
    const filteredRows = document.querySelectorAll('.filtered-row');
    const searchedRows = document.querySelectorAll('.searched-row');
    const sessionRows = document.querySelectorAll('.session-row');
    const sortedRows = document.querySelectorAll('.sorted-row');
    const noMatchRows = document.querySelectorAll('.no-match-row');
    if (filteredRows && filteredRows.length > 0) {
        totalPages.textContent = Math.ceil(filteredRows.length / perPage);
        filteredRows.forEach((row, index) => {
            if (index >= startIndex && index < endIndex) {
                row.style.display = 'table-row';
            } else {
                row.style.display = 'none';
            }
        });
    } else if (searchedRows.length > 0) {
        totalPages.textContent = Math.ceil(searchedRows.length / perPage);
        searchedRows.forEach((row, index) => {
            if (index >= startIndex && index < endIndex) {
                row.style.display = 'table-row';
            } else {
                row.style.display = 'none';
            }
        });
    } else if (sortedRows.length > 0) {
        totalPages.textContent = Math.ceil(sortedRows.length / perPage);
        sortedRows.forEach((row, index) => {
            if (index >= startIndex && index < endIndex) {
                row.style.display = 'table-row';
            } else {
                row.style.display = 'none';
            }
        });
    } else if (sessionRows.length > 0 && noMatchRows.length == sessionRows.length) {
        totalPages.textContent = '1';
        sessionRows.forEach(row => {
            row.style.display = 'none';
        });
        const tableBody = document.querySelector('.table-body');
        const existingNoMatchRow = document.querySelector('.no-match-msg');
        if (existingNoMatchRow) {
            existingNoMatchRow.remove();
        }
        const noMatchRow = `<tr class="no-match-msg">
                                <td colspan="4">
                                <div class="d-flex flex-column justify-content-center align-items-center gap-2">
                                <svg width="46px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 21L16.65 16.65M11 6C13.7614 6 16 8.23858 16 11M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>No matching sessions found.</span>
                                </div>
                                </td>
                            </tr>`;
        tableBody.innerHTML += noMatchRow;
    } else if (sessionRows.length > 0) {
        totalPages.textContent = Math.ceil(sessionRows.length / perPage);
        sessionRows.forEach((row, index) => {
            if (index >= startIndex && index < endIndex) {
                row.style.display = 'table-row';
            } else {
                row.style.display = 'none';
            }
        });
    }
}

function getSubjects() {
    const subjectNames = document.querySelectorAll('.subject-name');
    if (subjectNames.length === 0) return;
    subjects_list = [];
    subjectNames.forEach(subject => {
        const subjectName = subject.textContent.trim();
        if (!subjects_list.includes(subjectName)) {
            subjects_list.push(subjectName);
        }
    });
}

function renderSubjectsMenu() {
    const subjectsMenu = document.querySelector('.dropdown-menu.subjects-menu');
    if (subjectsMenu) {
        subjectsMenu.innerHTML = '';
        subjects_list.forEach(subject => {
            const li = `<li>
                            <button type="button" class="dropdown-item" data-active="false" onclick="filterBySubject('${subject}', this)">${subject}</button>
                        </li>`;
            subjectsMenu.insertAdjacentHTML('beforeend', li);
        });
    }
}

function resetFilter() {
    const sessionRows = document.querySelectorAll('.session-row');
    if (sessionRows.length > 0) {
        sessionRows.forEach(row => {
            row.style.display = 'table-row';
            row.classList.remove('filtered-row');
            row.classList.remove('searched-row');
            row.classList.remove('no-match-row');
            row.classList.remove('sorted-row');
        });
    }
    const dropdownMenu = document.querySelector('.dropdown-menu.subjects-menu');
    if (dropdownMenu) {
        const buttons = dropdownMenu.querySelectorAll('.dropdown-item');
        buttons.forEach(btn => {
            btn.setAttribute('data-active', 'false');
            btn.classList.remove('dropdown-item-selected');
        });
    }
    const pageInput = document.getElementById('pageInput');
    if (pageInput) {
        pageInput.value = '1';
    }
}

function filterBySubject(subject, button) {
    const sessionRows = document.querySelectorAll('.session-row');
    let currentActiveButton = button.getAttribute('data-active') === 'true';
    let newActiveState = !currentActiveButton;
    resetFilter();
    document.getElementById('sessionSearch').value = '';
    if (newActiveState) {
        button.setAttribute('data-active', 'true');
        button.classList.add('dropdown-item-selected');
        sessionRows.forEach(row => {
            const subjectCell = row.querySelector('.subject-name');
            if (subjectCell) {
                const subjectName = subjectCell.textContent.trim();
                if (subjectName === subject) {
                    row.style.display = 'table-row';
                    row.classList.add('filtered-row');
                } else {
                    row.style.display = 'none';
                }
            }
        });
        updateSessionTable(1);
    } else {
        resetFilter();
        updateSessionTable(1);
    }
}

document.getElementById('prevBtn')?.addEventListener('click', function () {
    const pageInput = document.getElementById('pageInput');
    let currentPage = parseInt(pageInput.value, 10);
    if (currentPage > 1) {
        pageInput.value = String(currentPage - 1);
    }
    updateSessionTable(parseInt(pageInput.value), 10);
});

document.getElementById('nextBtn')?.addEventListener('click', function () {
    const pageInput = document.getElementById('pageInput');
    let currentPage = parseInt(pageInput.value, 10);
    const sessionRows = document.querySelectorAll('.session-row');
    const filteredRows = document.querySelectorAll('.filtered-row');
    const searchedRows = document.querySelectorAll('.searched-row');
    const sortedRows = document.querySelectorAll('.sorted-row');
    const noMatchRows = document.querySelectorAll('.no-match-row');
    let totalPages = 0;
    if (filteredRows.length > 0) {
        totalPages = Math.ceil(filteredRows.length / perPage);
    } else if (searchedRows.length > 0) {
        totalPages = Math.ceil(searchedRows.length / perPage);
    } else if (sortedRows.length > 0) {
        totalPages = Math.ceil(sortedRows.length / perPage);
    } else if (noMatchRows.length === sessionRows.length) {
        totalPages = 1;
    } else if (sessionRows.length > 0) {
        totalPages = Math.ceil(sessionRows.length / perPage);
    }
    if (currentPage < totalPages) {
        pageInput.value = String(currentPage + 1);
    }
    updateSessionTable(parseInt(pageInput.value), 10);
});

document.getElementById('sessionSearch')?.addEventListener('input', function () {
    resetFilter();
    const searchTerm = this.value.toLowerCase();
    const sessionRows = document.querySelectorAll('.session-row');
    sessionRows.forEach(row => {
        const sessionTitle = row.querySelector('.session-title').textContent.toLowerCase();
        const subjectName = row.querySelector('.subject-name').textContent.toLowerCase();
        if (sessionTitle.includes(searchTerm) || subjectName.includes(searchTerm)) {
            row.style.display = 'table-row';
            row.classList.add('searched-row');
            document.querySelector('.no-match-msg')?.remove();
        } else {
            row.style.display = 'none';
            row.classList.add('no-match-row');
        }
    });
    updateSessionTable(1);
});

document.getElementById('sortBtn')?.addEventListener('click', function () {
    showModal('sortTableModal');
});

function sortInputs() {
    flatpickr("#start_date", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        allowInput: true,
    });

    flatpickr("#end_date", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        allowInput: true,
    });
}

function sortSessions(startDate, endDate) {
    resetFilter();
    const sessionRows = document.querySelectorAll('.session-row');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (sessionRows) {
        sessionRows.forEach(row => {
            const sessionDateCell = row.querySelector('.session-date');
            if (sessionDateCell) {
                const t = sessionDateCell.textContent.trim();
                const sessionDate = new Date(
                    parseInt(t.slice(7, 11)),
                    monthNames.indexOf(t.slice(3, 6)),
                    parseInt(t.slice(0, 2)),
                    parseInt(t.slice(12, 14)),
                    parseInt(t.slice(15, 17))
                );
                if (sessionDate >= startDate && sessionDate <= endDate) {
                    row.style.display = 'table-row';
                    row.classList.add('sorted-row');
                } else {
                    row.style.display = 'none';
                    row.classList.add('no-match-row');
                }
            }
        });
    }
    updateSessionTable(1);
}

document.getElementById('sortTableForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());
    const yearStart = parseInt(formObject.start_date.slice(0, 4), 10);
    const monthStart = parseInt(formObject.start_date.slice(5, 7), 10);
    const dayStart = parseInt(formObject.start_date.slice(8, 10), 10);
    const hourStart = parseInt(formObject.start_date.slice(11, 13), 10);
    const minuteStart = parseInt(formObject.start_date.slice(14, 16), 10);
    const yearEnd = parseInt(formObject.end_date.slice(0, 4), 10);
    const monthEnd = parseInt(formObject.end_date.slice(5, 7), 10);
    const dayEnd = parseInt(formObject.end_date.slice(8, 10), 10);
    const hourEnd = parseInt(formObject.end_date.slice(11, 13), 10);
    const minuteEnd = parseInt(formObject.end_date.slice(14, 16), 10);

    const startDate = new Date(
        yearStart, monthStart - 1, dayStart,
        hourStart, minuteStart
    );
    const endDate = new Date(
        yearEnd, monthEnd - 1, dayEnd,
        hourEnd, minuteEnd
    );

    sortSessions(startDate, endDate);
    this.reset();
});

document.getElementById('sessionForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());

    const dateObj = new Date();
    const YYYY = dateObj.getFullYear();
    const MM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const DD = String(dateObj.getDate()).padStart(2, '0');
    const hh = String(dateObj.getHours()).padStart(2, '0');
    const mm = String(dateObj.getMinutes()).padStart(2, '0');
    const ss = String(dateObj.getSeconds()).padStart(2, '0');
    const mss = String(dateObj.getMilliseconds()).padStart(3, '0');
    const localDeviceString = `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}.${mss}`;
    formObject.session_date = localDeviceString;

    if (formObject.subject_id && formObject.session_title && formObject.period) {
        console.log(true);
        var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('sessionModal'));
        myModal.hide();
    }

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
                data.session_id,
                data.session_full_period
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
                pomodoroBtn.style.setProperty('display', 'flex', 'important');
                initializePomodoro();
            }
            const sessionsDetails = document.querySelector('.sessions-details');
            if (sessionsDetails) {
                createSessionRow(sessionData);
            }
            this.reset();
        }
    }
    catch (error) {
        console.error('Error submitting session form:', error);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    resetFilter();
    updateSessionTable(1);
    sortInputs();
    getSubjects();
    renderSubjectsMenu();

    let t = document.getElementById('total-duration');
    if (t) {
        let totalStudyTime = parseInt(t.dataset.totalDuration, 10);
        if (totalStudyTime < 60) {
            document.getElementById('total-duration').textContent = totalStudyTime + ' minutes';
        } else {
            const hours = Math.floor(totalStudyTime / 60);
            const minutes = totalStudyTime % 60;
            document.getElementById('total-duration').textContent = hours + ' hours ' + minutes + ' minutes';
        }
    }

    const progressBars = document.querySelectorAll('.progress-bar.progress-bar-striped.progress-bar-animated');
    if (progressBars.length > 0) {
        progressBars.forEach(bar => {
            let totalDurationMinutes = parseInt(bar.parentElement.getAttribute('data-session-full-period')) || 0;
            let elapsedMinutes = parseInt(bar.parentElement.getAttribute('data-session-duration')) || 0;
            let progressPercentage = (elapsedMinutes / totalDurationMinutes) * 100;
            bar.style.setProperty('width', `${progressPercentage}%`);
            bar.parentElement.querySelector('.progress-text').textContent = `${elapsedMinutes} / ${totalDurationMinutes}`;
        });
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
    if (pomodoroBtn && pomodoroBtn.dataset.sessionActive === 'true') {
        pomodoroBtn.style.setProperty('display', 'flex', 'important');
        initializePomodoro();
    }
    setupPomodoroControls();
});