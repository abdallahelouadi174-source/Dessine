const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("colorPicker");
const colorValue = document.getElementById("colorValue");

const brushSize = document.getElementById("brushSize");
const sizeValue = document.getElementById("sizeValue");

const brushButton = document.getElementById("brushButton");
const eraserButton = document.getElementById("eraserButton");

const clearButton = document.getElementById("clearButton");
const downloadButton = document.getElementById("downloadButton");

const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");

const statusText = document.getElementById("status");

const presetButtons =
    document.querySelectorAll("[data-size]");


let drawing = false;
let currentTool = "brush";

let history = [];
let historyIndex = -1;


/* =========================
   CONFIGURATION DU CANVAS
========================= */

function setupCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    const ratio =
        window.devicePixelRatio || 1;

    canvas.width =
        rect.width * ratio;

    canvas.height =
        rect.height * ratio;

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    saveState();
}


setupCanvas();


/* =========================
   POSITION DU CURSEUR
========================= */

function getPosition(event) {

    const rect =
        canvas.getBoundingClientRect();

    let clientX;
    let clientY;

    if (
        event.touches &&
        event.touches.length > 0
    ) {

        clientX =
            event.touches[0].clientX;

        clientY =
            event.touches[0].clientY;

    } else {

        clientX =
            event.clientX;

        clientY =
            event.clientY;
    }

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}


/* =========================
   COMMENCER À DESSINER
========================= */

function startDrawing(event) {

    event.preventDefault();

    drawing = true;

    const position =
        getPosition(event);

    ctx.beginPath();

    ctx.moveTo(
        position.x,
        position.y
    );

    draw(event);
}


/* =========================
   DESSINER
========================= */

function draw(event) {

    if (!drawing) {
        return;
    }

    event.preventDefault();

    const position =
        getPosition(event);

    ctx.lineWidth =
        Number(brushSize.value);

    if (currentTool === "eraser") {

        ctx.globalCompositeOperation =
            "destination-out";

    } else {

        ctx.globalCompositeOperation =
            "source-over";

        ctx.strokeStyle =
            colorPicker.value;
    }

    ctx.lineTo(
        position.x,
        position.y
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        position.x,
        position.y
    );

    statusText.textContent =
        "Dessin en cours…";
}


/* =========================
   ARRÊTER DE DESSINER
========================= */

function stopDrawing() {

    if (!drawing) {
        return;
    }

    drawing = false;

    ctx.closePath();

    ctx.globalCompositeOperation =
        "source-over";

    saveState();

    statusText.textContent =
        "Modification enregistrée";
}


/* =========================
   HISTORIQUE
========================= */

function saveState() {

    const image =
        canvas.toDataURL("image/png");

    history =
        history.slice(
            0,
            historyIndex + 1
        );

    history.push(image);

    historyIndex =
        history.length - 1;

    updateHistoryButtons();
}


function restoreState(imageData) {

    const image =
        new Image();

    image.onload = () => {

        const rect =
            canvas.getBoundingClientRect();

        ctx.clearRect(
            0,
            0,
            rect.width,
            rect.height
        );

        ctx.globalCompositeOperation =
            "source-over";

        ctx.drawImage(
            image,
            0,
            0,
            rect.width,
            rect.height
        );
    };

    image.src = imageData;
}


function updateHistoryButtons() {

    undoButton.disabled =
        historyIndex <= 0;

    redoButton.disabled =
        historyIndex >= history.length - 1;

    undoButton.style.opacity =
        undoButton.disabled
            ? "0.4"
            : "1";

    redoButton.style.opacity =
        redoButton.disabled
            ? "0.4"
            : "1";
}


/* =========================
   SOURIS
========================= */

canvas.addEventListener(
    "mousedown",
    startDrawing
);

canvas.addEventListener(
    "mousemove",
    draw
);

canvas.addEventListener(
    "mouseup",
    stopDrawing
);

canvas.addEventListener(
    "mouseleave",
    stopDrawing
);


/* =========================
   TACTILE / IPAD
========================= */

canvas.addEventListener(
    "touchstart",
    startDrawing,
    { passive: false }
);

canvas.addEventListener(
    "touchmove",
    draw,
    { passive: false }
);

canvas.addEventListener(
    "touchend",
    stopDrawing
);


/* =========================
   PINCEAU
========================= */

brushButton.addEventListener(
    "click",
    () => {

        currentTool = "brush";

        brushButton.classList.add("active");

        eraserButton.classList.remove("active");

        statusText.textContent =
            "Pinceau sélectionné";
    }
);


/* =========================
   GOMME
========================= */

eraserButton.addEventListener(
    "click",
    () => {

        currentTool = "eraser";

        eraserButton.classList.add("active");

        brushButton.classList.remove("active");

        statusText.textContent =
            "Gomme sélectionnée";
    }
);


/* =========================
   COULEUR
========================= */

colorPicker.addEventListener(
    "input",
    () => {

        colorValue.textContent =
            colorPicker.value.toUpperCase();

        statusText.textContent =
            "Couleur modifiée";
    }
);


/* =========================
   TAILLE DU PINCEAU
========================= */

brushSize.addEventListener(
    "input",
    () => {

        sizeValue.textContent =
            brushSize.value;
    }
);


/* =========================
   TAILLES RAPIDES
========================= */

presetButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const size =
                    button.dataset.size;

                brushSize.value =
                    size;

                sizeValue.textContent =
                    size;

                statusText.textContent =
                    "Taille modifiée";
            }
        );
    }
);


/* =========================
   EFFACER LA TOILE
========================= */

clearButton.addEventListener(
    "click",
    () => {

        const confirmation =
            confirm(
                "Voulez-vous vraiment effacer toute la toile ?"
            );

        if (!confirmation) {
            return;
        }

        const rect =
            canvas.getBoundingClientRect();

        ctx.clearRect(
            0,
            0,
            rect.width,
            rect.height
        );

        ctx.globalCompositeOperation =
            "source-over";

        saveState();

        statusText.textContent =
            "Toile effacée";
    }
);


/* =========================
   ANNULER
========================= */

undoButton.addEventListener(
    "click",
    () => {

        if (historyIndex <= 0) {
            return;
        }

        historyIndex--;

        restoreState(
            history[historyIndex]
        );

        statusText.textContent =
            "Action annulée";

        updateHistoryButtons();
    }
);


/* =========================
   RÉTABLIR
========================= */

redoButton.addEventListener(
    "click",
    () => {

        if (
            historyIndex >=
            history.length - 1
        ) {
            return;
        }

        historyIndex++;

        restoreState(
            history[historyIndex]
        );

        statusText.textContent =
            "Action rétablie";

        updateHistoryButtons();
    }
);


/* =========================
   TÉLÉCHARGER
========================= */

downloadButton.addEventListener(
    "click",
    () => {

        const link =
            document.createElement("a");

        link.download =
            "mon-dessin.png";

        link.href =
            canvas.toDataURL("image/png");

        link.click();

        statusText.textContent =
            "Dessin téléchargé";
    }
);
