// Manejo de navegación entre páginas
const sections = document.querySelectorAll('.page-section');
const navLinks = document.querySelectorAll('nav a');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);

        sections.forEach(section => {
            section.style.display = section.id === targetId ? 'block' : 'none';
        });
    });