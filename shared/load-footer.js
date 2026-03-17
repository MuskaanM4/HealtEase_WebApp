document.addEventListener("DOMContentLoaded", function() {
    fetch('shared/footer.html')
        .then(response => response.text())
        .then(data => {
            // Voeg een div toe aan het einde van de body als die er nog niet is
            let footerContainer = document.getElementById('footer-container');
            if (!footerContainer) {
                footerContainer = document.createElement('div');
                footerContainer.id = 'footer-container';
                document.body.appendChild(footerContainer);
            }
            footerContainer.innerHTML = data;
        })
        .catch(error => console.error('Fout bij laden footer:', error));
});