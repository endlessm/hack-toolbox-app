/* exported LSUserFunction */

const {GObject, Gtk} = imports.gi;

const {Codeview} = imports.codeview;

// Parameters that we pass to the user functions while executing them.
// Unlike the real parameters in the game, which will vary, these need to be
// deterministic. If we're validating things before sending them to the game,
// then we don't want something to be an error only sometimes. The game will
// deal with runtime errors for that purpose.
const COMMON_SCOPE = {
    // Keep this in sync with UserScope class in
    // hack-toy-apps/com.endlessm.LightSpeed/userScope.js
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
    data: {},

    // validates arguments passed in to random() and returns deterministically
    random(min, max) {
        if (Number.isNaN(Number(min)))
            throw new TypeError(`${min} isn't a number`);
        if (Number.isNaN(Number(max)))
            throw new TypeError(`${max} isn't a number`);
        return min;
    },

    sin(theta) {
        return Math.sin(theta);
    },

    cos(theta) {
        return Math.cos(theta);
    },
};

const COMMON_SPAWN_SCOPE = {
    // Keep this in sync with SpawnScope class in
    // hack-toy-apps/com.endlessm.LightSpeed/userScope.js
    ticksSinceSpawn: 0,
};

const COMMON_UPDATE_SCOPE = {
    // Keep this in sync with UpdateEnemyScope class in
    // hack-toy-apps/com.endlessm.LightSpeed/userScope.js
    playerShip: {
        position: {x: 0, y: 0},
    },
    enemy: {
        position: {x: 0, y: 0},
        velocity: {x: 0, y: 0},
        data: {},
    },
};

const USER_FUNCTIONS = {
    spawnEnemy: {
        name: 'spawnEnemy',
        args: [],
        modelProp: 'spawnEnemyCode',
        getScope() {
            return Object.assign({}, COMMON_SPAWN_SCOPE, COMMON_SCOPE);
        },
    },
    updateAsteroid: {
        name: 'updateAsteroid',
        args: [],
        modelProp: 'updateAsteroidCode',
        childWidget: '_updateAsteroidCodeview',
        getScope() {
            return Object.assign({}, COMMON_UPDATE_SCOPE, COMMON_SCOPE);
        },
    },
    updateSpinner: {
        name: 'updateSpinner',
        args: [],
        modelProp: 'updateSpinnerCode',
        getScope() {
            return Object.assign({}, COMMON_UPDATE_SCOPE, COMMON_SCOPE);
        },
    },
    updateSquid: {
        name: 'updateSquid',
        args: [],
        modelProp: 'updateSquidCode',
        getScope() {
            return Object.assign({}, COMMON_UPDATE_SCOPE, COMMON_SCOPE);
        },
    },
    updateBeam: {
        name: 'updateBeam',
        args: [],
        modelProp: 'updateBeamCode',
        getScope() {
            return Object.assign({}, COMMON_UPDATE_SCOPE, COMMON_SCOPE);
        },
    },
};

var LSUserFunction = GObject.registerClass({

}, class LSUserFunction extends Gtk.Frame {
    _init(userFunctionName, props = {}) {
        super._init(props);

        this._codeview = new Codeview();
        this._codeview.userFunction = userFunctionName;

        this._codeview.connect('should-compile', this._compile.bind(this));

        this.add(this._codeview);

        this.get_style_context().add_class('user-function');
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
        if (this._model)
            this._model = null;

        this._model = model;

        const {name, args, modelProp} = USER_FUNCTIONS[this._codeview.userFunction];
        this._codeview.text = `function ${name}(${args.join(', ')}) {
${model[modelProp]}
}`;
    }

    _compile() {
        const {name, args, modelProp, getScope} = USER_FUNCTIONS[this._codeview.userFunction];
        const code = this._codeview.text;
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
            this._codeview.setCompileResultsFromException(e);
            return;
        }

        if (!userFunction) {
            // Function definition deleted, or otherwise not working
            this._codeview.setCompileResults([{
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
            this._codeview.setCompileResultsFromException(e);
            return;
        }

        this._codeview.setCompileResults([]);

        const funcBody = this._codeview.getFunctionBody(name);
        this._model[modelProp] = funcBody;
    }
});
