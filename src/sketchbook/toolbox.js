/* exported SketchToolbox */

const {GObject} = imports.gi;

const {SketchMetadataTopic} = imports.sketchbook.metadata;
const {SketchModel} = imports.sketchbook.model;
const {SketchCodeTopic} = imports.sketchbook.code;
const {Toolbox} = imports.toolbox;

var SketchToolbox = GObject.registerClass(class SketchToolbox extends Toolbox {
    _init(appId, props = {}) {
        super._init(appId, props);

        this._model = new SketchModel();

        this._codeTopic = new SketchCodeTopic();
        this._codeTopic.bindModel(this._model);
        this.addTopic('code', 'Code', 'accessories-text-editor-symbolic',
            this._codeTopic);
        this.showTopic('code');
        this.selectTopic('code');

        this._metadataTopic = new SketchMetadataTopic();
        this._metadataTopic.bindModel(this._model);
        this.addTopic('metadata', 'About', 'document-edit-symbolic',
            this._metadataTopic);
        this.showTopic('metadata');

        this._updateTitle();
        this.show_all();

        this._updateTitleHandler = this._model.connect('notify::title',
            this._updateTitle.bind(this));
        this.connect('reset', () => this._model.reset());
    }

    bindWindow(win) {
        win.get_style_context().add_class('Sketchbook');
        win.lockscreen.key = 'item.key.sidetrack.1';
        win.lockscreen.lock = 'lock.sidetrack.1';
        void this;
    }

    _updateTitle() {
        const text = this._model.title ? `“${this._model.title}”` : 'Untitled';
        this.setInfo(text);
    }

    shutdown() {
        super.shutdown();

        if (this._model && this._updateTitleHandler) {
            this._model.disconnect(this._updateTitleHandler);
            this._model = null;
            this._updateTitleHandler = null;
        }

        this._metadataTopic.unbindModel();
        this._codeTopic.unbindModel();
    }
});

