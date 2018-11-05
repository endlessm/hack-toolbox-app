/* exported FrameworkLevel3 */

const {Gdk, GObject, Gtk} = imports.gi;

const {Codeview} = imports.codeview;
const {VALID_LOGOS} = imports.framework.logoImage;
const Utils = imports.framework.utils;

const VALID_ENUMS = {
    logo_graphic: VALID_LOGOS,
    text_transformation: ['bubbles', 'flipped', 'normal', 'scrambled', 'zalgo'],
    card_order: ['ordered', 'random', 'az', 'za'],
    card_layout: ['grid', 'tiledGrid', 'windshield', 'piano', 'nest', 'overflow'],
    // FIXME what to call the card layouts
    image_filter: ['none', 'disco', 'corduroy', 'blueprint', 'lensFlare'],
    sounds_cursor_hover: ['none', 'scifi'],
    sounds_cursor_click: ['none', 'piano', 'drumkit'],
};

const COLOR_PROPS = ['logo_color', 'main_color', 'accent_color', 'info_color',
    'border_color'];
const ENUM_PROPS = ['text_transformation', 'card_order', 'card_layout',
    'image_filter', 'sounds_cursor_hover', 'sounds_cursor_click'];

var FrameworkLevel3 = GObject.registerClass(class FrameworkLevel3 extends Gtk.Frame {
    _init(defaults, props = {}) {
        super._init(props);

        this._defaults = defaults;

        this._codeview = new Codeview({visible: true});
        this.add(this._codeview);

        this.get_style_context().add_class('codeview-frame');

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
            hyperlinks: null,

            // aliases for boolean literals
            yes: true,
            no: false,
            on: true,
            off: false,
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
                this._model.logo_graphic = scope.logo_graphic;
            ['border_width', 'font', 'font_size', 'hyperlinks'].forEach(prop => {
                if (scope[prop] !== null)
                    this._model[prop] = scope[prop];
            });
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
        return {start, end, message, fixme: String(this._defaults.code(variable))};
    }

    _searchCodeForErrors(scope) {
        const errors = [];

        if (scope.logo_graphic !== null &&
            !VALID_ENUMS.logo_graphic.includes(scope.logo_graphic)) {
            errors.push(this._errorRecordAtAssignmentLocation('logo_graphic',
                `Unknown value ${scope.logo_graphic}: value must be one ` +
                `of ${VALID_ENUMS.logo_graphic.join(', ')}`));
        }

        const {fonts} = this._defaults;
        if (scope.font !== null && !fonts.includes(scope.font)) {
            errors.push(this._errorRecordAtAssignmentLocation('font',
                `Unknown value ${scope.font}: value must be one of ${fonts.join(', ')}`));
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

        if (scope.hyperlinks !== null && scope.hyperlinks !== true &&
            scope.hyperlinks !== false) {
            errors.push(this._errorRecordAtAssignmentLocation('hyperlinks',
                `Unknown value ${scope.hyperlinks}: value must be yes or no, ` +
                'on or off, true or false'));
        }

        return errors;
    }

    _regenerateCode() {
        this._codeview.text = `\
/////////////////////
// Theme
/////////////////////

logo_graphic = '${this._model.logo_graphic}'
logo_color = '${Utils.rgbaToString(this._model.logo_color)}'
main_color = '${Utils.rgbaToString(this._model.main_color)}'
accent_color = '${Utils.rgbaToString(this._model.accent_color)}'
info_color = '${Utils.rgbaToString(this._model.info_color)}'
font = '${this._model.font}'
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
hyperlinks = ${this._model.hyperlinks ? 'yes' : 'no'}
`;
    }

    bindModel(model) {
        this._model = model;
        this._notifyHandler = this._model.connect('notify',
            this._regenerateCode.bind(this));
        this._regenerateCode();
    }
});
