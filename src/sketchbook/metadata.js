/* exported SketchMetadataTopic */

const {GObject, Gtk} = imports.gi;

var SketchMetadataTopic = GObject.registerClass({
    GTypeName: 'SketchMetadataTopic',
    Template: 'resource:///com/endlessm/HackToolbox/sketchbook/metadata.ui',
    InternalChildren: ['descriptionText', 'instructionsText', 'titleText'],
}, class SketchMetadataTopic extends Gtk.Grid {
    bindModel(model) {
        this._model = model;

        const flags = GObject.BindingFlags.BIDIRECTIONAL |
            GObject.BindingFlags.SYNC_CREATE;
        this._bindings = [
            this._model.bind_property('title', this._titleText, 'text', flags),
            this._model.bind_property('description',
                this._descriptionText.buffer, 'text', flags),
            this._model.bind_property('instructions', this._instructionsText,
                'text', flags),
        ];
    }

    unbindModel() {
        if (this._bindings) {
            this._bindings.forEach(binding => binding.unbind());
            this._bindings = null;
        }
        this._model = null;
    }
});
