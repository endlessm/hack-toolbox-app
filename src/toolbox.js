/* exported Toolbox */

const {GObject, Gtk} = imports.gi;
const Gettext = imports.gettext;

const {ResetButton} = imports.resetButton;

const _ = Gettext.gettext;

const SoundServer = imports.soundServer;

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

        this._buttonReset = new ResetButton();

        this._minimizeImage = new Gtk.Image({iconName: 'go-down-symbolic'});
        this._buttonMinimize = new Gtk.Button();
        this._buttonMinimize.get_style_context().add_class('minimize');
        this._buttonMinimize.add(this._minimizeImage);

        this._leftStack = new Gtk.Stack({
            transitionType: Gtk.StackTransitionType.CROSSFADE,
            homogeneous: true,
            visible: true,
        });
        this._spinner = new Gtk.Spinner({active: false, visible: true});
        this._leftStack.add_named(this._spinner, 'busy');
        this._leftStack.add_named(this._buttonMinimize, 'normal');
        this._leftStack.visibleChildName = 'normal';

        this._headerbar.pack_start(this._leftStack);
        this._headerbar.pack_end(this._buttonReset);
        this._headerbar.show_all();
        this._realAdd(this._headerbar);

        this._revealer = new Gtk.Revealer({
            revealChild: true,
            transitionType: Gtk.RevealerTransitionType.SLIDE_UP,
        });
        this._realAdd(this._revealer);

        this._buttonReset.connect('clicked', this._onResetClicked.bind(this));
        this._buttonMinimize.connect('clicked', this._onMinimize.bind(this));
        this.setBusy(false);
    }

    get title() {
        return this._title;
    }

    get buttonReset() {
        return this._buttonReset;
    }

    get buttonMinimize() {
        return this._buttonMinimize;
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

    _onResetClicked() {
        const sound = SoundServer.getDefault();
        sound.play('hack-toolbox/reset/click');
        this.emit('reset');
    }

    _onMinimize() {
        const open = this._revealer.revealChild;
        this._minimizeImage.iconName = open ? 'go-up-symbolic' : 'go-down-symbolic';
        this._revealer.revealChild = !open;
        SoundServer.getDefault().play(`hack-toolbox/${open ? '' : 'un'}minimize`);
    }

    setBusy(value) {
        this._leftStack.visibleChildName = value ? 'busy' : 'normal';
        this._spinner.active = value;
    }

    // Can be overridden by subclasses to do any work on window close
    shutdown() {
        void this;
    }
});
