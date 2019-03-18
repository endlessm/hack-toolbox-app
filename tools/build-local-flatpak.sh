#!/bin/bash
#
# Convenience script to build a Flatpak bundle with the local contents (the original manifest)
# builds from git so changes need to be committed.
#
# Copyright (c) 2018 Endless Mobile Inc.
#
# Author: Joaquim Rocha <jrocha@endlessm.com>
#

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
  com.endlessm.HackToolbox.json.in > com.endlessm.HackToolbox.json

# Add any extra options from the user to the flatpak-builder command (e.g. --install)
flatpak-builder build --user --force-clean com.endlessm.HackToolbox.json --repo=${REPO} $@ || ret=$?

popd

exit $ret