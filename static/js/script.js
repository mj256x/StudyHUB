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
                location.reload();
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        }
    }
}

function showModal(modalId, subjectId = null) {
    var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId));
    myModal.show();
    if (subjectId) {
        const form = document.getElementById('deleteFilesForm');
        if (form) {
            form.action = '/delete_all_files/' + subjectId;
        }
    }
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

