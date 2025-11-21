const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const brightness = require('brightness');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true, // Auto fullscreen
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
    },
  });

  win.loadFile('www/index.html');
  // win.webContents.openDevTools(); // Optional: for debugging
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handler for saving images
ipcMain.handle('save-image', async (event, dataUrl, color, sessionId) => {
  try {
    const photosDir = path.join(__dirname, 'photos');
    if (!fs.existsSync(photosDir)) {
      fs.mkdirSync(photosDir);
    }

    const sessionDir = path.join(photosDir, sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir);
    }

    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `photo_${timestamp}_${color}.png`;
    const filePath = path.join(sessionDir, filename);

    fs.writeFileSync(filePath, base64Data, 'base64');
    console.log(`Saved ${filePath}`);
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Failed to save image:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-brightness', async () => {
  return await brightness.get();
});

ipcMain.handle('set-brightness', async (event, value) => {
  try {
    await brightness.set(value);
    const current = await brightness.get();
    console.log(`Set brightness to ${value}, read back: ${current}`);
    return current;
  } catch (err) {
    console.warn("Native brightness control failed, trying osascript fallback:", err);

    // Fallback: Use osascript to simulate brightness keys
    const { exec } = require('child_process');

    if (value > 0.8) {
      // Maximize: Press Brightness Up (key code 144) 20 times
      exec(`osascript -e 'repeat 20 times' -e 'tell application "System Events" to key code 144' -e 'end repeat'`);
      return 1.0;
    } else {
      // Restore/Lower: Assume we are at MAX (1.0) and want to go down.
      // Mac brightness has ~16 steps.
      const steps = Math.round((1.0 - value) * 16);
      if (steps > 0) {
        exec(`osascript -e 'repeat ${steps} times' -e 'tell application "System Events" to key code 145' -e 'end repeat'`);
      }
      return value;
    }
  }
});
