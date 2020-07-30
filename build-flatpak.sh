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
set -x
rm -rf var metadata export build

BRANCH=${BRANCH:-master}
GIT_CLONE_BRANCH=${GIT_CLONE_BRANCH:-HEAD}
RUN_TESTS=${RUN_TESTS:-false}
REPO=${REPO:-repo}

sed \
  -e "s|@BRANCH@|${BRANCH}|g" \
  -e "s|@GIT_CLONE_BRANCH@|${GIT_CLONE_BRANCH}|g" \
  -e "s|\"@RUN_TESTS@\"|${RUN_TESTS}|g" \
  com.hack_computer.HackToolbox.json.in \
  > com.hack_computer.HackToolbox.json

flatpak-builder build --ccache com.hack_computer.HackToolbox.json --repo=${REPO}
flatpak build-bundle ${REPO} com.hack_computer.HackToolbox.flatpak com.hack_computer.HackToolbox ${BRANCH}
# Reload the GSS to make sure we have the freshest changes in case it was modified for testing
# this build.
echo
echo Restarting the GSS
gdbus call -e -d com.hack_computer.GameStateService -o /com/hack_computer/GameStateService -m com.hack_computer.GameStateService.Reload > /dev/null

