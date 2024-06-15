const remote = require('electron').remote;
const path = require('path');

const { dialog } = remote;

const panelElement = document.querySelector('#side-panel');

const previewElement = document.querySelector('#preview');
const previewWrapperElement = document.querySelector('#preview-wrapper');
const inputWrapperElement = document.querySelector('#input-wrapper');
const importLabel = document.querySelector('#import-label');

const exportButton = document.querySelector('#export-button');

const closeWindowButton = document.querySelector('#close-window');

let template;


previewWrapperElement.addEventListener('dragover', e => {
    e.preventDefault();

    previewWrapperElement.style.opacity = '.5';
}, false);


previewWrapperElement.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();

    const extTest = /\.html|\.docx$/;

    const files = [...e.dataTransfer.files].map(file => file.path)
                                           .filter(file => extTest.test(file));

    if (files.length > 0) {
        const file = files[0];

        const source = requestRead(file);
        const extension = path.extname(file);
        const basename = path.basename(
            file, extension
        );

        if (source) {
            template = new Template(
                source,
                file,
                extension,
                basename,
                previewElement,
                inputWrapperElement
            );
            template.preview();
        }
    }

    previewWrapperElement.style.opacity = '1';
    importLabel.style.display = 'none';
    previewElement.style.display = 'block';
    panelElement.style.display = 'flex';
}, false);


previewWrapperElement.addEventListener('dragleave', e => {
    e.preventDefault();

    previewWrapperElement.style.opacity = '1';
}, false);


exportButton.addEventListener('click', _ => {
    if (template) {
        const directory = requestSaveDialog();

        if (directory) {
            template.exportAll(directory);
        }
    }
}, false);


closeWindowButton.addEventListener('click', _ => {
    const window = remote.getCurrentWindow();
    window.close();
});
