let points = [];
let grabbedPointIndex = null;
let textString = "";
let bgImg = null;
let customFont = null;
let lastPointsCount = 0;

let isDraggingKnob = false;
let knobAngle = 0; 

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

function setup() {
    let canvas = createCanvas(600, 600);
    canvas.parent('canvas-container');
    
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

    rotateKnob.addEventListener('mousedown', (e) => { isDraggingKnob = true; handleKnobRotation(e); });
    window.addEventListener('mousemove', (e) => { if (isDraggingKnob) handleKnobRotation(e); });
    window.addEventListener('mouseup', () => isDraggingKnob = false);

    textAlign(CENTER, CENTER);
    updateSelectedFont();
    textStyle(BOLD);

    initializeIsland();
    
    initWindowDragging(document.getElementById('controls-panel'));
    initWindowDragging(document.getElementById('canvas-window'));
}

function draw() {
    background(canvasBgColorInput.value);
    
    if (bgImg) {
        push();
        imageMode(CENTER);
        translate(width / 2 + parseInt(imgX.value), height / 2 + parseInt(imgY.value));
        let zoomFactor = map(imgZoom.value, 10, 300, 0.1, 3.0);
        image(bgImg, 0, 0, bgImg.width * zoomFactor, bgImg.height * zoomFactor);
        pop();
    }
    
    textString = textInput.value.replace(/\s/g, '');
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
        let steps = 3; 
        let falloffs = [0.5, 0.25, 0.1];

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

    fill(bgColorInput.value);
    let strokeVal = parseInt(strokeSlider.value);
    if (strokeVal > 0) {
        stroke(textColorInput.value);
        strokeWeight(strokeVal);
    } else {
        noStroke();
    }

    beginShape();
    for (let p of points) {
        vertex(p.x, p.y);
    }
    endShape(CLOSE);

    noStroke(); 
    fill(textColorInput.value);
    textSize(parseInt(sizeSlider.value));
    
    let shift = floor(map(knobAngle, 0, 2 * Math.PI, 0, numPoints));

    for (let i = 0; i < points.length; i++) {
        let p = points[i];
        let letterIndex = (i - shift + numPoints) % numPoints;
        let letter = textString[letterIndex] || '';
        text(letter, p.x, p.y);
    }
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

function handleFontUpload(e) {
    let file = e.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(event) {
            customFont = loadFont(event.target.result, () => {
                updateSelectedFont();
                fontButtonLabel.innerText = file.name.substring(0, 12) + "...";
            });
        }
        reader.readAsDataURL(file);
    }
}

function updateSelectedFont() {
    if (customFont) {
        textFont(customFont);
    } else {
        textFont('sans-serif');
    }
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
            });
        }
        reader.readAsDataURL(file);
    }
}

function removeBackgroundImage() {
    bgImg = null;
    bgImageInput.value = "";
    imageAdjustRow.classList.add('hidden-inputs');
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
    initializeIsland();
}

function initializeIsland() {
    points = [];
    textString = textInput.value.replace(/\s/g, '');
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
    
    bgColorInput.value = "#5a636a";
    textColorInput.value = "#111111";
    canvasBgColorInput.value = "#ffffff";
    
    bgColorPreview.style.backgroundColor = "#5a636a";
    textColorPreview.style.backgroundColor = "#111111";
    canvasBgPreview.style.backgroundColor = "#ffffff";
    
    customFont = null;
    fontInput.value = "";
    fontButtonLabel.innerText = "Cargar Fuente";
    updateSelectedFont();
    
    removeBackgroundImage();
    initializeIsland();
}

function adjustPointsCount() {
    let currentText = textInput.value.replace(/\s/g, '');
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