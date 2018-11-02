/* exported Codeview */

const {Gdk, GLib, GObject, Gtk, GtkSource, Pango} = imports.gi;

const SoundServer = imports.soundServer;

// Can add more, e.g. WARNING, SUGGESTION
const MarkType = {
    ERROR: 'com.endlessm.HackToolbox.codeview.error',
};

const KEYPRESS_SOUNDS = {
    ' ': 'codeview/keypress/space',
    '\n': 'codeview/keypress/return',
    '=': 'codeview/keypress/equals',
    '/': 'codeview/keypress/slash',
};

function _actionSound(action) {
    const sound = SoundServer.getDefault();
    sound.play(`codeview/action/${action}`);
}

function _markHasFixmeInformation(mark) {
    return typeof mark._fixme !== 'undefined' &&
        typeof mark._endLine !== 'undefined' &&
        typeof mark._endColumn !== 'undefined';
}


const Buffer = GObject.registerClass(class Buffer extends GtkSource.Buffer {
    // This custom buffer class exists because we need to override the default
    // vfunc_undo() and vfunc_redo() behaviour, to block the emission of
    // insert and delete signals while doing undo and redo. Otherwise, the
    // insert and delete sounds will play simultaneously with the undo and redo
    // sounds.

    _init(props = {}) {
        super._init(props);
        this._lastSelectionLength = 0;

        this._insertHandler = this.connect('insert-text',
            this.constructor._onInsertText);
        this._deleteHandler = this.connect('delete-range',
            this.constructor._onDeleteRange);
        this.connect('mark-set', this._onMarkSet.bind(this));
    }

    vfunc_undo() {
        this._withSoundHandlersBlocked(() => super.vfunc_undo());
        _actionSound('undo');
    }

    vfunc_redo() {
        this._withSoundHandlersBlocked(() => super.vfunc_redo());
        _actionSound('redo');
    }

    _withSoundHandlersBlocked(func, ...args) {
        if (this._insertHandler)
            GObject.signal_handler_block(this, this._insertHandler);
        if (this._deleteHandler)
            GObject.signal_handler_block(this, this._deleteHandler);
        try {
            func(...args);
        } finally {
            if (this._insertHandler)
                GObject.signal_handler_unblock(this, this._insertHandler);
            if (this._deleteHandler)
                GObject.signal_handler_unblock(this, this._deleteHandler);
        }
    }

    static _onInsertText(buffer, location, text) {
        if (!text.length === 1)
            return;
        if (text in KEYPRESS_SOUNDS) {
            const sound = SoundServer.getDefault();
            sound.play(KEYPRESS_SOUNDS[text]);
        }
    }

    static _onDeleteRange(buffer, start, end) {
        const deletedLength = end.get_offset() - start.get_offset();

        const sound = SoundServer.getDefault();
        if (deletedLength === 1)
            sound.play('codeview/keypress/delete');
        else
            sound.play('codeview/keypress/delete-selection');
    }

    _onMarkSet(buffer, location, mark) {
        if (!['insert', 'selection_bound'].includes(mark.name))
            return;
        const [hasSelection, insert, selectionBound] = this.get_selection_bounds();
        let length = 0;
        if (hasSelection) {
            length = selectionBound.get_offset() - insert.get_offset();
            length *= selectionBound.compare(insert);
        }
        if (length !== 0 && length !== this._lastSelectionLength)
            SoundServer.getDefault().play('codeview/action/selection-drag');
        this._lastSelectionLength = length;
    }
});

var Codeview = GObject.registerClass({
    GTypeName: 'Codeview',
    Signals: {
        'should-compile': {},
    },

    Template: 'resource:///com/endlessm/HackToolbox/codeview.ui',
    InternalChildren: ['fixButton', 'helpLabel', 'helpMessage'],
}, class Codeview extends Gtk.ScrolledWindow {
    _init(props = {}) {
        super._init(props);

        const langManager = GtkSource.LanguageManager.get_default();
        const language = langManager.get_language('js');

        const schemeManager = GtkSource.StyleSchemeManager.get_default();
        const styleScheme = schemeManager.get_scheme('hack');

        this._buffer = new Buffer({language, styleScheme});

        const darkRed = new Gdk.RGBA({red: 0xa4});
        this._errorUnderline = new GtkSource.Tag({
            name: 'error-underline',
            underline: Pango.Underline.ERROR,
            underlineRgba: darkRed,
        });
        this._buffer.tagTable.add(this._errorUnderline);

        this._view = new GtkSource.View({
            buffer: this._buffer,
            showLineNumbers: true,
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

        this.add(this._view);

        this._changedHandler = this._buffer.connect('changed',
            this._onBufferChanged.bind(this));
        renderer.connect('query-data', this._onRendererQueryData.bind(this));
        renderer.connect('query-activatable', (r, iter) =>
            this._getOurSourceMarks(iter).length > 0);
        renderer.connect('activate', this._onRendererActivate.bind(this));
        this._view.connect_after('cut-clipboard', () => _actionSound('cut'));
        this._view.connect_after('copy-clipboard', () => _actionSound('copy'));
        this._view.connect_after('paste-clipboard', () => _actionSound('paste'));
        this._view.connect('move-cursor', this.constructor._onMoveCursor);

        this._compileTimeout = null;
        this._numErrors = 0;
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
            this._buffer._withSoundHandlersBlocked(() => {
                if (this._buffer)
                    this._buffer.text = value;
            });
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

    _onFixClicked(marks) {
        if (this._helpMessageCloseId) {
            this._helpMessage.disconnect(this._helpMessageCloseId);
            this._helpMessageCloseId = null;
        }
        this._helpMessage.popdown();
        marks.forEach(mark => {
            const start = this._buffer.get_iter_at_mark(mark);
            const end = this._buffer.get_iter_at_line_offset(mark._endLine,
                mark._endColumn);
            this._buffer.begin_user_action();
            try {
                this._buffer._withSoundHandlersBlocked(() => {
                    this._buffer.delete(start, end);
                    this._buffer.insert(start, mark._fixme, -1);
                });
            } finally {
                this._buffer.end_user_action();
            }
        });
        SoundServer.getDefault().play('codeview/popup/fix');
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

        if (this._fixHandler)
            this._fixButton.disconnect(this._fixHandler);
        this._fixButton.hide();
        if (marks.every(_markHasFixmeInformation)) {
            this._fixHandler = this._fixButton.connect('clicked',
                this._onFixClicked.bind(this, marks));
            this._fixButton.show();
        }

        this._helpMessage.popup();
        this._helpMessageCloseId = this._helpMessage.connect_after('closed', () => {
            // Popup is closed whenever user clicks outside of it
            SoundServer.getDefault().play('codeview/popup/close');
            this._helpMessage.disconnect(this._helpMessageCloseId);
            this._helpMessageCloseId = null;
        });
        SoundServer.getDefault().play('codeview/popup/open');
    }

    static _onMoveCursor(view, step, count, extendSelection) {
        if (!extendSelection && step === Gtk.MovementStep.DISPLAY_LINES ||
            step === Gtk.MovementStep.PARAGRAPHS) {
            if (count === 1)
                SoundServer.getDefault().play('codeview/keypress/down');
            else if (count === -1)
                SoundServer.getDefault().play('codeview/keypress/up');
        }
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

        if (this._numErrors !== results.length) {
            this._numErrors = results.length;
            if (this._numErrors)
                SoundServer.getDefault().play('codeview/code-error-appearance');
            else
                SoundServer.getDefault().play('codeview/code-error-disappearance');
        }
    }

    findAssignmentLocation(variable) {
        const expressions = this.ast.body
            .filter(({type, expression}) => type === 'ExpressionStatement' &&
                    expression.type === 'AssignmentExpression')
            .map(({expression}) => expression);
        let node = expressions.find(({left}) => left.type === 'Identifier' &&
                                    left.name === variable);
        if (!node) {
            node = expressions.find(({left}) => left.type === 'MemberExpression' &&
`${left.object.object.name}[${left.object.property.value}].${left.property.name}` === variable);
        }
        return node ? node.right.loc : null;
    }
});
