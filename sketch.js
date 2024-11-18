let data; // Memorizza contenuto dataset
let continentsData = []; // Array che contiene dati sui continenti e loro fiumi

// Colori e dimensioni iniziali
let pageColor = "#0073e6"; 
let circleColor = "blue"; 
let centerDotColor = "#00ffff";
let lineColor = "#00ffff";
let textColor = "#D6EAF8"; 
let nameColor = "#D6EAF8";

let baseCircleSize = 250;
let basePadding = 100;
let circleSize, padding;

// Animazione
let currentLinePhase = 0; // Fase attuale animazione, indica quale linea stiamo disegnando
let currentLineProgress = 0; // Progresso linea corrente (0 a 1)
let animationSpeed = 0.08; // Velocità 
let animationComplete = false; // Stato dell'animazione

function preload() {
  data = loadTable("assets/rivers-data.csv", "csv", "header");
}

function setup() {
  // Eseguito una volta all'inizio
  if (continentsData.length === 0) {
    // Se non ancora estratto dato per continenti, si fa ora
    extractContinentsData();
  }
  
  // Aggiorna layout in base dimensione finestra
  updateLayout();
  createCanvas(windowWidth, getCanvasHeight()); // Crea canvas con larghezza finestra e altezza calcolata
  background(pageColor);
}

function draw() {
  drawCircles(); // Cerchi dei continenti
  
  // Gestisce animazione linee
  if (!animationComplete) {
    // Incrementa progresso linea
    currentLineProgress += animationSpeed;
    if (currentLineProgress >= 1) { 
      // Se progresso ragiunge 1 (linea completa), passa alla fase successiva 
      currentLineProgress = 0;
      currentLinePhase++;  // Passa alla seconda, terza linea...)

      // Se tutte le linee sono state disegnate allora fermo l'animazione
      if (currentLinePhase >= continentsData.reduce((acc, continent) => acc + continent.rivers.length, 0)) {  // Numero totale di linee
        animationComplete = true; 
        noLoop(); 
      }
    }
  }
  
  // Se l'animazione è completata, forza il disegno finale dei fiumi
  if (animationComplete) {
    currentLineProgress = 1; // Imposta progresso linea a 1 (linea completa)
    drawCircles(); // Ridisegna cerchi con fiumi finalizzati
  }
}

// Aggiorna dimensione cerchi e padding in base a dimensione della finestra
function updateLayout() {
  if (windowWidth > 1200) {
    circleSize = baseCircleSize; // Dimensione base per schermi larghi
    padding = basePadding; // Padding base
  } else if (windowWidth > 800) {
    circleSize = baseCircleSize * 0.8; // Riduce dimensione cerchi per schermi medi
    padding = basePadding * 0.6; // Riduce padding per schermi medi
  } else {
    circleSize = baseCircleSize * 0.6; // Riduce dimensione cerchi per schemri piccoli 
    padding = basePadding * 0.4; // Riduce padding per schermi piccoli
  }
}

// Calcola altezza canvas in base a numero di righe di cerchi
function getCanvasHeight() {
  let cols = getCols(); // Ottengo numero colonne che dipende da larghezza finestra
  let rows = ceil(continentsData.length / cols); // Calcolo numero righe
  return max(windowHeight, rows * (circleSize + padding)); // Altezza finale deve ospitare tutti cerchi
}

// Determina numero colonne di cerchi in base alla larghezza finestra 
function getCols() {
  return windowWidth > 1200 ? 3 : 2;
}

// Estraggo dati dataset e li organizzo per continente
function extractContinentsData() {
  let continentNames = data.getColumn("continent");
  let riverNames = data.getColumn("name");
  let riverLengths = data.getColumn("length");
  let riverAreas = data.getColumn("area");

  let continents = {}; // Oggetto per memorizzare dati per ciascun continente

  // Estrae dati per ogni fiume 
  for (let i = 0; i < data.getRowCount(); i++) {
    let continent = continentNames[i];
    let riverName = riverNames[i];
    let riverLength = parseFloat(riverLengths[i]) || 0; // Converte lunghezza fiume in numero, default 0
    let riverArea = parseFloat(riverAreas[i]) || 0; // Converte area fiume in numero, default 0

    if (continent === "Australia") continent = "Oceania"; // Siccome Australia è un paese, lo inserisco nel continetnte Oceania

    if (!continents[continent]) continents[continent] = {}; // Crea un array vuoto per il continente se non esiste

    let splitNames = riverName.split("–").map(name => name.trim()); // Gestisce fiumi con più nomi (split se necessario)
    // Aggiunge ogni parte del nome come fiume separato, senza ripetizioni
    splitNames.forEach(name => {
      if (!continents[continent][name]) {
        continents[continent][name] = {
          name: name,
          length: riverLength,
          area: riverArea
        };
      }
    });
  }

  // Scorre attraverso tutte le chiavi dell'oggetto continets (nomi)
  for (let continent in continents) {
    let riversArray = Object.values(continents[continent]); // Estrae tutti i valori (fiumi) associati alla chiave corrente e li restituisce come un array
    continentsData.push({
      continent: continent, // Aggiunge nome continente
      rivers: riversArray // Aggiunge l'array dei fiumi per quel continente
    });
  }
}

// Disegna cerchi per ogni continente
function drawCircles() {
  let cols = getCols();
  let rows = ceil(continentsData.length / cols); // Calcola il numero di righe necessarie
  let totalWidth = cols * (circleSize + padding) - padding; // Calcola la larghezza totale del layout
  let offsetX = (width - totalWidth) / 2; // Centra i cerchi orizzontalmente
  
  let rowSpacing = circleSize + padding; // Distanza tra le righe
  let totalHeight = rowSpacing * rows - padding; // Altezza totale
  let offsetY = (height - totalHeight) / 2; // Centra i cerchi verticalmente

  // Disegna ogni cerchio per ogni continente
  let xPos, yPos;
  for (let i = 0; i < continentsData.length; i++) {
    xPos = offsetX + (i % cols) * (circleSize + padding) + circleSize / 2;
    yPos = offsetY + floor(i / cols) * rowSpacing + circleSize / 2;

    let continent = continentsData[i];
    drawGlyph(xPos, yPos, circleSize, continent); // Disegna il glifo per il continente
  }
}

// Disegna un cerchio per un continente e le sue linee 
function drawGlyph(x, y, size, continentData) {
  fill(circleColor);
  noStroke();
  circle(x, y, size); // Disegna il cerchio principale

  fill(textColor);
  textAlign(CENTER, CENTER);
  textSize(12);
  text(continentData.continent, x, y - size / 2 - 18); // Nome continente sopra cerchio

  // Disegno punto centrale
  fill(centerDotColor);
  circle(x, y, 5);

  let numRivers = continentData.rivers.length;
  let angleStep = TWO_PI / numRivers; // Calcola l'angolo tra i fiumi (spaziati uniformemente attorno al cerchio)
  let maxLineLength = size / 2 - 20; // Lunghezza massima delle linee 
  let maxCombinedMetric = max(continentData.rivers.map(r => 0.85 * r.length + 0.15 * r.area));

  for (let j = 0; j < numRivers; j++) {
    if (j <= currentLinePhase || animationComplete) {  // Disegna solo fino alla linea della fase corrente
      let river = continentData.rivers[j]; 
      let combinedMetric = 0.85 * river.length + 0.15 * river.area; // Calcola il valore combinato per ogni fiume
      let lineLength = map(combinedMetric, 0, maxCombinedMetric, 10, maxLineLength); // Mappa la lunghezza della linea

      let progress = j === currentLinePhase && !animationComplete ? currentLineProgress : 1; // Se è la fase corrente, mostra il progresso
      let angle = j * angleStep; // Calcola angolo per ogni fiume
      let x2 = x + cos(angle) * lineLength * progress; // Coordinate finali della linea (x)
      let y2 = y + sin(angle) * lineLength * progress; // Coordinate finali della linea (y)

      stroke(lineColor);
      strokeWeight(0.8);
      line(x, y, x2, y2); // Disegna la linea
    }
  }
}

// Funzione che viene eseguita quando la finestra viene ridimensionata
function windowResized() {
  updateLayout(); // Aggiorna layout
  resizeCanvas(windowWidth, getCanvasHeight()); // Ridimensiona canvas
  background(pageColor); // Rispristina sfondo
  // Reset animazione
  currentLinePhase = 0;  
  currentLineProgress = 0;
  animationComplete = false;
  loop();  // Riavvia l'animazione al ridimensionamento
}
