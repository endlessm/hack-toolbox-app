/* exported LSControlPanel */

const {GLib, GObject, Gtk} = imports.gi;

const {Codeview} = imports.codeview;
const {PopupMenu} = imports.popupMenu;
const {Section} = imports.section;
const SoundServer = imports.soundServer;
const {SpinInput} = imports.spinInput;

GObject.type_ensure(Codeview.$gtype);
GObject.type_ensure(Section.$gtype);
GObject.type_ensure(SpinInput.$gtype);

// Parameters that we pass to the user functions while executing them.
// Unlike the real parameters in the game, which will vary, these need to be
// deterministic. If we're validating things before sending them to the game,
// then we don't want something to be an error only sometimes. The game will
// deal with runtime errors for that purpose.
const COMMON_SCOPE = {
    // Keep this in sync with getScope() in
    // hack-toy-apps/com.endlessm.LightSpeed/levelScene.js
    tick: 0,
    time: 0,
    width: 1920,
    height: 1080,
    shipTypes: [
        'spaceship',
        'daemon',
        'unicorn',
    ],
    enemyTypes: [
        'asteroid',
        'spinner',
        'squid',
        'beam',
    ],

    // validates arguments passed in to random() and returns deterministically
    random(min, max) {
        if (Number.isNaN(Number(min)))
            throw new TypeError(`${min} isn't a number`);
        if (Number.isNaN(Number(max)))
            throw new TypeError(`${max} isn't a number`);
        return min;
    },
};

const COMMON_UPDATE_SCOPE = {
    // Keep this in sync with runUpdateEnemy() in
    // hack-toy-apps/com.endlessm.LightSpeed/levelScene.js
    playerShipY: 0,
    enemy: {
        position: {x: 0, y: 0},
        velocity: {x: 0, y: 0},
    },
};

const VALID_SHIPS = ['spaceship', 'daemon', 'unicorn'];
const USER_FUNCTIONS = [
    {
        name: 'spawnEnemy',
        args: [],
        modelProp: 'spawnEnemyCode',
        childWidget: '_spawnEnemyCodeview',
        getScope() {
            return Object.assign({}, COMMON_SCOPE);
        },
    },
    {
        name: 'updateAsteroid',
        args: [],
        modelProp: 'updateAsteroidCode',
        childWidget: '_updateAsteroidCodeview',
        getScope() {
            return Object.assign({}, COMMON_UPDATE_SCOPE, COMMON_SCOPE);
        },
    },
    {
        name: 'updateSpinner',
        args: [],
        modelProp: 'updateSpinnerCode',
        childWidget: '_updateSpinnerCodeview',
        getScope() {
            return Object.assign({}, COMMON_UPDATE_SCOPE, COMMON_SCOPE);
        },
    },
    {
        name: 'updateSquid',
        args: [],
        modelProp: 'updateSquidCode',
        childWidget: '_updateSquidCodeview',
        getScope() {
            return Object.assign({}, COMMON_UPDATE_SCOPE, COMMON_SCOPE);
        },
    },
    {
        name: 'updateBeam',
        args: [],
        modelProp: 'updateBeamCode',
        childWidget: '_updateBeamCodeview',
        getScope() {
            return Object.assign({}, COMMON_UPDATE_SCOPE, COMMON_SCOPE);
        },
    },
];

var LSControlPanel = GObject.registerClass({
    GTypeName: 'LSControlPanel',
    Template: 'resource:///com/endlessm/HackToolbox/LightSpeed/panel.ui',
    InternalChildren: ['astronautSizeAdjustment', 'scoreTargetAdjustment',
        'shipAccelerationAdjustment', 'shipAssetButton', 'shipSizeAdjustment',
        'shipSpeedAdjustment', 'spawnEnemyCodeview', 'timeLimitAdjustment',
        'updateAsteroidCodeview', 'updateBeamCodeview', 'updateSpinnerCodeview',
        'updateSquidCodeview', 'variablesCodeview'],
}, class LSControlPanel extends Gtk.Grid {
    _init(props = {}) {
        this._lastCodeviewSoundMicrosec = 0;

        super._init(props);

        const shipInfo = {};
        VALID_SHIPS.forEach(id => {
            shipInfo[id] = `/com/endlessm/HackToolbox/LightSpeed/ships/${id}.png`;
        });
        this._shipAssetMenu = new PopupMenu(this._shipAssetButton, shipInfo,
            Gtk.Image, 'resource');

        this._variablesCodeview.connect('should-compile', this._compile.bind(this));
        USER_FUNCTIONS.forEach(info => {
            const codeview = this[info.childWidget];
            codeview.userFunction = info.name;
            codeview.connect('should-compile',
                this._compileUserFunction.bind(this, info));
        });
    }

    bindGlobal(model) {
        this._global = model;
        this._globalNotifyHandler = model.connect('notify', this._onGlobalNotify.bind(this));

        this._currentLevel = model.currentLevel;
        this._bindModel(this._global.getModel(this._currentLevel));
    }

    _onGlobalNotify() {
        if (this._global.currentLevel === this._currentLevel)
            return;
        this._currentLevel = this._global.currentLevel;
        this._bindModel(this._global.getModel(this._currentLevel));
    }

    _bindModel(model) {
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

        this._model = model;
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;

        const bindingInfo = {
            scoreTarget: this._scoreTargetAdjustment,
            timeLimit: this._timeLimitAdjustment,
            astronautSize: this._astronautSizeAdjustment,
            shipAsset: this._shipAssetMenu,
            shipSize: this._shipSizeAdjustment,
            shipSpeed: this._shipSpeedAdjustment,
            shipAcceleration: this._shipAccelerationAdjustment,
        };
        this._bindings = Object.entries(bindingInfo).map(([prop, target]) =>
            model.bind_property(prop, target, 'value', flags));

        this._notifyHandler = model.connect('notify', this._onNotify.bind(this));
        this._regenerateCode();

        USER_FUNCTIONS.forEach(({name, args, modelProp, childWidget}) => {
            const codeview = this[childWidget];
            codeview.text = `function ${name}(${args.join(', ')}) {
${model[modelProp]}
}`;
        });
    }

    bindWindow(win) {
        // Reuse Fizzics key for now
        void this;
        win.lockscreen.key = 'item.key.fizzics.1';
        win.lockscreen.lock = 'lock.fizzics.1';
    }

    _compileUserFunction({name, args, modelProp, getScope}, codeview) {
        const code = codeview.text;
        const scope = getScope();
        let userFunction;

        try {
            // eslint-disable-next-line no-new-func
            const factoryFunc = new Function('scope', `\
with(scope){
${code}
; if (typeof ${name} !== 'undefined') return ${name};
}`);
            userFunction = factoryFunc(scope);
        } catch (e) {
            if (!(e instanceof SyntaxError || e instanceof ReferenceError))
                throw e;
            codeview.setCompileResultsFromException(e);
            return;
        }

        if (!userFunction) {
            // Function definition deleted, or otherwise not working
            codeview.setCompileResults([{
                start: {
                    line: 1,
                    column: 1,
                },
                end: {
                    line: 1,
                    column: 1,
                },
                message: `Expected a function named ${name}.`,
                fixme: `function ${name}(${args.join('\n')}) {\n}\n`,
            }]);
            return;
        }

        try {
            userFunction();
        } catch (e) {
            codeview.setCompileResultsFromException(e);
            return;
        }

        codeview.setCompileResults([]);

        const funcBody = codeview.getFunctionBody(name);
        this._model[modelProp] = funcBody;
    }

    _compile() {
        const code = this._variablesCodeview.text;

        if (code === '')
            return;

        const scope = {
            scoreTarget: null,
            timeLimit: null,
            astronautSize: null,
            shipAsset: null,
            shipSize: null,
            shipSpeed: null,
            shipAcceleration: null,
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
            this._model.scoreTarget = scope.scoreTarget;
            this._model.timeLimit = scope.timeLimit;
            this._model.astronautSize = scope.astronautSize;
            this._model.shipAsset = scope.shipAsset;
            this._model.shipSize = scope.shipSize;
            this._model.shipSpeed = scope.shipSpeed;
            this._model.shipAcceleration = scope.shipAcceleration;
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
        const INT_PROPS_DEFAULTS = {
            // FIXME these are arbitrary. They should reflect the defaults of
            // each level instead.
            scoreTarget: 5,
            timeLimit: -1,
            astronautSize: 30,
            shipSize: 50,
            shipSpeed: 500,
            shipAcceleration: 500,
        };
        Object.entries(INT_PROPS_DEFAULTS).forEach(([prop, defaultValue]) => {
            if (typeof scope[prop] !== 'number') {
                errors.push(this._errorRecordAtAssignmentLocation(prop,
                    `Unknown value "${scope[prop]}" for ${prop}: value must be a number`,
                    defaultValue));
            }
        });
        if (typeof scope.shipAsset !== 'string' || !VALID_SHIPS.includes(scope.shipAsset)) {
            const allowedShips = `"${VALID_SHIPS.join('", "')}"`;
            errors.push(this._errorRecordAtAssignmentLocation('shipAsset',
                `Unknown value "${scope.shipAsset} for shipAsset: value must ` +
                `be one of ${allowedShips}`, 'spaceship'));
        }
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
        this._variablesCodeview.text =
`scoreTarget = ${this._model.scoreTarget};
timeLimit = ${this._model.timeLimit};

astronautSize = ${this._model.astronautSize};

shipAsset = '${this._model.shipAsset}';
shipSize = ${this._model.shipSize};
shipSpeed = ${this._model.shipSpeed};
shipAcceleration = ${this._model.shipAcceleration};
`;
    }
});
