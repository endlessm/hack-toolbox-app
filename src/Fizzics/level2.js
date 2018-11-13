/* exported FizzicsLevel2 */

const {GLib, GObject, Gtk} = imports.gi;

const {Codeview} = imports.codeview;
const SoundServer = imports.soundServer;
const {SPECIES, BACKGROUNDS, SKINS, VFX_BAD,
    VFX_GOOD, SFX_BAD, SFX_GOOD} = imports.Fizzics.model;

var FizzicsLevel2 = GObject.registerClass({
    GTypeName: 'FizzicsLevel2',

    Properties: {
        'update-sound-enabled': GObject.ParamSpec.boolean('update-sound-enabled',
            'Update sound enabled', '',
            GObject.ParamFlags.READWRITE, false),
    },

    Template: 'resource:///com/endlessm/HackToolbox/Fizzics/level2.ui',
    InternalChildren: [
        'content',
    ],
}, class FizzicsLevel2 extends Gtk.Box {
    _init(props = {}) {
        super._init(props);
        this._lastCodeviewSoundMicrosec = 0;
        this._updateSoundEnabled = false;

        this._codeview = new Codeview();
        this._codeview.connect('should-compile', () => {
            this._compile();
        });
        this._content.add(this._codeview);
    }

    get update_sound_enabled() {
        return this._updateSoundEnabled;
    }

    set update_sound_enabled(value) {
        if ('_updateSoundEnabled' in this && this._updateSoundEnabled === value)
            return;
        this._updateSoundEnabled = value;
        this.notify('update-sound-enabled');
    }

    _getPropsForGlobals() {
        void this;
        return {
            background: 'backgroundImageIndex',
            showDragTool: 'moveToolActive',
            showFlingTool: 'flingToolActive',
            showAddTool: 'createToolActive',
            showDeleteTool: 'deleteToolActive',
        };
    }

    _getPropsForIndex(index) {
        void this;
        return {
            radius: `radius_${index}`,
            gravity: `gravity_${index}`,
            bounce: `collision_${index}`,
            friction: `friction_${index}`,
            frozen: `usePhysics_${index}`,
            attraction0: `socialForce_${index}_0`,
            attraction1: `socialForce_${index}_1`,
            attraction2: `socialForce_${index}_2`,
            attraction3: `socialForce_${index}_3`,
            attraction4: `socialForce_${index}_4`,
            skin: `imageIndex_${index}`,
            vfxBad: `deathVisualBad_${index}`,
            sfxBad: `deathSoundBad_${index}`,
            vfxGood: `deathVisualGood_${index}`,
            sfxGood: `deathSoundGood_${index}`,
        };
    }

    _getValueForScope(scopeProp, modelProp) {
        if (scopeProp === 'background')
            return `"${BACKGROUNDS[this._model[modelProp]]}"`;
        if (scopeProp === 'skin')
            return `"${SKINS[this._model[modelProp]]}"`;
        if (scopeProp === 'vfxBad')
            return `"${VFX_BAD[this._model[modelProp]]}"`;
        if (scopeProp === 'sfxBad')
            return `"${SFX_BAD[this._model[modelProp]]}"`;
        if (scopeProp === 'vfxGood')
            return `"${VFX_GOOD[this._model[modelProp]]}"`;
        if (scopeProp === 'sfxGood')
            return `"${SFX_GOOD[this._model[modelProp]]}"`;
        if (scopeProp === 'frozen')
            return !this._model[modelProp];
        return this._model[modelProp];
    }

    _getValueForModel(scope, scopeProp) {
        void this;
        if (scopeProp === 'background')
            return BACKGROUNDS.indexOf(scope[scopeProp]);
        if (scopeProp === 'skin')
            return SKINS.indexOf(scope[scopeProp]);
        if (scopeProp === 'vfxBad')
            return VFX_BAD.indexOf(scope[scopeProp]);
        if (scopeProp === 'sfxBad')
            return SFX_BAD.indexOf(scope[scopeProp]);
        if (scopeProp === 'vfxGood')
            return VFX_GOOD.indexOf(scope[scopeProp]);
        if (scopeProp === 'sfxGood')
            return SFX_GOOD.indexOf(scope[scopeProp]);
        if (scopeProp === 'frozen')
            return !scope[scopeProp];
        return scope[scopeProp];
    }

    _createScopeWithProps(props) {
        void this;
        const scope = {};
        Object.keys(props).forEach(prop => {
            scope[prop] = null;
        });
        return scope;
    }

    _createScopeForObject(index) {
        const props = this._getPropsForIndex(index);
        return this._createScopeWithProps(props);
    }

    _createScope() {
        const props = this._getPropsForGlobals();
        const scope = this._createScopeWithProps(props);
        scope.species = Array.from({length: SPECIES}).map((value, index) => {
            return this._createScopeForObject(index);
        });
        return scope;
    }

    _updateModel(scope, props) {
        Object.keys(props).forEach(prop => {
            if (scope[prop] === null)
                return;
            const modelProp = props[prop];
            const value = this._getValueForModel(scope, prop);
            if (value === this._model[modelProp])
                return;
            this._model[modelProp] = value;
        });
    }

    _updateModelFromObject(object, index) {
        const props = this._getPropsForIndex(index);
        this._updateModel(object, props);
    }

    _updateModelFromScope(scope) {
        const props = this._getPropsForGlobals();
        this._updateModel(scope, props);
        Array.from({length: SPECIES}).forEach((value, index) => {
            this._updateModelFromObject(scope.species[index], index);
        });
    }

    _compile() {
        const code = this._codeview.text;

        if (code === '')
            return;

        const scope = this._createScope();
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

        const errors = this._searchForErrors(scope);
        if (errors.length > 0) {
            this._codeview.setCompileResults(errors);
            return;
        }

        this._codeview.setCompileResults([]);

        // Block the normal notify handler that updates the code view, since we
        // are propagating updates from the codeview to the GUI. Instead,
        // connect a temporary handler that lets us know if anything actually
        // did change.
        GObject.signal_handler_block(this._model, this._notifyHandler);

        let guiUpdated = false;
        const tempHandler = this._model.connect('notify', () => {
            guiUpdated = true;
        });

        try {
            this._updateModelFromScope(scope);
        } finally {
            this._model.disconnect(tempHandler);
            GObject.signal_handler_unblock(this._model, this._notifyHandler);
        }

        if (guiUpdated)
            SoundServer.getDefault().play('hack-toolbox/update-gui');
    }

    _errorRecordAtAssignmentLocation(variable, message, value) {
        const {start, end} = this._codeview.findAssignmentLocation(variable);
        return {start, end, message, fixme: String(value)};
    }

    _searchForErrorWithProps(errors, scope, props, prefix) {
        Object.keys(props).forEach(prop => {
            if (scope[prop] === null)
                return;
            const modelProp = props[prop];
            const value = this._getValueForScope(prop, modelProp);
            const type = typeof value;
            if (typeof scope[prop] !== type) {
                errors.push(this._errorRecordAtAssignmentLocation(
                    prefix ? `${prefix}${prop}` : prop,
                    `Unknown value ${scope[prop]} for ${prop}: value must be a ${type}`,
                    value
                ));
            }
        });
    }

    _searchForErrors(scope) {
        const errors = [];
        const props = this._getPropsForGlobals();
        this._searchForErrorWithProps(errors, scope, props, null);
        Array.from({length: SPECIES}).forEach((value, index) => {
            const objProps = this._getPropsForIndex(index);
            this._searchForErrorWithProps(
                errors, scope.species[index], objProps, `species[${index}].`);
        });
        return errors;
    }

    _generateCodeForOptions(options) {
        void this;
        return options.join(', ');
    }

    _generateCodeForIndex(index) {
        let code = `
// ${index}
`;
        const props = this._getPropsForIndex(index);
        Object.keys(props).forEach(prop => {
            const value = this._getValueForScope(prop, props[prop]);
            code += `species[${index}].${prop} = ${value}\n`;
        });
        return code;
    }

    _regenerateCode() {
        let code = `
////////////////////////////
// Globals
////////////////////////////

// background options: ${this._generateCodeForOptions(BACKGROUNDS)}\n
`;
        const props = this._getPropsForGlobals();
        Object.keys(props).forEach(prop => {
            const value = this._getValueForScope(prop, props[prop]);
            code += `${prop} = ${value}\n`;
        });
        code += `
////////////////////////////
// Species
////////////////////////////

// skin options: ${this._generateCodeForOptions(SKINS)}
// vfxBad options: ${this._generateCodeForOptions(VFX_BAD)}
// sfxBad options: ${this._generateCodeForOptions(SFX_BAD)}
// vfxGood options: ${this._generateCodeForOptions(VFX_GOOD)}
// sfxGood options: ${this._generateCodeForOptions(SFX_GOOD)}
`;

        Array.from({length: SPECIES}).forEach((value, index) => {
            code += `${this._generateCodeForIndex(index)}`;
        });
        this._codeview.text = code;
    }

    _onNotify() {
        const oldText = this._codeview.text;
        this._regenerateCode();
        const timeMicrosec = GLib.get_monotonic_time();
        if (this._updateSoundEnabled && !this._model.inReset &&
            oldText !== this._codeview.text &&
            timeMicrosec - this._lastCodeviewSoundMicrosec >= 100e3) {
            SoundServer.getDefault().play('hack-toolbox/update-codeview');
            this._lastCodeviewSoundMicrosec = timeMicrosec;
        }
    }

    bindModel(model) {
        this._model = model;
        this._notifyHandler = this._model.connect('notify',
            this._onNotify.bind(this));
        this._regenerateCode();
    }
});
