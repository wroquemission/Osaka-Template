class Template {
    constructor(source, path, extension, basename, previewElement, inputWrapper) {
        this.source = source;
        this.path = path;
        this.extension = extension;
        this.basename = basename;
        this.previewElement = previewElement;

        if (extension === '.docx') {
            this.placeholders = processDocx(path)[1];
            console.log(this.placeholders);
        } else {
            this.placeholders = this.findPlaceholders(source);
        }

        this.sections = [];

        this.loadInputs(inputWrapper);
    }

    findPlaceholders(text) {
        let matches = text.match(/\{[a-zA-Z0-9-_]*?\}/g)
        matches = matches.map(
            match => match.slice(1, match.length - 1)
        );

        return [...new Set(matches)];
    }

    loadInputs(wrapper) {
        while (wrapper.firstChild) {
            wrapper.firstChild.remove();
        }

        for (const placeholder of this.placeholders) {
            const section = new InputSection(
                placeholder.toUpperCase()
            );

            section.render(wrapper);

            this.sections.push(section);
        }
    }

    preview() {
        if (this.extension === '.html') {
            let output = this.source;

            for (const placeholder of this.placeholders) {
                const upper = placeholder.toUpperCase();

                output = output.replace(
                    new RegExp(`\\{${placeholder}\\}`, 'g'),
                    `<span class="placeholder placeholder-${placeholder}">${upper}</span>`
                );
            }


            const unicodePattern = /((?:&#\d{5};)+)/g;

            output = output.replace(unicodePattern,  '<span style="font-family: Noto Sans JP, NotoSansJP">$1</span>');

            this.previewElement.style.all = 'unset';
            this.previewElement.innerHTML = output
        } else {
            const pathElement = document.createElement('div');
            pathElement.classList.add('path-preview-element');
            pathElement.innerText = this.path;

            this.previewElement.appendChild(pathElement);
        }
    }

    fill(values) {
        this.placeholders.forEach((placeholder, i) => {
            const elements = document.querySelectorAll(
                `.placeholder-${placeholder}`
            );

            for (const element of elements) {
                element.innerText = values[i];
                element.classList.add('placeholder-filled');
            }
        });
    }

    exportAll(directory) {
        let sections = [];
        let longest = [];

        for (const section of this.sections) {
            const inputs = section.inputs;

            sections.push(inputs);

            if (inputs.length > longest.length) {
                longest = inputs;
            }
        }

        if (this.extension === '.html') {
            let i = 0;

            const exportNext = () => {
                const suffix = longest[i].value.replace(/\\|\//g, '_');

                const savePath = path.join(
                    directory,
                    `${this.basename}_${suffix}.pdf`
                );

                const values = sections.map(section => {
                    return section[i % section.length].value;
                });

                this.fill(values);

                const doc = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: 'a4'
                });
                doc.setFont('NotoSansJP', 'normal');

                doc.html(this.previewElement, {
                    callback: doc => {
                        const data = doc.output('datauristring');

                        const regex = /^data:.+\/(.+);base64,(.*)$/;

                        const matches = data.match(regex);
                        const buffer = Buffer.from(matches[2], 'base64');

                        requestWrite(
                            savePath,
                            buffer
                        );

                        if (i < longest.length - 1) {
                            i++;
                            exportNext();
                        } else {
                            this.preview();
                        }
                    },
                    width: 210,
                    height: 297,
                    windowWidth: 750,
                    margin: [5, 10, 5, 10],
                    autoPaging: 'text',
                    html2canvas: {
                        allowTaint: true,
                        letterRendering: true,
                        logging: false,
                        scale: 0.26
                    }
                });
            }

            exportNext();
        } else {
            for (const i = 0; i < longest.length; i++) {
                const savePath = path.join(
                    directory,
                    `${this.basename}_${longest[i].value}.docx`
                );

                const values = sections.map(section => {
                    return section[i % section.length].value;
                });

                saveDocx(savePath, values);
            }
        }
    }
}
