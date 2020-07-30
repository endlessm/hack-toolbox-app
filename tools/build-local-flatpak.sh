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

set -e
source_dir="$(git rev-parse --show-toplevel)"

pushd "$source_dir"

# If the GIT_CLONE_BRANCH var is not defined, we replace it so that it'll in fact set the
# git branch to "" but add also "type": "dir" so it builds from the current directory.
# This is hacky but until we need to keep git as the source type, then it's the less intrusive.
GIT_CLONE_BRANCH=${GIT_CLONE_BRANCH:-'", "type": "dir'}
REPO=${REPO:-repo}
BRANCH=${BRANCH:-master}

sed -e "s|@GIT_CLONE_BRANCH@|${GIT_CLONE_BRANCH}|g" \
    -e "s|@BRANCH@|${BRANCH}|g" \
  com.hack_computer.HackToolbox.json.in > com.hack_computer.HackToolbox.json

# Add any extra options from the user to the flatpak-builder command (e.g. --install)
flatpak-builder build --user --force-clean com.hack_computer.HackToolbox.json --repo=${REPO} $@ || ret=$?

popd

exit $ret
