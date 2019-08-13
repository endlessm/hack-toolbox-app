#!/bin/sh

FRAMEWORKAPPS="
	com.endlessm.dinosaurs.en
	com.endlessm.encyclopedia.en
"

LOCKSCREENSDIR=${MESON_INSTALL_PREFIX}/share/com.hack_computer.HackToolbox/lockscreens

for app in ${FRAMEWORKAPPS}; do
  ln -s framework.1 ${LOCKSCREENSDIR}/lock.${app}.1
  ln -s framework.2 ${LOCKSCREENSDIR}/lock.${app}.2
done
