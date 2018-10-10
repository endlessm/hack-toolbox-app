/* exported caesar */

// Adapted from https://gist.github.com/EvanHahn/2587465, public domain
function caesar(text, rotation, decodefunc) {
    const decomposedText = text.normalize('NFKD');
    let output = '';

    for (let i = 0; i < decomposedText.length; i++) {
        let c = decomposedText[i];
        const code = decomposedText.codePointAt(i);

        if (code >= 65 && code <= 90) {
            // Uppercase letters
            c = String.fromCodePoint((code - 65 + rotation) % 26 + 65);
            if (decodefunc)
                c = String.fromCodePoint(decodefunc(c.codePointAt(0) - 65) + 65);
        } else if (code >= 97 && code <= 122) {
            // Lowercase letters
            c = String.fromCodePoint((code - 97 + rotation) % 26 + 97);
            if (decodefunc)
                c = String.fromCodePoint(decodefunc(c.codePointAt(0) - 97) + 97);
        }

        output += c;
    }

    return output;
}
