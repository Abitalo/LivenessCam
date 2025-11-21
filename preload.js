const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script executing...');
ipcRenderer.send('log-message', 'Preload script running');

contextBridge.exposeInMainWorld('electronAPI', {
  saveImage: (dataUrl, color, sessionId) => ipcRenderer.invoke('save-image', dataUrl, color, sessionId),
  getBrightness: () => ipcRenderer.invoke('get-brightness'),
  setBrightness: (value) => ipcRenderer.invoke('set-brightness', value),
  log: (message) => ipcRenderer.send('log-message', message),
});
