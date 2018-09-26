/* exported getModulesGResource, proxyCallWithFDList, transformStringToFD */
/* global pkg */

const ByteArray = imports.byteArray;
const {Gio, GLib, HackToolbox} = imports.gi;

function _promisify(proto, asyncFunc, finishFunc) {
    proto[`_original_${asyncFunc}`] = proto[asyncFunc];
    proto[asyncFunc] = function(...args) {
        if (!args.every(arg => typeof arg !== 'function'))
            return this[`_original_${asyncFunc}`](...args);
        return new Promise((resolve, reject) => {
            const callStack = new Error().stack.split('\n')
                .filter(line => !line.match(/promisify/))
                .join('\n');
            this[`_original_${asyncFunc}`](...args, function(source, res) {
                try {
                    const result = source[finishFunc](res);
                    if (Array.isArray(result) && result.length > 1 && result[0] === true)
                        result.shift();
                    resolve(result);
                } catch (error) {
                    if (error.stack)
                        error.stack += `### Promise created here: ###\n${callStack}`;
                    else
                        error.stack = callStack;
                    reject(error);
                }
            });
        });
    };
}
Gio._promisify = _promisify;
Gio._LocalFilePrototype = Gio.File.new_for_path('').constructor.prototype;
const ResourceFilePrototype = Gio.File.new_for_uri('resource:///').constructor.prototype;

Gio._promisify(Gio._LocalFilePrototype, 'replace_contents_bytes_async',
    'replace_contents_finish');
Gio._promisify(ResourceFilePrototype, 'copy_async', 'copy_finish');
Gio._promisify(Gio.OutputStream.prototype, 'splice_async', 'splice_finish');
Gio._promisify(Gio.Subprocess.prototype, 'wait_check_async',
    'wait_check_finish');

function _defaultReplyFunc(result, exc) {
    if (exc !== null)
        logError(exc, 'Ignored exception from DBus method');
}

// Copied and adjusted from gjs/modules/overrides/Gio.js
function proxyCallWithFDList(methodName, sync, inSignature, ...arg_array) {
    let flags = 0;
    let cancellable = null;
    let fdlist = null;
    let replyFunc = _defaultReplyFunc;

    const signatureLength = inSignature.length;
    const minNumberArgs = signatureLength;
    const maxNumberArgs = signatureLength + 4;

    if (arg_array.length < minNumberArgs) {
        throw new Error(`Not enough arguments passed for method ${methodName}. ` +
            `Expected ${minNumberArgs}, got ${arg_array.length}`);
    } else if (arg_array.length > maxNumberArgs) {
        throw new Error(`Too many arguments passed for method ${methodName}. ` +
            `Maximum is ${maxNumberArgs} including one callback, ` +
            'Gio.Cancellable, Gio.UnixFDList, and/or flags');
    }

    while (arg_array.length > signatureLength) {
        const argNum = arg_array.length - 1;
        const arg = arg_array.pop();
        if (typeof arg === 'function' && !sync) {
            replyFunc = arg;
        } else if (typeof arg === 'number') {
            flags = arg;
        } else if (arg instanceof Gio.Cancellable) {
            cancellable = arg;
        } else if (arg instanceof Gio.UnixFDList) {
            fdlist = arg;
        } else {
            throw new Error(`Argument ${argNum} of method ${methodName} is ` +
                `${typeof arg}. It should be a callback, flags, ` +
                'Gio.UnixFDList, or a Gio.Cancellable');
        }
    }

    var inVariant = new GLib.Variant(`(${inSignature.join('')})`, arg_array);

    function asyncCallback(proxy, result) {
        try {
            const [outVariant, outFDList] =
                proxy.call_with_unix_fd_list_finish(result);
            replyFunc(outVariant.deep_unpack(), null, outFDList);
        } catch (e) {
            replyFunc([], e);
        }
    }

    if (sync) {
        const [outVariant, outFDList] = this.call_with_unix_fd_list_sync(
            methodName, inVariant, flags, -1, fdlist, cancellable);
        void outFDList;  // what to do with this?
        return outVariant.deep_unpack();
    }

    return this.call_with_unix_fd_list(methodName, inVariant, flags, -1, fdlist,
        cancellable, asyncCallback);
}

async function transformStringToFD(str, transformArgv, cancellable = null) {
    const proc = new Gio.Subprocess({
        argv: transformArgv,
        flags: Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE,
    });
    proc.init(null);

    const stdinBytes = ByteArray.fromString(str);
    const stdinBuf = Gio.MemoryInputStream.new_from_bytes(stdinBytes);
    const flags = Gio.OutputStreamSpliceFlags.CLOSE_SOURCE |
        Gio.OutputStreamSpliceFlags.CLOSE_TARGET;
    await proc.get_stdin_pipe().splice_async(stdinBuf, flags, GLib.PRIORITY_DEFAULT,
        cancellable);

    return proc.get_stdout_pipe().fd;
}

function getModulesGResource() {
    const pkgdatadir = Gio.File.new_for_path(pkg.pkgdatadir);
    const resource = pkgdatadir.get_child('customModules.gresource');
    return HackToolbox.open_fd_readonly(resource);
}
