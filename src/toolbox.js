/* exported Toolbox */

const {GObject, Gtk} = imports.gi;
const Gettext = imports.gettext;

const {ResetButton} = imports.resetButton;
const Utils = imports.utils;

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
    _init(appId, props = {}) {
        super._init(props);

        const leftColumn = new Gtk.Grid({
            orientation: Gtk.Orientation.VERTICAL,
            valign: Gtk.Align.FILL,
        });
        leftColumn.get_style_context().add_class('left-column');

        const masthead = new Gtk.Grid();
        masthead.get_style_context().add_class('masthead');

        const appIcon = new Gtk.Image();
        appIcon.get_style_context().add_class('icon');
        const appNameLabel = new Gtk.Label({halign: Gtk.Align.START});
        appNameLabel.get_style_context().add_class('name');

        const appInfo = Utils.appInfoForAppId(appId);
        if (appInfo) {
            appIcon.set_from_gicon(appInfo.icon, Gtk.IconSize.DIALOG);
            appNameLabel.label = appInfo.name;
        } else {
            // Application not installed, this is not expected during normal
            // use, but set some defaults in case it happens during development
            appIcon.set_from_icon_name('user-available', Gtk.IconSize.DIALOG);
            appNameLabel.label = 'Toolbox';
        }
        appIcon.pixelSize = 48;
        this._infoLabel = new Gtk.Label({halign: Gtk.Align.START});
        this._infoLabel.get_style_context().add_class('info');
        const buttonReset = new ResetButton();

        masthead.attach(appIcon, 0, 0, 1, 2);
        masthead.attach(appNameLabel, 1, 0, 1, 1);
        masthead.attach(this._infoLabel, 1, 1, 1, 1);
        masthead.attach(buttonReset, 0, 2, 2, 1);

        const separator = new Gtk.Separator({orientation: Gtk.Orientation.HORIZONTAL});
        leftColumn.add(masthead);
        leftColumn.add(separator);

        this.attach(leftColumn, 0, 0, 1, 1);

        const headerbar = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
        const minimizeImage = new Gtk.Image({iconName: 'go-previous-symbolic'});
        const buttonMinimize = new Gtk.Button();
        buttonMinimize.get_style_context().add_class('minimize');
        buttonMinimize.add(minimizeImage);

        this._leftStack = new Gtk.Stack({
            transitionType: Gtk.StackTransitionType.CROSSFADE,
            homogeneous: true,
            visible: true,
        });
        this._spinner = new Gtk.Spinner({active: false, visible: true});
        this._leftStack.add_named(this._spinner, 'busy');
        this._leftStack.add_named(buttonMinimize, 'normal');
        this._leftStack.visibleChildName = 'normal';

        headerbar.pack_end(this._leftStack, false, false, 0);
        headerbar.show_all();

        this._toolboxPanel = new Gtk.Grid({orientation: Gtk.Orientation.VERTICAL});
        this._toolboxPanel.get_style_context().add_class('panel');
        this._toolboxPanel.add(headerbar);

        this._revealer = new Gtk.Revealer({
            revealChild: true,
            transitionType: Gtk.RevealerTransitionType.SLIDE_RIGHT,
        });
        this._revealer.add(this._toolboxPanel);
        this.attach(this._revealer, 1, 0, 1, 1);

        buttonMinimize.connect('clicked', this._onMinimize.bind(this));
        buttonReset.connect('clicked', this._onResetClicked.bind(this));
        this.setBusy(false);
    }

    add(widget) {
        this._toolboxPanel.add(widget);
    }

    _onResetClicked() {
        const sound = SoundServer.getDefault();
        sound.play('hack-toolbox/reset/click');
        this.emit('reset');
    }

    _onMinimize() {
        const open = this._revealer.revealChild;
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
