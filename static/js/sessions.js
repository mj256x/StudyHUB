let timerInterval = null;
let subjects_list = [];

function createSessionCard(sessionData) {
    const now = new Date();
    const year = now.getFullYear();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const nowDateTime = `${day} ${monthNames[now.getMonth()]} ${year} ${hours}:${minutes}`;
    const tableBody = document.querySelector('.s-body');
    const activeSession = document.querySelector('.active-session');
    const isDisabled = (activeSession && activeSession.dataset.active === 'true') ? 'disabled-btn' : '';
    const isActive = (activeSession && activeSession.dataset.active === 'true') ? 'active-progress' : '';
    const newRow = `
                <div class="session-col col-12 col-lg-4">
                    <div class="session-h-card d-flex flex-column align-items-start gap-2 p-3">
                        <div class="session-title d-flex flex-row justify-content-between align-items-center w-100">
                            <div class="w-100 d-flex flex-row justify-content-start align-items-center gap-2">
                                <span class="subject-name justify-content-center align-items-center">
                                    ${sessionData[0]}
                                </span>
                                <span class="session-title-text">${sessionData[1]}</span>
                            </div>
                            <div class="d-flex flex-row justify-content-center align-items-center">
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
                        <div class="progress position-relative" role="progressbar" aria-label="Animated striped example" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" data-session-full-period="${sessionData[4]}" data-session-duration="${sessionData[2]}">
                            <div class="progress-bar progress-bar-striped progress-bar-animated ${isActive}"></div>
                            <span class="progress-text"></span>
                        </div>
                        <div class="session-date-container w-100">
                            <div class="session-date d-flex justify-content-start align-items-center gap-2">
                                <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                                        stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                                <span class="session-date-value">${nowDateTime}</span>
                                <span class="active-badge ms-auto">
                                    <span class="dot active"></span>
                                    <span class="text">Active</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>`;
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

async function getSessionsSummary() {
    const totalDurationElement = document.getElementById('total-duration');
    const totalSessionsElement = document.getElementById('total-sessions');
    const averageDurationElement = document.getElementById('average-duration');
    const topSubjectElement = document.getElementById('top-subject');
    const topSubjectProgressElement = document.getElementById('top-subject-progress');
    document.querySelectorAll('.placeholder-glow').forEach(placeholder => {
        placeholder.style.setProperty('display', 'inline-block', 'important');
    });
    try {
        const response = await fetch('/get_sessions_summary', {
            method: 'GET',
        });
        const data = await response.json();
        if (data.success) {
            if (totalDurationElement) {
                let totalStudyTime = data.total_duration;
                if (totalStudyTime < 60) {
                    totalDurationElement.textContent = totalStudyTime + ' minutes';
                } else {
                    const hours = Math.floor(totalStudyTime / 60);
                    const minutes = totalStudyTime % 60;
                    totalDurationElement.textContent = hours + ' hours ' + minutes + ' minutes';
                }
            }
            if (totalSessionsElement) {
                totalSessionsElement.textContent = data.total_sessions + ' sessions';
            }
            if (averageDurationElement) {
                averageDurationElement.textContent = data.average_duration.toFixed(2) + ' minutes';
            }
            if (topSubjectElement) {
                document.getElementById('top-subject-study-time').textContent = data.top_subject_study_time + ' minutes';
                document.getElementById('top-subject-session-count').textContent = data.top_subject_session_count + ' sessions';
                topSubjectElement.textContent = data.top_subject_name;
            }
            if (topSubjectProgressElement) {
                document.querySelector('.circular-progress').style.setProperty('--percent', data.top_subject_percentage, 'important');
                topSubjectProgressElement.textContent = data.top_subject_percentage + '%';
            }
        }
    } catch (error) {
        console.error('Error fetching sessions summary:', error);
    }
    finally {
        setTimeout(() => {
            document.querySelectorAll('.placeholder-glow').forEach(placeholder => {
                placeholder.style.setProperty('display', 'none', 'important');
            }), 2000
        });
    }
}

async function deleteSession(sessionId, btn) {
    try {
        const response = await fetch('/delete_session/' + sessionId, {
            method: 'POST',
        });
        const data = await response.json();
        if (data.success) {
            const card = btn.closest('.session-col');
            if (card) {
                card.remove();
                getSubjects();
                renderSubjectsMenu();
                updateSessionTable(1);
                showAlert('success', 'Session deleted successfully.');
            }
        }
    } catch (error) {
        console.error('Error deleting session:', error);
        showAlert('error', 'An error occurred while deleting the session. Please try again.');
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
    if (page === 1) {
        const pageInput = document.getElementById('pageInput');
        if (pageInput) {
            pageInput.value = '1';
        }
    }
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const totalPages = document.getElementById('totalPages');
    const filtersCards = document.querySelectorAll('.filtered-card');
    const searchedCards = document.querySelectorAll('.searched-card');
    const sessionCards = document.querySelectorAll('.session-h-card');
    const sortedCards = document.querySelectorAll('.sorted-card');
    const noMatchCards = document.querySelectorAll('.no-match-card');
    if (filtersCards && filtersCards.length > 0) {
        totalPages.textContent = Math.ceil(filtersCards.length / perPage);
        filtersCards.forEach((card, index) => {
            if (index >= startIndex && index < endIndex) {
                card.parentElement.classList.remove('d-none');
            } else {
                card.parentElement.classList.add('d-none');
            }
        });
    } else if (searchedCards.length > 0) {
        totalPages.textContent = Math.ceil(searchedCards.length / perPage);
        searchedCards.forEach((card, index) => {
            if (index >= startIndex && index < endIndex) {
                card.parentElement.classList.remove('d-none');
            } else {
                card.parentElement.classList.add('d-none');
            }
        });
    } else if (sortedCards.length > 0) {
        totalPages.textContent = Math.ceil(sortedCards.length / perPage);
        sortedCards.forEach((card, index) => {
            if (index >= startIndex && index < endIndex) {
                card.parentElement.classList.remove('d-none');
            } else {
                card.parentElement.classList.add('d-none');
            }
        });
    } else if (sessionCards.length > 0 && noMatchCards.length == sessionCards.length) {
        totalPages.textContent = '1';
        sessionCards.forEach(card => {
            card.parentElement.classList.add('d-none');
        });
        const tableBody = document.querySelector('.s-body');
        const existingNoMatchMsg = document.querySelector('.no-match-msg');
        if (existingNoMatchMsg) {
            existingNoMatchMsg.remove();
        }
        const noMatchMsg = `<div class="no-match-msg d-flex flex-column justify-content-center align-items-center gap-2">
                                <svg width="46px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 21L16.65 16.65M11 6C13.7614 6 16 8.23858 16 11M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>No matching sessions found.</span>
                            </div>`;
        tableBody.innerHTML += noMatchMsg;
    } else if (sessionCards.length > 0) {
        totalPages.textContent = Math.ceil(sessionCards.length / perPage);
        sessionCards.forEach((card, index) => {
            if (index >= startIndex && index < endIndex) {
                card.parentElement.classList.remove('d-none');
            } else {
                card.parentElement.classList.add('d-none');
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

document.querySelector('.filterbytopSubject')?.addEventListener('click', function () {
    filterBySubject(document.getElementById('top-subject').textContent, document.querySelector(`.dropdown-item[data-active="false"][onclick*="${document.getElementById('top-subject').textContent}"]`));
});

function resetFilter() {
    const sessionCards = document.querySelectorAll('.session-h-card');
    if (sessionCards.length > 0) {
        sessionCards.forEach(card => {
            card.parentElement.classList.remove('d-none');
            card.classList.remove('filtered-card');
            card.classList.remove('searched-card');
            card.classList.remove('no-match-card');
            card.classList.remove('sorted-card');
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
    const sessionCards = document.querySelectorAll('.session-h-card');
    let currentActiveButton = button.getAttribute('data-active') === 'true';
    let newActiveState = !currentActiveButton;
    resetFilter();
    document.getElementById('sessionSearch').value = '';
    if (newActiveState) {
        button.setAttribute('data-active', 'true');
        button.classList.add('dropdown-item-selected');
        sessionCards.forEach(card => {
            const subjectName = card.querySelector('.subject-name')?.textContent.trim();
            if (subjectName === subject) {
                card.parentElement.classList.remove('d-none');
                card.classList.add('filtered-card');
            } else {
                card.parentElement.classList.add('d-none');
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
    const sessionCards = document.querySelectorAll('.session-h-card');
    const filteredCards = document.querySelectorAll('.filtered-card');
    const searchedCards = document.querySelectorAll('.searched-card');
    const sortedCards = document.querySelectorAll('.sorted-card');
    const noMatchCards = document.querySelectorAll('.no-match-card');
    let totalPages = 0;
    if (filteredCards.length > 0) {
        totalPages = Math.ceil(filteredCards.length / perPage);
    } else if (searchedCards.length > 0) {
        totalPages = Math.ceil(searchedCards.length / perPage);
    } else if (sortedCards.length > 0) {
        totalPages = Math.ceil(sortedCards.length / perPage);
    } else if (noMatchCards.length === sessionCards.length) {
        totalPages = 1;
    } else if (sessionCards.length > 0) {
        totalPages = Math.ceil(sessionCards.length / perPage);
    }
    if (currentPage < totalPages) {
        pageInput.value = String(currentPage + 1);
    }
    updateSessionTable(parseInt(pageInput.value), 10);
});

document.getElementById('sessionSearch')?.addEventListener('input', function () {
    resetFilter();
    const searchTerm = this.value.toLowerCase();
    const sessionCards = document.querySelectorAll('.session-h-card');
    sessionCards.forEach(card => {
        const sessionTitle = card.querySelector('.session-title-text').textContent.toLowerCase();
        const subjectName = card.querySelector('.subject-name').textContent.toLowerCase();
        if (sessionTitle.includes(searchTerm) || subjectName.includes(searchTerm)) {
            card.parentElement.classList.remove('d-none');
            card.classList.add('searched-card');
            document.querySelector('.no-match-msg')?.remove();
        } else {
            card.parentElement.classList.add('d-none');
            card.classList.add('no-match-card');
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
        position: "above",
    });

    flatpickr("#end_date", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        allowInput: true,
        position: "above",
    });
}

function sortSessions(startDate, endDate) {
    resetFilter();
    const sessionCards = document.querySelectorAll('.session-h-card');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (sessionCards) {
        sessionCards.forEach(card => {
            const sessionDate = card.querySelector('.session-date-value')?.textContent.trim();
            const sessionDateObj = new Date(
                parseInt(sessionDate.slice(7, 11)),
                monthNames.indexOf(sessionDate.slice(3, 6)),
                parseInt(sessionDate.slice(0, 2)),
                parseInt(sessionDate.slice(12, 14)),
                parseInt(sessionDate.slice(15, 17))
            );
            if (sessionDateObj >= startDate && sessionDateObj <= endDate) {
                card.parentElement.classList.remove('d-none');
                card.classList.add('sorted-card');
                document.querySelector('.no-match-msg')?.remove();
            } else {
                card.parentElement.classList.add('d-none');
                card.classList.add('no-match-card');
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
                createSessionCard(sessionData);
            }
            showAlert('success', 'Session started successfully!');
            this.reset();
        }
    }
    catch (error) {
        console.error('Error submitting session form:', error);
        showAlert('error', 'An error occurred while starting the session. Please try again.');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        const placeholderElements = document.querySelectorAll('.placeholder-glow');
        if (placeholderElements.length > 0) {
            placeholderElements.forEach(element => {
                element.classList.add('d-none');
            });
        }
        const subjectNameElements = document.querySelectorAll('.subject-name');
        if (subjectNameElements.length > 0) {
            subjectNameElements.forEach(element => {
                element.classList.remove('d-none');
            });
            document.querySelector('main').classList.add('align-items-start');
            document.querySelector('main').classList.remove('justify-content-between');
        }
        const sessionTitleElements = document.querySelectorAll('.session-title-text');
        if (sessionTitleElements.length > 0) {
            sessionTitleElements.forEach(element => {
                element.classList.remove('d-none');
            });
        }
        const progressElements = document.querySelectorAll('.progress');
        if (progressElements.length > 0) {
            progressElements.forEach(element => {
                element.classList.remove('progress-animation');
            });
        }
        const sessionDateElements = document.querySelectorAll('.session-date');
        if (sessionDateElements.length > 0) {
            sessionDateElements.forEach(element => {
                element.classList.remove('d-none');
            });
        }
    }, 700);

    getSessionsSummary();
    resetFilter();
    updateSessionTable(1);
    sortInputs();
    getSubjects();
    renderSubjectsMenu();

    setTimeout(() => {
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
    }, 1000);

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