import { controlBrightness, restoreBrightness } from './modules/brightness.js';
import { requestCameraPermission, captureAndSave } from './modules/camera.js';
import { initDragAndDrop } from './modules/dragDrop.js';
import { showToast } from './modules/ui.js';

const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const cameraScreen = document.getElementById('camera-screen');
const cameraFeed = document.getElementById('camera-feed');
const overlay = document.getElementById('overlay');
const targetContainer = document.getElementById('target-container');

const COLORS = ['white', 'red', 'yellow', 'blue', 'green'];
const INTERVAL = 500;

// Initialize Drag & Drop
initDragAndDrop(targetContainer);

startBtn.addEventListener('click', async () => {
    const customSequence = Array.from(targetContainer.children).map(item => item.dataset.color);

    if (customSequence.length === 0) {
        showToast("Sequence is empty!");
        return;
    }

    try {
        console.log("Requesting camera access...");
        await requestCameraPermission();

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log("Camera access granted");

        cameraFeed.srcObject = stream;
        startScreen.classList.add('hidden');
        cameraScreen.classList.remove('hidden');

        if (customSequence.length > 0) {
            overlay.classList.remove(...COLORS);
            overlay.classList.add(customSequence[0]);
        }

        cameraFeed.onloadedmetadata = () => {
            cameraFeed.play();
            setTimeout(() => startSequence(customSequence), 1000);
        };
    } catch (err) {
        console.error("Error accessing camera:", err);
        alert(`Camera Error: ${err.name} - ${err.message}\n\nPlease check permissions in Settings.`);
    }
});

async function startSequence(sequence) {
    const currentSequence = sequence || COLORS;
    const sessionId = new Date().toISOString().replace(/[:.]/g, '-');

    await controlBrightness();

    for (const color of currentSequence) {
        overlay.classList.remove(...COLORS);
        overlay.classList.add(color);

        await new Promise(resolve => setTimeout(resolve, INTERVAL));

        try {
            await captureAndSave(cameraFeed, color, sessionId);
        } catch (err) {
            console.error(`Failed to capture ${color}:`, err);
        }
    }

    await finishSequence();
}

async function finishSequence() {
    await restoreBrightness();

    const stream = cameraFeed.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        cameraFeed.srcObject = null;
    }

    cameraScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');

    showToast("Sequence Complete!");
}
