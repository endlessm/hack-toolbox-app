/* exported HBLevel3 */

const {GObject, Gtk} = imports.gi;
const {Codeview} = imports.codeview;

var HBLevel3 = GObject.registerClass({
    GTypeName: 'HBLevel3',
    Template: 'resource:///com/endlessm/HackToolbox/hackyballs/level3.ui',
    InternalChildren: [
        'content',
    ],
}, class HBLevel3 extends Gtk.Box {
    _init(props = {}) {
        super._init(props);
        this._codeview = new Codeview();
        this._codeview.connect('should-compile', () => {
            this._compile();
        });
        this._content.add(this._codeview);
    }

    _getModelProps() {
        return GObject.Object.list_properties.call(this._model.constructor.$gtype);
    }

    _compile() {
        const code = this._codeview.text;

        if (code === '')
            return;

        const scope = {};
        this._getModelProps().forEach(pspec => {
            scope[pspec.get_name()] = null;
        });

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
            Object.getOwnPropertyNames(scope).forEach(prop => {
                if (!(prop in scope) || scope[prop] === this._model[prop])
                    return;
                this._model.set_property(prop, scope[prop]);
            });
        } finally {
            GObject.signal_handler_unblock(this._model, this._notifyHandler);
        }
    }

    _errorRecordAtAssignmentLocation(variable, message, default_value) {
        const {start, end} = this._codeview.findAssignmentLocation(variable);
        return {start, end, message, fixme: String(default_value)};
    }

    _searchCodeForErrors(scope) {
        const errors = [];

        this._getModelProps().forEach(pspec => {
            const propName = pspec.get_name();
            const propType = typeof pspec.default_value;
            if (!scope[propName])
                return;
            if (scope[propName] !== null && typeof scope[propName] !== propType) {
                errors.push(this._errorRecordAtAssignmentLocation(
                    propName,
                    `Unknown value ${scope[propName]}: value must be a ${propType}`,
                    pspec.default_value
                ));
            }
        });

        return errors;
    }

    _regenerateCode() {
        let text = '';
        this._getModelProps().forEach(pspec => {
            const propName = pspec.get_name();
            text += `${propName} = ${this._model[propName]}\n`;
        });
        this._codeview.text = text;
    }

    bindModel(model) {
        this._model = model;
        this._notifyHandler = this._model.connect('notify', () => {
            this._regenerateCode();
        });
        this._regenerateCode();
    }
});
