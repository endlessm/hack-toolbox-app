/* exported FrameworkLevel3 */

const {Gdk, GObject, Gtk, Pango} = imports.gi;

const {Codeview} = imports.codeview;
const {logoIDToResource, resourceToLogoID, VALID_LOGOS} = imports.framework.logoImage;
const {RaModel} = imports.framework.model;
const Utils = imports.framework.utils;

const VALID_ENUMS = {
    logo_graphic: VALID_LOGOS,
    text_transformation: ['bubbles', 'flipped', 'normal', 'scrambled', 'zalgo'],
    card_order: ['ordered', 'random', 'az', 'za'],
    card_layout: ['tiledGrid', 'windshield', 'piano', 'nest', 'overflow'],
    // FIXME what to call the card layouts
    image_filter: ['none', 'disco', 'corduroy', 'blueprint', 'lensFlare'],
    sounds_cursor_hover: ['none', 'scifi'],
    sounds_cursor_click: ['none', 'piano', 'drumkit'],
};

const COLOR_PROPS = ['logo_color', 'main_color', 'accent_color', 'info_color',
    'border_color'];
const ENUM_PROPS = ['text_transformation', 'card_order', 'card_layout',
    'image_filter', 'sounds_cursor_hover', 'sounds_cursor_click'];

function _fontNameToFontDescription(name) {
    const desc = new Pango.FontDescription();
    desc.set_family(name);
    return desc;
}

var FrameworkLevel3 = GObject.registerClass({
    GTypeName: 'FrameworkLevel3',
    Template: 'resource:///com/endlessm/HackToolbox/framework/level3.ui',
}, class FrameworkLevel3 extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);
        this._codeview = new Codeview({visible: true});
        this.add(this._codeview);

        this._codeview.connect('should-compile', this.compile.bind(this));
    }

    compile() {
        const code = this._codeview.text;

        if (code === '')
            return;

        const scope = {
            accent_color: null,
            border_color: null,
            border_width: null,
            card_layout: null,
            card_order: null,
            font: null,
            font_size: null,
            image_filter: null,
            info_color: null,
            logo_color: null,
            logo_graphic: null,
            main_color: null,
            sounds_cursor_click: null,
            sounds_cursor_hover: null,
            text_transformation: null,
        };
        try {
            // eslint-disable-next-line no-new-func
            const func = new Function('scope', `with(scope){\n${code}\n;}`);
            func(scope);
        } catch (e) {
            if (!(e instanceof SyntaxError || e instanceof ReferenceError))
                throw e;
            this._codeview.setCompileResults([{
                start: {
                    line: e.lineNumber - 1,  // remove the "with(scope)" line
                    column: e.columnNumber - 1,  // seems to be 1-based
                },
                message: e.message,
            }]);
            return;
        }

        if (Object.getOwnPropertyNames(scope).every(prop => prop === null))
            return;

        const errors = this._searchCodeForErrors(scope);
        if (errors.length > 0) {
            this._codeview.setCompileResults(errors);
            return;
        }

        this._codeview.setCompileResults([]);

        GObject.signal_handler_block(this._model, this._notifyHandler);

        try {
            if (scope.logo_graphic !== null)
                this._model.logo_graphic = logoIDToResource(scope.logo_graphic);
            if (scope.font !== null)
                this._model.font = _fontNameToFontDescription(scope.font);
            if (scope.border_width !== null)
                this._model.border_width = scope.border_width;
            if (scope.font_size !== null)
                this._model.font_size = scope.font_size;
            COLOR_PROPS.forEach(prop => {
                if (scope[prop] !== null) {
                    const rgba = new Gdk.RGBA();
                    rgba.parse(scope[prop]);
                    this._model[prop] = rgba;
                }
            });
            ENUM_PROPS.forEach(prop => {
                if (scope[prop] !== null)
                    this._model[prop] = scope[prop];
            });
        } finally {
            GObject.signal_handler_unblock(this._model, this._notifyHandler);
        }
    }

    _errorRecordAtAssignmentLocation(variable, message) {
        const {start, end} = this._codeview.findAssignmentLocation(variable);
        return {start, end, message, fixme: String(RaModel.CODE_DEFAULTS[variable])};
    }

    _searchCodeForErrors(scope) {
        const errors = [];

        if (scope.logo_graphic !== null &&
            !VALID_ENUMS.logo_graphic.includes(scope.logo_graphic)) {
            errors.push(this._errorRecordAtAssignmentLocation('logo_graphic',
                `Unknown value ${scope.logo_graphic}: value must be one ` +
                `of ${VALID_ENUMS.logo_graphic.join(', ')}`));
        }

        if (scope.font !== null && typeof scope.font !== 'string') {
            errors.push(this._errorRecordAtAssignmentLocation('font',
                `Unknown value ${scope.font}: value must be the name of a ` +
                'font, like "Lato"'));
        }

        ['border_width', 'font_size'].forEach(prop => {
            if (scope[prop] !== null &&
                (typeof scope[prop] !== 'number' || scope[prop] < 0)) {
                errors.push(this._errorRecordAtAssignmentLocation(prop,
                    `Unknown value ${scope[prop]}: value must be a number ` +
                    'of zero or more, like 10'));
            }
        });

        COLOR_PROPS.forEach(prop => {
            if (scope[prop] !== null) {
                const rgba = new Gdk.RGBA();
                if (!rgba.parse(scope[prop])) {
                    errors.push(this._errorRecordAtAssignmentLocation(prop,
                        `Unknown value ${scope[prop]}: value must be a ` +
                        'color, like "red" or "#729fcf"'));
                }
            }
        });

        ENUM_PROPS.forEach(prop => {
            if (scope[prop] !== null && !VALID_ENUMS[prop].includes(scope[prop])) {
                errors.push(this._errorRecordAtAssignmentLocation(prop,
                    `Unknown value ${scope[prop]}: value must be one ` +
                    `of ${VALID_ENUMS[prop].join('\n')}`));
            }
        });

        return errors;
    }

    _regenerateCode() {
        this._codeview.text = `\
/////////////////////
// Theme
/////////////////////

logo_graphic = '${resourceToLogoID(this._model.logo_graphic)}'
logo_color = '${Utils.rgbaToString(this._model.logo_color)}'
main_color = '${Utils.rgbaToString(this._model.main_color)}'
accent_color = '${Utils.rgbaToString(this._model.accent_color)}'
info_color = '${Utils.rgbaToString(this._model.info_color)}'
font = '${this._model.font.get_family()}'
font_size = ${this._model.font_size}

/////////////////////
// Cards
/////////////////////

border_width = ${this._model.border_width}
border_color = '${Utils.rgbaToString(this._model.border_color)}'
text_transformation = '${this._model.text_transformation}'
card_order = '${this._model.card_order}'
card_layout = '${this._model.card_layout}'
image_filter = '${this._model.image_filter}'
sounds_cursor_hover = '${this._model.sounds_cursor_hover}'
sounds_cursor_click = '${this._model.sounds_cursor_click}'
`;
    }

    bindModel(model) {
        this._model = model;
        this._notifyHandler = this._model.connect('notify',
            this._regenerateCode.bind(this));
        this._regenerateCode();
    }
});
