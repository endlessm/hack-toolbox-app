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
        'tab3',
        'tab3Image',
        'tab4',
        'tab4Image',
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

        this._editor3 = new FizzicsObjectEditor({visible: true});
        this._image3 = new FizzicsSkinImage({visible: true, pixels: 32});
        this._tab3.add(this._editor3);
        this._tab3Image.add(this._image3);

        this._editor4 = new FizzicsObjectEditor({visible: true});
        this._image4 = new FizzicsSkinImage({visible: true, pixels: 32});
        this._tab4.add(this._editor4);
        this._tab4Image.add(this._image4);
    }

    _bindModelToEditor(model, index) {
        this[`_editor${index}`].bindModel(
            model, {
                radius: `radius-${index}`,
                gravity: `gravity-${index}`,
                collision: `collision-${index}`,
                friction: `friction-${index}`,
                physics: `usePhysics-${index}`,
                social0: `socialForce-${index}-0`,
                social1: `socialForce-${index}-1`,
                social2: `socialForce-${index}-2`,
                social3: `socialForce-${index}-3`,
                social4: `socialForce-${index}-4`,
                skin: `imageIndex-${index}`,
                skin0: 'imageIndex-0',
                skin1: 'imageIndex-1',
                skin2: 'imageIndex-2',
                skin3: 'imageIndex-3',
                skin4: 'imageIndex-4',
            }
        );
    }

    bindModel(model) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
        model.bind_property('backgroundImageIndex', this._backgroundGroup, 'index', flags);
        model.bind_property('imageIndex-0', this._image0, 'index', flags);
        model.bind_property('imageIndex-1', this._image1, 'index', flags);
        model.bind_property('imageIndex-2', this._image2, 'index', flags);
        model.bind_property('imageIndex-3', this._image3, 'index', flags);
        model.bind_property('imageIndex-4', this._image4, 'index', flags);
        this._bindModelToEditor(model, 0);
        this._bindModelToEditor(model, 1);
        this._bindModelToEditor(model, 2);
        this._bindModelToEditor(model, 3);
        this._bindModelToEditor(model, 4);
    }
});
