/* exported HBLevel2 */

const {GObject, Gtk} = imports.gi;
const {Codeview} = imports.codeview;

var HBLevel2 = GObject.registerClass({
    GTypeName: 'HBLevel2',
    Template: 'resource:///com/endlessm/HackToolbox/hackyballs/level2.ui',
    InternalChildren: [
        'content',
    ],
}, class HBLevel2 extends Gtk.Box {
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
        this._codeview.text = `\
/////////////////////
// Select Background
/////////////////////

backgroundImageIndex = ${this._model.backgroundImageIndex}

/////////////////////
// Object Parameters
/////////////////////

// Object 0

radius0 = ${this._model.radius0}
gravity0 = ${this._model.gravity0}
collision0 = ${this._model.collision0}
friction0 = ${this._model.friction0}
usePhysics0 = ${this._model.usePhysics0}
socialForce00 = ${this._model.socialForce00}
socialForce01 = ${this._model.socialForce01}
socialForce02 = ${this._model.socialForce02}
imageIndex0 = ${this._model.imageIndex0}

// Object 1

radius1 = ${this._model.radius1}
gravity1 = ${this._model.gravity1}
collision1 = ${this._model.collision1}
friction1 = ${this._model.friction1}
usePhysics1 = ${this._model.usePhysics1}
socialForce10 = ${this._model.socialForce10}
socialForce11 = ${this._model.socialForce11}
socialForce12 = ${this._model.socialForce12}
imageIndex1 = ${this._model.imageIndex1}

// Object 2

radius2 = ${this._model.radius2}
gravity2 = ${this._model.gravity2}
collision2 = ${this._model.collision2}
friction2 = ${this._model.friction2}
usePhysics2 = ${this._model.usePhysics2}
socialForce20 = ${this._model.socialForce20}
socialForce21 = ${this._model.socialForce21}
socialForce22 = ${this._model.socialForce22}
imageIndex2 = ${this._model.imageIndex2}
`;
    }

    bindModel(model) {
        this._model = model;
        this._notifyHandler = this._model.connect('notify', () => {
            this._regenerateCode();
        });
        this._regenerateCode();
    }
});
