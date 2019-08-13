#!/bin/bash
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

