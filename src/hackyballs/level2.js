/* exported HBLevel2 */

const {GObject, Gtk} = imports.gi;
const {HBSliders} = imports.hackyballs.sliders;

var HBLevel2 = GObject.registerClass({
    GTypeName: 'HBLevel2',
    Template: 'resource:///com/endlessm/HackToolbox/hackyballs/level2.ui',
    InternalChildren: [
        'comboObjects',
        'pageObject0',
        'pageObject1',
        'pageObject2',
        'stackObjects',
    ],
}, class HBLevel2 extends Gtk.Box {
    _init(props = {}) {
        super._init(props);
        this._sliders0 = new HBSliders();
        this._sliders1 = new HBSliders();
        this._sliders2 = new HBSliders();

        this._pageObject0.add(this._sliders0);
        this._pageObject1.add(this._sliders1);
        this._pageObject2.add(this._sliders2);

        this._comboObjects.connect('changed', () => {
            this._onObjectChanged();
        });
    }

    _onObjectChanged() {
        const index = this._comboObjects.active;
        this._stackObjects.set_visible_child_name(`page${index}`);
    }

    bindModel(model) {
        this._sliders0.bindModel(
            model, {
                radius: 'radius0',
                gravity: 'gravity0',
                collision: 'collision0',
                friction: 'friction0',
                social0: 'socialForce00',
                social1: 'socialForce01',
                social2: 'socialForce02',
            }
        );
        this._sliders1.bindModel(
            model, {
                radius: 'radius1',
                gravity: 'gravity1',
                collision: 'collision1',
                friction: 'friction1',
                social0: 'socialForce10',
                social1: 'socialForce11',
                social2: 'socialForce12',
            }
        );
        this._sliders2.bindModel(
            model, {
                radius: 'radius2',
                gravity: 'gravity2',
                collision: 'collision2',
                friction: 'friction2',
                social0: 'socialForce20',
                social1: 'socialForce21',
                social2: 'socialForce22',
            }
        );
    }
});
