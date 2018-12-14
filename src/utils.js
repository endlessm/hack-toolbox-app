const {Gio} = imports.gi;

// Taken from GJS 1.54

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
