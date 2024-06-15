const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const _ = require('lodash');

class InspectModule {
    constructor() {
        this.inspect = {};
    }
    set(obj) {
        if (obj.inspect) {
            this.inspect = _.merge({}, this.inspect, obj.inspect);
        }
    }
}

const getTags = function (postParsed) {
    return postParsed.filter(function (part) {
        return part.type === 'placeholder';
    }).reduce(function (tags, part) {
        tags[part.value] = {};
        if (part.subparsed) {
            tags[part.value] = getTags(part.subparsed);
        }
        return tags;
    }, {});
}

function processDocx(path) {
    const content = requestReadBinary(path);
    const zip = new PizZip(content);

    const inspectModule = new InspectModule();

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        modules: [inspectModule]
    });

    try {
        doc.compile()
    } catch (error) {
        var e = {
            message: error.message,
            name: error.name,
            stack: error.stack,
            properties: error.properties,
        }

        throw error;
    }

    const postParsed = inspectModule.inspect.postparsed;

    const tags = Object.keys(getTags(postParsed));

    return [doc, tags];
}

function saveDocx(path, values) {
    const [doc, tags] = processDocx(path);
    const data = tags.map((e, i) => [e, values[i]]);

    doc.render(Object.from(data));

    const buf = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
    });

    fs.writeFileSync(path, buf);
}

