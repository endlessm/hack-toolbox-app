/* exported LSSpawnTopic */

const {GObject, Gtk} = imports.gi;

const {LSUserFunction} = imports.LightSpeed.userFunction;

var LSSpawnTopic = GObject.registerClass({
    Properties: {
        'needs-attention': GObject.ParamSpec.boolean('needs-attention', 'Needs attention',
            'Display an indicator on the button that it needs attention',
            GObject.ParamFlags.READWRITE, false),
    },
}, class LSSpawnTopic extends Gtk.Grid {
    _init(props = {}) {
        props.orientation = Gtk.Orientation.VERTICAL;
        super._init(props);

        this._spawnEnemy = new LSUserFunction('spawnEnemy');
        this.add(this._spawnEnemy);

        this._spawnPowerup = new LSUserFunction('spawnPowerup');
        this.add(this._spawnPowerup);
    }

    bindGlobal(model) {
        this._spawnEnemy.bindGlobal(model);
        this._spawnPowerup.bindGlobal(model);
    }

    unbindGlobalModel() {
        this._spawnEnemy.unbindGlobalModel();
        this._spawnPowerup.unbindGlobalModel();
    }
});
