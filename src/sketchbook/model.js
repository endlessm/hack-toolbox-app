/* exported SketchModel */

const {GObject} = imports.gi;

var SketchModel = GObject.registerClass({
    Properties: {
        title: GObject.ParamSpec.string('title', 'Title', 'Sketch title',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            'Sketch'),
        description: GObject.ParamSpec.string('description', 'Description',
            'Detailed description of the sketch',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            ''),
        instructions: GObject.ParamSpec.string('instructions', 'Instructions',
            'Instructions for using the sketch',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            ''),
        code: GObject.ParamSpec.string('code', 'Code', 'Sketch code',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            ''),
    },
}, class SketchModel extends GObject.Object {
    reset() {
        this.title = 'Sketch';
        this.description = '';
        this.instructions = '';
        this.code = '';
    }
});
