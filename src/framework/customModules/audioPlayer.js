/* exported AudioPlayer */
const {GObject, Gst} = imports.gi;

Gst.init(null);

const RESOURCE_URI = 'resource:///com/endlessm/HackToolbox/CustomModules/soundpacks';

var AudioPlayer = GObject.registerClass({
    Properties: {
        channels: GObject.ParamSpec.uint('channels', 'Channels', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            0, 100, 1),
        soundpack: GObject.ParamSpec.string('soundpack', 'Sound Pack', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            'wacky'),
    },
}, class AudioPlayer extends GObject.Object {
    _init(props = {}) {
        super._init(props);

        this._pipelines = [];
        for (let ch = 0; ch < this._channels; ch++) {
            const playbin = Gst.ElementFactory.make('playbin', `play${ch}`);
            playbin.uri = `${RESOURCE_URI}/${this._soundpack}/${ch % 6}`;
            const pipeline = new Gst.Pipeline({name: `pipeline${ch}`});
            pipeline.add(playbin);

            const bus = pipeline.get_bus();
            bus.add_signal_watch();
            bus.connect('message::error', (b, message) => {
                const [error, debugInfo] = message.parse_error();
                logError(error, debugInfo);
            });
            bus.connect('message::eos', () => {
                this.stop(ch);
            });

            this._pipelines.push(pipeline);
        }
    }

    cleanup() {
        this._pipelines.forEach(p => p.get_bus().remove_signal_watch());
    }

    get channels() {
        return this._channels;
    }

    set channels(value) {
        this._channels = value;
    }

    get soundpack() {
        return this._soundpack;
    }

    set soundpack(value) {
        this._soundpack = value;
    }

    play(channel) {
        const pipeline = this._pipelines[channel];
        if (pipeline.set_state(Gst.State.PLAYING) === Gst.StateChangeReturn.FAILURE)
            throw new Error('play failed');
    }

    stop(channel) {
        const pipeline = this._pipelines[channel];
        if (pipeline.set_state(Gst.State.NULL) === Gst.StateChangeReturn.FAILURE)
            throw new Error('stop failed');
    }
});
