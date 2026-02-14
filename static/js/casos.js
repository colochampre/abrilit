const casos = [
    {
        nombre: {
            es: "Informes BTC - Busca tu coach",
            en: "Informes BTC - Find your coach"
        },
        img: "static/img/caso-1.jpg",
        link: "https://buscatucoach.com/",
        descripcion: {
            es: "Plataforma mediante la cual los coaches pueden gestionar tests online para el conocimiento de la personalidad de sus clientes.",
            en: "Platform through which coaches can manage online tests for the knowledge of their clients' personality."
        }
    },
    {
        nombre: {
            es: "LADIE Audiología - Fabricante de equipos de audiometría",
            en: "LADIE Audiology - Manufacturer of audiometric equipment"
        },
        img: "static/img/caso-2.jpg",
        link: "https://ladie-audiologia.com/",
        descripcion: {
            es: "Gestión de productos, producción, trazabilidad, stocks, compras, ventas, clientes y proveedores.",
            en: "Management of products, production, traceability, stocks, purchases, sales, customers and suppliers."
        }
    },
    {
        nombre: {
            es: "CDH Gestión Judicial - INECIP (Instituto de Estudios Comparados en Ciencias Penales y Sociales)",
            en: "CDH Judicial Management - INECIP (Institute of Comparative Studies in Criminal and Social Sciences)"
        },
        img: "static/img/caso-3.jpg",
        link: "https://cdhgestionjudicial.org.ar/",
        descripcion: {
            es: "Portal para el diagnóstico de problemas recurrentes en materia de gestión judicial en la Argentina y la región, y herramientas e insumos para responder a los mismos.",
            en: "Portal for the diagnosis of recurring problems in judicial management in Argentina and the region, and tools and supplies to respond to them."
        }
    },
    {
        nombre: {
            es: "Gestión Educativa Integral",
            en: "Integral Educational Management"
        },
        img: "static/img/caso-4.jpg",
        link: "https://www.gestioneducativaintegral.com.ar/",
        descripcion: {
            es: "Landing page de la consultora educativa que promueve una transformación en las instituciones educativas a través de su servicio de asesorías personalizadas y cursos virtuales orientados a la capacitación y actualización.",
            en: "Landing page of the educational consultant that promotes a transformation in educational institutions through its personalized consulting service and virtual courses oriented to training and updating."
        }
    },
    {
        nombre: {
            es: "Facultad de Ciencias Económicas - UNLP",
            en: "Faculty of Economic Sciences - UNLP"
        },
        img: "static/img/caso-5.jpg",
        link: "https://www.econo.unlp.edu.ar/",
        descripcion: {
            es: "Sistema de gestión de la investigación de la Secretaría de Investigación y Transferencia.",
            en: "Investigation management system of the Research and Transfer Secretariat."
        }
    }
];

let currentIndex = 0;
let cardsPerView = 1;
let touchStartX = 0;
let touchEndX = 0;

function getCardsPerView() {
    if (window.innerWidth >= 1280) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
}

function renderCasos(lang) {
    const track = document.getElementById('cases-track');
    if (!track) return;
    
    track.innerHTML = casos.map(caso => `
        <div class="case-card">
            <img src="${caso.img}" alt="${caso.nombre[lang] || caso.nombre.es}" class="case-image">
            <div class="case-info">
                <a href="${caso.link}" target="_blank"><h3>${caso.nombre[lang] || caso.nombre.es}</h3></a>
                <p>${caso.descripcion[lang] || caso.descripcion.es}</p>
            </div>
        </div>
    `).join('');
    
    renderDots();
    updateCarousel();
}

function renderDots() {
    const dotsContainer = document.getElementById('carousel-dots');
    if (!dotsContainer) return;
    
    cardsPerView = getCardsPerView();
    const maxIndex = casos.length - cardsPerView;
    const totalDots = maxIndex + 1;
    
    dotsContainer.innerHTML = Array.from({ length: totalDots }, (_, i) => `
        <button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Ir a grupo ${i + 1}"></button>
    `).join('');
    
    dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const dotIndex = parseInt(dot.dataset.index);
            currentIndex = dotIndex;
            updateCarousel();
        });
    });
}

function updateCarousel() {
    const track = document.getElementById('cases-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (!track) return;
    
    cardsPerView = getCardsPerView();
    const cardWidth = 100 / cardsPerView;
    const maxIndex = casos.length - cardsPerView;
    
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    
    const translateX = -(currentIndex * cardWidth);
    track.style.transform = `translateX(${translateX}%)`;
    
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
    });
}

function nextSlide() {
    currentIndex++;
    updateCarousel();
}

function prevSlide() {
    currentIndex--;
    updateCarousel();
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
}

function handleTouchMove(e) {
    touchEndX = e.touches[0].clientX;
}

function handleTouchEnd() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const carousel = document.getElementById('cases-carousel');
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    if (carousel) {
        carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
        carousel.addEventListener('touchmove', handleTouchMove, { passive: true });
        carousel.addEventListener('touchend', handleTouchEnd);
    }
    
    window.addEventListener('resize', () => {
        currentIndex = 0;
        renderDots();
        updateCarousel();
    });
});
