/* exported LSToolbox */

const {Gio, GLib, GObject, Gtk} = imports.gi;

const {Toolbox} = imports.toolbox;
const {LSCombinedTopic} = imports.LightSpeed.controlpanel;
const {LSGlobalModel} = imports.LightSpeed.globalParams;
const {LSUserFunction} = imports.LightSpeed.userFunction;

var LSToolbox = GObject.registerClass(class LSToolbox extends Toolbox {
    _init(appId, props = {}) {
        super._init(appId, props);

        const iconTheme = Gtk.IconTheme.get_default();
        iconTheme.add_resource_path('/com/endlessm/HackToolbox/LightSpeed/icons');

        this._global = new LSGlobalModel();

        this._combinedTopic = new LSCombinedTopic();
        this._combinedTopic.bindGlobal(this._global);
        this.addTopic('Game', 'rocket-symbolic', this._combinedTopic);

        this._spawnEnemyTopic = new LSUserFunction('spawnEnemy');
        this._spawnEnemyTopic.bindGlobal(this._global);
        this.addTopic('Enemies', 'astronaut-symbolic', this._spawnEnemyTopic);

        this._updateAsteroidTopic = new LSUserFunction('updateAsteroid');
        this._updateAsteroidTopic.bindGlobal(this._global);
        this.addTopic('Asteroid', 'asteroid-symbolic', this._updateAsteroidTopic);

        this._updateSpinnerTopic = new LSUserFunction('updateSpinner');
        this._updateSpinnerTopic.bindGlobal(this._global);
        this.addTopic('Spinner', 'spinner-symbolic', this._updateSpinnerTopic);

        this._updateSquidTopic = new LSUserFunction('updateSquid');
        this._updateSquidTopic.bindGlobal(this._global);
        this.addTopic('Squid', 'squid-symbolic', this._updateSquidTopic);

        this._updateBeamTopic = new LSUserFunction('updateBeam');
        this._updateBeamTopic.bindGlobal(this._global);
        this.addTopic('Beam', 'beam-symbolic', this._updateBeamTopic);

        this._updateLevelInfo();
        this.show_all();

        this._global.connect('notify::currentLevel', this._updateLevelInfo.bind(this));
        this.connect('reset', this._onReset.bind(this));
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
        Gio.DBus.session.call_sync('com.endlessm.LightSpeed',
            '/com/endlessm/LightSpeed', 'org.gtk.Actions', 'Activate',
            new GLib.Variant('(sava{sv})', ['reset', [], {}]),
            null, Gio.DBusCallFlags.NONE, -1, null);
        this._combinedTopic.reset();
        // The user functions are reset by the LightSpeed app already
    }
});
