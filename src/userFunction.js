/* exported UserFunction */

const {GObject, Gtk} = imports.gi;

const {Codeview} = imports.codeview;

class InstructionError extends Error {
}

var UserFunction = GObject.registerClass({
    Properties: {
        'needs-attention': GObject.ParamSpec.boolean('needs-attention', 'Needs attention',
            'Display an indicator on the button that it needs attention',
            GObject.ParamFlags.READWRITE, false),
    },
}, class UserFunction extends Gtk.Frame {
    _init(userFunctionName, props = {}) {
        super._init(props);
        this._codeview = new Codeview();
        this._codeview.userFunction = userFunctionName;
        this._codeview.connect('should-compile',
            (widget, userInitiated) => this._compile(userInitiated));

        this.add(this._codeview);

        this.get_style_context().add_class('user-function');
    }

    bindGlobalModel(model) {
        this._global = model;
        const {perLevel, modelProp} = this.USER_FUNCTIONS[this._codeview.userFunction];

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
        this.set_property('needs-attention', false);
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
        const {modelProp} = this.USER_FUNCTIONS[this._codeview.userFunction];
        this._notifyHandler = model.connect(`notify::${modelProp}`, this._setCode.bind(this));
        this._setCode();
    }

    _setCode() {
        const {name, args, perLevel, modelProp} = this.USER_FUNCTIONS[
            this._codeview.userFunction
        ];
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
        const {perLevel, modelProp} = this.USER_FUNCTIONS[this._codeview.userFunction];
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
        const {name, args, getScope, validate} = this.USER_FUNCTIONS[
            this._codeview.userFunction
        ];
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
            this._codeview.setCompileResultsFromException(e, userInitiated);
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
            }], userInitiated);
            this.set_property('needs-attention', true);
            return;
        }

        try {
            userFunction();
        } catch (e) {
            this.set_property('needs-attention', true);
            // Only send erroneous code for Sidetrack
            if (e instanceof InstructionError) {
                this._codeview.setCompileResultsFromUserFunctionException(e, userInitiated);
                const funcBody = this._codeview.getFunctionBody(name);

                if (userInitiated)
                    this._updateCode(funcBody);
            } else {
                this._codeview.setCompileResultsFromException(e, userInitiated);
            }
            return;
        }

        try {
            validate();
        } catch (e) {
            this._codeview.setCompileResultsFromException(e, userInitiated);
            const funcBody = this._codeview.getFunctionBody(name);
            // Only send erroneous code for Sidetrack
            if (userInitiated && e instanceof InstructionError)
                this._updateCode(funcBody);

            this.set_property('needs-attention', true);
            return;
        }

        this._codeview.setCompileResults([], userInitiated);
        this.set_property('needs-attention', false);
        const funcBody = this._codeview.getFunctionBody(name);

        if (userInitiated)
            this._updateCode(funcBody);
    }
});
