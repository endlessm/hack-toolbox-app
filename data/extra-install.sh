#!/bin/sh
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

FRAMEWORKAPPS="
	com.endlessm.dinosaurs.en
	com.endlessm.encyclopedia.en
"

LOCKSCREENSDIR=${MESON_INSTALL_PREFIX}/share/com.hack_computer.HackToolbox/lockscreens

for app in ${FRAMEWORKAPPS}; do
  ln -s framework.1 ${LOCKSCREENSDIR}/lock.${app}.1
  ln -s framework.2 ${LOCKSCREENSDIR}/lock.${app}.2
done
