let slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function showNextSlide() {
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add('active');
}

setInterval(showNextSlide, 4000);

// Mapa Leaflet con OpenTopoMap
var recorridoMap = L.map('recorridoMap').setView([-0.5, -78.25], 11);

// Capa base con relieve
L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap, SRTM | Map style © OpenTopoMap (CC-BY-SA)',
  maxZoom: 17
}).addTo(recorridoMap);

// Puntos clave
const puntos = [
  { nombre: "🏞️ Captación en Antisana", coords: [-0.50998, -78.13517] },
  { nombre: "💧 Laguna La Mica (almacenamiento)", coords: [-0.5420661808309257, -78.20969867005236] },
  { nombre: "🚰 Conducción superior (túneles)", coords: [-0.541800, -78.229622] },
  { nombre: "⚠️ Zona de deslizamiento (aprox.)", coords: [-0.501910, -78.303665] },
  { nombre: "⚡ Central El Carmen (~8 MW)", coords: [-0.45506028381357094, -78.36516826766962] },
  { nombre: "🔧 Estación reguladora La Moca", coords: [-0.39996748157775586, -78.39087616032049] },
  { nombre: "🏭 Planta de tratamiento El Troje", coords: [-0.33366067710572767, -78.52259825531064] }
];

// Añadir marcadores
let ruta = [];
const icons = {
  "🏞️ Captación en Antisana": L.divIcon({ html: '🏞️', className: 'emoji-icon', iconSize: [25, 25] }),
  "💧 Laguna La Mica (almacenamiento)": L.divIcon({ html: '💧', className: 'emoji-icon', iconSize: [25, 25] }),
  "⚠️ Zona de deslizamiento (aprox.)": L.divIcon({ html: '⚠️', className: 'emoji-icon', iconSize: [25, 25] }),
  "🚰 Conducción superior (túneles)": L.divIcon({ html: '🌀', className: 'emoji-icon', iconSize: [25, 25] }),
  "⚡ Central El Carmen (~8 MW)": L.divIcon({ html: '⚡🏭', className: 'emoji-icon', iconSize: [25, 25] }),
  "🔧 Estación reguladora La Moca": L.divIcon({ html: '🔄🚰', className: 'emoji-icon', iconSize: [25, 25] }),

  "🏭 Planta de tratamiento El Troje": L.divIcon({ html: '🏭', className: 'emoji-icon', iconSize: [25, 25] })
};

puntos.forEach(p => {
  L.marker(p.coords, { icon: icons[p.nombre] })
    .addTo(recorridoMap)
    .bindPopup(p.nombre);

  ruta.push(p.coords);
});

// Línea del recorrido
// Crea la línea como SVG con animación de flujo
var flowingLine = L.polyline(ruta, {
  color: '#00b4d8',
  weight: 5,
  opacity: 0.9,
  className: 'animated-flow'
}).addTo(recorridoMap);


// Barrios con cobertura
const cobertura = [
  { nombre: "Guamaní", coords: [-0.33368, -78.55494] },
  { nombre: "La Ecuatoriana", coords: [-0.30929, -78.56153] },
  { nombre: "Turubamba", coords: [-0.33531, -78.53297] },
  { nombre: "Quitumbe", coords: [-0.29611, -78.53806] }, // convertido desde Wikimapia
  { nombre: "Chillogallo", coords: [-0.31887, -78.57307] },
  { nombre: "La Argelia", coords: [-0.2758, -78.5261] }
];

cobertura.forEach(barrio => {
  L.circle(barrio.coords, {
    radius: 2000,
    color: 'green',
    fillOpacity: 0.25
  }).addTo(recorridoMap).bindTooltip(barrio.nombre);
});

// Leyenda flotante
const leyenda = L.control({ position: 'bottomleft' });
leyenda.onAdd = function () {
  const div = L.DomUtil.create('div', 'info legend');
  div.innerHTML = `
    <div style="background:white; padding: 10px; border-radius: 10px; border: 1px solid gray; font-size: 14px;">
      <b>Zona de cobertura Troje</b><br>
      - Cobertura geográfica: 6 parroquias.<br>
      - Población atendida: 300 000 y 400 000 personas.<br>
      - Barrios: 150.<br>
      - Caudal actual: 850 L/s<br>
      - Meta futura: 1.700 L/s
    </div>
  `;
  return div;
};
leyenda.addTo(recorridoMap);

const secciones = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".sidebar a");

  window.addEventListener("scroll", () => {
    let current = "";

    secciones.forEach(section => {
      const sectionTop = section.offsetTop;
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    links.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href").substring(1) === current) {
        link.classList.add("active");
      }
    });
  });

///////////////////


  (() => {
    const slides = document.querySelectorAll('.fauna-slide');
    const nextBtn = document.querySelector('.fauna-next');
    const prevBtn = document.querySelector('.fauna-prev');
    let index = 0;
    let interval;

    function showSlide(i) {
      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === i);
      });
    }

    function nextSlide() {
      index = (index + 1) % slides.length;
      showSlide(index);
    }

    function prevSlide() {
      index = (index - 1 + slides.length) % slides.length;
      showSlide(index);
    }

    function startAutoSlide() {
      interval = setInterval(nextSlide, 5000); // cambia cada 5 segundos
    }

    function stopAutoSlide() {
      clearInterval(interval);
    }

    nextBtn.addEventListener('click', () => {
      stopAutoSlide();
      nextSlide();
      startAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
      stopAutoSlide();
      prevSlide();
      startAutoSlide();
    });

    startAutoSlide();
  })();

