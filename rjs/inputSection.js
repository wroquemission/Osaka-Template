const { clipboard } = require('electron');

class InputSection {
    constructor(title) {
        this.title = title;

        this.inputs = [];
        this.hidden = true;

        this.element = document.createElement('div');
        this.element.classList.add('input-section');

        this.inputWrapper = document.createElement('div');
        this.inputWrapper.classList.add('section-input-wrapper');
    }

    addInput(value) {
        if (!value) value = '';

        const inputRow = document.createElement('div');
        inputRow.classList.add('input-section-row');

        const input = document.createElement('input');
        input.classList.add('input-section-input');
        input.value = value;
        this.inputs.push(input);

        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                this.addInput();
            } else if (e.key === 'v' && e.ctrlKey) {
                e.preventDefault();

                const split = clipboard.readText().split(/\n|\t/);

                if (split.length > 1) {
                    input.value = split[0];

                    for (const value of split.slice(1)) {
                        this.addInput(value);
                    }
                }
            }
        }, false);

        inputRow.appendChild(input);

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-button');
        removeButton.innerText = 'delete';

        removeButton.addEventListener('click', () => {
            if (this.inputs.length > 1) {
                this.inputs.splice(this.inputs.indexOf(input), 1);
                inputRow.remove();
            }
        }, false);

        inputRow.appendChild(removeButton);

        this.inputWrapper.appendChild(inputRow);

        input.focus();
    }

    render(wrapper) {
        const title = document.createElement('div');
        title.classList.add('input-section-title');
        title.innerText = this.title;

        this.element.appendChild(title);

        this.addInput();

        this.element.appendChild(this.inputWrapper);

        const addButton = document.createElement('button');
        addButton.classList.add('input-add-button');

        addButton.innerText = '+';

        addButton.addEventListener('click', () => {
            this.addInput();
        }, false);

        this.element.appendChild(addButton);

        wrapper.appendChild(this.element);
    }
}
