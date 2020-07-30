/*
 * Copyright © 2020 Endless OS Foundation LLC.
 *
 * This file is part of hack-toolbox-app
 * (see https://github.com/endlessm/hack-toolbox-app).
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
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
