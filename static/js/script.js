async function uploadProfilePicture(input) {
    const file = input.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('pfp', file);
        try {
            const response = await fetch('/upload_profile_picture', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                const profilePicture = document.querySelectorAll('.user-pfp');
                profilePicture.forEach(pfp => {
                    pfp.src = data.pfp;
                });
                showAlert('success', 'Profile picture updated successfully!');
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            showAlert('danger', 'Failed to upload profile picture. Please try again.');
        }
    }
}

const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function showError(inputElement, valid) {
    const uncheckedIcon = inputElement.parentElement?.querySelector('.unchecked');
    const checkedIcon = inputElement.parentElement?.querySelector('.checked');


    if (valid) {
        if (checkedIcon) checkedIcon.style.display = 'block';
        if (uncheckedIcon) uncheckedIcon.style.display = 'none';
        if (inputElement === document.getElementById('confirm_password')) {
            if (document.querySelector('.password-check').style.display === 'flex') {
                checkedIcon.style.right = '40px';
                checkedIcon.style.top = '395px';
            } else {
                checkedIcon.style.right = '40px';
                checkedIcon.style.top = '255px';
            }
        } else if (inputElement === document.getElementById('new_password')) {
            checkedIcon.style.top = '165px';
            checkedIcon.style.right = '40px';
        }
        inputElement.style.setProperty('border-color', 'green', 'important');
    } else {
        if (checkedIcon) checkedIcon.style.display = 'none';
        if (uncheckedIcon) uncheckedIcon.style.display = 'block';
        if (inputElement === document.getElementById('confirm_password')) {
            if (document.querySelector('.password-check').style.display === 'flex') {
                uncheckedIcon.style.top = '395px';
                uncheckedIcon.style.right = '40px';
            } else {
                uncheckedIcon.style.top = '255px';
                uncheckedIcon.style.right = '40px';
            }
        } else if (inputElement === document.getElementById('new_password')) {
            uncheckedIcon.style.top = '165px';
            uncheckedIcon.style.right = '40px';
        }
        inputElement.style.setProperty('border-color', 'red', 'important');
    }
}

function clearError(inputElement) {
    const icons = inputElement.parentElement?.querySelectorAll('.unchecked, .checked');
    icons?.forEach((icon) => {
        icon.style.display = 'none';
    });
    inputElement.style.removeProperty('border-color');
}

function togglePasswordVisibility(btn) {
    const passwordFields = document.querySelectorAll('#current_password, #new_password, #confirm_password');
    const showed = btn.getAttribute('data-showed') === 'true';
    btn.setAttribute('data-showed', !showed);
    passwordFields.forEach(field => {
        field.type = showed ? 'password' : 'text';
    });
    btn.querySelector('.show-password-text').textContent = showed ? 'Show Passwords' : 'Hide Passwords';
    btn.querySelector('.opened-eye').style.display = showed ? 'block' : 'none';
    btn.querySelector('.closed-eye').style.display = showed ? 'none' : 'block';
}

document.getElementById('new_username').addEventListener('input', function () {
    const newUsername = this.value.trim();
    if (newUsername.length > 0) {
        if (usernameRegex.test(newUsername)) {
            showError(this, true);
            document.querySelector('.username-error').textContent = '';
        } else {
            showError(this, false);
            document.querySelector('.username-error').textContent = '* Enter a valid username (3-15 characters,a-Z, 0-9, _ )';
        }
    } else {
        clearError(this);
        document.querySelector('.username-error').textContent = '';
    }
});

document.getElementById('change-username-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    try {
        const newUsername = document.getElementById('new_username').value.trim();
        if (newUsername.length === 0 || !usernameRegex.test(newUsername)) {
            showError(document.getElementById('new_username'), false);
            const newUsernameError = document.querySelector('.username-error');
            newUsernameError.textContent = newUsername.length > 0 ? '* Enter a valid username (3-15 characters,a-Z, 0-9, _ )' : '* Cannot be empty';
            return;
        }
        const response = await fetch('/change_username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newUsername: newUsername })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('username').textContent = newUsername;
            showAlert('success', 'Username changed successfully!');
            var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('changeUsernameModal'));
            myModal.hide();
        } else {
            showAlert('danger', 'The username you entered is already taken.');
        }
    } catch (error) {
        console.error('Error changing username:', error);
        showAlert('danger', 'An error occurred while changing the username.');
    }
});

document.getElementById('current_password').addEventListener('input', function () {
    clearError(this);
    document.querySelector('.current-password-error').textContent = '';
});

const passwordCheckTerms = document.querySelectorAll('.password-check span');
document.getElementById('new_password').addEventListener('input', function () {
    if (this.value.length > 0) {
        document.querySelector('.password-check').style.display = 'flex';

        if (this.value.length >= 8) {
            passwordCheckTerms[0].classList.add('active');
        } else {
            passwordCheckTerms[0].classList.remove('active');
        }
        if (/[A-Z]/.test(this.value)) {
            passwordCheckTerms[1].classList.add('active');
        } else {
            passwordCheckTerms[1].classList.remove('active');
        }
        if (/[a-z]/.test(this.value)) {
            passwordCheckTerms[2].classList.add('active');
        } else {
            passwordCheckTerms[2].classList.remove('active');
        }
        if (/\d/.test(this.value)) {
            passwordCheckTerms[3].classList.add('active');
        } else {
            passwordCheckTerms[3].classList.remove('active');
        }
        if (/[@$!%*?&]/.test(this.value)) {
            passwordCheckTerms[4].classList.add('active');
        } else {
            passwordCheckTerms[4].classList.remove('active');
        }

        if (!passwordRegex.test(this.value)) {
            showError(this, false);
            document.querySelector('.password-error').textContent = '* Enter a valid password';
        } else {
            showError(this, true);
            document.querySelector('.password-check').style.display = 'none';
            document.querySelector('.password-error').textContent = '';
        }

    } else {
        clearError(this);
        document.querySelector('.password-check').style.display = 'none';
        document.querySelector('.password-error').textContent = '';
    }
});

document.getElementById('confirm_password').addEventListener('input', function () {
    const newPasswordInput = document.getElementById('new_password');
    if (this.value.length > 0) {
        if (this.value !== newPasswordInput.value) {
            showError(this, false);
            document.querySelector('.conf-password-error').textContent = '* Passwords do not match';
        } else {
            showError(this, true);
            document.querySelector('.conf-password-error').textContent = '';
        }
    } else {
        clearError(this);
        document.querySelector('.conf-password-error').textContent = '';
    }
});

document.getElementById('change-password-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    try {
        const currentPassword = document.getElementById('current_password').value.trim();
        const newPassword = document.getElementById('new_password').value.trim();
        const confirmPassword = document.getElementById('confirm_password').value.trim();
        if (currentPassword.length === 0) {
            document.getElementById('current_password').style.setProperty('border-color', 'red', 'important');
            document.querySelector('.current-password-error').textContent = '* Cannot be empty';
        }
        if (newPassword.length === 0 || !passwordRegex.test(newPassword)) {
            document.getElementById('new_password').style.setProperty('border-color', 'red', 'important');
            document.querySelector('.password-error').textContent = newPassword.length > 0 ? '* Enter a valid password' : '* Cannot be empty';
        }
        if (confirmPassword.length === 0) {
            document.getElementById('confirm_password').style.setProperty('border-color', 'red', 'important');
            document.querySelector('.conf-password-error').textContent = '* Cannot be empty';
        }
        if (currentPassword.length === 0 || newPassword.length === 0 || confirmPassword.length === 0 || !passwordRegex.test(newPassword)) {
            return;
        }
        if (newPassword !== confirmPassword) {
            showAlert('danger', 'New password and confirm password do not match.');
            return;
        }
        const response = await fetch('/change_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword, confirmPassword: confirmPassword })
        });
        const data = await response.json();
        if (data.success) {
            showAlert('success', 'Password changed successfully!');
            var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('changePasswordModal'));
            myModal.hide();
            this.reset();
        } else {
            showAlert('danger', 'An error occurred while changing the password.');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showAlert('danger', 'An error occurred while changing the password.');
    }
});

document.getElementById('new_email').addEventListener('input', function () {
    if (this.value.length > 0) {
        if (!emailRegex.test(this.value)) {
            showError(this, false);
            document.querySelector('.email-error').textContent = '* Enter a valid email';
        } else {
            showError(this, true);
            document.querySelector('.email-error').textContent = '';
        }
    } else {
        clearError(this);
        document.querySelector('.email-error').textContent = '';
    }
});

document.getElementById('change-email-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    try {
        const newEmail = document.getElementById('new_email').value.trim();
        if (newEmail.length === 0 || !emailRegex.test(newEmail)) {
            showError(document.getElementById('new_email'), false);
            const newEmailError = document.querySelector('.email-error');
            newEmailError.textContent = newEmail.length > 0 ? '* Enter a valid email' : '* Cannot be empty';
            return;
        }
        const response = await fetch('/change_email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newEmail: newEmail })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('user-email').textContent = newEmail;
            showAlert('success', 'Email changed successfully!');
            var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('changeEmailModal'));
            myModal.hide();
        } else {
            showAlert('danger', 'The email you entered is already used.');
        }
    } catch (error) {
        console.error('Error changing email:', error);
        showAlert('danger', 'An error occurred while changing the email.');
    }
});

function showModal(modalId, btn = null, subjectId = null) {
    var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId));
    if (btn) {
        const action = btn.getAttribute('data-action');
        if (action) {
            const form = document.getElementById('deleteAllForm');
            document.getElementById(modalId).querySelector('.modal-title').textContent = btn.textContent.trim();
            if (form) {
                console.log('Setting form action to: /' + action);
                form.action = '/' + action;
                console.log('Form action set to: ' + form.action);
                if (action === 'delete_all_tasks' || action === 'delete_all_subjects' || action === 'clear_sessions_history') {
                    form.querySelector('.warning-text').textContent = `Are you sure you want to ${btn.textContent.trim()}?`;
                } else if (action === 'delete_account') {
                    form.querySelector('.warning-text').textContent = 'Are you sure you want to Delete Your Account?';
                }
            }
        }
    }
    if (subjectId) {
        const form = document.getElementById('deleteAllForm');
        if (form) {
            document.getElementById(modalId).querySelector('.modal-title').textContent = 'Delete All Lectures';
            form.action = '/delete_all_files/' + subjectId;
            form.querySelector('.warning-text').textContent = 'Are you sure you want to Delete All Lectures?';
        }
    }
    myModal.show();
}

const alertIcons = {
    success: '<svg class="bi flex-shrink-0 me-2" width="24px" height="24px" role="img" aria-label="Success:"><use xlink:href="#success-icon" /></svg>',
    info: '<svg class="bi flex-shrink-0 me-2" width="24px" height="24px" role="img" aria-label="Info:"><use xlink:href="#info-icon" /></svg>',
    warning: '<svg class="bi flex-shrink-0 me-2" width="24px" height="24px" role="img" aria-label="Warning:"><use xlink:href="#warning-icon" /></svg>',
    danger: '<svg class="bi flex-shrink-0 me-2" width="24px" height="24px" role="img" aria-label="Danger:"><use xlink:href="#warning-icon" /></svg>',
};

function showAlert(type, message) {
    const alert = document.querySelector('#alert');
    if (alert) {
        alert.className = 'alert';
        void alert.offsetWidth;
        alert.querySelector('.alert-icon').innerHTML = alertIcons[type];
        alert.querySelector('.alert-message').textContent = message;
        alert.classList.add(`alert-${type}`);
        alert.classList.add('show');
        setTimeout(() => {
            alert.classList.remove('show');
            alert.classList.add('dismiss');
        }, 3000);
    }
}

function noResultsMsg(message, buttonFunction, buttonText) {
    const main = document.querySelector('main');
    if (main) {
        const noResultsMessage = `
                    <div class="no-results-message">
                        <svg width="100px" height="100px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 10.5V7M12 14H12.01M7 18V20.3355C7 20.8684 7 21.1348 7.10923 21.2716C7.20422 21.3906 7.34827 21.4599 7.50054 21.4597C7.67563 21.4595 7.88367 21.2931 8.29976 20.9602L10.6852 19.0518C11.1725 18.662 11.4162 18.4671 11.6875 18.3285C11.9282 18.2055 12.1844 18.1156 12.4492 18.0613C12.7477 18 13.0597 18 13.6837 18H16.2C17.8802 18 18.7202 18 19.362 17.673C19.9265 17.3854 20.3854 16.9265 20.673 16.362C21 15.7202 21 14.8802 21 13.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V14C3 14.93 3 15.395 3.10222 15.7765C3.37962 16.8117 4.18827 17.6204 5.22354 17.8978C5.60504 18 6.07003 18 7 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <p>${message}</p>
                        <button class="create-btn" onclick="${buttonFunction}">${buttonText}</button>
                    </div>
                    `;
        document.querySelectorAll('.no-results-message').forEach(msg => msg.remove());
        main.insertAdjacentHTML('afterbegin', noResultsMessage);
    }
}

document.querySelectorAll('.nav-link').forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active');
    }
});

document.addEventListener('DOMContentLoaded', function () {

    flatpickr("#deadline", {
        dateFormat: "Y-m-d",
        locale: "en"
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        document.querySelectorAll('.no-results-message').forEach(msg => msg.remove());
        document.querySelectorAll('.hidden-card').forEach(card => {
            card.classList.remove('hidden-card');
        });
        const term = searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll('[data-searchable-item]');

        cards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            console.log(card.style.display);
            if (cardText.includes(term)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });

    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', (e) => {
        e.stopPropagation();
        searchInput.classList.toggle('active');
        if (searchInput.classList.contains('active')) {
            searchInput.focus();
            searchButton.style.setProperty('border', 'none', 'important');
        } else {
            searchInput.blur();
            searchButton.style.setProperty('border', '2px solid #6B8CAE', 'important');
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchButton.contains(e.target)) {
            searchInput.classList.remove('active');
            searchInput.blur();
        }
    });

});

