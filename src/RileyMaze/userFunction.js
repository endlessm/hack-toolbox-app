/* exported RMZUserFunction */

const {GObject, Gtk} = imports.gi;

const {Codeview} = imports.codeview;

const FORWARD = 1;
const UP = 2;
const DOWN = 3;
const JUMP = 4;
const PUSH = 5;
const MAX_QUEUE_LEN = 8;

class InstructionError extends Error {
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

        throw new InstructionError(`unknown instruction ${name}`);
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
            throw new TypeError(`${unit} isn't a valid unit.`);

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
                throw Error('Instructions must have 8 moves.');
        },
    },
    level: {
        name: 'level',
        args: [],
        modelProp: 'levelCode',
        perLevel: true,
        getScope() {
            return Object.assign({}, COMMON_SCOPE, LEVEL_EDIT_SCOPE);
        },
        validate() {
            // eslint-disable-line no-empty-function
        },
    },
};


var RMZUserFunction = GObject.registerClass({
    Properties: {
        'needs-attention': GObject.ParamSpec.boolean('needs-attention', 'Needs attention',
            'Display an indicator on the button that it needs attention',
            GObject.ParamFlags.READWRITE, false),
    },
}, class RMZUserFunction extends Gtk.Frame {
    _init(userFunctionName, props = {}) {
        super._init(props);

        this._codeview = new Codeview();
        this._codeview.userFunction = userFunctionName;

        this._codeview.connect('should-compile', this._compile.bind(this));

        this.add(this._codeview);

        this.get_style_context().add_class('user-function');
    }

    bindGlobalModel(model) {
        this._global = model;
        const {perLevel, modelProp} = USER_FUNCTIONS[this._codeview.userFunction];

        if (perLevel) {
            this._globalNotifyHandler = model.connect('notify',
                this._onGlobalNotify.bind(this));
            this._currentLevel = model.currentLevel;
            this._bindLevelModel(this._global.getModel(this._currentLevel));
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
        this._bindLevelModel(this._global.getModel(this._currentLevel));
    }

    _unbindLevelModel() {
        if (this._model && this._notifyHandler) {
            this._model.disconnect(this._notifyHandler);
            this._notifyHandler = null;
        }

        this._model = null;
    }

    _bindLevelModel(model) {
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

    _compile() {
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
            this.set_property('needs-attention', true);
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
            this.set_property('needs-attention', true);
            return;
        }

        try {
            userFunction();
        } catch (e) {
            this.set_property('needs-attention', true);

            if (e instanceof InstructionError) {
                this._codeview.setCompileResultsFromUserFunctionException(e);
                const funcBody = this._codeview.getFunctionBody(name);
                this._updateCode(funcBody);
            } else {
                this._codeview.setCompileResultsFromException(e);
            }
            return;
        }


        try {
            validate();
        } catch (e) {
            this._codeview.setCompileResultsFromException(e);
            const funcBody = this._codeview.getFunctionBody(name);
            this._updateCode(funcBody);
            this.set_property('needs-attention', true);
            return;
        }

        this._codeview.setCompileResults([]);
        this.set_property('needs-attention', false);
        const funcBody = this._codeview.getFunctionBody(name);
        this._updateCode(funcBody);
    }

    discardChanges() {
        this._setCode();
        this.set_property('needs-attention', false);
    }
});
