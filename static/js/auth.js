const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const userError = document.getElementById('usernameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const passwordCheckTerms = document.querySelectorAll('.password-check span');
const openedEye = document.querySelector('.opened-eye');
const closedEye = document.querySelector('.closed-eye');
const openedEyeCp = document.querySelector('.opened-eye-cp');
const closedEyeCp = document.querySelector('.closed-eye-cp');
const usernameEmailInput = document.getElementById('usernameEmailInput');
const usernameInput = document.getElementById('usernameInput');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');
const alertIcons = {
    success: '<svg class="bi flex-shrink-0 me-2" width="24px" height="24px" role="img" aria-label="Success:"><use xlink:href="#success-icon" /></svg>',
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

function showError(inputElement, valid) {
    if (valid) {
        inputElement.classList.add('is-valid');
        inputElement.classList.remove('is-invalid');
        inputElement.style.borderBottomColor = 'green';
    } else {
        inputElement.classList.remove('is-valid');
        inputElement.classList.add('is-invalid');
        inputElement.style.borderBottomColor = 'red';
    }
    if (inputElement === passwordInput) {
        openedEye.style.right = '40px';
        closedEye.style.right = '40px';
    } else if (inputElement === confirmPasswordInput) {
        if (openedEyeCp) openedEyeCp.style.right = '40px';
        if (closedEyeCp) closedEyeCp.style.right = '40px';
    }
}

function clearError(inputElement) {
    inputElement.classList.remove('is-valid');
    inputElement.classList.remove('is-invalid');
    inputElement.style.borderBottomColor = 'color-mix(in srgb, var(--c-mauve), var(--c-highlight) 55%)';
    if (inputElement === passwordInput) {
        openedEye.style.right = '5px';
        closedEye.style.right = '5px';
    } else if (inputElement === confirmPasswordInput) {
        if (openedEyeCp) openedEyeCp.style.right = '5px';
        if (closedEyeCp) closedEyeCp.style.right = '5px';
    }
}

function showFormError(inputElement, message) {
    inputElement.classList.add('is-invalid');
    inputElement.style.borderBottomColor = 'red';
    message.textContent = '* This field is required';
}

let submitCheck = {
    usernameInput: 0,
    usernameEmailInput: 0,
    emailInput: 0,
    passwordInput: 0,
    confirmPasswordInput: 0
};

usernameInput?.addEventListener('input', function () {
    if (this.value.length > 0) {
        if (!usernameRegex.test(this.value)) {
            showError(this, false);
            userError.textContent = '* Enter a valid username';
            submitCheck.usernameInput = 0;
        } else {
            showError(this, true);
            userError.textContent = '';
            submitCheck.usernameInput = 1;
        }
    } else {
        clearError(this);
        userError.textContent = '';
    }
});

usernameEmailInput?.addEventListener('input', function () {
    if (this.value.length > 0) {
        if (!usernameRegex.test(this.value) && !emailRegex.test(this.value)) {
            showError(this, false);
            userError.textContent = '* Enter a valid username or email';
            submitCheck.usernameEmailInput = 0;
        } else {
            showError(this, true);
            userError.textContent = '';
            submitCheck.usernameEmailInput = 1;
        }
    } else {
        clearError(this);
        userError.textContent = '';
    }
});

emailInput?.addEventListener('input', function () {
    if (this.value.length > 0) {
        if (!emailRegex.test(this.value)) {
            showError(this, false);
            emailError.textContent = '* Enter a valid email';
            submitCheck.emailInput = 0;
        } else {
            showError(this, true);
            emailError.textContent = '';
            submitCheck.emailInput = 1;
        }
    } else {
        clearError(this);
        emailError.textContent = '';
    }
});

passwordInput.addEventListener('input', function () {
    const passwordCheck = document.querySelector('.password-check');
    if (this.value.length > 0) {
        if (passwordCheck) {
            passwordCheck.style.display = 'flex';
            if (passwordCheckTerms) {
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
            }
        }
        if (!passwordRegex.test(this.value)) {
            showError(this, false);
            passwordError.textContent = '* Enter a valid password';
            submitCheck.passwordInput = 0;
        } else {
            showError(this, true);
            if (passwordCheck) passwordCheck.style.display = 'none';
            passwordError.textContent = '';
            submitCheck.passwordInput = 1;
        }
    } else {
        clearError(this);
        if (passwordCheck) passwordCheck.style.display = 'none';
        passwordError.textContent = '';
    }
});

confirmPasswordInput?.addEventListener('input', function () {
    if (this.value.length > 0) {
        if (this.value !== passwordInput.value) {
            showError(this, false);
            confirmPasswordError.textContent = '* Passwords do not match';
            submitCheck.confirmPasswordInput = 0;
        } else {
            showError(this, true);
            confirmPasswordError.textContent = '';
            submitCheck.confirmPasswordInput = 1;
        }

    } else {
        clearError(this);
        confirmPasswordError.textContent = '';
    }
});

document.querySelector('.input-form').addEventListener('submit', function (event) {
    if (usernameEmailInput && !usernameEmailInput.value) {
        event.preventDefault();
        showFormError(usernameEmailInput, userError);
    }
    if (usernameInput && !usernameInput.value) {
        event.preventDefault();
        showFormError(usernameInput, userError);
    }
    if (emailInput && !emailInput.value) {
        event.preventDefault();
        showFormError(emailInput, emailError);
    }
    if (passwordInput && !passwordInput.value) {
        event.preventDefault();
        showFormError(passwordInput, passwordError);
    }
    if (confirmPasswordInput && !confirmPasswordInput.value) {
        event.preventDefault();
        showFormError(confirmPasswordInput, confirmPasswordError);
    }
    if (Object.values(submitCheck).some(value => value === 0)) {
        event.preventDefault();
    }
});

openedEye.addEventListener('click', function () {
    passwordInput.setAttribute('type', 'text');
    this.style.display = 'none';
    closedEye.style.display = 'block';
});

closedEye.addEventListener('click', function () {
    passwordInput.setAttribute('type', 'password');
    this.style.display = 'none';
    openedEye.style.display = 'block';
});

openedEyeCp?.addEventListener('click', function () {
    confirmPasswordInput.setAttribute('type', 'text');
    this.style.display = 'none';
    closedEyeCp.style.display = 'block';
});

closedEyeCp?.addEventListener('click', function () {
    confirmPasswordInput.setAttribute('type', 'password');
    this.style.display = 'none';
    openedEyeCp.style.display = 'block';
});