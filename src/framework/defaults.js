/* exported Defaults */

const {Gdk} = imports.gi;

const GameState = imports.gameState;

const KEYS_DEFAULT = [
    'item.key.framework.1',
    'item.key.framework.2',
    'item.key.framework.3',
];

const KEYS = {
    'com.endlessm.Hackdex_chapter_one': [
        'item.key.hackdex1.1',
        'item.key.hackdex1.2',
        'item.key.hackdex1.3',
    ],
};

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
    'com.endlessm.Hackdex_chapter_one': {
        'logo-graphic': 'clubhouse',
        font: 'Orator',
        'card-layout': 'grid',
        [COLORS]: {
            logo: 'white',
            main: 'white',
            accent: 'white',
            info: 'white',
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
    'com.endlessm.Hackdex_chapter_one': ['Fira Sans', 'Hack', 'HammersmithOne',
        'Lato', 'Marcellus SC', 'Pathway Gothic One', 'Orator', 'Podkova',
        'Raleway', 'Skranji'],
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
    constructor(appId) {
        this._appId = appId;
        this._defaults = DEFAULTS[appId];
        this._applyQuestOverridesSync();
    }

    _applyQuestOverridesSync() {
        if (this._appId === 'com.endlessm.Hackdex_chapter_one') {
            // Override for the "corrupted hackdex chapter 1" quest
            const gameState = GameState.getDefault();
            const key = 'app.com_endlessm_Hackdex_chapter_one.corruption';
            let corruption;
            try {
                corruption = gameState.GetSync(key);
            } catch (e) {
                void e;  // key not yet present; do nothing
                return;
            }
            if (corruption.state) {
                const state = corruption.state.deep_unpack();
                const color = corruption.color.deep_unpack();
                if (state === 'corrupted')
                    this._defaults[COLORS]['main'] = 'rgba(255, 255, 255, 0)';
                else if (state === 'fixed')
                    this._defaults[COLORS]['main'] = color;
            }
        }
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
        return AVAILABLE_FONTS[this._appId];
    }

    get keys() {
        if (this._appId in KEYS)
            return KEYS[this._appId];
        return KEYS_DEFAULT;
    }

    get locks() {
        return [
            `lock.${this._appId}.1`,
            `lock.${this._appId}.2`,
            `lock.${this._appId}.3`,
        ];
    }
};
