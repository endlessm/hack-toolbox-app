/* exported bubbles, flipped, normal, scrambled, zalgo */

const Utils = imports.framework.utils;

// The "bubbles", "flipped" and "zalgo" transformations are taken from Lunicode:
// https://github.com/combatwombat/Lunicode.js/blob/master/lunicode.js
// License: MIT

const FLIP_MAP = {
    // Thanks to
    // - David Faden: http://www.revfad.com/flip.html
    // - http://en.wikipedia.org/wiki/Transformation_of_text
    a: '\u0250',
    b: 'q',
    c: '\u0254',
    d: 'p',
    e: '\u01DD',
    f: '\u025F',
    g: '\u0253',
    h: '\u0265',
    i: '\u0131',
    j: '\u027E',
    k: '\u029E',
    l: '\u006C',
    m: '\u026F',
    n: 'u',
    r: '\u0279',
    t: '\u0287',
    v: '\u028C',
    w: '\u028D',
    y: '\u028E',
    A: '\u2200',
    B: 'ᙠ',
    C: '\u0186',
    D: 'ᗡ',
    E: '\u018e',
    F: '\u2132',
    G: '\u2141',
    J: '\u017f',
    K: '\u22CA',
    L: '\u02e5',
    M: 'W',
    P: '\u0500',
    Q: '\u038C',
    R: '\u1D1A',
    T: '\u22a5',
    U: '\u2229',
    V: '\u039B',
    Y: '\u2144',
    1: '\u21c2',
    2: '\u1105',
    3: '\u0190',
    4: '\u3123',
    5: '\u078e',
    6: '9',
    7: '\u3125',
    '&': '\u214b',
    '.': '\u02D9',
    '"': '\u201e',
    ';': '\u061b',
    '[': ']',
    '(': ')',
    '{': '}',
    '?': '\u00BF',
    '!': '\u00A1',
    "'": ',',
    '<': '>',
    '\u203E': '_',
    '\u00AF': '_',
    '\u203F': '\u2040',
    '\u2045': '\u2046',
    '\u2234': '\u2235',
    '\r': '\n',
    ß: 'ᙠ',

    '\u0308': '\u0324',
    '´': ' \u0317',
    '`': ' \u0316',
    '^': ' \u032E',
};
// invert the map
Object.keys(FLIP_MAP).forEach(key => {
    FLIP_MAP[FLIP_MAP[key]] = key;
});

const BUBBLES_MAP = {
    0: '\u24ea',
};
// Numbers
for (let i = 49; i <= 57; i++)
    BUBBLES_MAP[String.fromCharCode(i)] = String.fromCharCode(i + 9263);
// Capital letters
for (let i = 65; i <= 90; i++)
    BUBBLES_MAP[String.fromCharCode(i)] = String.fromCharCode(i + 9333);
// Lower letters
for (let i = 97; i <= 122; i++)
    BUBBLES_MAP[String.fromCharCode(i)] = String.fromCharCode(i + 9327);

const ZALGO_DIACRITICS = {
    top: [],
    middle: [],
    bottom: [],

    init() {
        // Sort diacritics in top, bottom or middle

        for (let i = 768; i <= 789; i++)
            this.top.push(String.fromCharCode(i));

        for (let i = 790; i <= 819; i++) {
            if (i !== 794 && i !== 795)
                this.bottom.push(String.fromCharCode(i));
        }

        this.top.push(String.fromCharCode(794));
        this.top.push(String.fromCharCode(795));

        for (let i = 820; i <= 824; i++)
            this.middle.push(String.fromCharCode(i));

        for (let i = 825; i <= 828; i++)
            this.bottom.push(String.fromCharCode(i));

        for (let i = 829; i <= 836; i++)
            this.top.push(String.fromCharCode(i));

        this.top.push(String.fromCharCode(836));
        this.bottom.push(String.fromCharCode(837));
        this.top.push(String.fromCharCode(838));
        this.bottom.push(String.fromCharCode(839));
        this.bottom.push(String.fromCharCode(840));
        this.bottom.push(String.fromCharCode(841));
        this.top.push(String.fromCharCode(842));
        this.top.push(String.fromCharCode(843));
        this.top.push(String.fromCharCode(844));
        this.bottom.push(String.fromCharCode(845));
        this.bottom.push(String.fromCharCode(846));
        // 847 (U+034F) is invisible:
        // http://en.wikipedia.org/wiki/Combining_grapheme_joiner
        this.top.push(String.fromCharCode(848));
        this.top.push(String.fromCharCode(849));
        this.top.push(String.fromCharCode(850));
        this.bottom.push(String.fromCharCode(851));
        this.bottom.push(String.fromCharCode(852));
        this.bottom.push(String.fromCharCode(853));
        this.bottom.push(String.fromCharCode(854));
        this.top.push(String.fromCharCode(855));
        this.top.push(String.fromCharCode(856));
        this.bottom.push(String.fromCharCode(857));
        this.bottom.push(String.fromCharCode(858));
        this.top.push(String.fromCharCode(859));
        this.bottom.push(String.fromCharCode(860));
        this.top.push(String.fromCharCode(861));
        this.top.push(String.fromCharCode(861));
        this.bottom.push(String.fromCharCode(863));
        this.top.push(String.fromCharCode(864));
        this.top.push(String.fromCharCode(865));
    },
};
ZALGO_DIACRITICS.init();

function normal(text) {
    return text;
}

function flipped(text) {
    return [...text].map(ch => FLIP_MAP[ch] || ch)
        .reverse()
        .join('');
}

function bubbles(text) {
    // Circles around Letters. Uses special circle characters for some letters
    // and combining characters for the rest
    // Thanks to
    // - Alan Wood: http://www.alanwood.net/unicode/enclosed_alphanumerics.html
    let first = true;

    const ret = [...text].map(letter => {
        let ch = BUBBLES_MAP[letter];

        // No dedicated circled character available? Use a Combining Diacritical
        // Mark surrounded with non-breaking spaces, so it doesn't overlap
        if (typeof ch === 'undefined') {
            if (letter.charCodeAt(0) >= 33) {
                ch = letter + String.fromCharCode(8413);
                if (!first) {
                    ch = String.fromCharCode(8239) + String.fromCharCode(160) +
                        String.fromCharCode(160) + String.fromCharCode(8239) +
                        ch;
                }
            } else {
                ch = letter;
            }
        }
        first = ch === '\n';
        return ch;
    });
    return ret.join('');
}

function scrambled(text) {
    let words = text.split(' ');
    words = words.map(word => {
        const sequence = Array.from({length: word.length - 2}, () => Math.random());
        const letters = word.split('');
        const beginning = letters[0];  // eslint-disable-line prefer-destructuring
        const middle = Utils.shuffle(letters.slice(1, -1), sequence);
        const end = letters[letters.length - 1];
        return beginning + middle.join('') + end;
    });
    return words.join(' ');
}

function zalgo(text) {
    // How many diacritic marks shall we put on top/bottom?
    const MAX_HEIGHT = 15;
    // 0-100%. maxHeight 100 and randomization 20%: the height goes from 80 to
    // 100. randomization 70%, height goes from 30 to 100.
    const RANDOMIZATION = 100;

    let newText = '';
    [...text].forEach(letter => {
        let newChar = letter;

        // Middle
        // Put just one of the middle characters there, or it gets crowded
        const middleLen = ZALGO_DIACRITICS.middle.length;
        newChar += ZALGO_DIACRITICS.middle[Math.floor(Math.random() * middleLen)];

        // Top
        // Put up to this.options.maxHeight random diacritics on top.
        // optionally fluctuate the number via the randomization value (0-100%)
        // randomization 100%: 0 to maxHeight
        //                30%: 70% of maxHeight to maxHeight
        //                 x%: 100-x% of maxHeight to maxHeight
        const topLen = ZALGO_DIACRITICS.top.length;
        const topNum = MAX_HEIGHT - Math.random() * (RANDOMIZATION / 100 * MAX_HEIGHT);
        for (let count = 0; count < topNum; count++)
            newChar += ZALGO_DIACRITICS.top[Math.floor(Math.random() * topLen)];

        // Bottom
        const bottomLen = ZALGO_DIACRITICS.bottom.length;
        const bottomNum = MAX_HEIGHT - Math.random() * (RANDOMIZATION / 100 * MAX_HEIGHT);
        for (let count = 0; count < bottomNum; count++)
            newChar += ZALGO_DIACRITICS.bottom[Math.floor(Math.random() * bottomLen)];

        newText += newChar;
    });
    return newText;
}

