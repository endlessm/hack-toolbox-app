/*
 * Copyright © 2020 Endless OS Foundation LLC.
 *
 * This file is part of hack-toolbox-app
 * (see https://github.com/endlessm/hack-toolbox-app).
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
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
    // hack-toy-apps/com.hack_computer.LightSpeed/userScope.js
    tick: 0,
    time: 0,
    width: 1920,
    height: 1080,
    shipTypes: [
        'spaceship',
        'daemon',
        'unicorn',
    ],
    spaceship: 'spaceship',
    daemon: 'daemon',
    unicorn: 'unicorn',
    enemyTypes: [
        'asteroid',
        'spinner',
        'squid',
        'beam',
    ],
    asteroid: 'asteroid',
    spinner: 'spinner',
    squid: 'squid',
    beam: 'beam',
    data: {},

    // validates arguments passed in to random() and returns deterministically
    random(min, max) {
        if (Number.isNaN(Number(min)))
            throw new TypeError(`${min} isn't a number`);
        if (Number.isNaN(Number(max)))
            throw new TypeError(`${max} isn't a number`);
        return min;
    },

    pickOne(...choices) {
        if (choices.length === 0)
            throw new Error('You need at least one thing to pick from');
        return choices[0];
    },

    sin(theta) {
        return Math.sin(theta);
    },

    cos(theta) {
        return Math.cos(theta);
    },
};

class Point {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
}
// Set method that checks type for number properties of objects
function propNumFactory(obj, propName) {
    Object.defineProperty(obj, propName, {
        set(newVal) {
            if (Number.isNaN(Number(newVal)))
                throw new TypeError(`${propName} must be a number.`);
            else if (Number(newVal) < 0)
                throw new RangeError(`${propName} must be a positive number.`);
            obj[`_${propName}`] = newVal; // eslint-disable-line no-param-reassign
        },
        get() {
            return obj[`_${propName}`];
        },
    });
}

const playPos = new Point();
propNumFactory(playPos, 'x');
propNumFactory(playPos, 'y');

const enemyPos = new Point();
propNumFactory(enemyPos, 'x');
propNumFactory(enemyPos, 'y');

const enemyVelocity = new Point();
propNumFactory(enemyVelocity, 'x');
propNumFactory(enemyVelocity, 'y');

const COMMON_UPDATE_SCOPE = {
    // Keep this in sync with UpdateEnemyScope class in
    // hack-toy-apps/com.hack_computer.LightSpeed/userScope.js
    playerShip: {
        position: playPos,
    },
    enemy: {
        position: enemyPos,
        velocity: enemyVelocity,
        data: {},
    },
};

const shipPos = new Point();
propNumFactory(shipPos, 'x');
propNumFactory(shipPos, 'y');

const POWERUP = {
    ship: {
        position: shipPos,
        invulnerableTimer: 0,
        shrinkTimer: 0,
        attractTimer: 0,
    },
    powerUpType: 0,
    blowup: 'blowup',
    invulnerable: 'invulnerable',
    upgrade: 'upgrade',
    shrink: 'shrink',
    attraction: 'attraction',
    engine: 'engine',
    blowUpEnemies() {},  // eslint-disable-line no-empty-function
};

var COMMON_SPAWN_SCOPE = {
    // Keep this in sync with SpawnScope class in
    // hack-toy-apps/com.hack_computer.LightSpeed/userScope.js
    ticksSinceSpawn: 0,
};

const USER_FUNCTIONS = {
    spawnEnemy: {
        name: 'spawnEnemy',
        args: [],
        modelProp: 'spawnEnemyCode',
        perLevel: true,
        getScope() {
            const ENEMY_SCOPE = Object.assign({}, COMMON_SPAWN_SCOPE, COMMON_SCOPE);
            propNumFactory(ENEMY_SCOPE, 'ticksSinceSpawn');
            return ENEMY_SCOPE;
        },
        validate(funcRet) {
            // Don't throw an error when returning null
            if (funcRet === null)
                return;

            if (!COMMON_SCOPE.enemyTypes.includes(funcRet))
                throw TypeError('The spawnEnemy function must return an enemyType.');
        },
    },
    updateAsteroid: {
        name: 'updateAsteroid',
        args: [],
        modelProp: 'updateAsteroidCode',
        childWidget: '_updateAsteroidCodeview',
        perLevel: false,
        getScope() {
            return Object.assign({}, COMMON_UPDATE_SCOPE, COMMON_SCOPE);
        },
        validate() {
            // eslint-disable-line no-empty-function
        },
    },
    updateSpinner: {
        name: 'updateSpinner',
        args: [],
        modelProp: 'updateSpinnerCode',
        perLevel: false,
        getScope() {
            return Object.assign({}, COMMON_UPDATE_SCOPE, COMMON_SCOPE);
        },
        validate() {
            // eslint-disable-line no-empty-function
        },
    },
    updateSquid: {
        name: 'updateSquid',
        args: [],
        modelProp: 'updateSquidCode',
        perLevel: false,
        getScope() {
            return Object.assign({}, COMMON_UPDATE_SCOPE, COMMON_SCOPE);
        },
        validate() {
            // eslint-disable-line no-empty-function
        },
    },
    updateBeam: {
        name: 'updateBeam',
        args: [],
        modelProp: 'updateBeamCode',
        perLevel: false,
        getScope() {
            return Object.assign({}, COMMON_UPDATE_SCOPE, COMMON_SCOPE);
        },
        validate() {
            // eslint-disable-line no-empty-function
        },
    },
    spawnPowerup: {
        name: 'spawnPowerup',
        args: [],
        modelProp: 'spawnPowerupCode',
        perLevel: true,
        getScope() {
            const SPAWN_POWERUP = Object.assign({
                blowup: 'blowup',
                invulnerable: 'invulnerable',
                upgrade: 'upgrade',
            }, COMMON_SPAWN_SCOPE, COMMON_SCOPE);
            propNumFactory(SPAWN_POWERUP, 'ticksSinceSpawn');
            return SPAWN_POWERUP;
        },
        validate(funcRet) {
            // Can't explicitly check for null here
            // since we set it to return undefined sometimes
            if (funcRet && !POWERUP.powerUpType.includes(funcRet))
                throw TypeError('The spawnPowerup function must return a powerUpType.');
        },
    },
    activatePowerup: {
        name: 'activatePowerup',
        args: [],
        modelProp: 'activatePowerupCode',
        perLevel: false,
        getScope() {
            const POWERUP_SCOPE = Object.assign({}, POWERUP, COMMON_SCOPE);
            propNumFactory(POWERUP_SCOPE.ship, 'invulnerableTimer');
            propNumFactory(POWERUP_SCOPE.ship, 'shrinkTimer');
            propNumFactory(POWERUP_SCOPE.ship, 'attractTimer');
            return POWERUP_SCOPE;
        },
        validate() {
            // eslint-disable-line no-empty-function
        },
    },
};

var LSUserFunction = GObject.registerClass({
    Properties: {
        'needs-attention': GObject.ParamSpec.boolean('needs-attention', 'Needs attention',
            'Display an indicator on the button that it needs attention',
            GObject.ParamFlags.READWRITE, false),
    },
}, class LSUserFunction extends Gtk.Frame {
    _init(userFunctionName, props = {}) {
        super._init(props);

        this._codeview = new Codeview();
        this._codeview.userFunction = userFunctionName;

        this._codeview.connect('should-compile',
            (widget, userInitiated) => this._compile(userInitiated));

        this.add(this._codeview);

        this.get_style_context().add_class('user-function');
    }

    bindGlobal(model) {
        this._global = model;
        const {perLevel, modelProp} = USER_FUNCTIONS[this._codeview.userFunction];

        if (perLevel) {
            this._globalNotifyHandler = model.connect('notify',
                this._onGlobalNotify.bind(this));
            this._currentLevel = model.currentLevel;
            this._bindModel(this._global.getModel(this._currentLevel));
        } else {
            this._globalNotifyHandler = model.connect(`notify::${modelProp}`,
                this._setCode.bind(this));
            this._setCode();
        }
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
        this._bindModel(this._global.getModel(this._currentLevel));
        this.set_property('needs-attention', false);
    }

    _unbindLevelModel() {
        if (this._model && this._notifyHandler) {
            this._model.disconnect(this._notifyHandler);
            this._notifyHandler = null;
        }

        this._model = null;
    }

    _bindModel(model) {
        if (this._model)
            this._unbindLevelModel();

        this._model = model;
        const {modelProp} = USER_FUNCTIONS[this._codeview.userFunction];
        this._notifyHandler = model.connect(`notify::${modelProp}`, this._setCode.bind(this));
        this._setCode();
    }

    _setCode() {
        const {name, args, perLevel, modelProp} = USER_FUNCTIONS[this._codeview.userFunction];
        let code;
        if (perLevel)
            code = this._model[modelProp];
        else
            code = this._global[modelProp];

        this._codeview.text = `function ${name}(${args.join(', ')}) {
${code}
}`;
    }

    _updateCode(funcBody) {
        const {perLevel, modelProp} = USER_FUNCTIONS[this._codeview.userFunction];
        // Block the normal notify handler that updates the code view, since we
        // are propagating updates from the codeview to the GUI.
        if (perLevel) {
            GObject.signal_handler_block(this._model, this._notifyHandler);
            try {
                this._model[modelProp] = funcBody;
            } finally {
                GObject.signal_handler_unblock(this._model, this._notifyHandler);
            }
        } else {
            GObject.signal_handler_block(this._global, this._globalNotifyHandler);
            try {
                this._global[modelProp] = funcBody;
            } finally {
                GObject.signal_handler_unblock(this._global, this._globalNotifyHandler);
            }
        }
    }

    _compile(userInitiated = true) {
        const {name, args, getScope, validate} = USER_FUNCTIONS[this._codeview.userFunction];
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
            this.set_property('needs-attention', true);
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
            const ret = userFunction();
            validate(ret);
        } catch (e) {
            this._codeview.setCompileResultsFromException(e);
            this.set_property('needs-attention', true);
            return;
        }

        this._codeview.setCompileResults([]);
        this.set_property('needs-attention', false);
        const funcBody = this._codeview.getFunctionBody(name);
        // If _updateCode is called when userInitiated is false
        // then the result is an infinite loop
        if (userInitiated)
            this._updateCode(funcBody);
    }

    discardChanges() {
        this._setCode();
        this.set_property('needs-attention', false);
    }
});
