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
/* exported LSCombinedTopic */

const {GLib, GObject, Gtk} = imports.gi;

const {Codeview} = imports.codeview;
const {PopupMenu} = imports.popupMenu;
const {Section} = imports.section;
const SoundServer = imports.soundServer;
const {SpinInput} = imports.spinInput;

GObject.type_ensure(Codeview.$gtype);
GObject.type_ensure(Section.$gtype);
GObject.type_ensure(SpinInput.$gtype);

const VALID_SHIPS = ['spaceship', 'daemon', 'unicorn'];
const VALID_VARIABLES = ['scoreTarget', 'astronautSize', 'shipAsset',
    'shipSize', 'shipSpeed'];

var LSCombinedTopic = GObject.registerClass({
    GTypeName: 'LSCombinedTopic',
    Properties: {
        'needs-attention': GObject.ParamSpec.boolean('needs-attention', 'Needs attention',
            'Display an indicator on the button that it needs attention',
            GObject.ParamFlags.READWRITE, false),
    },
    Template: 'resource:///com/hack_computer/HackToolbox/LightSpeed/panel.ui',
    InternalChildren: ['astronautSizeAdjustment', 'scoreTargetAdjustment',
        'shipAssetButton', 'shipSizeAdjustment', 'shipSpeedAdjustment',
        'variablesCodeview'],
}, class LSCombinedTopic extends Gtk.Grid {
    _init(props = {}) {
        this._lastCodeviewSoundMicrosec = 0;
        super._init(props);

        const shipInfo = {};
        VALID_SHIPS.forEach(id => {
            shipInfo[id] = `/com/hack_computer/HackToolbox/LightSpeed/ships/${id}.png`;
        });
        this._shipAssetMenu = new PopupMenu(this._shipAssetButton, shipInfo,
            Gtk.Image, 'resource');

        this._variablesCodeview.connect('should-compile',
            (widget, userInitiated) => this._compile(userInitiated));
    }

    bindGlobal(model) {
        this._global = model;
        this._globalNotifyHandler = model.connect('notify', this._onGlobalNotify.bind(this));

        this._currentLevel = model.currentLevel;
        this._bindModel(this._global.getModel(this._currentLevel));
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

    _bindModel(model) {
        this._unbindLevelModel();
        this._model = model;
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
        const bindingInfo = {
            scoreTarget: this._scoreTargetAdjustment,
            astronautSize: this._astronautSizeAdjustment,
            shipAsset: this._shipAssetMenu,
            shipSize: this._shipSizeAdjustment,
            shipSpeed: this._shipSpeedAdjustment,
        };
        this._bindings = Object.entries(bindingInfo).map(([prop, target]) =>
            model.bind_property(prop, target, 'value', flags));
        this._notifyHandler = this._model.connect(
            'notify', (object, pspec) => this._onNotify(pspec));
        this._regenerateCode();
    }

    bindWindow(win) {
        win.lockscreen.key = 'item.key.lightspeed.1';
        win.lockscreen.lock = 'lock.lightspeed.1';
        void this;
    }

    _compile(userInitiated = true) {
        const code = this._variablesCodeview.text;

        if (code === '')
            return;

        const scope = {};
        VALID_VARIABLES.forEach(name => {
            scope[name] = null;
        });
        VALID_SHIPS.forEach(name => {
            scope[name] = name;
        });
        try {
            // eslint-disable-next-line no-new-func
            const func = new Function('scope', `with(scope){\n${code}\n;}`);
            func(scope);
        } catch (e) {
            if (!(e instanceof SyntaxError || e instanceof ReferenceError))
                throw e;
            this._variablesCodeview.setCompileResultsFromException(e);
            this.set_property('needs-attention', true);
            return;
        }

        if (VALID_VARIABLES.every(prop => scope[prop] === null))
            return;

        const errors = this._searchForErrors(scope);
        if (errors.length > 0) {
            this._variablesCodeview.setCompileResults(errors);
            this.set_property('needs-attention', true);
            return;
        }

        this._variablesCodeview.setCompileResults([]);
        this.set_property('needs-attention', false);

        // Block the normal notify handlers that update the code view, since we
        // are propagating updates from the codeview to the GUI. Instead,
        // connect a temporary handler that lets us know if anything actually
        // did change.
        if (userInitiated) {
            GObject.signal_handler_block(this._model, this._notifyHandler);

            let guiUpdated = false;
            const tempHandler = this._model.connect('notify', () => {
                guiUpdated = true;
            });

            try {
                this._model.scoreTarget = scope.scoreTarget;
                this._model.astronautSize = scope.astronautSize;
                this._model.shipAsset = scope.shipAsset;
                this._model.shipSize = scope.shipSize;
                this._model.shipSpeed = scope.shipSpeed;
            } finally {
                this._model.disconnect(tempHandler);
                GObject.signal_handler_unblock(this._model, this._notifyHandler);
            }

            if (guiUpdated)
                SoundServer.getDefault().play('hack-toolbox/update-gui');
        }
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
            astronautSize: 30,
            shipSize: 50,
            shipSpeed: 500,
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

    _onNotify(pspec) {
        const props = [
            'scoreTarget',
            'astronautSize',
            'shipAsset',
            'shipSize',
            'shipSpeed',
        ];
        if (props.includes(pspec.name))
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
        this.set_property('needs-attention', false);
    }

    _regenerateCode() {
        this._variablesCodeview.text =
`scoreTarget = ${this._model.scoreTarget};

astronautSize = ${this._model.astronautSize};

shipAsset = ${this._model.shipAsset};
shipSize = ${this._model.shipSize};
shipSpeed = ${this._model.shipSpeed};
`;
    }
});
