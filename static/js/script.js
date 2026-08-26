function showModal(modalId, subjectId = null) {
    var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId));
    myModal.show();
    var form = document.getElementById('deleteFilesForm');
    if (form && subjectId) {
        form.action = '/delete_all_files/' + subjectId;
    }
}

setTimeout(function () {
    const flashMessage = document.getElementById('flash');
    if (flashMessage) {
        flashMessage.style.display = 'none';
    }
}, 3000);


const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', function (event) {
    const term = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('[data-searchable-item]');

    cards.forEach(card => {
        const cardTitle = card.querySelector('.card-title');
        const cardText = card.textContent.toLowerCase();
        console.log(card.style.display);
        if (cardText.includes(term)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

function toggleSearchInput() {
    const searchInput = document.getElementById('search-input');
    if (searchInput.style.display === 'none') {
        searchInput.style.display = 'block';
        searchInput.classList.add('search-input-is-visible');
        searchInput.focus();
    } else {
        searchInput.style.display = 'none';
        searchInput.classList.remove('search-input-is-visible');
    }
}
