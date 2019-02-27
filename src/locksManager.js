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
        if (!key.startsWith('item.key.') && !key.startsWith('lock.'))
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

    setUsed(key) {
        try {
            const [variant] = this._proxy.GetSync(key);
            const dict = new GLib.VariantDict(variant);
            dict.insert_value('used', new GLib.Variant('b', true));
            this._proxy.SetSync(key, dict.end());
        } catch (error) {
            logError(error);
        }
    }

    isUnlocked(lock) {
        return !this._proxy.getDictValueSync(lock, 'locked', true);
    }

    setUnlocked(lock) {
        const variant = new GLib.Variant('a{sb}', {locked: false});
        this._proxy.SetSync(lock, variant);
    }

    getTrapSequence(lock) {
        return this._proxy.getDictValueSync(lock, 'trap_sequence');
    }

    setLockTried(lock, tried) {
        try {
            const [variant] = this._proxy.GetSync(lock);
            const dict = new GLib.VariantDict(variant);
            dict.insert_value('tried', new GLib.Variant('b', tried));
            this._proxy.SetSync(lock, dict.end());
        } catch (error) {
            const variant2 = new GLib.Variant('a{sb}', {tried});
            this._proxy.SetSync(lock, variant2);
        }
    }
});
