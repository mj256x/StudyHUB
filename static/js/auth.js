const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const inputError = document.getElementById('usernameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const passwordCheckTerms = document.querySelectorAll('.password-check span');
const openedEyeCp = document.querySelector('.opened-eye-cp');
const closedEyeCp = document.querySelector('.closed-eye-cp');

function showError(inputElement, valid) {
    const uncheckedIcon = inputElement.parentElement?.querySelector('.unchecked');
    const checkedIcon = inputElement.parentElement?.querySelector('.checked');


    if (valid) {
        if (checkedIcon) checkedIcon.style.display = 'block';
        if (uncheckedIcon) uncheckedIcon.style.display = 'none';
        inputElement.style.borderBottomColor = 'green';
        document.querySelector('.opened-eye').style.right = '40px';
        document.querySelector('.closed-eye').style.right = '40px';
        if (openedEyeCp) openedEyeCp.style.right = '40px';
        if (closedEyeCp) closedEyeCp.style.right = '40px';
    } else {
        if (checkedIcon) checkedIcon.style.display = 'none';
        if (uncheckedIcon) uncheckedIcon.style.display = 'block';
        inputElement.style.borderBottomColor = 'red';
        document.querySelector('.opened-eye').style.right = '40px';
        document.querySelector('.closed-eye').style.right = '40px';
        if (openedEyeCp) openedEyeCp.style.right = '40px';
        if (closedEyeCp) closedEyeCp.style.right = '40px';
    }
}

function clearError(inputElement) {
    const icons = inputElement.parentElement?.querySelectorAll('.unchecked, .checked');
    icons?.forEach((icon) => {
        icon.style.display = 'none';
    });
    inputElement.style.borderBottomColor = '#e2e8f0';
    if (openedEyeCp) openedEyeCp.style.right = '5px';
    if (closedEyeCp) closedEyeCp.style.right = '5px';
    document.querySelector('.opened-eye').style.right = '5px';
    document.querySelector('.closed-eye').style.right = '5px';
}

function showFormError(inputElement, message) {
    const uncheckedIcon = inputElement.parentElement?.querySelector('.unchecked');
    if (uncheckedIcon) uncheckedIcon.style.display = 'block';
    inputElement.style.borderBottomColor = 'red';
    message.textContent = '* This field is required';
}

document.getElementById('usernameInput')?.addEventListener('input', function () {
    if (this.value.length > 0) {
        if (!usernameRegex.test(this.value)) {
            showError(this, false);
            inputError.textContent = '* Enter a valid username';
        } else {
            showError(this, true);
            inputError.textContent = '';
        }
    } else {
        clearError(this);
        inputError.textContent = '';
    }
});

document.getElementById('usernameEmailInput')?.addEventListener('input', function () {
    if (this.value.length > 0) {
        if (!usernameRegex.test(this.value) && !emailRegex.test(this.value)) {
            showError(this, false);
            inputError.textContent = '* Enter a valid username or email';
        } else {
            showError(this, true);
            inputError.textContent = '';
        }
    } else {
        clearError(this);
        inputError.textContent = '';
    }
});

document.getElementById('emailInput')?.addEventListener('input', function () {
    if (this.value.length > 0) {
        if (!emailRegex.test(this.value)) {
            showError(this, false);
            emailError.textContent = '* Enter a valid email';
        } else {
            showError(this, true);
            emailError.textContent = '';
        }
    } else {
        clearError(this);
        emailError.textContent = '';
    }
});

document.getElementById('passwordInput')?.addEventListener('input', function () {
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
            passwordError.textContent = '* Enter a valid password';
        } else {
            showError(this, true);
            document.querySelector('.password-check').style.display = 'none';
            passwordError.textContent = '';
        }

    } else {
        clearError(this);
        document.querySelector('.password-check').style.display = 'none';
        passwordError.textContent = '';
    }
});

document.getElementById('confirmPasswordInput')?.addEventListener('input', function () {
    const passwordInput = document.getElementById('passwordInput');
    if (this.value.length > 0) {
        if (this.value !== passwordInput.value) {
            showError(this, false);
            confirmPasswordError.textContent = '* Passwords do not match';
        } else {
            showError(this, true);
            confirmPasswordError.textContent = '';
        }

    } else {
        clearError(this);
        confirmPasswordError.textContent = '';
    }
});

document.querySelector('.input-form')?.addEventListener('submit', function (event) {
    const usernameEmailInput = document.getElementById('usernameEmailInput');
    const usernameInput = document.getElementById('usernameInput');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');

    if (usernameEmailInput && !usernameEmailInput.value) {
        event.preventDefault();
        showFormError(usernameEmailInput, inputError);
    }
    if (usernameInput && !usernameInput.value) {
        event.preventDefault();
        showFormError(usernameInput, inputError);
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
});

const passwordInput = document.getElementById('passwordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');

document.querySelector('.opened-eye').addEventListener('click', function () {
    passwordInput.setAttribute('type', 'text');
    this.style.display = 'none';
    document.querySelector('.closed-eye').style.display = 'block';
});

document.querySelector('.closed-eye').addEventListener('click', function () {
    passwordInput.setAttribute('type', 'password');
    this.style.display = 'none';
    document.querySelector('.opened-eye').style.display = 'block';
});

document.querySelector('.opened-eye-cp')?.addEventListener('click', function () {
    confirmPasswordInput.setAttribute('type', 'text');
    this.style.display = 'none';
    document.querySelector('.closed-eye-cp').style.display = 'block';
});

document.querySelector('.closed-eye-cp')?.addEventListener('click', function () {
    confirmPasswordInput.setAttribute('type', 'password');
    this.style.display = 'none';
    document.querySelector('.opened-eye-cp').style.display = 'block';
});