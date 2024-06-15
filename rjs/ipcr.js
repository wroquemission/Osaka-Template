const { ipcRenderer } = require('electron');

function requestOpenDialog() {
    return ipcRenderer.sendSync('get-open-dialog');
}

function requestRead(path) {
    return ipcRenderer.sendSync('get-read', path);
}

function requestReadBinary(path) {
    return ipcRenderer.sendSync('get-read-binary', path);
}

function requestWrite(path, data) {
    return ipcRenderer.sendSync('get-write', path, data);
}

function requestSaveDialog() {
    return ipcRenderer.sendSync('get-save-dialog');
}
