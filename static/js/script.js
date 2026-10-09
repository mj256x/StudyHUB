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

function noResultsMsg(message, buttonFunction, buttonText, NoMatchIcon = false) {
    let svgElement = ``;
    if (NoMatchIcon) {
        svgElement = `<svg width="250px" height="250px" viewBox="0 0 764 576" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="368.367" cy="264.859" r="264.859" fill="#E8F5FF"/>
                            <circle cx="368.367" cy="264.859" r="207.016" fill="#BFE3FF"/>
                            <path d="M369.744 525.971C345.427 550.825 311.511 566.25 273.992 566.25C229.209 566.25 189.559 544.274 165.238 510.518C153.232 543.052 121.946 566.25 85.2419 566.25C38.1642 566.25 0 528.086 0 481.008C0 433.93 38.1642 395.766 85.2419 395.766C106.544 395.766 126.02 403.58 140.963 416.497C148.781 349.965 205.358 298.347 273.992 298.347C320.235 298.347 361.005 321.779 385.076 357.418C405.118 341.407 430.529 331.835 458.175 331.835C509.188 331.835 552.589 364.424 568.694 409.918C580.972 402.852 595.211 398.811 610.393 398.811C654.965 398.811 691.401 433.641 693.968 477.569C698.77 475.854 703.943 474.919 709.335 474.919C734.555 474.919 755 495.364 755 520.585C755 545.805 734.555 566.25 709.335 566.25C691.939 566.25 676.815 556.523 669.105 542.212C653.995 557.078 633.265 566.25 610.393 566.25C582.178 566.25 557.224 552.293 542.056 530.906C520.772 552.712 491.055 566.25 458.175 566.25C422.882 566.25 391.232 550.651 369.744 525.971Z" fill="#F8FDFF"/>
                            <path d="M755 520.585C755 495.364 734.555 474.919 709.335 474.919C703.943 474.919 698.77 475.854 693.968 477.569C691.401 433.641 654.965 398.811 610.393 398.811C595.211 398.811 580.972 402.852 568.694 409.918C552.588 364.424 509.188 331.835 458.175 331.835C430.529 331.835 405.117 341.407 385.075 357.418C361.005 321.779 320.235 298.347 273.992 298.347C205.358 298.347 148.781 349.965 140.963 416.497C126.02 403.58 106.544 395.766 85.2419 395.766C56.9698 395.766 31.9124 409.53 16.4049 430.723" stroke="#006DBE" stroke-width="16.8548" stroke-linecap="round"/>
                            <circle cx="477.133" cy="137.133" r="9.13307" stroke="#005EA3" stroke-width="12.6411"/>
                            <circle cx="639.089" cy="312.089" r="6.08871" stroke="#005EA3" stroke-width="12.6411"/>
                            <circle cx="103.7" cy="290.7" r="13.6996" stroke="#005EA3" stroke-width="12.6411"/>
                            <path d="M240.399 228.327H210.06M261.814 202.062V176.573" stroke="#006DBE" stroke-width="12.6411" stroke-linecap="round"/>
                            <path d="M242.184 207.46L222.004 187.28" stroke="#006DBE" stroke-width="12.6411" stroke-linecap="round"/>
                            <circle cx="360.756" cy="318.135" r="86.7641" fill="#E8F5FF"/>
                            <rect x="438.412" y="355.606" width="169.696" height="60.7331" rx="30.3666" transform="rotate(45 438.412 355.606)" fill="#004476"/>
                            <circle cx="361.363" cy="321.503" r="86.0248" transform="rotate(45 361.363 321.503)" stroke="#004476" stroke-width="49.4477"/>
                            <rect width="73.1686" height="12.6153" rx="6.30764" transform="matrix(-0.707107 -0.707107 -0.707107 0.707107 391.691 342.965)" fill="#006DBE"/>
                            <rect width="73.1686" height="12.6153" rx="6.30763" transform="matrix(-0.707107 0.707107 0.707107 0.707107 382.771 291.227)" fill="#006DBE"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M370.528 177C366.792 176.765 363.573 179.602 363.337 183.337C363.102 187.073 365.939 190.292 369.675 190.528C400.445 192.468 430.646 205.19 454.16 228.704C471.008 245.553 482.309 265.825 488.08 287.275C489.053 290.889 492.771 293.031 496.385 292.058C500 291.086 502.141 287.367 501.169 283.753C494.797 260.072 482.316 237.692 463.744 219.12C437.808 193.184 404.465 179.14 370.528 177ZM345.79 189.188C349.533 189.188 352.567 186.154 352.567 182.411C352.567 178.668 349.533 175.634 345.79 175.634C342.047 175.634 339.013 178.668 339.013 182.411C339.013 186.154 342.047 189.188 345.79 189.188Z" fill="#006DBE"/>
                            <path d="M456.851 400.726L525.978 469.853" stroke="white" stroke-width="18.7606" stroke-linecap="round"/>
                    </svg>`;
    } else {
        svgElement = `<svg width="100px" height="100px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 10.5V7M12 14H12.01M7 18V20.3355C7 20.8684 7 21.1348 7.10923 21.2716C7.20422 21.3906 7.34827 21.4599 7.50054 21.4597C7.67563 21.4595 7.88367 21.2931 8.29976 20.9602L10.6852 19.0518C11.1725 18.662 11.4162 18.4671 11.6875 18.3285C11.9282 18.2055 12.1844 18.1156 12.4492 18.0613C12.7477 18 13.0597 18 13.6837 18H16.2C17.8802 18 18.7202 18 19.362 17.673C19.9265 17.3854 20.3854 16.9265 20.673 16.362C21 15.7202 21 14.8802 21 13.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V14C3 14.93 3 15.395 3.10222 15.7765C3.37962 16.8117 4.18827 17.6204 5.22354 17.8978C5.60504 18 6.07003 18 7 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`;
    }
    const main = document.querySelector('main');
    if (main) {
        const noResultsMessage = `
                    <div class="no-results-message">
                        ${svgElement}
                        <p>${message}</p>
                        <button class="create-btn" onclick="${buttonFunction}">${buttonText}</button>
                    </div>
                    `;
        document.querySelectorAll('.no-results-message').forEach(msg => msg.remove());
        main.insertAdjacentHTML('afterbegin', noResultsMessage);
    }
}

function toggleActiveLink() {
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add('active-link');
        }
    });
}

function clearNoResultsMsg() {
    document.querySelectorAll('.no-results-message').forEach(msg => msg.remove());
    document.querySelectorAll('.hidden-card').forEach(card => {
        card.classList.remove('hidden-card');
    });
    document.querySelectorAll('.Nomatch-card').forEach(card => {
        card.classList.remove('Nomatch-card');
    });
}

function clearSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.value = '';
    document.querySelectorAll('[data-searchable-item]').forEach(card => {
        card.style.display = '';
    });
    clearNoResultsMsg();
}

document.addEventListener('DOMContentLoaded', function () {

    toggleActiveLink();

    if (window.location.pathname === '/sessions_history' || window.location.pathname === '/index') {
        document.querySelector('.search-container').style.setProperty('display', 'none', 'important');
    }

    flatpickr("#deadline", {
        dateFormat: "Y-m-d",
        locale: "en",
        static: false
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        clearNoResultsMsg();
        const term = searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll('[data-searchable-item]');

        cards.forEach(card => {
            const mainTaskTitle = card.querySelector('.main-task-title')?.textContent.toLowerCase() || '';
            const subTaskTitle = card.querySelector('.sub-task-title')?.textContent.toLowerCase() || '';
            const subjectTitle = card.querySelector('.subject-title')?.textContent.toLowerCase() || '';
            const fileTitle = card.querySelector('.file-name')?.textContent.toLowerCase() || '';
            const cardText = `${mainTaskTitle} ${subTaskTitle} ${subjectTitle} ${fileTitle}`;
            if (cardText.includes(term)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
                card.classList.add('Nomatch-card');
            }
        });
        if (term.length > 0 && document.querySelectorAll('.Nomatch-card').length === cards.length) {
            showAlert('info', 'No results found for your search.');
            noResultsMsg('No results found for your search.', 'clearSearch()', 'Clear Search', true);
        } else {
            clearNoResultsMsg();
        }
    });

    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', (e) => {
        e.stopPropagation();
        searchInput.classList.toggle('active-search');
        if (searchInput.classList.contains('active-search')) {
            searchInput.focus();
            searchButton.style.setProperty('border', 'none', 'important');
        } else {
            searchInput.blur();
            searchButton.style.setProperty('border', '2px solid #6B8CAE', 'important');
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchButton.contains(e.target)) {
            searchInput.classList.remove('active-search');
            searchInput.blur();
            searchButton.style.setProperty('border', '2px solid #6B8CAE', 'important');
        }
    });

});

