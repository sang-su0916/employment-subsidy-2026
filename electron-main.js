const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: '2026 고용지원금 최적화 시스템',
        icon: path.join(__dirname, 'icon.png')
    });

    win.loadFile('index.html');

    win.setMenuBarVisibility(false);
    
    return win;
}

ipcMain.handle('select-data-file', async () => {
    const result = await dialog.showOpenDialog({
        title: '지원금 데이터 파일 선택',
        filters: [
            { name: 'JSON Files', extensions: ['json'] }
        ],
        properties: ['openFile']
    });
    
    if (result.canceled || result.filePaths.length === 0) {
        return { success: false, message: '파일 선택이 취소되었습니다.' };
    }
    
    const selectedPath = result.filePaths[0];
    const dataDir = path.join(app.getPath('userData'), 'data');
    const targetPath = path.join(dataDir, 'subsidies-2026.json');
    
    try {
        await fs.mkdir(dataDir, { recursive: true });
        
        const fileContent = await fs.readFile(selectedPath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        
        if (!jsonData.subsidies || !Array.isArray(jsonData.subsidies)) {
            return { 
                success: false, 
                message: '유효하지 않은 데이터 형식입니다. subsidies 배열이 필요합니다.' 
            };
        }
        
        await fs.writeFile(targetPath, fileContent, 'utf-8');
        
        return { 
            success: true, 
            message: '데이터가 성공적으로 업데이트되었습니다. 프로그램을 재시작해주세요.',
            version: jsonData.version,
            lastUpdated: jsonData.lastUpdated
        };
    } catch (error) {
        return { 
            success: false, 
            message: `데이터 업데이트 실패: ${error.message}` 
        };
    }
});

ipcMain.handle('get-data-path', () => {
    return path.join(app.getPath('userData'), 'data', 'subsidies-2026.json');
});

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
