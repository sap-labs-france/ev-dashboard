#!/usr/bin/env bash

if [ -e /etc/environment_emobility.sh ]
then
  . /etc/environment_emobility.sh
else
  echo "/etc/environment_emobility.sh file not found, fallback to hardcoded values"
  emobility_install_dir="/opt/dashboard"
fi

[ -z $emobility_install_dir ] && { echo "emobility installation directory env variable not found, exiting"; exit 1; }

if [ -d $emobility_install_dir ]; then
  rm -rf $emobility_install_dir
fi
