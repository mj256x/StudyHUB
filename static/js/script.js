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

document.querySelectorAll('.nav-link').forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active');
    }
});

document.addEventListener('DOMContentLoaded', function () {

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
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
            searchButton.style.borderLeft = 'none';
        } else {
            searchInput.blur();
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchButton.contains(e.target)) {
            searchInput.classList.remove('active');
            searchInput.blur();
        }
    });

});

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
