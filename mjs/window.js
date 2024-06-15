const { BrowserWindow } = require('electron');

const path = require('path');

const url = require('url');

class Window {
    constructor(winObject) {
        this.window = new BrowserWindow(winObject);

        this.loadURL();

        this.window.on('closed', e => this.window = null);
    }

    loadURL() {
        this.window.loadURL(url.format({
            pathname: path.join(__dirname, '../html/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
}

module.exports = Window;
