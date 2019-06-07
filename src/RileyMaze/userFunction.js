/* exported RMZUserFunction */

const {GObject} = imports.gi;

const {UserFunction, InstructionError} = imports.userFunction;

const FORWARD = 1;
const UP = 2;
const DOWN = 3;
const JUMP = 4;
const PUSH = 5;
const MAX_QUEUE_LEN = 8;

class UnitError extends TypeError {
}

const RILEY = {
    // Keep this in sync with riley class in
    // hack-toy-apps/com.endlessm.RileyMaze/parameters.js
    queue: [],
    forward() {
        this.queue.push(FORWARD);

        if (this.queue.length > MAX_QUEUE_LEN)
            throw new InstructionError('Instructions must have 8 moves.');
    },

    up() {
        this.queue.push(UP);

        if (this.queue.length > MAX_QUEUE_LEN)
            throw new InstructionError('Instructions must have 8 moves.');
    },

    down() {
        this.queue.push(DOWN);

        if (this.queue.length > MAX_QUEUE_LEN)
            throw new InstructionError('Instructions must have 8 moves.');
    },

    jump() {
        this.queue.push(JUMP);

        if (this.queue.length > MAX_QUEUE_LEN)
            throw new InstructionError('Instructions must have 8 moves.');
    },

    push() {
        this.queue.push(PUSH);

        if (this.queue.length > MAX_QUEUE_LEN)
            throw new InstructionError('Instructions must have 8 moves.');
    },
};

const HANDLER = {
    get(target, name, receiver) {
        if (name in target)
            return Reflect.get(target, name, receiver);

        throw new InstructionError(`Unknown instruction ${name}`);
    },
};

const proxy = new Proxy(RILEY, HANDLER);

const INSTRUCTION_SCOPE = {
    riley: proxy,
};

const COMMON_SCOPE = {
    // Keep this in sync with UserScope class in
    // hack-toy-apps/com.endlessm.RileyMaze/parameters.js
    width: 1920,
    height: 1080,
    data: {},
};

const POSITION_HANDLER = {
    set(obj, prop, value) {
        if ((prop === 'rileyPosition' || prop === 'goalPosition') &&
            Number.isNaN(Number(value)))
            throw new TypeError(`Value for ${prop} must be a number.`);
        else if ((prop === 'rileyPosition' || prop === 'goalPosition') &&
            (value < 0 || value > 4))
            throw new RangeError(`${prop} must be between 0 and 4.`);
        else
            return Reflect.set(obj, prop, value);
    },
};

const UNITS = ['wall', 'pit', 'robotA', 'robotB'];
const LEVEL_EDIT_SCOPE = {
    wall: 'wall',
    pit: 'pit',
    robotA: 'robotA',
    robotB: 'robotB',
    rileyPosition: 0,
    goalPosition: 2,
    add(unit, x, y) {
        if (Number.isNaN(Number(x)))
            throw new TypeError(`${x} isn't a number.`);

        if (Number.isNaN(Number(y)))
            throw new TypeError(`${y} isn't a number.`);

        if (!UNITS.includes(unit))
            throw new UnitError(`${unit} isn't a valid unit.`);

        if (x < 0 || x > 7)
            throw new RangeError('x must be between 0 and 7.');

        if (y < 0 || y > 4)
            throw new RangeError('y must be between 0 and 4.');
    },
};

const USER_FUNCTIONS = {
    instructions: {
        name: 'instructions',
        args: [],
        modelProp: 'instructionCode',
        perLevel: true,
        getScope() {
            INSTRUCTION_SCOPE.riley.queue.length = 0;
            return Object.assign({}, COMMON_SCOPE, INSTRUCTION_SCOPE);
        },
        validate() {
            if (INSTRUCTION_SCOPE.riley.queue.length < MAX_QUEUE_LEN)
                throw new InstructionError('Instructions must have 8 moves.');
        },
    },
    level: {
        name: 'level',
        args: [],
        modelProp: 'levelCode',
        perLevel: true,
        getScope() {
            const SCOPE_OBJ = Object.assign({}, COMMON_SCOPE, LEVEL_EDIT_SCOPE);
            return new Proxy(SCOPE_OBJ, POSITION_HANDLER);
        },
        validate() {
            // eslint-disable-line no-empty-function
        },
    },
};


var RMZUserFunction = GObject.registerClass(class RMZUserFunction extends UserFunction {
    _init(userFunctionName, props = {}) {
        this.USER_FUNCTIONS = USER_FUNCTIONS;
        super._init(userFunctionName, props);
    }

    _onGlobalNotify() {
        if (this._global.currentLevel === this._currentLevel)
            return;
        this._currentLevel = this._global.currentLevel;
        this._bindLevelModel(this._global.getModel(this._currentLevel));
    }

    discardChanges() {
        this._setCode();
    }
});
