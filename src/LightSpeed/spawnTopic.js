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
        this._spawnEnemy.connect('notify::needs-attention',
            this._notifyNeedsAttention.bind(this));
        this.add(this._spawnEnemy);

        this._spawnPowerup = new LSUserFunction('spawnPowerup');
        this._spawnPowerup.connect('notify::needs-attention',
            this._notifyNeedsAttention.bind(this));
        this.add(this._spawnPowerup);
    }

    _notifyNeedsAttention() {
        this.notify('needs-attention');
    }

    get needs_attention() {
        return this._spawnEnemy.needs_attention || this._spawnPowerup.needs_attention;
    }

    bindGlobalModel(model) {
        this._spawnEnemy.bindGlobalModel(model);
        this._spawnPowerup.bindGlobalModel(model);
    }

    unbindGlobalModel() {
        this._spawnEnemy.unbindGlobalModel();
        this._spawnPowerup.unbindGlobalModel();
    }

    discardChanges() {
        this._spawnEnemy.discardChanges();
        this._spawnPowerup.discardChanges();
    }
});
