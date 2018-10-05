/* exported Toolbox */

const {GObject, Gtk} = imports.gi;
const Gettext = imports.gettext;

const _ = Gettext.gettext;

var Toolbox = GObject.registerClass({
    CssName: 'toolbox',
    Properties: {
        title: GObject.ParamSpec.string('title', 'Title', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            _('Hack')),
    },
    Signals: {
        reset: {},
    },
}, class Toolbox extends Gtk.Grid {
    _init(props = {}) {
        this._headerbar = new Gtk.HeaderBar({hasSubtitle: false});

        props.orientation = Gtk.Orientation.VERTICAL;
        super._init(props);

        const image = new Gtk.Image({iconName: 'view-refresh-symbolic'});
        const buttonReset = new Gtk.Button({
            alwaysShowImage: true,
            image,
            label: _('Reset All'),
        });
        this._minimizeImage = new Gtk.Image({iconName: 'go-down-symbolic'});
        const buttonMinimize = new Gtk.Button();
        buttonMinimize.add(this._minimizeImage);

        this._headerbar.pack_start(buttonMinimize);
        this._headerbar.pack_end(buttonReset);
        this._headerbar.show_all();
        this._realAdd(this._headerbar);

        this._revealer = new Gtk.Revealer({
            revealChild: true,
            transitionType: Gtk.RevealerTransitionType.SLIDE_UP,
        });
        this._realAdd(this._revealer);

        buttonReset.connect('clicked', () => this.emit('reset'));
        buttonMinimize.connect('clicked', this._onMinimize.bind(this));
    }

    get title() {
        return this._title;
    }

    set title(value) {
        if ('_title' in this && this._title === value)
            return;
        this._title = value;
        this._headerbar.title = value;
        this.notify('title');
    }

    _realAdd(widget) {
        Gtk.Container.prototype.add.call(this, widget);
    }

    add(widget) {
        this._revealer.add(widget);
    }

    _onMinimize() {
        const open = this._revealer.revealChild;
        this._minimizeImage.iconName = open ? 'go-up-symbolic' : 'go-down-symbolic';
        this._revealer.revealChild = !open;
    }
});
