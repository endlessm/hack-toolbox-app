/* exported HBModelBase, HBModelGlobal, HBModelObject */

const {Gio, GLib, GObject} = imports.gi;

const ViewName = 'view.JSContext.globalParameters';
const BusName = 'com.endlessm.hackyballs';
const AppObjectPath = '/com/endlessm/hackyballs';
const ClippyIface = `
<node xmlns:doc="http://www.freedesktop.org/dbus/1.0/doc.dtd">
  <interface name='com.endlessm.Clippy'>
    <method name='Set'>
      <arg type='s' name='object' />
      <arg type='s' name='property' />
      <arg type='v' name='value' />
    </method>
    <method name='Get'>
      <arg type='s' name='object' />
      <arg type='s' name='property' />
      <arg type='v' name='value' direction='out'/>
    </method>
    <method name='Connect'>
      <arg type='s' name='object' />
      <arg type='s' name='signal' />
      <arg type='s' name='detail' />
    </method>
    <signal name='ObjectNotify'>
      <arg type='s' name='object' />
      <arg type='s' name='property' />
      <arg type='v' name='value' />
    </signal>
  </interface>
</node>
`;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var HBModelBase = GObject.registerClass({
}, class HBModelBase extends GObject.Object {
    _init(props = {}) {
        super._init(props);
        const Proxy = Gio.DBusProxy.makeProxyWrapper(ClippyIface);
        this._proxy = new Proxy(Gio.DBus.session, BusName, AppObjectPath);
    }

    reset() {
        const props = GObject.Object.list_properties.call(this.constructor.$gtype);
        props.forEach(pspec => {
            this.set_property(pspec.get_name(), pspec.default_value);
        });
    }

    bindProperties(map = {}) {
        const invertMap = {};

        const props = GObject.Object.list_properties.call(this.constructor.$gtype);
        props.forEach(prop => {
            const localProp = prop.get_name();
            const proxyProp = map[localProp] ? map[localProp] : localProp;
            this._bindLocalToProxy(localProp, proxyProp);
            invertMap[proxyProp] = localProp;
        });

        this._proxy.connectSignal('ObjectNotify', (p, s, [, proxyProp, ret]) => {
            const value = ret.deep_unpack();
            const localProp = invertMap[proxyProp] ? invertMap[proxyProp] : proxyProp;
            if (!(localProp in this) || this[localProp] === value)
                return;
            this.set_property(localProp, value);
        });
    }

    _getProxyValue(proxyProperty) {
        // https://gitlab.gnome.org/GNOME/gjs/issues/206
        const params = new GLib.Variant('(ss)', [ViewName, proxyProperty]);
        const value = this._proxy.call_sync('Get', params, 0, -1, null);
        return value.get_child_value(0)
                    .get_variant()
                    .deep_unpack();
    }

    static _getVariantForValue(value) {
        if (typeof value === 'boolean')
            return GLib.Variant.new_boolean(value);
        return GLib.Variant.new_double(value);
    }

    _bindLocalToProxy(localProperty, proxyProperty) {
        this[localProperty] = this._getProxyValue(proxyProperty);
        this._proxy.ConnectSync(ViewName, 'notify', proxyProperty);
        this.connect(`notify::${localProperty}`, () => {
            const value = this.constructor._getVariantForValue(this[localProperty]);
            this._proxy.SetSync(ViewName, proxyProperty, value);
        });
    }
});

var HBModelGlobal = GObject.registerClass({
    Properties: {
        backgroundImageIndex: GObject.ParamSpec.uint(
            'backgroundImageIndex', 'backgroundImageIndex', '',
            _propFlags, 0, GLib.MAXUINT32, 0),

        radius0: GObject.ParamSpec.double(
            'radius0', 'radius0', '',
            _propFlags, 0.0, 50.0, 30.0),
        gravity0: GObject.ParamSpec.double(
            'gravity0', 'gravity0', '',
            _propFlags, 0.0, 0.8, 0.4),
        collision0: GObject.ParamSpec.double(
            'collision0', 'collision0', '',
            _propFlags, 0.0, 0.2, 0.2),
        friction0: GObject.ParamSpec.double(
            'friction0', 'friction0', '',
            _propFlags, 0.0, 0.3, 0.045),
        socialForce00: GObject.ParamSpec.double(
            'socialForce00', 'socialForce00', '',
            _propFlags, -0.5, 0.5, -0.15),
        socialForce01: GObject.ParamSpec.double(
            'socialForce01', 'socialForce01', '',
            _propFlags, -0.5, 0.5, 0.0),
        socialForce02: GObject.ParamSpec.double(
            'socialForce02', 'socialForce02', '',
            _propFlags, -0.5, 0.5, 0.0),

        radius1: GObject.ParamSpec.double(
            'radius1', 'radius1', '',
            _propFlags, 0.0, 50.0, 50.0),
        gravity1: GObject.ParamSpec.double(
            'gravity1', 'gravity1', '',
            _propFlags, 0.0, 0.8, 0.0),
        collision1: GObject.ParamSpec.double(
            'collision1', 'collision1', '',
            _propFlags, 0.0, 0.2, 0.2),
        friction1: GObject.ParamSpec.double(
            'friction1', 'friction1', '',
            _propFlags, 0.0, 0.3, 0.099),
        socialForce10: GObject.ParamSpec.double(
            'socialForce10', 'socialForce10', '',
            _propFlags, -0.5, 0.5, -0.5),
        socialForce11: GObject.ParamSpec.double(
            'socialForce11', 'socialForce11', '',
            _propFlags, -0.5, 0.5, 0.0),
        socialForce12: GObject.ParamSpec.double(
            'socialForce12', 'socialForce12', '',
            _propFlags, -0.5, 0.5, 0.5),

        radius2: GObject.ParamSpec.double(
            'radius2', 'radius2', '',
            _propFlags, 0.0, 50.0, 30.0),
        gravity2: GObject.ParamSpec.double(
            'gravity2', 'gravity2', '',
            _propFlags, 0.0, 0.8, 0.08),
        collision2: GObject.ParamSpec.double(
            'collision2', 'collision2', '',
            _propFlags, 0.0, 0.2, 0.2),
        friction2: GObject.ParamSpec.double(
            'friction2', 'friction2', '',
            _propFlags, 0.0, 0.3, 0.099),
        socialForce20: GObject.ParamSpec.double(
            'socialForce20', 'socialForce20', '',
            _propFlags, -0.5, 0.5, 0.0),
        socialForce21: GObject.ParamSpec.double(
            'socialForce21', 'socialForce21', '',
            _propFlags, -0.5, 0.5, 0.0),
        socialForce22: GObject.ParamSpec.double(
            'socialForce22', 'socialForce22', '',
            _propFlags, -0.5, 0.5, -0.5),

    },
}, class HBModelGlobal extends HBModelBase {
    _init(props = {}) {
        super._init(props);
        this.bindProperties();
    }
});
