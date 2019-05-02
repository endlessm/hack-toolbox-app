#!/bin/bash

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
