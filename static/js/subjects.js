document.addEventListener('DOMContentLoaded', function () {
    const progressBars = document.querySelectorAll('.progress-bar');

    progressBars.forEach(bar => {
        const progress = parseInt(bar.getAttribute('aria-valuenow')) || 0;
        bar.style.width = progress + '%';
        if (progress <= 25 && progress > 0) {
            bar.classList.add('progress-danger');
        } else if (progress <= 50 && progress > 25) {
            bar.classList.add('progress-warning');
        }
        else if (progress <= 75 && progress > 50) {
            bar.classList.add('progress-nearly-success');
        } else if (progress <= 100 && progress > 75) {
            bar.classList.add('progress-success');
        }
    });
});

function renameSubject(subjectId, currentName) {
    const renameModalLabel = document.getElementById('renameModalLabel');
    renameModalLabel.textContent = 'Rename Subject:';
    const form = document.getElementById('renameForm');
    if (form) {
        form.action = '/rename_subject/' + subjectId;
    }
    const inputField = document.getElementById('rename_input');
    inputField.value = currentName;
    inputField.setAttribute('name', 'new_subject_name');
    showModal('renameModal');
}

async function toggleFavorite(subjectId, btnElement) {
    try {
        const response = await fetch('/add_to_favorite/' + subjectId, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
            const svg = btnElement.querySelector('.fav-svg');
            const textSpan = btnElement.querySelector('.fav-span');

            if (data.new_status) {
                svg.classList.add('favorite-icon');
                textSpan.innerText = 'Remove from Favorites';
            } else {
                svg.classList.remove('favorite-icon');
                textSpan.innerText = 'Add to Favorites';
            }
        }
    } catch (error) {
        console.error('Error toggling favorite status:', error);
    }
}

function afterResetOrClicked(svg, textSpan) {
    svg.classList.remove('completed-icon');
    textSpan.innerText = 'Mark as Completed';
}

async function toggleCompleted(subjectId, btnElement) {
    try {
        const response = await fetch('/toggle_completed/' + subjectId, {
            method: 'POST',
        });
        const data = await response.json();
        if (data.success) {
            const svg = btnElement.querySelector('.completed-svg');
            const textSpan = btnElement.querySelector('.completed-span');
            if (data.new_status) {
                svg.classList.add('completed-icon');
                textSpan.innerText = 'Mark as Incomplete';
            } else {
                afterResetOrClicked(svg, textSpan);
            }
            location.reload();
        }
    }
    catch (error) {
        console.error('Error toggling completed status:', error);
    }
}

async function showCompleted(btn) {
    let currentActive = btn.getAttribute('data-active') === 'true';
    let newActive = !currentActive;
    const svg = btn.querySelector('.completed-svg');
    const btnText = btn.querySelector('.completed-span');
    if (newActive) {
        try {
            const response = await fetch('/get_completed_subjects', {
                method: 'GET'
            });
            const data = await response.json();
            if (data.success && data.subjects) {
                const subjectCards = document.querySelectorAll('[data-subject-id]');
                subjectCards.forEach(card => {
                    const subjectId = card.getAttribute('data-subject-id');
                    const isCompleted = data.subjects[subjectId];
                    if (isCompleted) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
                btn.setAttribute('data-active', 'true');
                btn.classList.add('done-btn-active');
                svg.classList.add('completed-icon');
                btnText.innerText = "Show All";
            }
        } catch (error) {
            console.error('Error fetching completed subjects:', error);
        }
    } else {
        const subjectCards = document.querySelectorAll('[data-subject-id]');
        subjectCards.forEach(card => {
            card.style.display = 'block';
        });
        svg.classList.remove('completed-icon');
        btnText.innerText = "Show Completed";
        btn.classList.remove('done-btn-active');
        btn.setAttribute('data-active', 'false');
    }
}

async function showFavorites(btn) {
    let currentActive = btn.getAttribute('data-active') === 'true';
    let newActive = !currentActive;
    const svg = btn.querySelector('.fav-svg');
    const btnText = btn.querySelector('.fav-span');
    if (newActive) {
        try {
            const response = await fetch('/get_favorite_subjects', {
                method: 'GET'
            });
            const data = await response.json();
            if (data.success && data.subjects) {
                const subjectCards = document.querySelectorAll('[data-subject-id]');
                subjectCards.forEach(card => {
                    const subjectId = card.getAttribute('data-subject-id');
                    const isFavorite = data.subjects[subjectId];
                    if (isFavorite) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
                btn.setAttribute('data-active', 'true');
                svg.classList.add('favorite-icon');
                btnText.innerText = "Show All";
            }
        } catch (error) {
            console.error('Error fetching favorite subjects:', error);
        }
    } else {
        const subjectCards = document.querySelectorAll('[data-subject-id]');
        subjectCards.forEach(card => {
            card.style.display = 'block';
        });
        btn.setAttribute('data-active', 'false');
        svg.classList.remove('favorite-icon');
        btnText.innerText = "Show Favorites";
    }
}

async function showCompletedFiles(btn, subjectId) {
    let currentActive = btn.getAttribute('data-active') === 'true';
    let newActive = !currentActive;
    const btnText = btn.querySelector('#btn-text');
    if (newActive) {
        try {
            const response = await fetch('/get_completed_files/' + subjectId, {
                method: 'GET'
            });
            const data = await response.json();
            if (data.success && data.files) {
                const fileCards = document.querySelectorAll('[data-file-id]');
                fileCards.forEach(card => {
                    const fileId = card.getAttribute('data-file-id');
                    const isCompleted = data.files[fileId];
                    if (isCompleted) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
                btn.setAttribute('data-active', 'true');
                btn.classList.add('done-btn-active');
                btn.classList.add('done-text');
                btnText.innerText = "Show All";
            }
        } catch (error) {
            console.error('Error fetching completed files:', error);
        }
    } else {
        const fileCards = document.querySelectorAll('[data-file-id]');
        fileCards.forEach(card => {
            card.style.display = 'block';
        });
        btn.setAttribute('data-active', 'false');
        btn.classList.remove('done-btn-active');
        btn.classList.remove('done-text');
        btnText.innerText = "Show Done";
    }
}

function moveORcopyFileToAnotherFolder(fileId, action, subjectId) {
    const form = document.getElementById('moveCopyForm');
    const submitBtn = document.getElementById('moveCopyBtn');

    if (action === 'move') {
        form.action = '/move_file/' + fileId;
        submitBtn.innerText = 'Move File';
    } else if (action === 'copy') {
        form.action = '/copy_file/' + fileId;
        submitBtn.innerText = 'Copy File';
    }
    const subjectOption = document.querySelectorAll('.subject-option');
    subjectOption.forEach(option => {
        if (subjectId == option.value) {
            option.style.display = 'none';
        }
    });
    showModal('moveORcopyFileModal');
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
            const fileTitle = document.getElementById('file-title-' + fileId);
            const dotsBtn = document.getElementById('dots-btn-' + fileId);
            const doneSvg = document.getElementById('done-svg-' + fileId);

            if (data.new_status) {
                card.classList.add('done-card');
                btnText.innerText = 'Mark as Undone';
                doneSvg.classList.add('done-text');
                btnText.classList.add('done-text');
                doneBtn.classList.add('done-btn-active');
                fileTitle.classList.add('done-text');
                dotsBtn.classList.add('done-dots-btn');
            } else {
                card.classList.remove('done-card');
                btnText.innerText = 'Mark as Done';
                doneSvg.classList.remove('done-text');
                btnText.classList.remove('done-text');
                doneBtn.classList.remove('done-btn-active');
                fileTitle.classList.remove('done-text');
                dotsBtn.classList.remove('done-dots-btn');
            }
        }
    } catch (error) {
        console.error('Error toggling done status:', error);
    }
}