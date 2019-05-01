/* exported RMZUnitsTopic */

const {GLib, GObject, Gtk} = imports.gi;

const {Codeview} = imports.codeview;
const {PopupMenu} = imports.popupMenu;
const {Section} = imports.section;
const SoundServer = imports.soundServer;

GObject.type_ensure(Codeview.$gtype);
GObject.type_ensure(Section.$gtype);
// Placeholders for the units
const VALID_ROBOT_A = ['unicorn'];
const VALID_ROBOT_B = ['unicorn'];
const up = 'up';
const down = 'down';
const directions = {true: up, false: down};
const directionStr = {up: true, down: false};


var RMZUnitsTopic = GObject.registerClass({
    GTypeName: 'RMZCombinedTopic',
    Template: 'resource:///com/endlessm/HackToolbox/RileyMaze/panel.ui',
    InternalChildren: ['units', 'robotAAssetButton', 'robotAUp',
        'robotADown', 'robotBAssetButton', 'robotBUp', 'robotBDown',
        'variablesCodeview'],
}, class RMZCombinedTopic extends Gtk.Grid {
    _init(props = {}) {
        this._lastCodeviewSoundMicrosec = 0;
        super._init(props);

        const robotAInfo = {};
        VALID_ROBOT_A.forEach(id => {
            robotAInfo[id] = `/com/endlessm/HackToolbox/RileyMaze/units/${id}.png`;
        });
        this._robotAAssetMenu = new PopupMenu(this._robotAAssetButton, robotAInfo,
            Gtk.Image, 'resource');

        const robotBInfo = {};
        VALID_ROBOT_B.forEach(id => {
            robotBInfo[id] = `/com/endlessm/HackToolbox/RileyMaze/units/${id}.png`;
        });
        this._robotBAssetMenu = new PopupMenu(this._robotBAssetButton, robotBInfo,
            Gtk.Image, 'resource');
        this._variablesCodeview.connect('should-compile', this._compile.bind(this));
    }

    bindGlobalModel(model) {
        this._global = model;
        this._globalNotifyHandler = model.connect('notify', this._onGlobalNotify.bind(this));

        this._currentLevel = model.currentLevel;
        this._bindLevelModel(this._global.getModel(this._currentLevel));
    }

    unbindGlobalModel() {
        this._unbindLevelModel();
        if (this._global && this._globalNotifyHandler) {
            this._global.disconnect(this._globalNotifyHandler);
            this._globalNotifyHandler = null;
        }
    }

    _onGlobalNotify() {
        if (this._global.currentLevel === this._currentLevel)
            return;
        this._currentLevel = this._global.currentLevel;
        this._bindLevelModel(this._global.getModel(this._currentLevel));
    }

    _unbindLevelModel() {
        if (this._model) {
            if (this._notifyHandler) {
                this._model.disconnect(this._notifyHandler);
                this._notifyHandler = null;
            }
            if (this._bindings) {
                this._bindings.forEach(binding => binding.unbind());
                this._bindings = null;
            }
            this._model = null;
        }
    }

    _bindLevelModel(model) {
        this._unbindLevelModel();

        this._model = model;
        this._robotAUp.connect('toggled',
            this._onActiveChanged.bind(this, 'robotADirection'));
        this._model.connect('notify::robotADirection', () => {
            const dirBool = directionStr[this._model.robotADirection];
            if (dirBool === true)
                this._robotAUp.set_active(true);
            else if (dirBool === false)
                this._robotADown.set_active(true);
        });
        this._robotBUp.connect('toggled',
            this._onActiveChanged.bind(this, 'robotBDirection'));
        this._model.connect('notify::robotBDirection', () => {
            const dirBool = directionStr[this._model.robotBDirection];
            if (dirBool === true)
                this._robotBUp.set_active(true);
            else if (dirBool === false)
                this._robotBDown.set_active(true);
        });
        this._notifyHandler = model.connect('notify', this._onNotify.bind(this));
        this._regenerateCode();
    }

    _onActiveChanged(childName, button) {
        this._model.set_property(childName, directions[button.get_active()]);
    }

    _compile() {
        const code = this._variablesCodeview.text;

        if (code === '')
            return;

        const scope = {
            down: down,
            up: up,
            robotADirection: null,
            robotBDirection: null,
        };
        try {
            // eslint-disable-next-line no-new-func
            const func = new Function('scope', `with(scope){\n${code}\n;}`);
            func(scope);
        } catch (e) {
            if (!(e instanceof SyntaxError || e instanceof ReferenceError))
                throw e;
            this._variablesCodeview.setCompileResultsFromException(e);
            return;
        }

        if (Object.getOwnPropertyNames(scope).every(prop => prop === null))
            return;

        const errors = this._searchForErrors(scope);
        if (errors.length > 0) {
            this._variablesCodeview.setCompileResults(errors);
            return;
        }

        this._variablesCodeview.setCompileResults([]);

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
            if (scope.robotADirection !== null &&
                this._model.robotADirection !== scope.robotADirection)
                this._model.set_property('robotADirection', scope.robotADirection);
            if (scope.robotBDirection !== null &&
                this._model.robotBDirection !== scope.robotBDirection)
                this._model.set_property('robotBDirection', scope.robotBDirection);
        } finally {
            this._model.disconnect(tempHandler);
            GObject.signal_handler_unblock(this._model, this._notifyHandler);
        }

        if (guiUpdated)
            SoundServer.getDefault().play('hack-toolbox/update-gui');
    }

    _errorRecordAtAssignmentLocation(variable, message, value) {
        const {start, end} = this._variablesCodeview.findAssignmentLocation(variable);
        return {start, end, message, fixme: String(value)};
    }

    _searchForErrors(scope) {
        const errors = [];
        const PROPS_DEFAULTS = {
            robotADirection: up,
            robotBDirection: up,
        };
        Object.entries(PROPS_DEFAULTS).forEach(([prop, defaultValue]) => {
            if (scope[prop] !== up && scope[prop] !== down) {
                errors.push(this._errorRecordAtAssignmentLocation(prop,
                    `Unknown value ${scope[prop]}" for ${prop}: value must be up or down`,
                    defaultValue));
            }
        });
        return errors;
    }

    _onNotify() {
        this.reset();
    }

    reset() {
        const oldText = this._variablesCodeview.text;
        this._regenerateCode();
        const timeMicrosec = GLib.get_monotonic_time();
        if (this._updateSoundEnabled && !this._model.inReset &&
            oldText !== this._variablesCodeview.text &&
            timeMicrosec - this._lastCodeviewSoundMicrosec >= 100e3) {
            SoundServer.getDefault().play('hack-toolbox/update-codeview');
            this._lastCodeviewSoundMicrosec = timeMicrosec;
        }
    }

    _regenerateCode() {
        this._variablesCodeview.text = `\
robotADirection = ${this._model.robotADirection};
robotBDirection = ${this._model.robotBDirection};
`;
    }
});
