/* exported ResetButton */

const {GObject, Gtk} = imports.gi;

const GameState = imports.gameState;
const Signals = imports.signals;

const RESET_BUTTON_KEY = 'app.hack_toolbox.reset_button';

var ResetButton = GObject.registerClass({}, class ResetButton extends Gtk.Button {
    _init(props = {}) {
        Object.assign(props, {noShowAll: true});
        super._init(props);

        const image = new Gtk.Image({
            iconName: 'reset-button-symbolic',
            pixelSize: 32,
            visible: true,
        });
        this.add(image);

        this.get_style_context().add_class('reset');

        const gameState = GameState.getDefault();
        this.visible = gameState.getDictValueSync(RESET_BUTTON_KEY, 'visible', false);
        Signals._connect.call(gameState, 'changed', this._onGameStateChanged.bind(this));
    }

    _onGameStateChanged(self, senderName, [key, value]) {
        if (key !== RESET_BUTTON_KEY)
            return;
        this.visible = value.deep_unpack().visible;
    }
});
