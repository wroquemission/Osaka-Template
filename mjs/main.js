const { app, dialog } = require('electron');

const windowStateKeeper = require('electron-window-state');
const appData = app.getPath('appData');

const { ipcMain } = require('electron');

const fs = require('fs');

const shell = require('shelljs');
const nShell = require('electron').shell;

const path = require('path');

let configErrorScheduled = false;

const fixPath = require('fix-path');
fixPath();


ipcMain.on('get-open-dialog', (event, _) => {
    event.returnValue = dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'HTML', extensions: ['htm', 'html'] }
        ]
    });
});

ipcMain.on('get-read', (event, path) => {
    try {
        event.returnValue = fs.readFileSync(path).toString();
    } catch (e) {

    }
});

ipcMain.on('get-read-binary', (event, path) => {
    try {
        event.returnValue = fs.readFileSync(path, 'binary').toString();
    } catch (e) {

    }
});

ipcMain.on('get-write', (event, path, data) => {
    try {
        event.returnValue = fs.writeFileSync(path, data);
    } catch (e) {

    }
});

ipcMain.on('get-save-dialog', (event) => {
    const files = dialog.showOpenDialog({ properties: ['openDirectory'] });

    event.returnValue = files && files[0];
});

const Window = require('./window');

const mainWinObject = {
    center: true,
    icon: '../assets/icon.png',
    frame: false,
    backgroundColor: '#fff',
    minWidth: 600,
    minHeight: 400,
    fullscreen: false
};

let mainWin;

const createWindow = () => {
    let mainWindowState = windowStateKeeper({
        defaultWidth: 500,
        defaultHeight: 600
    });

    mainWinObject.width = mainWindowState.width;
    mainWinObject.height = mainWindowState.height;

    mainWin = new Window(mainWinObject);
    
    if (configErrorScheduled) {
        dialog.showMessageBox(null, {
            message: 'Configuration not set.',
        });
    }

    mainWindowState.manage(mainWin.window);
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.exit(0);
    }
});

app.on('activate', () => {
    if (!mainWin || mainWin.window === null) {
        mainWin = createWindow();
    }
});

