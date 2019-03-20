/* exported LSToolbox */

const {Gio, GLib, GObject, Gtk} = imports.gi;
const Signals = imports.signals;

const GameState = imports.gameState;
const {LSCombinedTopic} = imports.LightSpeed.controlpanel;
const {LSGlobalModel} = imports.LightSpeed.globalParams;
const {LSUserFunction} = imports.LightSpeed.userFunction;
const {Toolbox} = imports.toolbox;

var LSToolbox = GObject.registerClass(class LSToolbox extends Toolbox {
    _init(appId, props = {}) {
        super._init(appId, props);

        const iconTheme = Gtk.IconTheme.get_default();
        iconTheme.add_resource_path('/com/endlessm/HackToolbox/LightSpeed/icons');

        this._model = new LSGlobalModel();

        this._combinedTopic = new LSCombinedTopic();
        this._combinedTopic.bindModel(this._model);
        this.addTopic('game', 'Game', 'rocket-symbolic', this._combinedTopic);

        this._spawnEnemyTopic = new LSUserFunction('spawnEnemy');
        this._spawnEnemyTopic.bindModel(this._model);
        this.addTopic('spawnEnemy', 'Spawn', 'spawn-symbolic',
            this._spawnEnemyTopic);
        this.hideTopic('spawnEnemy');

        this._updateAsteroidTopic = new LSUserFunction('updateAsteroid');
        this._updateAsteroidTopic.bindModel(this._model);
        this.addTopic('updateAsteroid', 'Asteroid', 'asteroid-symbolic',
            this._updateAsteroidTopic);
        this.hideTopic('updateAsteroid');

        this._updateSpinnerTopic = new LSUserFunction('updateSpinner');
        this._updateSpinnerTopic.bindModel(this._model);
        this.addTopic('updateSpinner', 'Spinner', 'spinner-symbolic',
            this._updateSpinnerTopic);
        this.hideTopic('updateSpinner');

        this._updateSquidTopic = new LSUserFunction('updateSquid');
        this._updateSquidTopic.bindModel(this._model);
        this.addTopic('updateSquid', 'Squid', 'squid-symbolic',
            this._updateSquidTopic);
        this.hideTopic('updateSquid');

        this._updateBeamTopic = new LSUserFunction('updateBeam');
        this._updateBeamTopic.bindModel(this._model);
        this.addTopic('updateBeam', 'Beam', 'beam-symbolic',
            this._updateBeamTopic);
        this.hideTopic('updateBeam');

        this._updateLevelInfo();
        this.show_all();

        this._updateLevelHandler = this._model.connect('notify::currentLevel',
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
        let text = `Level ${this._model.currentLevel}`;
        if (this._model.currentLevel === 0)
            text = 'Intro';
        this.setInfo(text);
    }

    _onReset() {
        Gio.DBus.session.call_sync('com.endlessm.LightSpeed',
            '/com/endlessm/LightSpeed', 'org.gtk.Actions', 'Activate',
            new GLib.Variant('(sava{sv})', ['reset', [], {}]),
            null, Gio.DBusCallFlags.NONE, -1, null);
        this._combinedTopic.reset();
        // The user functions are reset by the LightSpeed app already
    }

    async _showTopicsInitially() {
        const topics = ['spawnEnemy', 'updateAsteroid', 'updateSpinner',
            'updateSquid', 'updateBeam'];
        const gameState = GameState.getDefault();

        await Promise.all(topics.map(async topic => {
            const key = `lightspeed.topic.${topic}`;
            const revealed = await gameState.getDictValue(key, 'visible', false);
            if (revealed)
                this.showTopic(topic);
        }));

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

        if (this._model && this._updateLevelHandler) {
            this._model.disconnect(this._updateLevelHandler);
            this._model = null;
            this._updateLevelHandler = 0;
        }

        this._combinedTopic.unbindModel();
        this._spawnEnemyTopic.unbindModel();
        this._updateAsteroidTopic.unbindModel();
        this._updateSpinnerTopic.unbindModel();
        this._updateSquidTopic.unbindModel();
        this._updateBeamTopic.unbindModel();
    }
});
