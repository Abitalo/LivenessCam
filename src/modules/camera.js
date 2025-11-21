import { Filesystem, Directory } from '@capacitor/filesystem';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

const isMobile = Capacitor.isNativePlatform();

export async function requestCameraPermission() {
    if (isMobile) {
        const permissions = await Camera.requestPermissions();
        if (permissions.camera !== 'granted' && permissions.camera !== 'limited') {
            throw new Error('Camera permission denied');
        }
    }
}

export async function captureAndSave(cameraFeed, color, sessionId) {
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
