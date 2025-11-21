// Platform Detection
const isMobile = window.Capacitor !== undefined;
const { Filesystem, Directory } = isMobile ? require('@capacitor/filesystem') : {};
const { ScreenBrightness } = isMobile ? require('@capacitor-community/screen-brightness') : {};

// Electron API Setup (Only if not mobile)
if (!isMobile) {
    const { ipcRenderer } = require('electron');
    window.electronAPI = {
        saveImage: (dataUrl, color, sessionId) => ipcRenderer.invoke('save-image', dataUrl, color, sessionId),
        getBrightness: () => ipcRenderer.invoke('get-brightness'),
        setBrightness: (value) => ipcRenderer.invoke('set-brightness', value),
    };
}

const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const cameraScreen = document.getElementById('camera-screen');
const cameraFeed = document.getElementById('camera-feed');
const overlay = document.getElementById('overlay');
const canvas = document.getElementById('capture-canvas'); // Note: this element might not exist in HTML, we create one dynamically in captureAndSave, but keeping ref if needed.
const toast = document.getElementById('toast-message');

const COLORS = ['white', 'red', 'yellow', 'blue', 'green'];
const INTERVAL = 500; // 0.5 seconds

let originalBrightness = 0.5;

// Drag & Drop Logic
const targetContainer = document.getElementById('target-container');
let draggedItem = null;

document.querySelectorAll('.color-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => item.style.opacity = '0.5', 0);
    });

    item.addEventListener('dragend', () => {
        draggedItem = null;
        item.style.opacity = '1';
    });
});

// Only need target container logic now since everything starts there
targetContainer.addEventListener('dragover', (e) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'move';

    // Calculate insertion position
    const afterElement = getDragAfterElement(targetContainer, e.clientX);
    if (draggedItem) {
        if (afterElement == null) {
            targetContainer.appendChild(draggedItem);
        } else {
            targetContainer.insertBefore(draggedItem, afterElement);
        }
    }
});

targetContainer.addEventListener('drop', (e) => {
    e.preventDefault();
});

// Helper to find the element after the cursor
function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.color-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}


startBtn.addEventListener('click', async () => {
    // Read custom sequence
    const customSequence = Array.from(targetContainer.children).map(item => item.dataset.color);

    if (customSequence.length === 0) {
        alert("Sequence is empty!");
        return;
    }

    // 1. Start Camera immediately
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraFeed.srcObject = stream;

        startScreen.classList.add('hidden');
        cameraScreen.classList.remove('hidden');

        // FIX: Set initial color immediately to prevent white flash
        if (customSequence.length > 0) {
            overlay.classList.remove(...COLORS);
            overlay.classList.add(customSequence[0]);
        }

        // Wait for video to be ready to play
        cameraFeed.onloadedmetadata = () => {
            cameraFeed.play();
            // Give it a moment to stabilize then start sequence
            setTimeout(() => startSequence(customSequence), 1000);
        };
    } catch (err) {
        console.error("Error accessing camera:", err);
        alert(`Could not access camera: ${err.message}. Please ensure you have a camera connected and have granted permissions.`);
    }
});

async function startSequence(sequence) {
    const currentSequence = sequence || COLORS;
    const sessionId = new Date().toISOString().replace(/[:.]/g, '-');

    // Increase Brightness
    await controlBrightness();

    for (const color of currentSequence) {
        // 1. Set color
        overlay.classList.remove(...COLORS);
        overlay.classList.add(color);

        // 2. Wait
        await new Promise(resolve => setTimeout(resolve, INTERVAL));

        // 3. Capture
        try {
            await captureAndSave(color, sessionId); // Added await
        } catch (err) {
            console.error(`Failed to capture ${color}:`, err);
        }
    }

    // Finish sequence
    await finishSequence();
}

async function controlBrightness() {
    try {
        if (isMobile) {
            try {
                originalBrightness = await ScreenBrightness.getBrightness();
                await ScreenBrightness.setBrightness({ brightness: 1.0 });
            } catch (e) {
                console.warn("Mobile brightness failed:", e);
            }
        } else {
            // Electron Brightness
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000));
            try {
                originalBrightness = await Promise.race([window.electronAPI.getBrightness(), timeout]);
            } catch (e) {
                console.warn("Could not get original brightness:", e);
                originalBrightness = 0.5;
            }
            await Promise.race([window.electronAPI.setBrightness(1.0), timeout]);
        }
    } catch (err) {
        console.warn("Brightness operation timed out or failed:", err);
    }
}

async function restoreBrightness() {
    try {
        if (isMobile) {
            const target = originalBrightness > 0 ? originalBrightness : 0.5;
            await ScreenBrightness.setBrightness({ brightness: target });
        } else {
            await window.electronAPI.setBrightness(originalBrightness);
        }
    } catch (err) {
        console.warn("Failed to restore brightness:", err);
    }
}

async function captureAndSave(color, sessionId) {
    // 1. Capture Frame
    const canvas = document.createElement('canvas');
    canvas.width = cameraFeed.videoWidth;
    canvas.height = cameraFeed.videoHeight;
    const ctx = canvas.getContext('2d');

    // Mirror flip
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');

    // 2. Save
    if (isMobile) {
        try {
            const fileName = `photo_${new Date().toISOString().replace(/[:.]/g, '-')}_${color}.png`;
            const path = `LivenessCam/${sessionId}/${fileName}`;
            await Filesystem.writeFile({
                path: path,
                data: dataUrl.split(',')[1],
                directory: Directory.Documents,
                recursive: true
            });
            console.log(`Saved to Documents/${path}`);
        } catch (e) {
            console.error("Mobile save failed:", e);
        }
    } else {
        const result = await window.electronAPI.saveImage(dataUrl, color, sessionId);
        console.log("Saved:", result);
    }
}

async function finishSequence() {
    // Restore Brightness
    await restoreBrightness();

    // Stop camera stream
    const stream = cameraFeed.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        cameraFeed.srcObject = null;
    }

    // Hide Camera, Show Start
    cameraScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');

    // Show Toast
    showToast("Sequence Complete!");
}

function showToast(message) {
    const toast = document.getElementById('toast-message');
    toast.textContent = message;
    toast.classList.remove('hidden');
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
