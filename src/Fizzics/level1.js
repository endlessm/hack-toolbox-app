/* exported FizzicsLevel1 */

const {GObject, Gtk} = imports.gi;

const {ButtonGroup} = imports.framework.buttonGroup;
const {FizzicsSkinImage} = imports.Fizzics.skinImage;
const {FizzicsObjectEditor} = imports.Fizzics.objectEditor;

var FizzicsLevel1 = GObject.registerClass({
    GTypeName: 'FizzicsLevel1',
    Template: 'resource:///com/endlessm/HackToolbox/Fizzics/level1.ui',
    InternalChildren: [
        'buttonBackground0',
        'buttonBackground1',
        'buttonBackground2',
        'tab0',
        'tab0Image',
        'tab1',
        'tab1Image',
        'tab2',
        'tab2Image',
    ],
}, class FizzicsLevel1 extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);
        this._backgroundGroup = new ButtonGroup({
            buttonBackground0: this._buttonBackground0,
            buttonBackground1: this._buttonBackground1,
            buttonBackground2: this._buttonBackground2,
        });

        this._editor0 = new FizzicsObjectEditor({visible: true});
        this._image0 = new FizzicsSkinImage({visible: true, pixels: 32});
        this._tab0.add(this._editor0);
        this._tab0Image.add(this._image0);

        this._editor1 = new FizzicsObjectEditor({visible: true});
        this._image1 = new FizzicsSkinImage({visible: true, pixels: 32});
        this._tab1.add(this._editor1);
        this._tab1Image.add(this._image1);

        this._editor2 = new FizzicsObjectEditor({visible: true});
        this._image2 = new FizzicsSkinImage({visible: true, pixels: 32});
        this._tab2.add(this._editor2);
        this._tab2Image.add(this._image2);
    }

    bindModel(model) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
        model.bind_property('backgroundImageIndex', this._backgroundGroup, 'index', flags);
        model.bind_property('imageIndex-0', this._image0, 'index', flags);
        model.bind_property('imageIndex-1', this._image1, 'index', flags);
        model.bind_property('imageIndex-2', this._image2, 'index', flags);

        this._editor0.bindModel(
            model, {
                radius: 'radius-0',
                gravity: 'gravity-0',
                collision: 'collision-0',
                friction: 'friction-0',
                physics: 'usePhysics-0',
                social0: 'socialForce-0-0',
                social1: 'socialForce-0-1',
                social2: 'socialForce-0-2',
                skin: 'imageIndex-0',
                skin0: 'imageIndex-0',
                skin1: 'imageIndex-1',
                skin2: 'imageIndex-2',
            }
        );
        this._editor1.bindModel(
            model, {
                radius: 'radius-1',
                gravity: 'gravity-1',
                collision: 'collision-1',
                friction: 'friction-1',
                physics: 'usePhysics-1',
                social0: 'socialForce-1-0',
                social1: 'socialForce-1-1',
                social2: 'socialForce-1-2',
                skin: 'imageIndex-1',
                skin0: 'imageIndex-0',
                skin1: 'imageIndex-1',
                skin2: 'imageIndex-2',
            }
        );
        this._editor2.bindModel(
            model, {
                radius: 'radius-2',
                gravity: 'gravity-2',
                collision: 'collision-2',
                friction: 'friction-2',
                physics: 'usePhysics-2',
                social0: 'socialForce-2-0',
                social1: 'socialForce-2-1',
                social2: 'socialForce-2-2',
                skin: 'imageIndex-2',
                skin0: 'imageIndex-0',
                skin1: 'imageIndex-1',
                skin2: 'imageIndex-2',
            }
        );
    }
});
