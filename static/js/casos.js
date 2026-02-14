const casos = [
    {
        nombre: {
            es: "Informes BTC - Busca tu coach",
            en: "Informes BTC - Find your coach"
        },
        img: "static/img/caso-1.jpg",
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
        descripcion: {
            es: "Sistema de gestión de la investigación de la Secretaría de Investigación y Transferencia.",
            en: "Investigation management system of the Research and Transfer Secretariat."
        }
    }
];

function renderCasos(lang) {
    const grid = document.getElementById('cases-grid');
    if (!grid) return;
    grid.innerHTML = casos.map(caso => `
        <div class="case-card">
            <img src="${caso.img}" alt="${caso.nombre}" class="case-image">
            <div class="case-info">
                <h3>${caso.nombre[lang] || caso.nombre.es}</h3>
                <p>${caso.descripcion[lang] || caso.descripcion.es}</p>
            </div>
        </div>
    `).join('');
}
