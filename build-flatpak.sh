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
  com.endlessm.HackToolbox.json.in \
  > com.endlessm.HackToolbox.json

flatpak-builder build --ccache com.endlessm.HackToolbox.json --repo=${REPO}
flatpak build-bundle ${REPO} com.endlessm.HackToolbox.flatpak com.endlessm.HackToolbox ${BRANCH}
# Reload the GSS to make sure we have the freshest changes in case it was modified for testing
# this build.
echo
echo Restarting the GSS
gdbus call -e -d com.endlessm.GameStateService -o /com/endlessm/GameStateService -m com.endlessm.GameStateService.Reload > /dev/null

