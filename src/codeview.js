/* exported Codeview */

const {Gdk, GLib, GObject, Gtk, GtkSource, Pango} = imports.gi;

// Can add more, e.g. WARNING, SUGGESTION
const MarkType = {
    ERROR: 'com.endlessm.HackToolbox.codeview.error',
};

function _markHasFixmeInformation(mark) {
    return typeof mark._fixme !== 'undefined' &&
        typeof mark._endLine !== 'undefined' &&
        typeof mark._endColumn !== 'undefined';
}

var Codeview = GObject.registerClass({
    GTypeName: 'Codeview',
    Signals: {
        'should-compile': {},
    },

    Template: 'resource:///com/endlessm/HackToolbox/codeview.ui',
    InternalChildren: ['fixButton', 'helpButton', 'helpHeading', 'helpLabel',
        'helpMessage', 'scroll'],
}, class Codeview extends Gtk.Overlay {
    _init(props = {}) {
        super._init(props);

        const langManager = GtkSource.LanguageManager.get_default();
        const language = langManager.get_language('js');

        const schemeManager = GtkSource.StyleSchemeManager.get_default();
        const styleScheme = schemeManager.get_scheme('tango');

        this._buffer = new GtkSource.Buffer({language, styleScheme});

        const darkRed = new Gdk.RGBA({red: 0xa4});
        this._errorUnderline = new GtkSource.Tag({
            name: 'error-underline',
            underline: Pango.Underline.ERROR,
            underlineRgba: darkRed,
        });
        this._buffer.tagTable.add(this._errorUnderline);

        this._view = new GtkSource.View({
            buffer: this._buffer,
            showLineMarks: true,
            visible: true,
        });

        const background = new Gdk.RGBA({red: 0xa4, alpha: 0.2});
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
            this._cached_ast = null;
            this.setCompileResults([]);
        } finally {
            if (this._changedHandler)
                GObject.signal_handler_unblock(this._buffer, this._changedHandler);
        }
    }

    get ast() {
        if (this._cached_ast)
            return this._cached_ast;
        return Reflect.parse(this.text);
    }

    _onBufferChanged() {
        this.ensureNoTimeout();
        this._cached_ast = null;
        this._compileTimeout = GLib.timeout_add_seconds(GLib.PRIORITY_HIGH, 1,
            this.compile.bind(this));
    }

    _onHelpClicked() {
        this.ensureNoTimeout();
        this.compile();
        this._helpMessage.get_style_class().remove_class('error');
        this._helpMessage.popup();
    }

    _onFixClicked(marks) {
        this._helpMessage.popdown();
        marks.forEach(mark => {
            const start = this._buffer.get_iter_at_mark(mark);
            const end = this._buffer.get_iter_at_line_offset(mark._endLine,
                mark._endColumn);
            this._buffer.begin_user_action();
            try {
                this._buffer.delete(start, end);
                this._buffer.insert(start, mark._fixme, -1);
            } finally {
                this._buffer.end_user_action();
            }
        });
    }

    _onRendererQueryData(renderer, start) {
        renderer.iconName = '';
        const marks = this._getOurSourceMarks(start);
        if (marks.length > 0)
            renderer.iconName = 'edit-delete-symbolic';
    }

    _onRendererActivate(renderer, iter, area) {
        const marks = this._getOurSourceMarks(iter);
        this._helpHeading.hide();
        this._helpLabel.label = marks.map(mark => mark._message).join('\n');
        this._helpMessage.pointingTo = area;
        this._helpMessage.relativeTo = this._view;
        this._helpMessage.get_style_context().add_class('error');

        if (this._fixHandler)
            this._fixButton.disconnect(this._fixHandler);
        this._fixButton.hide();
        if (marks.every(_markHasFixmeInformation)) {
            this._fixHandler = this._fixButton.connect('clicked',
                this._onFixClicked.bind(this, marks));
            this._fixButton.show();
        }

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
        const [begin, bound] = this._buffer.get_bounds();
        this._buffer.remove_source_marks(begin, bound, MarkType.ERROR);
        this._buffer.remove_tag(this._errorUnderline, begin, bound);
        results.forEach(({start, end, message, fixme}) => {
            const iter = this._buffer.get_iter_at_line_offset(start.line - 1, start.column);
            const mark = this._buffer.create_source_mark(null, MarkType.ERROR, iter);
            mark._message = message;

            let endIter;
            if (end) {
                endIter = this._buffer.get_iter_at_line_offset(end.line - 1, end.column);
                mark._endLine = end.line - 1;
                mark._endColumn = end.column;
            } else {
                iter.set_line_offset(0);
                endIter = iter.copy();
                endIter.forward_to_line_end();
            }
            this._buffer.apply_tag(this._errorUnderline, iter, endIter);

            if (fixme)
                mark._fixme = fixme;
        });
    }

    findAssignmentLocation(variable) {
        const node = this.ast.body
            .filter(({type, expression}) => type === 'ExpressionStatement' &&
                    expression.type === 'AssignmentExpression')
            .map(({expression}) => expression)
            .find(({left}) => left.type === 'Identifier' && left.name === variable);
        return node ? node.right.loc : null;
    }
});
