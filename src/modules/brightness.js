import { ScreenBrightness } from '@capacitor-community/screen-brightness';
import { Capacitor } from '@capacitor/core';

const isMobile = Capacitor.isNativePlatform();
let originalBrightness = 0.5;

export async function controlBrightness() {
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
            // Create a helper for timeout
            const createTimeout = () => {
                const p = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000));
                p.catch(() => { }); // Prevent unhandled rejection
                return p;
            };

            try {
                originalBrightness = await Promise.race([window.electronAPI.getBrightness(), createTimeout()]);
            } catch (e) {
                console.warn("Could not get original brightness:", e);
                originalBrightness = 0.5;
            }

            try {
                await Promise.race([window.electronAPI.setBrightness(1.0), createTimeout()]);
            } catch (e) {
                console.warn("Could not set brightness:", e);
            }
        }
    } catch (err) {
        console.warn("Brightness operation timed out or failed:", err);
    }
}

export async function restoreBrightness() {
    try {
        if (isMobile) {
            const target = originalBrightness > 0 ? originalBrightness : 0.5;
            await ScreenBrightness.setBrightness({ brightness: target });
        } else {
            // Create a helper for timeout
            const createTimeout = () => {
                const p = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000));
                p.catch(() => { }); // Prevent unhandled rejection
                return p;
            };

            try {
                await Promise.race([window.electronAPI.setBrightness(originalBrightness), createTimeout()]);
            } catch (e) {
                console.warn("Failed to restore brightness:", e);
            }
        }
    } catch (err) {
        console.warn("Failed to restore brightness:", err);
    }
}
