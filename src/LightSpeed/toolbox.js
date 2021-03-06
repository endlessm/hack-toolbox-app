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
/* exported LSToolbox */

const {Gio, GLib, GObject, Gtk} = imports.gi;
const Signals = imports.signals;

const GameState = imports.gameState;
const {LSCombinedTopic} = imports.LightSpeed.controlpanel;
const {LSGlobalModel} = imports.LightSpeed.globalParams;
const {LSSpawnTopic} = imports.LightSpeed.spawnTopic;
const {LSUserFunction} = imports.LightSpeed.userFunction;
const {Toolbox} = imports.toolbox;

var LSToolbox = GObject.registerClass(class LSToolbox extends Toolbox {
    _init(appId, props = {}) {
        super._init(appId, props);

        const iconTheme = Gtk.IconTheme.get_default();
        iconTheme.add_resource_path('/com/hack_computer/HackToolbox/LightSpeed/icons');

        this._global = new LSGlobalModel();

        this._combinedTopic = new LSCombinedTopic();
        this._combinedTopic.bindGlobal(this._global);
        this.addTopic('game', 'Game', 'rocket-symbolic', this._combinedTopic);
        this.selectTopic('game');

        this._spawnTopic = new LSSpawnTopic();
        this._spawnTopic.bindGlobal(this._global);
        this.addTopic('spawn', 'Spawn', 'spawn-symbolic', this._spawnTopic);
        this.hideTopic('spawn');

        this._updateAsteroidTopic = new LSUserFunction('updateAsteroid');
        this._updateAsteroidTopic.bindGlobal(this._global);
        this.addTopic('updateAsteroid', 'Asteroid', 'asteroid-symbolic',
            this._updateAsteroidTopic);
        this.hideTopic('updateAsteroid');

        this._updateSpinnerTopic = new LSUserFunction('updateSpinner');
        this._updateSpinnerTopic.bindGlobal(this._global);
        this.addTopic('updateSpinner', 'Spinner', 'spinner-symbolic',
            this._updateSpinnerTopic);
        this.hideTopic('updateSpinner');

        this._updateSquidTopic = new LSUserFunction('updateSquid');
        this._updateSquidTopic.bindGlobal(this._global);
        this.addTopic('updateSquid', 'Squid', 'squid-symbolic',
            this._updateSquidTopic);
        this.hideTopic('updateSquid');

        this._updateBeamTopic = new LSUserFunction('updateBeam');
        this._updateBeamTopic.bindGlobal(this._global);
        this.addTopic('updateBeam', 'Beam', 'beam-symbolic',
            this._updateBeamTopic);
        this.hideTopic('updateBeam');

        this._activatePowerupTopic = new LSUserFunction('activatePowerup');
        this._activatePowerupTopic.bindGlobal(this._global);
        this.addTopic('activatePowerup', 'Power-Up', 'powerup-symbolic',
            this._activatePowerupTopic);
        this.hideTopic('activatePowerup');

        this._updateLevelInfo();
        this.show_all();

        this._updateLevelHandler = this._global.connect('notify::currentLevel',
            this._updateLevelInfo.bind(this));
        this.connect('reset', this._onReset.bind(this));

        this._showTopicsInitially()
            .catch(err => logError(err, 'Error showing topics initially'));
    }

    bindWindow(win) {
        win.get_style_context().add_class('LightSpeed');
        this._combinedTopic.bindWindow(win);
    }

    _updateLevelInfo() {
        let text = `Level ${this._global.currentLevel}`;
        if (this._global.currentLevel === 0)
            text = 'Intro';
        this.setInfo(text);
    }

    _onReset() {
        Gio.DBus.session.call_sync('com.hack_computer.LightSpeed',
            '/com/hack_computer/LightSpeed', 'org.gtk.Actions', 'Activate',
            new GLib.Variant('(sava{sv})', ['reset', [], {}]),
            null, Gio.DBusCallFlags.NONE, -1, null);
        this._combinedTopic.reset();

        // In the case where there's an error in a code view, it will not have
        // been synced to the Lightspeed game state. Any discrepancies between
        // the code view and the game state must be discarded.
        this._spawnTopic.discardChanges();
        this._updateAsteroidTopic.discardChanges();
        this._updateSpinnerTopic.discardChanges();
        this._updateSquidTopic.discardChanges();
        this._updateBeamTopic.discardChanges();
        this._activatePowerupTopic.discardChanges();
    }

    async _showTopicsInitially() {
        const topics = ['spawn', 'updateAsteroid', 'updateSpinner',
            'updateSquid', 'updateBeam', 'activatePowerup'];
        const gameState = GameState.getDefault();

        await Promise.all(topics.map(async topic => {
            const key = `lightspeed.topic.${topic}`;
            try {
                const revealed = await gameState.getDictValue(key, 'visible', false);
                if (revealed)
                    this.showTopic(topic);
            } catch (e) {
                // fail conservatively
                this.showTopic(topic);
            }
        }));

        // Backwards compatibility with old game state
        if (!this.isTopicVisible('spawn')) {
            try {
                const revealed = await gameState.getDictValue(
                    'lightspeed.topic.spawnEnemy', 'visible', false);
                if (revealed)
                    this.showTopic('spawn');
            } catch (e) {
                this.showTopic('spawn');
            }
        }

        Signals._connect.call(gameState, 'changed', this._onGameStateChanged.bind(this));
    }

    _onGameStateChanged(self, senderName, [key, value]) {
        if (!key.startsWith('lightspeed.topic.'))
            return;
        const topic = key.slice('lightspeed.topic.'.length);
        let {visible} = value.deep_unpack();
        if (visible instanceof GLib.Variant)
            visible = visible.deep_unpack();
        if (visible)
            this.revealTopic(topic);
        else
            this.hideTopic(topic);
    }

    shutdown() {
        super.shutdown();

        if (this._global && this._updateLevelHandler) {
            this._global.disconnect(this._updateLevelHandler);
            this._global = null;
            this._updateLevelHandler = null;
        }

        this._combinedTopic.unbindGlobalModel();
        this._spawnTopic.unbindGlobalModel();
        this._updateAsteroidTopic.unbindGlobalModel();
        this._updateSpinnerTopic.unbindGlobalModel();
        this._updateSquidTopic.unbindGlobalModel();
        this._updateBeamTopic.unbindGlobalModel();
        this._activatePowerupTopic.unbindGlobalModel();
    }
});
