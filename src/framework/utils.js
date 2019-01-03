/* exported getModulesGResource, proxyCallWithFDList, rgbaToString,
transformStringToFD */
/* global pkg */

const ByteArray = imports.byteArray;
const {Gio, GLib, HackToolbox} = imports.gi;

void imports.utils;  // pull in promisified functions

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

// a better version of Gdk.RGBA.to_string() that produces human-readable strings
// when possible.
function rgbaToString(rgba) {
    function format(val) {
        return Math.round(val * 255)
            .toString(16)
            .padStart(2, '0');
    }
    const HUMAN_READABLE_NAMES = {
        '#f0f8ff': 'alice blue',
        '#faebd7': 'antique white',
        '#7fffd4': 'aquamarine',
        '#f0ffff': 'azure',
        '#f5f5dc': 'beige',
        '#ffe4c4': 'bisque',
        '#000000': 'black',
        '#ffebcd': 'blanched almond',
        '#0000ff': 'blue',
        '#8a2be2': 'blue violet',
        '#a52a2a': 'brown',
        '#deb887': 'burlywood',
        '#5f9ea0': 'cadet blue',
        '#7fff00': 'chartreuse',
        '#d2691e': 'chocolate',
        '#ff7f50': 'coral',
        '#6495ed': 'cornflower',
        '#fff8dc': 'cornsilk',
        '#dc143c': 'crimson',
        '#00ffff': 'cyan',
        '#00008b': 'dark blue',
        '#008b8b': 'dark cyan',
        '#b8860b': 'dark goldenrod',
        '#a9a9a9': 'dark gray',
        '#006400': 'dark green',
        '#bdb76b': 'dark khaki',
        '#8b008b': 'dark magenta',
        '#556b2f': 'dark olive green',
        '#ff8c00': 'dark orange',
        '#9932cc': 'dark orchid',
        '#8b0000': 'dark red',
        '#e9967a': 'dark salmon',
        '#8fbc8f': 'dark sea green',
        '#483d8b': 'dark slate blue',
        '#2f4f4f': 'dark slate gray',
        '#00ced1': 'dark turquoise',
        '#9400d3': 'dark violet',
        '#ff1493': 'deep pink',
        '#00bfff': 'deep sky blue',
        '#696969': 'dim gray',
        '#1e90ff': 'dodger blue',
        '#b22222': 'firebrick',
        '#fffaf0': 'floral white',
        '#228b22': 'forest green',
        '#dcdcdc': 'gainsboro',
        '#f8f8ff': 'ghost white',
        '#ffd700': 'gold',
        '#daa520': 'goldenrod',
        '#bebebe': 'gray',
        '#808080': 'web gray',
        '#00ff00': 'green',
        '#008000': 'web green',
        '#adff2f': 'green yellow',
        '#f0fff0': 'honeydew',
        '#ff69b4': 'hot pink',
        '#cd5c5c': 'indian red',
        '#4b0082': 'indigo',
        '#fffff0': 'ivory',
        '#f0e68c': 'khaki',
        '#e6e6fa': 'lavender',
        '#fff0f5': 'lavender blush',
        '#7cfc00': 'lawn green',
        '#fffacd': 'lemon chiffon',
        '#add8e6': 'light blue',
        '#f08080': 'light coral',
        '#e0ffff': 'light cyan',
        '#fafad2': 'light goldenrod',
        '#d3d3d3': 'light gray',
        '#90ee90': 'light green',
        '#ffb6c1': 'light pink',
        '#ffa07a': 'light salmon',
        '#20b2aa': 'light sea green',
        '#87cefa': 'light sky blue',
        '#778899': 'light slate gray',
        '#b0c4de': 'light steel blue',
        '#ffffe0': 'light yellow',
        '#32cd32': 'lime green',
        '#faf0e6': 'linen',
        '#ff00ff': 'magenta',
        '#b03060': 'maroon',
        '#7f0000': 'web maroon',
        '#66cdaa': 'medium aquamarine',
        '#0000cd': 'medium blue',
        '#ba55d3': 'medium orchid',
        '#9370db': 'medium purple',
        '#3cb371': 'medium sea green',
        '#7b68ee': 'medium slate blue',
        '#00fa9a': 'medium spring green',
        '#48d1cc': 'medium turquoise',
        '#c71585': 'medium violet red',
        '#191970': 'midnight blue',
        '#f5fffa': 'mint cream',
        '#ffe4e1': 'misty rose',
        '#ffe4b5': 'moccasin',
        '#ffdead': 'navajo white',
        '#000080': 'navy blue',
        '#fdf5e6': 'old lace',
        '#808000': 'olive',
        '#6b8e23': 'olive drab',
        '#ffa500': 'orange',
        '#ff4500': 'orange red',
        '#da70d6': 'orchid',
        '#eee8aa': 'pale goldenrod',
        '#98fb98': 'pale green',
        '#afeeee': 'pale turquoise',
        '#db7093': 'pale violet red',
        '#ffefd5': 'papaya whip',
        '#ffdab9': 'peach puff',
        '#cd853f': 'peru',
        '#ffc0cb': 'pink',
        '#dda0dd': 'plum',
        '#b0e0e6': 'powder blue',
        '#a020f0': 'purple',
        '#7f007f': 'web purple',
        '#663399': 'rebecca purple',
        '#ff0000': 'red',
        '#bc8f8f': 'rosy brown',
        '#4169e1': 'royal blue',
        '#8b4513': 'saddle brown',
        '#fa8072': 'salmon',
        '#f4a460': 'sandy brown',
        '#2e8b57': 'sea green',
        '#fff5ee': 'seashell',
        '#a0522d': 'sienna',
        '#c0c0c0': 'silver',
        '#87ceeb': 'sky blue',
        '#6a5acd': 'slate blue',
        '#708090': 'slate gray',
        '#fffafa': 'snow',
        '#00ff7f': 'spring green',
        '#4682b4': 'steel blue',
        '#d2b48c': 'tan',
        '#008080': 'teal',
        '#d8bfd8': 'thistle',
        '#ff6347': 'tomato',
        '#40e0d0': 'turquoise',
        '#ee82ee': 'violet',
        '#f5deb3': 'wheat',
        '#ffffff': 'white',
        '#f5f5f5': 'white smoke',
        '#ffff00': 'yellow',
        '#9acd32': 'yellow green',
    };

    let retval = rgba.to_string();  // fallback
    if (rgba.alpha === 1.0)
        retval = `#${format(rgba.red)}${format(rgba.green)}${format(rgba.blue)}`;
    if (retval in HUMAN_READABLE_NAMES)
        return HUMAN_READABLE_NAMES[retval];

    return retval;
}
