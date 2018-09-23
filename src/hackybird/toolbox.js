/* exported HackyWindow, HackyPanel */

const {GObject, Gtk, Gio, GLib} = imports.gi;

const {ToolboxWindowBase} = imports.window;

const HACKY_IFACE = `
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

var HackyWindow = GObject.registerClass(class HackyWindow extends ToolboxWindowBase {
    _init(props = {}) {
        super._init(props);
        const screen = this.get_screen();
        const visual = screen.get_rgba_visual();
        this.set_visual(visual);
        this.set_decorated(false);
        this.add(new HackyPanel());
        this.show_all();
    }
});

var HackyPanel = GObject.registerClass({
    GTypeName: 'HackyPanel',
    Template: 'resource:///com/endlessm/HackToolbox/hackybird/panel.ui',
    InternalChildren: [
        'adjustment_scale',
        'adjustment_gap',
        'adjustment_zoom',
        'adjustment_angle',
        'adjustment_color',
        'adjustment_bgcolor',
        'adjustment_speed',
        'adjustment_gravity',
        'switch_invincible',
        'switch_raining',
        'text_code'
    ],
    Properties: {
        'gap': GObject.ParamSpec.int('gap', 'gap', 'gap',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            0,  GLib.MAXUINT16, 0),
        'gravity': GObject.ParamSpec.int('gravity', 'gravity', 'gravity',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            0,  GLib.MAXUINT16, 0),
        'speed': GObject.ParamSpec.int('speed', 'speed', 'speed',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            0,  GLib.MAXUINT16, 0),
        'invincible': GObject.ParamSpec.boolean('invincible', 'invincible', 'invincible',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            false),
        'scale': GObject.ParamSpec.int('scale', 'scale', 'scale',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            0,  GLib.MAXUINT16, 0),
        'paused': GObject.ParamSpec.boolean('paused', 'paused', 'paused',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            true),
        'score': GObject.ParamSpec.int('score', 'score', 'score',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            0,  GLib.MAXUINT16, 0),
        'zoom': GObject.ParamSpec.float('zoom', 'zoom', 'zoom',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            1.0,  2.0, 1.0),
        'angle': GObject.ParamSpec.float('angle', 'angle', 'angle',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            0.0,  360.0, 0.0),
        'color': GObject.ParamSpec.int('color', 'color', 'color',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            0,  3, 0),
        'bgcolor': GObject.ParamSpec.int('bgcolor', 'bgcolor', 'bgcolor',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            0,  3, 0),
        'raining': GObject.ParamSpec.boolean('raining', 'raining', 'raining',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            false),
   },
}, class HackyPanel extends Gtk.Box {
    _init(props = {}) {
        super._init(props);
        const Proxy = Gio.DBusProxy.makeProxyWrapper(HACKY_IFACE);
        this._proxy = new Proxy(Gio.DBus.session,
                                'com.endlessm.hackybird',
                                '/com/endlessm/hackybird');
        this._bind_everything();
    }

    _get_proxy_value (property) {
        // https://gitlab.gnome.org/GNOME/gjs/issues/206
        const params = new GLib.Variant('(ss)', ['view_hack', property])
        const value = this._proxy.call_sync('Get', params, 0, -1, null);
        return value.get_child_value(0).get_variant().deep_unpack();
    }

    _bind_everything() {
        this._bind_local_to_proxy('gap');
        this._bind_local_to_proxy('gravity');
        this._bind_local_to_proxy('speed');
        this._bind_local_to_proxy('invincible');
        this._bind_local_to_proxy('scale');
        this._bind_local_to_proxy('paused');
        this._bind_local_to_proxy('score');
        this._bind_local_to_proxy('zoom');
        this._bind_local_to_proxy('angle');
        this._bind_local_to_proxy('color');
        this._bind_local_to_proxy('bgcolor');
        this._bind_local_to_proxy('raining');

        /* Update local property when proxy changed */
        this._proxy.connectSignal('ObjectNotify', (p, s, [o, prop, val]) => {
            const value = val.deep_unpack();
            if (this[prop] === value)
                return;
            this.set_property(prop, value);
        });

        /* Bind UI to local properties */
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
        this.bind_property('scale', this._adjustment_scale, 'value', flags);
        this.bind_property('gap', this._adjustment_gap, 'value', flags);
        this.bind_property('zoom', this._adjustment_zoom, 'value', flags);
        this.bind_property('angle', this._adjustment_angle, 'value', flags);
        this.bind_property('color', this._adjustment_color, 'value', flags);
        this.bind_property('bgcolor', this._adjustment_bgcolor, 'value', flags);
        this.bind_property('speed', this._adjustment_speed, 'value', flags);
        this.bind_property('gravity', this._adjustment_gravity, 'value', flags);
        this.bind_property('invincible', this._switch_invincible, 'active', flags);
        this.bind_property('raining', this._switch_raining, 'active', flags);
        this._text_code.get_buffer().connect('changed', () => { this._code_changed() });
    }

    _get_proper_variant(value) {
        if (typeof(value) === 'boolean')
            return GLib.Variant.new_boolean(value);
        return GLib.Variant.new_double(value);
    }

    _bind_local_to_proxy(property) {
        /* Set local to proxy values */
        const value = this._get_proxy_value(property);
        this[property] = value;
        /* Start listening for changes */
        this._proxy.ConnectSync('view_hack', 'notify', property);
        /* Make it work in both ways */
        this.connect('notify::' + property, () => {
            if (this[property] === this._get_proxy_value(property))
                return;
            this._proxy.SetSync('view_hack',
                          property,
                          this._get_proper_variant(this[property]));
        });
    }

    _get_proper_value(property, value) {
        const pspec = GObject.Object.find_property.call(this.constructor, property);
        if (!pspec)
            return null;
        if (typeof(pspec.default_value) === 'boolean')
            return (value === 'true');
        return parseFloat(value);
    }

    _code_changed() {
        const buffer = this._text_code.get_buffer();
        const start = buffer.get_start_iter();
        const end = buffer.get_end_iter();
        const code = buffer.get_text(start, end, true);

        code.split('\n').forEach(line => {
            line = line.replace(/\s/g,'');
            if (line.length === 0)
                return;
            try {
                let [property, value] = line.split('=');
                value = this._get_proper_value(property, value)
                if (value === null || value === this[property])
                    return;
                this.set_property(property, value);
            } catch (error) {
                print(error);
            }
        });
    }
});
