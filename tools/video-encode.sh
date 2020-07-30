#!/bin/bash
##
## Copyright © 2020 Endless OS Foundation LLC.
##
## This file is part of hack-toolbox-app
## (see https://github.com/endlessm/hack-toolbox-app).
##
## This program is free software; you can redistribute it and/or modify
## it under the terms of the GNU General Public License as published by
## the Free Software Foundation; either version 2 of the License, or
## (at your option) any later version.
##
## This program is distributed in the hope that it will be useful,
## but WITHOUT ANY WARRANTY; without even the implied warranty of
## MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
## GNU General Public License for more details.
##
## You should have received a copy of the GNU General Public License along
## with this program; if not, write to the Free Software Foundation, Inc.,
## 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
##

echo_help_and_exit()
{
	echo "Usage: $0 remove-alpha png_dir | encode png_dir [pattern output.webm]"
	echo "ffmpeg is available at https://ffbinaries.com/downloads"
	echo "example pattern: '03_SideTrack_L1_Open_%03d.png'"
	exit
}

if [ -z $2 ]; then
	echo_help_and_exit
fi

DIR=$2

cd "$DIR"

case "$1" in
	remove-alpha)
		# Remove alpha from source images
		for a in *.png; do
			echo Removing alpha channel from $a;
			convert $a -alpha off $a;
		done
  	;;
	encode)
		PATTERN=$3
		OUTPUT=$4
		# Encode video in 2 pass
		ffmpeg -framerate 20 -i ${PATTERN} -c:v libvpx -b:v 2M -pass 1 -an -f webm /dev/null && \
		ffmpeg -framerate 20 -i ${PATTERN} -c:v libvpx -b:v 2M -pass 2 $OUTPUT
	;;
	*)
	echo_help_and_exit
	;;
esac

cd "$OLDPWD"
