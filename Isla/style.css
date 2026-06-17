:root {
    --bg-main: #f1f3f7;
    --panel-bg: rgba(255, 255, 255, 0.95);
    --border-color: #e2e8f0;
    --text-dark: #0f172a;
    --text-muted: #64748b;
    --input-bg: #ffffff;
    --knob-bg: #ecf0f5;
}

body.dark-mode {
    --bg-main: #0f172a;
    --panel-bg: rgba(30, 41, 59, 0.95);
    --border-color: #334155;
    --text-dark: #f8fafc;
    --text-muted: #94a3b8;
    --input-bg: #1e293b;
    --knob-bg: #334155;
}

body {
    margin: 0;
    padding: 0;
    background-color: var(--bg-main);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    min-height: 100vh;
    position: relative;
    transition: background-color 0.3s ease;
}

.draggable-window {
    position: absolute;
    z-index: 10;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
    background: var(--panel-bg);
    border: 1px solid var(--border-color);
    transition: top 0.35s cubic-bezier(0.4, 0, 0.2, 1), left 0.35s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, border-color 0.3s ease;
    touch-action: none; /* NUEVO: Evita comportamientos nativos de scroll al arrastrar ventanas en celular */
}

#controls-panel {
    top: 24px;
    left: 24px;
    padding: 24px;
    border-radius: 20px;
    width: 95%;
    max-width: 920px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    box-sizing: border-box;
}

#canvas-window {
    top: 415px;
    left: 24px;
    border-radius: 20px;
    overflow: hidden;
    display: inline-block;
}

.window-handle {
    cursor: grab;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
}

.window-handle:active {
    cursor: grabbing;
}

.panel-header {
    padding-bottom: 4px;
    width: 100%;
}

.header-main-info {
    flex: 1;
}

.panel-header h1 {
    font-size: 24px;
    font-weight: 800;
    color: var(--text-dark);
    margin: 0 0 4px 0;
}

.panel-header p {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0 0 8px 0;
}

.dark-mode-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-dark);
    font-size: 14px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 2px 5px rgba(0,0,0,0.03);
    margin-left: 15px;
}

.dark-mode-btn:hover {
    background: var(--input-bg);
    transform: scale(1.05);
}

.canvas-window-header {
    background-color: var(--input-bg);
    border-bottom: 1px solid var(--border-color);
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.center-sort-controls {
    display: flex;
    gap: 8px;
}

.window-sort-btn {
    background: var(--panel-bg);
    border: 1px solid var(--border-color);
    color: var(--text-dark);
    font-size: 13px;
    font-weight: 800;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    padding: 0;
}

.window-sort-btn:hover:not(:disabled) {
    background: var(--input-bg);
    border-color: var(--text-muted);
}

.window-sort-btn:disabled {
    color: var(--border-color);
    background: var(--input-bg);
    cursor: not-allowed;
}

.main-layout {
    display: flex;
    gap: 35px;
    width: 100%;
    align-items: flex-start;
}

.left-column {
    flex: 1.1;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.right-column {
    flex: 1.3;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.dimensions-row {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    width: 100%;
}

.dimensions-row #ratio-selector-group {
    flex: 1;
}

.dimensions-row #ratio-selector-group select {
    width: 100%;
}

#custom-dimensions {
    display: flex;
    gap: 8px;
    align-items: flex-end;
}

.numerical-input {
    max-width: 75px;
}

.files-row {
    display: flex;
    gap: 15px;
    width: 100%;
}

.full-width-button {
    flex: 1;
}

.sliders-and-knob {
    display: flex;
    gap: 25px;
    align-items: center;
    width: 100%;
}

.sliders-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
}

.toggle-container-row {
    display: flex;
    gap: 10px;
    width: 100%;
}

.toggle-button {
    background-color: var(--input-bg);
    border: 1px solid var(--border-color);
    color: var(--text-dark);
    font-weight: 600;
    font-size: 12px;
    height: 36px;
    padding: 0 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    text-align: center;
}

.toggle-button:hover {
    background-color: var(--border-color);
}

.toggle-button.active {
    background-color: var(--text-dark);
    color: var(--input-bg);
    border-color: var(--text-dark);
}

.mini-variant {
    max-width: 90px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.footer-left-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 20px;
    margin-top: 4px;
}

.geometry-advanced-row {
    display: flex;
    flex: 1;
    justify-content: flex-end;
}

.radio-button-group {
    display: flex;
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 2px;
    width: 100%;
    max-width: 180px;
}

.radio-tab-btn {
    flex: 1;
    height: 30px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.15s ease;
}

.radio-tab-btn.active {
    background: var(--panel-bg);
    color: var(--text-dark);
    box-shadow: 0 2px 5px rgba(15,23,42,0.06);
}

.knob-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.knob-container label {
    font-size: 10px;
}

.knob {
    width: 84px;
    height: 84px;
    background-color: var(--knob-bg);
    border: 2px solid var(--border-color);
    border-radius: 50%;
    position: relative;
    cursor: grab;
    user-select: none;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
    display: flex;
    align-items: center;
    justify-content: center;
}

.knob:active {
    cursor: grabbing;
    border-color: var(--text-muted);
}

.knob-indicator {
    width: 12px;
    height: 12px;
    background-color: var(--text-muted);
    border-radius: 50%;
    position: absolute;
    top: 10px;
    left: calc(50% - 6px);
    transform-origin: center 32px; 
    pointer-events: none;
}

.knob-center-play {
    width: 36px;
    height: 36px;
    background-color: var(--panel-bg);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    color: var(--text-dark);
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    z-index: 5;
    padding: 0;
    transition: all 0.15s ease;
}

.knob-center-play:hover {
    background-color: var(--input-bg);
    transform: scale(1.05);
}

.knob-center-play.playing {
    background-color: var(--text-dark);
    color: var(--input-bg);
    border-color: var(--text-dark);
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.shrink-fit {
    min-width: 135px;
    max-width: 145px;
}

label {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-dark);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

input[type="text"], input[type="number"], select, input[type="range"] {
    box-sizing: border-box;
    outline: none;
    width: 100%;
}

input[type="text"], input[type="number"], select {
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dark);
    background: var(--input-bg);
    height: 40px;
}

select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 14px;
    padding-right: 32px;
}

.hidden-inputs {
    display: none !important;
}

.file-upload-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--input-bg);
    border: 1px solid var(--border-color);
    color: var(--text-dark);
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    height: 40px;
    box-sizing: border-box;
    text-align: center;
    width: 100%;
}

.file-upload-btn:hover {
    background-color: var(--border-color);
}

.color-pickers {
    display: flex;
    gap: 16px;
    align-items: center;
}

.color-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}

.color-item label {
    font-size: 9px;
}

.custom-color-picker {
    position: relative;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid var(--panel-bg);
    box-shadow: 0 0 0 1px var(--border-color);
    overflow: hidden;
}

.custom-color-picker input[type="color"] {
    position: absolute;
    top: -10px;
    left: -10px;
    width: 60px;
    height: 60px;
    border: none;
    opacity: 0;
    cursor: pointer;
}

.color-preview {
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.actions-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    margin-top: auto;
    width: 100%;
}

.buttons-group {
    display: flex;
    gap: 10px;
    width: 100%;
    justify-content: flex-end;
}

button {
    background-color: var(--text-dark);
    color: var(--panel-bg);
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    height: 40px;
}

button:hover {
    filter: brightness(0.9);
}

.icon-btn {
    font-size: 18px;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

#export-btn {
    color: white !important;
}

#export-btn:hover {
    background-color: #1d4ed8 !important;
}

.info-text {
    font-size: 11px;
    font-weight: 700;
    color: #2563eb;
}

#canvas-container {
    background: transparent;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
}

.row {
    display: flex;
    gap: 20px;
    align-items: flex-end;
    justify-content: space-between;
}
