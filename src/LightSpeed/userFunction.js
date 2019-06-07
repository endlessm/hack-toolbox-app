/* exported LSUserFunction */

const {GObject} = imports.gi;

const {UserFunction} = imports.userFunction;

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
    // hack-toy-apps/com.endlessm.LightSpeed/userScope.js
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
    // hack-toy-apps/com.endlessm.LightSpeed/userScope.js
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

var LSUserFunction = GObject.registerClass(class LSUserFunction extends UserFunction {
    _init(userFunctionName, props = {}) {
        this.USER_FUNCTIONS = USER_FUNCTIONS;
        super._init(userFunctionName, props);
    }

    discardChanges() {
        this._setCode();
        this.set_property('needs-attention', false);
    }
});
