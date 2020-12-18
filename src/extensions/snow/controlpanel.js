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
/* exported SnowControlPanel */

const {GObject, Gtk} = imports.gi;
const {Codeview} = imports.codeview;
const {Section} = imports.section;
const {SpinInput} = imports.spinInput;
const {PopupMenu} = imports.popupMenu;

GObject.type_ensure(Codeview.$gtype);
GObject.type_ensure(Section.$gtype);
GObject.type_ensure(SpinInput.$gtype);

const VALID_VARIABLES = ['max', 'duration', 'myFlakes', 'initialFlakes', 'meltDuration'];

var SnowFlake = GObject.registerClass({
}, class SnowFlake extends Gtk.Box {
    _init(props = {}) {
        super._init({
            halign: Gtk.Align.FILL,
            orientation: Gtk.Orientation.VERTICAL,
        });

        this._label = new Gtk.Label();
        this._label.set_markup(`<span size="xx-large">${props.flake}</span>`);
        this.add(this._label);
        this.show_all();
    }
});

var SnowControlPanel = GObject.registerClass({
    GTypeName: 'SnowControlPanel',
    Template: 'resource:///com/hack_computer/HackToolbox/Extensions/snow/controlpanel.ui',
    InternalChildren: [
        'codeview',
        'flakesButton',
        'maxAdjustment',
        'durationAdjustment',
        'meltAdjustment',
        'initialAdjustment',
    ],
}, class SnowControlPanel extends Gtk.Grid {
    _init(model, props = {}) {
        super._init(props);
        const flakesChoices = {
            snow: '❄',
            santa: '🎅',
            snowman: '⛄',
            cat: '🐱',
        };

        this._model = model;

        this._flakesGroup = new PopupMenu(
            this._flakesButton, flakesChoices, SnowFlake, 'flake');
        this.fillAdjustements();

        this._flakesGroup.connect('notify::value', () => {
            this._model.setFlakes(this._flakesGroup.value);
            this.regenerateCode();
        });

        this._maxAdjustment.connect('value-changed', () => {
            const {value} = this._maxAdjustment;
            this._model.setVariable('_max', value);
            this.regenerateCode();
        });

        this._durationAdjustment.connect('value-changed', () => {
            const {value} = this._durationAdjustment;
            this._model.setVariable('_duration', value);
            this.regenerateCode();
        });

        this._meltAdjustment.connect('value-changed', () => {
            const {value} = this._meltAdjustment;
            this._model.setVariable('_meltDuration', value);
            this.regenerateCode();
        });

        this._initialAdjustment.connect('value-changed', () => {
            const {value} = this._initialAdjustment;
            this._model.setVariable('_initialFlakes', value);
            this.regenerateCode();
        });

        this._codeview.minContentHeight = 424;
        this.regenerateCode();

        this._codeview.connect('should-compile',
            (widget, userInitiated) => this._compile(userInitiated));
    }

    fillAdjustements() {
        this._maxAdjustment.value = this._model.getVariable('_max');
        this._durationAdjustment.value = this._model.getVariable('_duration');
        this._meltAdjustment.value = this._model.getVariable('_meltDuration');
        this._initialAdjustment.value = this._model.getVariable('_initialFlakes');
    }

    regenerateCode() {
        this._codeview.text = `
max = ${this._model.getVariable('_max')};
myFlakes = ${JSON.stringify(this._model.getVariable('_myFlakes'))};
duration = ${this._model.getVariable('_duration')};
meltDuration = ${this._model.getVariable('_meltDuration')};
initialFlakes = ${this._model.getVariable('_initialFlakes')};
`;
    }

    _compile(userInitiated) {
        const code = this._codeview.text;

        if (code === '')
            return;

        const scope = {};
        VALID_VARIABLES.forEach(name => {
            scope[name] = null;
        });
        try {
            // eslint-disable-next-line no-new-func
            const func = new Function('scope', `with(scope){\n${code}\n;}`);
            func(scope);
        } catch (e) {
            if (!(e instanceof SyntaxError || e instanceof ReferenceError))
                throw e;
            this._codeview.setCompileResultsFromException(e, true, -3);
            return;
        }

        if (VALID_VARIABLES.every(prop => scope[prop] === null))
            return;

        // Validate limits
        if (!this._validateLimits(scope.initialFlakes, this._initialAdjustment, 6))
            return;
        if (!this._validateLimits(scope.max, this._maxAdjustment, 2))
            return;
        if (!this._validateLimits(scope.duration, this._durationAdjustment, 4))
            return;
        if (!this._validateLimits(scope.meltDuration, this._meltAdjustment, 5))
            return;

        this._codeview.setCompileResults([]);

        if (userInitiated) {
            this._model.setVariable('_initialFlakes', scope.initialFlakes);
            this._model.setVariable('_max', scope.max);
            this._model.setVariable('_myFlakes', scope.myFlakes);
            this._model.setVariable('_duration', scope.duration);
            this._model.setVariable('_meltDuration', scope.meltDuration);
            this.fillAdjustements();
        }
    }

    _validateLimits(value, adjustement, line = 1) {
        const upper = adjustement.get_upper();
        const lower = adjustement.get_lower();
        if (typeof value !== 'number' || value > upper || value < lower) {
            this._codeview.setCompileResults([{
                start: {line: line, column: 0},
                message: `The value should be a number between ${lower} and ${upper}`,
            }]);
            return false;
        }

        return true;
    }
});
