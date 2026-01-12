const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectDataFile: () => ipcRenderer.invoke('select-data-file'),
    getDataPath: () => ipcRenderer.invoke('get-data-path')
});
