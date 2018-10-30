/* exported LocksManager */

const {GLib, GObject} = imports.gi;

const GameState = imports.gameState;

var LocksManager = GObject.registerClass({
    Signals: {
        changed: {
            flags: GObject.SignalFlags.RUN_FIRST | GObject.SignalFlags.DETAILED,
        },
    },
}, class LocksManager extends GObject.Object {
    _init(props = {}) {
        super._init(props);
        this._proxy = GameState.getDefault();
        this._proxy.connect('g-signal', this._onChanged.bind(this));
    }

    _onChanged(proxy, sender, signal, params) {
        if (signal !== 'changed')
            return;
        const key = params.get_child_value(0).deep_unpack();
        if (!key.startsWith('item.key'))
            return;
        this.emit(`changed::${key}`);
    }

    hasKey(key) {
        try {
            this._proxy.GetSync(key);
            return true;
        } catch (error) {
            return false;
        }
    }

    isUnlocked(key) {
        try {
            const [variant] = this._proxy.GetSync(key);
            return variant.deep_unpack()
                          .used
                          .deep_unpack();
        } catch (error) {
            return false;
        }
    }

    setUnlocked(key) {
        const variant = new GLib.Variant('a{sb}', {used: true});
        this._proxy.SetSync(key, variant);
    }
});
