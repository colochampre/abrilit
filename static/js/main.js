// ============================================
// TRADUCCIONES
// ============================================
const translations = {
    es: {
        'theme': 'Tema',
        'light': 'Claro',
        'dark': 'Oscuro',
        'theme-toggle-light': 'Modo claro',
        'theme-toggle-dark': 'Modo oscuro',
        'language': 'Idioma',
        'hero-title': 'Soluciones<br>para tus proyectos',
        'contact-us': 'Contáctanos',
        'services': 'Servicios',
        'service-1': 'Soluciones tecnológicas',
        'service-2': 'Dirección de proyectos',
        'service-3': 'Software y aplicaciones a medida',
        'service-4': 'Aplicaciones web y comercio electrónico',
        'service-5': 'Consultoría',
        'success-cases': 'Algunos casos de éxito',
        'who-we-are': '¿Quiénes somos?',
        'about-text-1': 'Somos un equipo de profesionales con más de',
        'about-text-2': '30 años de experiencia en el sector',
        'about-text-3': ', que combinan la solidez y compromiso con agilidad, innovación y dinamismo, para brindar soluciones de la más alta calidad a las necesidades de nuestros clientes.',
        'contact-title': 'Contactanos',
        'name': 'Nombre',
        'email': 'Email',
        'message': 'Mensaje',
        'send-message': 'Enviar mensaje'
    },
    en: {
        'theme': 'Theme',
        'light': 'Light',
        'dark': 'Dark',
        'theme-toggle-light': 'Light mode',
        'theme-toggle-dark': 'Dark mode',
        'language': 'Language',
        'hero-title': 'Solutions<br>for your projects',
        'contact-us': 'Contact us',
        'services': 'Services',
        'service-1': 'Technological solutions',
        'service-2': 'Project management',
        'service-3': 'Custom software and applications',
        'service-4': 'Web applications and e-commerce',
        'service-5': 'Consulting',
        'success-cases': 'Some success stories',
        'who-we-are': 'Who we are',
        'about-text-1': 'We are a team of professionals with more than',
        'about-text-2': '30 years of experience in the sector',
        'about-text-3': ', combining solidity and commitment with agility, innovation and dynamism, to provide the highest quality solutions to our clients\' needs.',
        'contact-title': 'Contact us',
        'name': 'Name',
        'email': 'Email',
        'message': 'Message',
        'send-message': 'Send message'
    }
};

// ============================================
// GESTIÓN DE TEMA
// ============================================
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
}

// ============================================
// GESTIÓN DE IDIOMA
// ============================================
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    document.documentElement.setAttribute('lang', lang);
    updateContent(lang);
    renderCasos(lang);
    updateThemeToggleUI();
}

function updateContent(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });
}

function loadLanguage() {
    const savedLang = localStorage.getItem('language') || 'es';
    setLanguage(savedLang);
}

// ============================================
// ACTUALIZAR ICONO DEL TOGGLE
// ============================================
function updateThemeToggleUI() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const toggleIcon = document.getElementById('themeToggleIcon');
    const toggleText = document.querySelector('#themeToggle [data-i18n="theme-toggle"]');
    
    if (toggleIcon && toggleText) {
        if (currentTheme === 'dark') {
            toggleIcon.className = 'bi bi-toggle-off';
            toggleText.textContent = translations[currentLang]['theme-toggle-light'] || 'Modo claro';
        } else {
            toggleIcon.className = 'bi bi-toggle-on';
            toggleText.textContent = translations[currentLang]['theme-toggle-dark'] || 'Modo oscuro';
        }
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
let currentLang = 'es';

document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    loadLanguage();
    updateThemeToggleUI();
    
    // Manejar clicks en dropdown items usando event delegation
    document.addEventListener('click', function(e) {
        const dropdownItem = e.target.closest('.dropdown-item[data-action]');
        if (dropdownItem) {
            const action = dropdownItem.getAttribute('data-action');
            const value = dropdownItem.getAttribute('data-value');
            
            if (action === 'theme-toggle') {
                // Alternar entre light y dark
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                setTheme(newTheme);
                updateThemeToggleUI();
            } else if (action === 'language') {
                setLanguage(value);
            }
        }
    });
    
    // Manejo del formulario de contacto
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = currentLang === 'es' ? 'Enviando...' : 'Sending...';
            
            const formData = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                mensaje: document.getElementById('mensaje').value
            };
            
            try {
                // En producción (cPanel) usa el PHP; en local el backend Python/Go
                const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname) || window.location.protocol === 'file:';
                const apiUrl = isLocal ? 'http://localhost:5000/send-email' : '/api/send-email.php';
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();

                if (result.success) {
                    alert(currentLang === 'es' ? '¡Mensaje enviado correctamente! Te contactaremos pronto.' : 'Message sent successfully! We will contact you soon.');
                    contactForm.reset();
                } else {
                    alert(currentLang === 'es' ? 'Error al enviar el mensaje. Por favor, intenta nuevamente.' : 'Error sending message. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert(currentLang === 'es' ? 'Error al enviar el mensaje. Por favor, intenta nuevamente.' : 'Error sending message. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});
