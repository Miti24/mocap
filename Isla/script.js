let points = [];
let grabbedPointIndex = null;
let textString = "";
let bgImg = null;
let customFont = null;
let lastPointsCount = 0;

let isDraggingKnob = false;
let knobAngle = 0; 
let groupWordsActive = false;

let clipTextActive = false;
let contourMode = "curve"; 

// Capa PGrahics auxiliar para procesar la máscara real de calado tipográfico
let maskBuffer;

let currentWindowsLayout = "normal"; 

const textInput = document.getElementById('text-input');
const bgColorInput = document.getElementById('bg-color');
const textColorInput = document.getElementById('text-color');
const canvasBgColorInput = document.getElementById('canvas-bg-color');

const bgColorPreview = document.getElementById('bg-color-preview');
const textColorPreview = document.getElementById('text-color-preview');
const canvasBgPreview = document.getElementById('canvas-bg-preview');

const sizeSlider = document.getElementById('size-slider');
const strokeSlider = document.getElementById('stroke-slider');
const rotateKnob = document.getElementById('rotation-knob');
const knobIndicator = document.getElementById('knob-indicator');
const groupWordsBtn = document.getElementById('group-words-btn');
const resetBtn = document.getElementById('reset-btn');
const exportBtn = document.getElementById('export-btn');
const infoText = document.getElementById('dynamic-info');

const sizeModeSelect = document.getElementById('size-mode');
const ratioSelectorGroup = document.getElementById('ratio-selector-group');
const aspectRatioSelect = document.getElementById('aspect-ratio');
const customDimensionsDiv = document.getElementById('custom-dimensions');
const customWInput = document.getElementById('custom-w');
const customHInput = document.getElementById('custom-h');
const labelW = document.getElementById('label-w');
const labelH = document.getElementById('label-h');

const bgImageInput = document.getElementById('bg-image-input');
const imageAdjustRow = document.getElementById('image-adjust-row');
const imgZoom = document.getElementById('img-zoom');
const imgX = document.getElementById('img-x');
const imgY = document.getElementById('img-y');
const removeImgBtn = document.getElementById('remove-img-btn');

const fontInput = document.getElementById('font-input');
const fontButtonLabel = document.getElementById('font-button-label');

const moveCanvasUpBtn = document.getElementById('move-canvas-up-btn');
const moveCanvasDownBtn = document.getElementById('move-canvas-down-btn');

const clipTextBtn = document.getElementById('clip-text-btn');
const contourCurveBtn = document.getElementById('contour-curve-btn');
const contourSharpBtn = document.getElementById('contour-sharp-btn');

function setup() {
    let canvas = createCanvas(600, 600);
    canvas.parent('canvas-container');
    
    // Crear el buffer gráfico con las mismas dimensiones para operaciones de calado
    maskBuffer = createGraphics(width, height);
    
    resetBtn.addEventListener('click', fullReset);
    exportBtn.addEventListener('click', exportPoster);
    sizeModeSelect.addEventListener('change', handleSizeModeChange);
    aspectRatioSelect.addEventListener('change', updateCanvasDimensions);
    customWInput.addEventListener('input', updateCanvasDimensions);
    customHInput.addEventListener('input', updateCanvasDimensions);
    
    bgColorInput.addEventListener('input', () => bgColorPreview.style.backgroundColor = bgColorInput.value);
    textColorInput.addEventListener('input', () => textColorPreview.style.backgroundColor = textColorInput.value);
    canvasBgColorInput.addEventListener('input', () => canvasBgPreview.style.backgroundColor = canvasBgColorInput.value);
    
    bgImageInput.addEventListener('change', handleImageUpload);
    removeImgBtn.addEventListener('click', removeBackgroundImage);
    fontInput.addEventListener('change', handleFontUpload);

    groupWordsBtn.addEventListener('click', toggleGroupWords);
    
    clipTextBtn.addEventListener('click', toggleClipText);
    contourCurveBtn.addEventListener('click', () => setContourMode("curve"));
    contourSharpBtn.addEventListener('click', () => setContourMode("sharp"));

    moveCanvasUpBtn.addEventListener('click', () => { if(currentWindowsLayout === "normal") animateLayoutSwap(); });
    moveCanvasDownBtn.addEventListener('click', () => { if(currentWindowsLayout === "swapped") animateLayoutSwap(); });

    rotateKnob.addEventListener('mousedown', (e) => { isDraggingKnob = true; handleKnobRotation(e); });
    window.addEventListener('mousemove', (e) => { if (isDraggingKnob) handleKnobRotation(e); });
    window.addEventListener('mouseup', () => isDraggingKnob = false);

    textAlign(CENTER, CENTER);
    updateBufferFont();
    textStyle(BOLD);

    initializeIsland();
    
    initWindowDragging(document.getElementById('controls-panel'));
    initWindowDragging(document.getElementById('canvas-window'));
    
    updateWindowsPositions();
}

function draw() {
    // 1. Dibujar fondo del canvas principal e imagen si existe
    background(canvasBgColorInput.value);
    
    if (bgImg) {
        push();
        imageMode(CENTER);
        translate(width / 2 + parseInt(imgX.value), height / 2 + parseInt(imgY.value));
        let zoomFactor = map(imgZoom.value, 10, 300, 0.1, 3.0);
        image(bgImg, 0, 0, bgImg.width * zoomFactor, bgImg.height * zoomFactor);
        pop();
    }
    
    if (groupWordsActive) {
        textString = textInput.value; 
    } else {
        textString = textInput.value.replace(/\s/g, ''); 
    }
    
    let numPoints = textString.length;
    infoText.innerText = `Tamaño: ${width}x${height} px`;

    if (numPoints !== lastPointsCount && numPoints > 2) {
        adjustPointsCount();
        lastPointsCount = numPoints;
    }

    if (grabbedPointIndex !== null) {
        let targetX = mouseX;
        let targetY = mouseY;
        
        let deltaX = targetX - points[grabbedPointIndex].x;
        let deltaY = targetY - points[grabbedPointIndex].y;
        
        points[grabbedPointIndex].x = targetX;
        points[grabbedPointIndex].y = targetY;
        
        let total = points.length;
        let steps = groupWordsActive ? 5 : 3; 
        let falloffs = groupWordsActive ? [0.65, 0.45, 0.3, 0.18, 0.08] : [0.35, 0.18, 0.05]; 

        for (let i = 1; i <= steps; i++) {
            let factor = falloffs[i - 1];
            let idxRight = (grabbedPointIndex + i) % total;
            points[idxRight].x += deltaX * factor;
            points[idxRight].y += deltaY * factor;
            
            let idxLeft = (grabbedPointIndex - i + total) % total;
            points[idxLeft].x += deltaX * factor;
            points[idxLeft].y += deltaY * factor;
        }
    }

    let shift = floor(map(knobAngle, 0, 2 * Math.PI, 0, numPoints));
    let strokeVal = parseInt(strokeSlider.value);

    if (clipTextActive) {
        // MODO CALAR AVANZADO: Usamos el buffer gráfico como lienzo de corte stencil
        maskBuffer.clear();
        maskBuffer.push();
        
        // Dibujar el cuerpo sólido de la Isla en el buffer
        maskBuffer.fill(bgColorInput.value);
        if (strokeVal > 0) {
            maskBuffer.stroke(textColorInput.value);
            maskBuffer.strokeWeight(strokeVal);
        } else {
            maskBuffer.noStroke();
        }

        if (contourMode === "curve") {
            maskBuffer.beginShape();
            maskBuffer.curveVertex(points[points.length - 1].x, points[points.length - 1].y);
            for (let p of points) maskBuffer.curveVertex(p.x, p.y);
            maskBuffer.curveVertex(points[0].x, points[0].y);
            maskBuffer.curveVertex(points[1].x, points[1].y);
            maskBuffer.endShape(CLOSE);
        } else {
            maskBuffer.beginShape();
            for (let p of points) maskBuffer.vertex(p.x, p.y);
            maskBuffer.endShape(CLOSE);
        }

        // Cortar la geometría usando la operación de borrado tipográfico REMOVE
        maskBuffer.blendMode(REMOVE);
        maskBuffer.noStroke();
        maskBuffer.fill(0, 0, 0, 255); // Relleno opaco de perforación
        maskBuffer.textSize(parseInt(sizeSlider.value));
        maskBuffer.textAlign(CENTER, CENTER);

        renderTextToBuffer(maskBuffer, shift, numPoints);
        maskBuffer.pop();

        // Estampar la isla ya perforada encima del fondo
        image(maskBuffer, 0, 0);

        // Si hay contorno activo, se vuelve a dibujar el texto encima de forma clásica solo como línea vacía
        if (strokeVal > 0) {
            push();
            noFill();
            stroke(textColorInput.value);
            strokeWeight(strokeVal);
            textSize(parseInt(sizeSlider.value));
            renderTextToCanvas(shift, numPoints);
            pop();
        }

    } else {
        // MODO CLÁSICO: Relleno e impresión normal
        fill(bgColorInput.value);
        if (strokeVal > 0) {
            stroke(textColorInput.value);
            strokeWeight(strokeVal);
        } else {
            noStroke();
        }

        if (contourMode === "curve") {
            beginShape();
            curveVertex(points[points.length - 1].x, points[points.length - 1].y);
            for (let p of points) curveVertex(p.x, p.y);
            curveVertex(points[0].x, points[0].y);
            curveVertex(points[1].x, points[1].y);
            endShape(CLOSE);
        } else {
            beginShape();
            for (let p of points) vertex(p.x, p.y);
            endShape(CLOSE);
        }

        noStroke(); 
        fill(textColorInput.value);
        textSize(parseInt(sizeSlider.value));
        renderTextToCanvas(shift, numPoints);
    }
}

// Funciones modulares de renderizado textual cruzado
function renderTextToBuffer(targetBuffer, shift, numPoints) {
    for (let i = 0; i < points.length; i++) {
        let letterIndex = (i - shift + numPoints) % numPoints;
        let letter = textString[letterIndex] || '';
        if (letter === ' ') continue;

        let p = points[i];
        let offsetVisualX = 0, offsetVisualY = 0;
        
        if (groupWordsActive) {
            let nextIndex = (letterIndex + 1) % numPoints;
            let prevIndex = (letterIndex - 1 + numPoints) % numPoints;
            if (textString[nextIndex] === ' ' || textString[prevIndex] === ' ') {
                let angleUnit = map(i, 0, points.length, 0, TWO_PI);
                offsetVisualX = cos(angleUnit) * 4;
                offsetVisualY = sin(angleUnit) * 4;
            }
        }
        targetBuffer.text(letter, p.x + offsetVisualX, p.y + offsetVisualY);
    }
}

function renderTextToCanvas(shift, numPoints) {
    for (let i = 0; i < points.length; i++) {
        let letterIndex = (i - shift + numPoints) % numPoints;
        let letter = textString[letterIndex] || '';
        if (letter === ' ') continue;

        let p = points[i];
        let offsetVisualX = 0, offsetVisualY = 0;

        if (groupWordsActive) {
            let nextIndex = (letterIndex + 1) % numPoints;
            let prevIndex = (letterIndex - 1 + numPoints) % numPoints;
            if (textString[nextIndex] === ' ' || textString[prevIndex] === ' ') {
                let angleUnit = map(i, 0, points.length, 0, TWO_PI);
                offsetVisualX = cos(angleUnit) * 4;
                offsetVisualY = sin(angleUnit) * 4;
            }
        }
        text(letter, p.x + offsetVisualX, p.y + offsetVisualY);
    }
}

function toggleClipText() {
    clipTextActive = !clipTextActive;
    if (clipTextActive) {
        clipTextBtn.classList.add('active');
    } else {
        clipTextBtn.classList.remove('active');
    }
}

function setContourMode(mode) {
    contourMode = mode;
    if (mode === "curve") {
        contourCurveBtn.classList.add('active');
        contourSharpBtn.classList.remove('active');
    } else {
        contourSharpBtn.classList.add('active');
        contourCurveBtn.classList.remove('active');
    }
}

function handleFontUpload(e) {
    let file = e.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(event) {
            customFont = loadFont(event.target.result, () => {
                updateBufferFont();
                fontButtonLabel.innerText = file.name.substring(0, 12) + "...";
            });
        }
        reader.readAsDataURL(file);
    }
}

function updateBufferFont() {
    if (customFont) {
        textFont(customFont);
        maskBuffer.textFont(customFont);
    } else {
        textFont('sans-serif');
        maskBuffer.textFont('sans-serif');
    }
}

// Modificación responsive de redimensionamiento de buffers internos
function updateCanvasDimensions() {
    let mode = sizeModeSelect.value;
    let targetW = 600;
    let targetH = 600;

    if (mode === 'ratio') {
        let ratio = aspectRatioSelect.value;
        if (ratio === 'custom') {
            customDimensionsDiv.classList.remove('hidden-inputs');
            let rX = parseFloat(customWInput.value) || 1;
            let rY = parseFloat(customHInput.value) || 1;
            targetH = Math.round(targetW * (rY / rX));
        } else {
            customDimensionsDiv.classList.add('hidden-inputs');
            if (ratio === "4:3") targetH = Math.round(targetW * (3 / 4));
            if (ratio === "3:4") targetH = Math.round(targetW * (4 / 3));
            if (ratio === "16:9") targetH = Math.round(targetW * (9 / 16));
            if (ratio === "9:16") targetH = Math.round(targetW * (16 / 9));
        }
    } else {
        targetW = parseInt(customWInput.value) || 600;
        targetH = parseInt(customHInput.value) || 600;
    }

    resizeCanvas(targetW, targetH);
    maskBuffer = createGraphics(targetW, targetH); // Redimensionar buffer de calado
    updateBufferFont();
    initializeIsland();
    setTimeout(updateWindowsPositions, 50);
}

function updateWindowsPositions() {
    const panel = document.getElementById('controls-panel');
    const canvasWin = document.getElementById('canvas-window');
    
    const panelHeight = panel.offsetHeight;
    const canvasHeight = canvasWin.offsetHeight;
    
    if (currentWindowsLayout === "normal") {
        panel.style.top = "24px";
        canvasWin.style.top = (24 + panelHeight + 24) + "px";
        moveCanvasDownBtn.disabled = true;
        moveCanvasUpBtn.disabled = false;
    } else {
        canvasWin.style.top = "24px";
        panel.style.top = (24 + canvasHeight + 32) + "px";
        moveCanvasUpBtn.disabled = true;
        moveCanvasDownBtn.disabled = false;
    }
    
    panel.style.left = "24px";
    canvasWin.style.left = "24px";
}

function animateLayoutSwap() {
    currentWindowsLayout = (currentWindowsLayout === "normal") ? "swapped" : "normal";
    updateWindowsPositions();
}

function toggleGroupWords() {
    groupWordsActive = !groupWordsActive;
    if (groupWordsActive) {
        groupWordsBtn.classList.add('active');
    } else {
        groupWordsBtn.classList.remove('active');
    }
    initializeIsland();
}

function handleKnobRotation(e) {
    const rect = rotateKnob.getBoundingClientRect();
    const knobX = rect.left + rect.width / 2;
    const knobY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - knobX;
    const deltaY = e.clientY - knobY;
    
    knobAngle = Math.atan2(deltaY, deltaX) + Math.PI / 2;
    if (knobAngle < 0) knobAngle += 2 * Math.PI;

    const deg = knobAngle * (180 / Math.PI);
    knobIndicator.style.transform = `rotate(${deg}deg)`;
}

function handleImageUpload(e) {
    let file = e.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(event) {
            bgImg = loadImage(event.target.result, () => {
                imageAdjustRow.classList.remove('hidden-inputs');
                imgZoom.value = 100;
                imgX.value = 0;
                imgY.value = 0;
                updateWindowsPositions();
            });
        }
        reader.readAsDataURL(file);
    }
}

function removeBackgroundImage() {
    bgImg = null;
    bgImageInput.value = "";
    imageAdjustRow.classList.add('hidden-inputs');
    updateWindowsPositions();
}

function handleSizeModeChange() {
    let mode = sizeModeSelect.value;
    if (mode === 'ratio') {
        ratioSelectorGroup.classList.remove('hidden-inputs');
        labelW.innerText = "Prop. X";
        labelH.innerText = "Prop. Y";
        if (aspectRatioSelect.value !== 'custom') {
            customDimensionsDiv.classList.add('hidden-inputs');
        } else {
            customDimensionsDiv.classList.remove('hidden-inputs');
        }
    } else {
        ratioSelectorGroup.classList.add('hidden-inputs');
        customDimensionsDiv.classList.remove('hidden-inputs');
        labelW.innerText = "Ancho (px)";
        labelH.innerText = "Alto (px)";
    }
    updateCanvasDimensions();
}

function initializeIsland() {
    points = [];
    if (groupWordsActive) {
        textString = textInput.value;
    } else {
        textString = textInput.value.replace(/\s/g, '');
    }
    let numPoints = textString.length;
    lastPointsCount = numPoints;
    
    let centerX = width / 2;
    let centerY = height / 2;
    let radius = min(width, height) * 0.28;

    for (let i = 0; i < numPoints; i++) {
        let angle = map(i, 0, numPoints, 0, TWO_PI);
        let x = centerX + cos(angle) * radius;
        let y = centerY + sin(angle) * radius;
        points.push({ x: x, y: y });
    }
}

function fullReset() {
    sizeSlider.value = 50;
    strokeSlider.value = 0;
    
    knobAngle = 0;
    knobIndicator.style.transform = `rotate(0deg)`;
    
    groupWordsActive = false;
    groupWordsBtn.classList.remove('active');

    clipTextActive = false;
    clipTextBtn.classList.remove('active');
    setContourMode("curve");

    bgColorInput.value = "#5a636a";
    textColorInput.value = "#111111";
    canvasBgColorInput.value = "#ffffff";
    
    bgColorPreview.style.backgroundColor = "#5a636a";
    textColorPreview.style.backgroundColor = "#111111";
    canvasBgPreview.style.backgroundColor = "#ffffff";
    
    customFont = null;
    fontInput.value = "";
    fontButtonLabel.innerText = "Cargar Fuente";
    updateBufferFont();
    
    currentWindowsLayout = "normal";
    
    removeBackgroundImage();
    initializeIsland();
    setTimeout(updateWindowsPositions, 50);
}

function adjustPointsCount() {
    let currentText = groupWordsActive ? textInput.value : textInput.value.replace(/\s/g, '');
    if(currentText.length < 3) return;
    
    let centerX = 0, centerY = 0;
    for(let p of points) {
        centerX += p.x;
        centerY += p.y;
    }
    centerX = points.length ? centerX / points.length : width / 2;
    centerY = points.length ? centerY / points.length : height / 2;
    
    let radius = min(width, height) * 0.28;
    points = [];
    for (let i = 0; i < currentText.length; i++) {
        let angle = map(i, 0, currentText.length, 0, TWO_PI);
        let x = centerX + cos(angle) * radius;
        let y = centerY + sin(angle) * radius;
        points.push({ x: x, y: y });
    }
}

function mousePressed() {
    let closestDist = 30;
    grabbedPointIndex = null;
    for (let i = 0; i < points.length; i++) {
        let d = dist(mouseX, mouseY, points[i].x, points[i].y);
        if (d < closestDist) {
            closestDist = d;
            grabbedPointIndex = i;
        }
    }
}

function mouseReleased() {
    grabbedPointIndex = null;
}

function exportPoster() {
    let name = textInput.value.trim().toLowerCase().replace(/\s+/g, '-');
    if (!name) name = 'afiche-isla';
    saveCanvas(name, 'png');
}

function initWindowDragging(windowElement) {
    const handle = windowElement.querySelector('.window-handle');
    if (!handle) return;

    let posX = 0, posY = 0, mouseX = 0, mouseY = 0;

    handle.addEventListener('mousedown', dragMouseDown);

    function dragMouseDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'LABEL') {
            return;
        }
        e.preventDefault();
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.addEventListener('mouseup', closeDragElement);
        document.addEventListener('mousemove', elementDrag);
    }

    function elementDrag(e) {
        e.preventDefault();
        posX = mouseX - e.clientX;
        posY = mouseY - e.clientY;
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        windowElement.style.top = (windowElement.offsetTop - posY) + "px";
        windowElement.style.left = (windowElement.offsetLeft - posX) + "px";
    }

    function closeDragElement() {
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('mousemove', elementDrag);
    }
}