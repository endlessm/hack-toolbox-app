/* exported Codeview */

const {EosMetrics, Gdk, Gio, GLib, GObject, Gtk, GtkSource, HackToolbox} = imports.gi;
const ByteArray = imports.byteArray;

const SoundServer = imports.soundServer;
void imports.utils;  // pull in promisified functions

const CODEVIEW_ERROR_EVENT = 'e98aa2b8-3f11-4a25-b8e9-b10a635df121';

// Can add more, e.g. WARNING, SUGGESTION
const MarkType = {
    ERROR: 'com.hack_computer.HackToolbox.codeview.error',
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
        this._lastKeypressTimestamp = null;

        this._insertHandler = this.connect('insert-text',
            this._onInsertText.bind(this));
        this._deleteHandler = this.connect('delete-range',
            this._onDeleteRange.bind(this));
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

    _calculateKeystrokePitch() {
        const now = Date.now();
        const options = {pitch: 1.0};
        if (this._lastKeypressTimestamp !== null) {
            const delay = now - this._lastKeypressTimestamp;
            // If the delay is too long, then play at default pitch.
            if (delay <= 2000)
                options.pitch = Math.max(2 - 0.0015 * delay, 0.5);
        }
        this._lastKeypressTimestamp = Date.now();
        return options;
    }

    _onInsertText(buffer, location, text) {
        if (!text.length === 1)
            return;

        const sound = SoundServer.getDefault();
        const options = this._calculateKeystrokePitch();

        if (text in KEYPRESS_SOUNDS)
            sound.playFull(KEYPRESS_SOUNDS[text], options);
        else
            sound.playFull('codeview/keypress/other', options);
    }

    _onDeleteRange(buffer, start, end) {
        const deletedLength = end.get_offset() - start.get_offset();

        const sound = SoundServer.getDefault();

        if (deletedLength === 1) {
            const options = this._calculateKeystrokePitch();
            sound.playFull('codeview/keypress/delete', options);
        } else {
            sound.play('codeview/keypress/delete-selection');
        }
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
    Properties: {
        text: GObject.ParamSpec.string('text', 'Text', 'Source code being edited',
            GObject.ParamFlags.READWRITE, ''),
    },
    Signals: {
        'should-compile': {
            param_types: [GObject.TYPE_BOOLEAN],
        },
    },

    Template: 'resource:///com/hack_computer/HackToolbox/codeview.ui',
    InternalChildren: ['fixButton', 'helpLabel', 'helpMessage'],
}, class Codeview extends Gtk.ScrolledWindow {
    _init(props = {}) {
        super._init(props);

        const langManager = GtkSource.LanguageManager.get_default();
        const language = langManager.get_language('js');

        const schemeManager = GtkSource.StyleSchemeManager.get_default();
        const styleScheme = schemeManager.get_scheme('hack');

        this._buffer = new Buffer({language, styleScheme});

        const bgErr = new Gdk.RGBA();
        bgErr.parse('#ff6a6a');
        const fgErr = new Gdk.RGBA();
        fgErr.parse('#fdfdfd');
        this._errorStyle = new GtkSource.Tag({
            name: 'error-style',
            backgroundSet: true,
            backgroundRgba: bgErr,
            foregroundSet: true,
            foregroundRgba: fgErr,
        });
        this._buffer.tagTable.add(this._errorStyle);

        this._view = new GtkSource.View({
            autoIndent: true,
            buffer: this._buffer,
            indentWidth: 4,
            insertSpacesInsteadOfTabs: true,
            showLineNumbers: true,
            smartBackspace: true,
            smartHomeEnd: GtkSource.SmartHomeEndType.BEFORE,
            tabWidth: 4,
            visible: true,
        });

        const background = new Gdk.RGBA({red: 1, green: 1, blue: 1, alpha: 0.1});
        const attrs = new GtkSource.MarkAttributes({background});
        this._view.set_mark_attributes(MarkType.ERROR, attrs, 0);

        const gutter = this._view.get_gutter(Gtk.TextWindowType.LEFT);
        const renderer = new GtkSource.GutterRendererPixbuf({
            size: 16,
            visible: true,
            yalign: 0.7,
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
        this._view.connect('focus-in-event', this._onFocusIn.bind(this));
        this._view.connect('focus-out-event', this._onFocusOut.bind(this));
        this._view.connect('key-press-event', this._onKeyPress.bind(this));

        this._compileTimeout = null;
        this._numErrors = 0;
        this._ambientMusicID = null;
        this._inMetricsEvent = false;
        this._lastCompiledText = null;

        // This is the identifier of the user function being edited in this
        // codeview. Empty string is the regular variable assignment panel.
        this._userFunction = '';
    }

    get text() {
        if (this._buffer)
            return this._buffer.text;
        return '';
    }

    set text(value) {
        if (this._buffer && this._buffer.text === value)
            return;

        if (this._changedHandler)
            GObject.signal_handler_block(this._buffer, this._changedHandler);
        try {
            this._buffer._withSoundHandlersBlocked(() => {
                if (this._buffer)
                    this._buffer.text = value;
            });
            this._cached_ast = null;
            this.compile(false);
            this.notify('text');
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

    get userFunction() {
        return this._userFunction;
    }

    set userFunction(value) {
        this._userFunction = value;
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
            renderer.iconName = 'error-indicator';
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

    _onFocusIn() {
        if (this._ambientMusicID === 'pending')
            return Gdk.EVENT_PROPAGATE;
        if (this._ambientMusicID === 'cancel') {
            // Focused in and out and back in quickly, before the first UUID was
            // returned. In this case, un-cancel the original sound but don't
            // request another one.
            this._ambientMusicID = 'pending';
            return Gdk.EVENT_PROPAGATE;
        }
        this._ambientMusicID = 'pending';
        SoundServer.getDefault().playAsync('codeview/ambient/hacking')
        .then(uuid => {
            if (this._ambientMusicID === 'cancel') {
                SoundServer.getDefault().stop(uuid);
                this._ambientMusicID = null;
                return;
            }

            this._ambientMusicID = uuid;
        });
        return Gdk.EVENT_PROPAGATE;
    }

    _onFocusOut() {
        if (this._ambientMusicID === 'pending') {
            this._ambientMusicID = 'cancel';
        } else if (this._ambientMusicID) {
            SoundServer.getDefault().stop(this._ambientMusicID);
            this._ambientMusicID = null;
        }
        return Gdk.EVENT_PROPAGATE;
    }

    // Returns a string corresponding to one indent level, spaces or tab
    _getTabString() {
        let tabCode = '\t';
        if (this._view.insertSpacesInsteadOfTabs)
            tabCode = ' '.repeat(this._view.indentWidth);
        return tabCode;
    }

    // Inserts text both before the cursor and after it
    _insertAroundCursor(before, after) {
        this._buffer.insert_at_cursor(before + after, -1);
        // refresh cursor and move it to the middle
        const cursor = this._buffer.get_iter_at_mark(this._buffer.get_insert());
        cursor.backward_chars(after.length);
        this._buffer.place_cursor(cursor);
    }

    _doAutoIndentBracket(cursor, lineBefore) {
        // Get the line's leading whitespace
        const [whitespace] = (/^[ \t]+/).exec(lineBefore) || [''];

        const addIndent = `\n${whitespace}${this._getTabString()}`;
        let addAfter = '';

        // Get everything on the line after the cursor position
        const lineEnd = cursor.copy();
        if (!cursor.ends_line())
            lineEnd.forward_to_line_end();
        const lineAfter = this._buffer.get_text(cursor, lineEnd, false);
        if (lineAfter) {
            // text between beginning and ending brackets should come in the
            // middle row
            const endingPos = lineAfter.indexOf('}');
            const end = cursor.copy();
            if (endingPos === -1)
                end.forward_to_line_end();
            else
                end.forward_chars(endingPos);
            const endingText = this._buffer.get_text(cursor, end, false).trim();
            this._buffer.delete(cursor, end);
            addAfter = `${endingText}\n${whitespace}`;
        }

        this._insertAroundCursor(addIndent, addAfter);
        this._view.reset_cursor_blink();
        return Gdk.EVENT_STOP;
    }

    _doAutoUnindentClosingBracket(cursor) {
        const pos = cursor.copy();
        const defaultEditable = this._view.editable;

        // Replicate GtkSourceView's "smart backspace" algorithm
        // Adapted from do_smart_backspace in gtksourceview/gtksourceview.c
        const visualColumn = this._view.get_visual_column(pos);
        let {indentWidth} = this._view;
        if (indentWidth <= 0)
            indentWidth = this._view.tabWidth;
        if (visualColumn < indentWidth || visualColumn % indentWidth !== 0)
            return Gdk.EVENT_PROPAGATE;

        const targetColumn = visualColumn - indentWidth;
        while (this._view.get_visual_column(pos) > targetColumn)
            pos.backward_cursor_position();
        this._buffer.delete_interactive(pos, cursor, defaultEditable);
        while (this._view.get_visual_column(pos) < targetColumn) {
            if (!this._buffer.insert_interactive(pos, ' ', 1, defaultEditable))
                break;
        }

        this._buffer.insert_at_cursor('}', -1);
        this._view.reset_cursor_blink();
        return Gdk.EVENT_STOP;
    }

    // Auto indent algorithm based on intelligent_text_completion.py from
    // https://github.com/nymanjens/gedit-intelligent-text-completion
    _onKeyPress(view, event) {
        const [hadSelection, cursor] = this._buffer.get_selection_bounds();
        if (hadSelection)
            return Gdk.EVENT_PROPAGATE;

        // String roughly corresponding to what is being typed
        const [, keyval] = event.get_keyval();
        let typedChar = String.fromCodePoint(Gdk.keyval_to_unicode(keyval));
        if (typedChar === '\r')
            typedChar = '\n';
        if (!'\n}'.includes(typedChar))
            return Gdk.EVENT_PROPAGATE;

        // Get everything on the line up to the cursor position
        const lineStartPos = cursor.copy();
        lineStartPos.set_line_offset(0);
        const lineBefore = this._buffer.get_text(lineStartPos, cursor, false);

        // Typing a newline directly after an opening brace
        if (typedChar === '\n' && lineBefore.endsWith('{')) {
            this._buffer.begin_user_action();
            try {
                return this._doAutoIndentBracket(cursor, lineBefore);
            } finally {
                this._buffer.end_user_action();
            }
        }

        // Typing a closing brace on a line that consists only of whitespace
        if (typedChar === '}' && !(/\S/).test(lineBefore)) {
            this._buffer.begin_user_action();
            try {
                return this._doAutoUnindentClosingBracket(cursor);
            } finally {
                this._buffer.end_user_action();
            }
        }

        return Gdk.EVENT_PROPAGATE;
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

    compile(userInitiated = true) {
        this.emit('should-compile', userInitiated);
        this._compileTimeout = null;
        return GLib.SOURCE_REMOVE;
    }

    // returns a diff in the form of an ed-script, which is the format output by
    // the diff tool that takes the fewest bytes. It is forward-only; you cannot
    // apply it in reverse.
    async _diffFromLastCompiledText() {
        const oldBytes = ByteArray.fromString(this._lastCompiledText);
        const oldTextFd = HackToolbox.open_bytes(oldBytes);

        const launcher = new Gio.SubprocessLauncher({
            flags: Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE,
        });
        launcher.take_fd(oldTextFd, oldTextFd);
        const proc = launcher.spawnv(['diff', '-e', `/dev/fd/${oldTextFd}`, '-']);
        const [stdout] = await proc.communicate_utf8_async(this._buffer.text, null);
        return stdout;
    }

    async _recordErrorMetrics(results) {
        if (this._numErrors === 0 && !this._inMetricsEvent)
            return;

        const recorder = EosMetrics.EventRecorder.get_default();
        const eventKey = new GLib.Variant('(ss)',
            [Gio.Application.get_default().applicationId, this._userFunction]);

        if (this._numErrors && !this._inMetricsEvent) {
            const payload = new GLib.Variant('(sssa(suquq))', [
                Gio.Application.get_default().applicationId,
                this._userFunction,
                this._buffer.text,
                results.map(result => {
                    const {start, message} = result;
                    const end = result.end || start;
                    return [message, start.line, start.column,
                        end.line, end.column];
                }),
            ]);
            recorder.record_start(CODEVIEW_ERROR_EVENT, eventKey, payload);
            this._inMetricsEvent = true;
            this._lastCompiledText = this._buffer.text;
        } else if (this._inMetricsEvent) {
            const edScript = await this._diffFromLastCompiledText();
            const payload = new GLib.Variant('s', edScript);
            if (this._numErrors) {
                recorder.record_progress(CODEVIEW_ERROR_EVENT, eventKey, payload);
                this._lastCompiledText = this._buffer.text;
            } else {
                recorder.record_stop(CODEVIEW_ERROR_EVENT, eventKey, payload);
                this._inMetricsEvent = false;
                this._lastCompiledText = null;
            }
        }
    }

    setCompileResults(results, userInitiated = true) {
        const [begin, bound] = this._buffer.get_bounds();
        this._buffer.remove_source_marks(begin, bound, MarkType.ERROR);
        this._buffer.remove_tag(this._errorStyle, begin, bound);
        results.forEach(({start, end, message, fixme}) => {
            // Avoid aborting on bad input - classy GtkTextBuffer crash
            if (start.column < 0)
                start.column = 0;
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
            this._buffer.apply_tag(this._errorStyle, iter, endIter);

            if (fixme)
                mark._fixme = fixme;
        });

        if (this._numErrors !== results.length) {
            this._numErrors = results.length;
            // Only play sounds when user compiles the code
            if (userInitiated) {
                if (this._numErrors)
                    SoundServer.getDefault().play('codeview/code-error-appearance');
                else
                    SoundServer.getDefault().play('codeview/code-error-disappearance');

                this._recordErrorMetrics(results)
                    .catch(e => logError(e, 'Error while recording error metrics'));
            }
        }
    }

    setCompileResultsFromException(exception, userInitiated = true) {
        this.setCompileResults([{
            start: {
                line: exception.lineNumber - 1,  // remove initial "with(scope)" line
                column: exception.columnNumber - 1,  // seems to be 1-based
            },
            message: exception.message,
        }], userInitiated);
    }

    // Like setCompileResultsFromException(), but instead this is an exception
    // thrown by the user code itself (for example, during test execution.)
    setCompileResultsFromUserFunctionException(exception, userInitiated = true) {
        const stackFrames = exception.stack.split('\n');
        // The format of stack frames originating inside a function created with
        // new Function(...) looks like this:
        // /original/file.js line 321 > Function:12:3. We are looking for the
        // topmost such line, since that will contain the line and column where
        // the exception was thrown in the user code (12 and 3 in this example)
        const userScriptStackFrame = stackFrames.find(line => (/ > Function:/).test(line));
        const [line, column] = userScriptStackFrame.split(':').slice(-2);
        this.setCompileResults([{
            start: {
                line: line - 1,
                column: column - 1,
            },
            message: exception.message,
        }], userInitiated);
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

    // Get the body of a function defined at top level, removing the starting
    // "function foo() {" and the ending curly brace.
    getFunctionBody(fname) {
        const funcDecl = this.ast.body.find(({type, id}) =>
            type === 'FunctionDeclaration' && id.name === fname);
        if (typeof funcDecl === 'undefined')
            throw new Error(`No function named ${fname} was defined at toplevel`);

        const {start} = funcDecl.body.loc;
        // Workaround for mozjs52 bug; funcDecl.body.loc.end is incorrect
        const {end} = funcDecl.loc;
        const lines = this._buffer.text.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/);

        // Add 2 to the start column, 1 because slice() is inclusive, and
        // another 1 because the position returned by the parser is the one
        // before the opening brace
        lines[start.line - 1] = lines[start.line - 1].slice(start.column + 2);
        // Subtract 1 from the end column, because the end location is pointing
        // at the function's closing brace, which should not be included.
        lines[end.line - 1] = lines[end.line - 1].slice(0, end.column - 1);
        let funcBody = lines.filter((line, ix) =>
            ix >= start.line - 1 && ix <= end.line - 1)
            .join('\n');

        // Chop off leading \n after the opening brace, if it was still there
        if (funcBody.startsWith('\n'))
            funcBody = funcBody.slice(1);

        return funcBody;
    }
});
