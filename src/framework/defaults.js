/* exported Defaults */

const {Gdk} = imports.gi;

const COLORS = Symbol('colors');

const DEFAULTS = {
    'com.endlessm.dinosaurs.en': {
        'logo-graphic': 'dinosaur',
        font: 'Skranji',
        'card-layout': 'tiledGrid',
        [COLORS]: {
            logo: 'white',
            main: 'white',
            accent: '#cc532a',
            info: '#f4d94e',
            border: 'black',
        },
    },
};

const COMMON_DEFAULTS = {
    'font-size': 10,
    'border-width': 0,
    'text-transformation': 'normal',
    'card-order': 'ordered',
    'image-filter': 'none',
    'sounds-cursor-hover': 'none',
    'sounds-cursor-click': 'none',
    hyperlinks: true,
    'text-cipher': 0,
};

const AVAILABLE_FONTS = {
    'com.endlessm.dinosaurs.en': ['Fira Sans', 'HammersmithOne', 'Lato',
        'Marcellus SC', 'Pathway Gothic One', 'Podkova', 'Raleway', 'Skranji'],
};

function _valueToCode(value) {
    if (typeof value === 'boolean')
        return value ? 'yes' : 'no';
    if (typeof value === 'number')
        return `${value}`;
    if (typeof value === 'string')
        return `'${value.replace(/'/g, "\\'")}'`;
    return value.toSource();
}

var Defaults = class Defaults {
    constructor(busName) {
        this._busName = busName;
        this._defaults = DEFAULTS[busName];
    }

    _getColor(propertyName) {
        return this._defaults[COLORS][propertyName.slice(0, -6)];
    }

    value(propertyName) {
        if (propertyName in COMMON_DEFAULTS)
            return COMMON_DEFAULTS[propertyName];
        if (propertyName in this._defaults)
            return this._defaults[propertyName];
        if (propertyName.endsWith('-color')) {
            const retval = new Gdk.RGBA();
            retval.parse(this._getColor(propertyName));
            return retval;
        }
        throw new Error(`unknown property name ${propertyName}`);
    }

    code(variableName) {
        const propertyName = variableName.replace(/_/g, '-');
        if (propertyName in COMMON_DEFAULTS)
            return _valueToCode(COMMON_DEFAULTS[propertyName]);
        if (propertyName in this._defaults)
            return _valueToCode(this._defaults[propertyName]);
        if (propertyName.endsWith('-color'))
            return _valueToCode(this._getColor(propertyName));
        throw new Error(`unknown property name ${propertyName}`);
    }

    get fonts() {
        return AVAILABLE_FONTS[this._busName];
    }
};
