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
    const isVisible = searchInput.classList.toggle('is-visible');
    if (isVisible) {
        searchInput.classList.add('searchable');
        searchInput.focus();
    }
}