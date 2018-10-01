/* exported Codeview */

const {Gdk, GLib, GObject, Gtk, GtkSource} = imports.gi;

// Can add more, e.g. WARNING, SUGGESTION
const MarkType = {
    ERROR: 'com.endlessm.HackToolbox.codeview.error',
};

var Codeview = GObject.registerClass({
    GTypeName: 'Codeview',
    Signals: {
        'should-compile': {},
    },

    Template: 'resource:///com/endlessm/HackToolbox/codeview.ui',
    InternalChildren: ['helpButton', 'helpHeading', 'helpLabel', 'helpMessage',
        'okButton', 'scroll'],
}, class Codeview extends Gtk.Overlay {
    _init(props = {}) {
        super._init(props);

        const langManager = GtkSource.LanguageManager.get_default();
        const language = langManager.get_language('js');

        const schemeManager = GtkSource.StyleSchemeManager.get_default();
        const styleScheme = schemeManager.get_scheme('tango');

        this._buffer = new GtkSource.Buffer({language, styleScheme});

        this._view = new GtkSource.View({
            buffer: this._buffer,
            showLineMarks: true,
            visible: true,
        });

        const background = new Gdk.RGBA({red: 0xa4, green: 0, blue: 0, alpha: 0.2});
        const attrs = new GtkSource.MarkAttributes({background});
        this._view.set_mark_attributes(MarkType.ERROR, attrs, 0);

        const gutter = this._view.get_gutter(Gtk.TextWindowType.LEFT);
        const renderer = new GtkSource.GutterRendererPixbuf({
            size: 16,
            visible: true,
        });
        gutter.insert(renderer, 0);

        this._scroll.add(this._view);

        this._changedHandler = this._buffer.connect('changed',
            this._onBufferChanged.bind(this));
        this._helpButton.connect('clicked', this._onHelpClicked.bind(this));
        this._okButton.connect('clicked', this._onOkClicked.bind(this));
        renderer.connect('query-data', this._onRendererQueryData.bind(this));
        renderer.connect('query-activatable', (r, iter) =>
            this._getOurSourceMarks(iter).length > 0);
        renderer.connect('activate', this._onRendererActivate.bind(this));

        this._compileTimeout = null;
    }

    get text() {
        if (this._buffer)
            return this._buffer.text;
        return '';
    }

    set text(value) {
        if (this._changedHandler)
            GObject.signal_handler_block(this._buffer, this._changedHandler);
        try {
            if (this._buffer)
                this._buffer.text = value;
        } finally {
            if (this._changedHandler)
                GObject.signal_handler_unblock(this._buffer, this._changedHandler);
        }
    }

    _onBufferChanged() {
        this.ensureNoTimeout();
        this._compileTimeout = GLib.timeout_add_seconds(GLib.PRIORITY_HIGH, 1,
            this.compile.bind(this));
    }

    _onHelpClicked() {
        this.ensureNoTimeout();
        this.compile();
        this._helpMessage.get_style_class().remove_class('error');
        this._helpMessage.popup();
    }

    _onOkClicked() {
        this._helpMessage.popdown();
    }

    _onRendererQueryData(renderer, start) {
        renderer.iconName = '';
        const marks = this._getOurSourceMarks(start);
        if (marks.length > 0)
            renderer.iconName = 'edit-delete-symbolic';
    }

    _onRendererActivate(renderer, iter, area) {
        const marks = this._getOurSourceMarks(iter);
        this._helpLabel.label = marks.map(mark => mark._message).join('\n');
        this._helpMessage.pointingTo = area;
        this._helpMessage.relativeTo = this._view;
        this._helpMessage.get_style_context().add_class('error');
        this._helpMessage.popup();
    }

    _getOurSourceMarks(iter) {
        return this._buffer.get_source_marks_at_line(iter.get_line(),
            MarkType.ERROR);
    }

    ensureNoTimeout() {
        if (!this._compileTimeout)
            return;
        GLib.Source.remove(this._compileTimeout);
        this._compileTimeout = null;
    }

    compile() {
        this.emit('should-compile');
        this._compileTimeout = null;
        return GLib.SOURCE_REMOVE;
    }

    setCompileResults(results) {
        const [start, end] = this._buffer.get_bounds();
        this._buffer.remove_source_marks(start, end, MarkType.ERROR);
        results.forEach(({line, column, message}) => {
            const iter = this._buffer.get_iter_at_line_offset(line - 1, column);
            const mark = this._buffer.create_source_mark(null, MarkType.ERROR, iter);
            mark._message = message;
        });
    }
});
