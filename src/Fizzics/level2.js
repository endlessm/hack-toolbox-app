/* exported FizzicsLevel2 */

const {GObject, Gtk} = imports.gi;
const {Codeview} = imports.codeview;

var FizzicsLevel2 = GObject.registerClass({
    GTypeName: 'FizzicsLevel2',
    Template: 'resource:///com/endlessm/HackToolbox/Fizzics/level2.ui',
    InternalChildren: [
        'content',
    ],
}, class FizzicsLevel2 extends Gtk.Box {
    _init(props = {}) {
        super._init(props);
        this._codeview = new Codeview();
        this._codeview.connect('should-compile', () => {
            this._compile();
        });
        this._content.add(this._codeview);
    }

    static _toScopeName(name) {
        return name.replace(/-/g, '_');
    }

    static _toModelName(name) {
        return name.replace(/_/g, '-');
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
            scope[this.constructor._toScopeName(pspec.get_name())] = null;
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
                const property = this.constructor._toModelName(prop);
                if (!(prop in scope) || scope[prop] === this._model[property])
                    return;
                this._model[property] = scope[prop];
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
            const propName = this.constructor._toScopeName(pspec.get_name());
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
// Parameters
/////////////////////

// Balls 0

radius_0 = ${this._model['radius-0']}
gravity_0 = ${this._model['gravity-0']}
collision_0 = ${this._model['collision-0']}
friction_0 = ${this._model['friction-0']}
usePhysics_0 = ${this._model['usePhysics-0']}
socialForce_0_0 = ${this._model['socialForce-0-0']}
socialForce_0_1 = ${this._model['socialForce-0-1']}
socialForce_0_2 = ${this._model['socialForce-0-2']}
imageIndex_0 = ${this._model['imageIndex-0']}

// Balls 1

radius_1 = ${this._model['radius-1']}
gravity_1 = ${this._model['gravity-1']}
collision_1 = ${this._model['collision-1']}
friction_1 = ${this._model['friction-1']}
usePhysics_1 = ${this._model['usePhysics-1']}
socialForce_1_0 = ${this._model['socialForce-1-0']}
socialForce_1_1 = ${this._model['socialForce-1-1']}
socialForce_1_2 = ${this._model['socialForce-1-2']}
imageIndex_1 = ${this._model['imageIndex-1']}

// Balls 2

radius_2 = ${this._model['radius-2']}
gravity_2 = ${this._model['gravity-2']}
collision_2 = ${this._model['collision-2']}
friction_2 = ${this._model['friction-2']}
usePhysics_2 = ${this._model['usePhysics-2']}
socialForce_2_0 = ${this._model['socialForce-2-0']}
socialForce_2_1 = ${this._model['socialForce-2-1']}
socialForce_2_2 = ${this._model['socialForce-2-2']}
imageIndex_2 = ${this._model['imageIndex-2']}
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
