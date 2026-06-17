let points = [];
let grabbedPointIndex = null;
let textString = "";
let bgImg = null;
let customFont = null;
let lastPointsCount = 0;

// Variables para animación de Tren y Perilla de Rotación
let textShift = 0; 
let isAnimating = false; 
let isDraggingKnob = false;
let currentRotationAngle = 0; 

// Array dinámico para guardar las posiciones espaciales calculadas de cada letra
let computedLetterPositions = [];

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
const fontInput = document.getElementById('font-input');
const fontButtonLabel = document.getElementById('font-button-label');

const groupWordsBtn = document.getElementById('group-words-btn');
const clipTextBtn = document.getElementById('clip-text-btn');
const contourCurveBtn = document.getElementById('contour-curve-btn');
const contourSharpBtn = document.getElementById('contour-sharp-btn');

const rotationKnob = document.getElementById('rotation-knob');
const knobIndicator = document.getElementById('knob-indicator');
const playTrainBtn = document.getElementById('play-train-btn');
const darkModeToggle = document.getElementById('dark-mode-toggle');

const moveCanvasUpBtn = document.getElementById('move-canvas-up-btn');
const moveCanvasDownBtn = document.getElementById('move-canvas-down-btn');

const windows = document.querySelectorAll('.draggable-window');
let activeDraggedWindow = null;
let winOffsetX = 0;
let winOffsetY = 0;

let isGroupedMode = false;
let isClippedMode = false;
let geometryMode = "curve"; 

let maskBuffer;

function setup() {
    let container = document.getElementById('canvas-container');
    let canvas = createCanvas(600, 600);
    canvas.parent(container);
    
    maskBuffer = createGraphics(width, height);
    
    initializeIsland();
    setupColorPickers();
    setupDimensionsLogic();
    setupWindowDragging();
    setupKnobInteractions();
    setupPlayButton();
    setupDarkModeLogic();
    
    textInput.addEventListener('input', () => {
        adjustPointsCount();
    });
    
    groupWordsBtn.addEventListener('click', () => {
        isGroupedMode = !isGroupedMode;
        groupWordsBtn.classList.toggle('active', isGroupedMode);
    });

    clipTextBtn.addEventListener('click', () => {
        isClippedMode = !isClippedMode;
        clipTextBtn.classList.toggle('active', isClippedMode);
    });

    contourCurveBtn.addEventListener('click', () => {
        geometryMode = "curve";
        contourCurveBtn.classList.add('active');
        contourSharpBtn.classList.remove('active');
    });

    contourSharpBtn.addEventListener('click', () => {
        geometryMode = "sharp";
        contourSharpBtn.classList.add('active');
        contourCurveBtn.classList.remove('active');
    });
    
    bgImageInput.addEventListener('change', handleBgImage);
    fontInput.addEventListener('change', handleFontUpload);
    resetBtn.addEventListener('click', resetToDefaults);
    exportBtn.addEventListener('click', exportCanvasImage);

    moveCanvasUpBtn.addEventListener('click', () => { if(currentWindowsLayout === "normal") animateLayoutSwap(); });
    moveCanvasDownBtn.addEventListener('click', () => { if(currentWindowsLayout === "swapped") animateLayoutSwap(); });

    updateWindowsPositions();
}

function draw() {
    background(color(canvasBgColorInput.value));
    
    if (isAnimating) {
        textShift += 0.003; 
        if (textShift > 1) textShift -= 1;
        currentRotationAngle = textShift * TWO_PI;
        knobIndicator.style.transform = `rotate(${degrees(currentRotationAngle)}deg)`;
    }
    
    if (bgImg) {
        push();
        let z = document.getElementById('img-zoom') ? parseFloat(document.getElementById('img-zoom').value)/100 : 1;
        let ox = document.getElementById('img-x') ? parseFloat(document.getElementById('img-x').value) : 0;
        let oy = document.getElementById('img-y') ? parseFloat(document.getElementById('img-y').value) : 0;
        translate(width/2 + ox, height/2 + oy);
        scale(z);
        imageMode(CENTER);
        image(bgImg, 0, 0);
        pop();
    }
    
    if (isGroupedMode) {
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

    // ACTUALIZACIÓN DE ARRASTRE ADAPTATIVO MOUSE + TOUCH
    if (grabbedPointIndex !== null) {
        // Lee mouseX/mouseY por defecto, pero si es táctil mapea la coordenada touchX/touchY de p5
        let targetX = (touches.length > 0) ? touches[0].x : mouseX;
        let targetY = (touches.length > 0) ? touches[0].y : mouseY;
        
        let deltaX = targetX - points[grabbedPointIndex].x;
        let deltaY = targetY - points[grabbedPointIndex].y;
        
        points[grabbedPointIndex].x = targetX;
        points[grabbedPointIndex].y = targetY;
        
        let total = points.length;
        let steps = isGroupedMode ? 5 : 3; 
        let falloffs = isGroupedMode ? [0.65, 0.45, 0.3, 0.18, 0.08] : [0.35, 0.18, 0.05]; 

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

    let strokeVal = parseInt(strokeSlider.value);

    if (isClippedMode) {
        maskBuffer.clear();
        maskBuffer.push();
        maskBuffer.fill(color(bgColorInput.value));
        if (strokeVal > 0) {
            maskBuffer.stroke(color(textColorInput.value));
            maskBuffer.strokeWeight(strokeVal);
        } else {
            maskBuffer.noStroke();
        }

        if (geometryMode === "curve") {
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

        maskBuffer.blendMode(REMOVE);
        maskBuffer.noStroke();
        maskBuffer.fill(0, 0, 0, 255);
        maskBuffer.textSize(parseInt(sizeSlider.value));
        maskBuffer.textAlign(CENTER, CENTER);

        computeAndRenderText(maskBuffer, true);
        maskBuffer.pop();

        image(maskBuffer, 0, 0);

        if (strokeVal > 0) {
            push();
            noFill();
            stroke(color(textColorInput.value));
            strokeWeight(strokeVal);
            textSize(parseInt(sizeSlider.value));
            computeAndRenderText(this, false);
            pop();
        }

    } else {
        fill(color(bgColorInput.value));
        if (strokeVal > 0) {
            stroke(color(textColorInput.value));
            strokeWeight(strokeVal);
        } else {
            noStroke();
        }

        if (geometryMode === "curve") {
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
        fill(color(textColorInput.value));
        textSize(parseInt(sizeSlider.value));
        computeAndRenderText(this, false);
    }
}

function computeAndRenderText(targetContext, isMaskingPhase) {
    let wordsOrLetters = [];
    if (isGroupedMode) {
        wordsOrLetters = textInput.value.split(" ").filter(w => w.length > 0);
    } else {
        wordsOrLetters = textInput.value.split("");
    }
    
    if (wordsOrLetters.length === 0) return;
    
    let samples = [];
    let sampleCount = 400;
    
    if (geometryMode === "curve" && points.length >= 3) {
        for (let i = 0; i < sampleCount; i++) {
            let t = i / sampleCount;
            let virtualT = t * points.length;
            let idx = Math.floor(virtualT) % points.length;
            let localT = virtualT - Math.floor(virtualT);
            
            let p0 = points[(idx - 1 + points.length) % points.length];
            let p1 = points[idx];
            let p2 = points[(idx + 1) % points.length];
            let p3 = points[(idx + 2) % points.length];
            
            samples.push({
                x: curvePoint(p0.x, p1.x, p2.x, p3.x, localT),
                y: curvePoint(p0.y, p1.y, p2.y, p3.y, localT)
            });
        }
    } else {
        let totalLen = 0;
        let segments = [];
        for (let i = 0; i < points.length; i++) {
            let p1 = points[i];
            let p2 = points[(i + 1) % points.length];
            let d = dist(p1.x, p1.y, p2.x, p2.y);
            segments.push({ p1, p2, len: d, startLen: totalLen });
            totalLen += d;
        }
        for (let i = 0; i < sampleCount; i++) {
            let targetLen = (i / sampleCount) * totalLen;
            let seg = segments[segments.length - 1];
            for (let s of segments) {
                if (targetLen >= s.startLen && targetLen <= s.startLen + s.len) {
                    seg = s;
                    break;
                }
            }
            let ratio = seg.len > 0 ? (targetLen - seg.startLen) / seg.len : 0;
            samples.push({
                x: lerp(seg.p1.x, seg.p2.x, ratio),
                y: lerp(seg.p1.y, seg.p2.y, ratio)
            });
        }
    }

    if (!isMaskingPhase) {
        computedLetterPositions = []; 
    }

    if (customFont) targetContext.textFont(customFont);
    else targetContext.textFont('sans-serif');
    
    targetContext.textAlign(CENTER, CENTER);

    for (let i = 0; i < wordsOrLetters.length; i++) {
        let normIndex = i / wordsOrLetters.length;
        let targetT = normIndex + textShift; 
        if (targetT > 1) targetT -= 1;
        if (targetT < 0) targetT += 1;
        
        let sampleIdx = Math.floor(targetT * (samples.length - 1));
        let pt = samples[sampleIdx];
        
        let nextIdx = (sampleIdx + 4) % samples.length;
        let ptNext = samples[nextIdx];
        let angle = atan2(ptNext.y - pt.y, ptNext.x - pt.x);
        
        if (!isMaskingPhase) {
            computedLetterPositions.push({
                x: pt.x,
                y: pt.y,
                vertexReferenceIndex: Math.floor(map(i, 0, wordsOrLetters.length, 0, points.length)) % points.length
            });
        }

        targetContext.push();
        targetContext.translate(pt.x, pt.y);
        targetContext.rotate(angle);
        targetContext.text(wordsOrLetters[i], 0, 0);
        targetContext.pop();
    }
}

// LOGICA CORE DE SELECCIÓN COMPATIBLE MOUSE + CELULAR
function handleInteractionStart(inputX, inputY) {
    let closestDist = 35; 
    grabbedPointIndex = null;
    for (let i = 0; i < computedLetterPositions.length; i++) {
        let lPos = computedLetterPositions[i];
        let d = dist(inputX, inputY, lPos.x, lPos.y);
        if (d < closestDist) {
            closestDist = d;
            grabbedPointIndex = lPos.vertexReferenceIndex;
        }
    }
}

function mousePressed() {
    handleInteractionStart(mouseX, mouseY);
}

function mouseReleased() {
    grabbedPointIndex = null;
}

// NUEVOS: Oyentes táctiles nativos de p5.js para simular el comportamiento en teléfonos
function touchStarted() {
    if (touches.length > 0) {
        handleInteractionStart(touches[0].x, touches[0].y);
    }
    // Evita el colapso del scroll nativo del móvil al tocar el canvas
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        return false;
    }
}

function touchEnded() {
    grabbedPointIndex = null;
}

function setupDarkModeLogic() {
    darkModeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            darkModeToggle.innerText = "☀️";
        } else {
            darkModeToggle.innerText = "🌙";
        }
        setTimeout(updateWindowsPositions, 50);
    });
}

function setupPlayButton() {
    playTrainBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        isAnimating = !isAnimating;
        if (isAnimating) {
            playTrainBtn.innerText = "❚❚";
            playTrainBtn.classList.add('playing');
        } else {
            playTrainBtn.innerText = "▶";
            playTrainBtn.classList.remove('playing');
        }
    });
}

function setupKnobInteractions() {
    // Interacción híbrida para la perilla rotatoria
    rotationKnob.addEventListener('mousedown', startKnobDrag);
    rotationKnob.addEventListener('touchstart', (e) => {
        startKnobDrag(e.touches[0]);
    }, {passive: false});

    window.addEventListener('mousemove', (e) => { if (isDraggingKnob) updateKnobRotation(e); });
    window.addEventListener('touchmove', (e) => { 
        if (isDraggingKnob) {
            updateKnobRotation(e.touches[0]);
            e.preventDefault();
        }
    }, {passive: false});

    window.addEventListener('mouseup', () => isDraggingKnob = false);
    window.addEventListener('touchend', () => isDraggingKnob = false);
}

function startKnobDrag(e) {
    if (e.target === playTrainBtn) return;
    isDraggingKnob = true;
    isAnimating = false; 
    playTrainBtn.innerText = "▶";
    playTrainBtn.classList.remove('playing');
    updateKnobRotation(e);
}

function updateKnobRotation(e) {
    let rect = rotationKnob.getBoundingClientRect();
    let knobCenterX = rect.left + rect.width / 2;
    let knobCenterY = rect.top + rect.height / 2;
    
    let angle = atan2(e.clientY - knobCenterY, e.clientX - knobCenterX);
    let normalizedAngle = angle + HALF_PI; 
    if (normalizedAngle < 0) normalizedAngle += TWO_PI;
    
    currentRotationAngle = normalizedAngle;
    textShift = normalizedAngle / TWO_PI; 
    knobIndicator.style.transform = `rotate(${degrees(currentRotationAngle)}deg)`;
}

function initializeIsland() {
    points = [];
    let currentText = textInput.value.replace(/\s/g, '');
    let pointsCount = Math.max(currentText.length, 6);
    let centerX = width / 2;
    let centerY = height / 2;
    let radius = min(width, height) * 0.28;
    for (let i = 0; i < pointsCount; i++) {
        let angle = map(i, 0, pointsCount, 0, TWO_PI);
        let x = centerX + cos(angle) * radius;
        let y = centerY + sin(angle) * radius;
        points.push({ x: x, y: y });
    }
    lastPointsCount = pointsCount;
}

function adjustPointsCount() {
    if (isGroupedMode) return; 
    let currentText = textInput.value.replace(/\s/g, '');
    if(currentText.length < 3 || currentText.length === lastPointsCount) return;
    
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
    lastPointsCount = currentText.length;
}

function setupColorPickers() {
    bgColorInput.addEventListener('input', () => { bgColorPreview.style.backgroundColor = bgColorInput.value; });
    textColorInput.addEventListener('input', () => { textColorPreview.style.backgroundColor = textColorInput.value; });
    canvasBgColorInput.addEventListener('input', () => { canvasBgPreview.style.backgroundColor = canvasBgColorInput.value; });
}

function setupDimensionsLogic() {
    sizeModeSelect.addEventListener('change', () => {
        if (sizeModeSelect.value === 'ratio') {
            ratioSelectorGroup.classList.remove('hidden-inputs');
            customDimensionsDiv.classList.add('hidden-inputs');
            updateRatioDimensions();
        } else {
            ratioSelectorGroup.classList.add('hidden-inputs');
            customDimensionsDiv.classList.remove('hidden-inputs');
            resizeCanvas(parseInt(customWInput.value), parseInt(customHInput.value));
            maskBuffer = createGraphics(parseInt(customWInput.value), parseInt(customHInput.value));
        }
    });
    aspectRatioSelect.addEventListener('change', updateRatioDimensions);
    customWInput.addEventListener('input', () => { if(sizeModeSelect.value==='pixels') { resizeCanvas(parseInt(customWInput.value), parseInt(customHInput.value)); maskBuffer = createGraphics(width, height); } });
    customHInput.addEventListener('input', () => { if(sizeModeSelect.value==='pixels') { resizeCanvas(parseInt(customWInput.value), parseInt(customHInput.value)); maskBuffer = createGraphics(width, height); } });
}

function updateRatioDimensions() {
    let r = aspectRatioSelect.value;
    let w = 600, h = 600;
    if (r === '4:3') { w = 640; h = 480; }
    else if (r === '3:4') { w = 450; h = 600; }
    else if (r === '16:9') { w = 720; h = 405; }
    else if (r === '9:16') { w = 367; h = 650; }
    resizeCanvas(w, h);
    maskBuffer = createGraphics(w, h);
    updateBufferFont();
    infoText.innerText = `Tamaño: ${w}x${h} px`;
}

function handleBgImage(e) {
    let file = e.target.files[0];
    if (file) {
        let url = URL.createObjectURL(file);
        loadImage(url, img => {
            bgImg = img;
            document.getElementById('image-adjust-row').classList.remove('hidden-inputs');
        });
    }
}

function handleFontUpload(e) {
    let file = e.target.files[0];
    if (file) {
        fontButtonLabel.innerText = file.name.substring(0, 12) + "...";
        let reader = new FileReader();
        reader.onload = function(event) {
            customFont = loadFont(event.target.result, () => {
                updateBufferFont();
            });
        };
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

function resetToDefaults() {
    textInput.value = "Mocap Estudio";
    bgColorInput.value = "#5a636a";
    textColorInput.value = "#111111";
    canvasBgColorInput.value = "#ffffff";
    bgColorPreview.style.backgroundColor = "#5a636a";
    textColorPreview.style.backgroundColor = "#111111";
    canvasBgPreview.style.backgroundColor = "#ffffff";
    sizeSlider.value = 50;
    strokeSlider.value = 0;
    textShift = 0;
    currentRotationAngle = 0;
    isAnimating = false;
    playTrainBtn.innerText = "▶";
    playTrainBtn.classList.remove('playing');
    knobIndicator.style.transform = `rotate(0deg)`;
    customFont = null;
    fontButtonLabel.innerText = "Cargar Fuente";
    isGroupedMode = false;
    isClippedMode = false;
    geometryMode = "curve";
    groupWordsBtn.classList.remove('active');
    clipTextBtn.classList.remove('active');
    contourCurveBtn.classList.add('active');
    contourSharpBtn.classList.remove('active');
    document.body.classList.remove('dark-mode');
    darkModeToggle.innerText = "🌙";
    currentWindowsLayout = "normal";
    initializeIsland();
    setTimeout(updateWindowsPositions, 50);
}

function exportCanvasImage() {
    saveCanvas('mocap_isla_geografica', 'png');
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

// SISTEMA DE ARRASTRE FLUIDO DE VENTANAS COMPATIBLE MOUSE + TOUCH
function setupWindowDragging() {
    windows.forEach(win => {
        let handle = win.querySelector('.window-handle');
        if (!handle) return;
        
        const dragStart = (clientX, clientY, target) => {
            if(target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.classList.contains('window-sort-btn')) return;
            activeDraggedWindow = win;
            winOffsetX = clientX - win.offsetLeft;
            winOffsetY = clientY - win.offsetTop;
            win.style.transition = 'none';
        };

        handle.addEventListener('mousedown', (e) => dragStart(e.clientX, e.clientY, e.target));
        handle.addEventListener('touchstart', (e) => dragStart(e.touches[0].clientX, e.touches[0].clientY, e.target), {passive: true});
    });

    window.addEventListener('mousemove', (e) => {
        if (activeDraggedWindow) {
            activeDraggedWindow.style.left = (e.clientX - winOffsetX) + 'px';
            activeDraggedWindow.style.top = (e.clientY - winOffsetY) + 'px';
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (activeDraggedWindow) {
            activeDraggedWindow.style.left = (e.touches[0].clientX - winOffsetX) + 'px';
            activeDraggedWindow.style.top = (e.touches[0].clientY - winOffsetY) + 'px';
        }
    }, {passive: true});

    const dragEnd = () => {
        if (activeDraggedWindow) {
            activeDraggedWindow.style.transition = '';
            activeDraggedWindow = null;
        }
    };

    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('touchend', dragEnd);
}
