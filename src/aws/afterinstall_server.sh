#!/usr/bin/env bash

if [ -e /etc/environment_emobility.sh ]
then
  . /etc/environment_emobility.sh
else
  echo "/etc/environment_emobility.sh file not found, exiting"
  exit 1
fi

[ -z $emobility_install_dir ] && { echo "emobility installation directory env variable not found, exiting"; exit 1; }
[ -z $emobility_landscape ] && { echo "emobility landscape env variable not found, exiting"; exit 1; }
[ -z $emobility_service_type ] && { echo "emobility env service type variable not found, exiting"; exit 1; }
[ -z $emobility_user ] && { echo "emobility user env variable not found, exiting"; exit 1; }
[ -z $emobility_group ] && { echo "emobility group env variable not found, exiting"; exit 1; }

[ -e /etc/nginx/sites-enabled/default ] && sudo rm /etc/nginx/sites-enabled/default

sudo cp $emobility_install_dir/dist/assets/configs-aws/nginx-$emobility_service_type-$emobility_landscape.conf /etc/nginx/sites-available/default_emobility
sudo ln -sf /etc/nginx/sites-available/default_emobility /etc/nginx/sites-enabled/
sudo cat << EOF > /etc/nginx/conf.d/aws.conf
log_format aws '$http_x_forwarded_for - $http_referer - [$time_local] "$request" $status $body_bytes_sent';
EOF
sudo systemctl reload nginx
cp $emobility_install_dir/dist/assets/configs-aws/config-$emobility_service_type-$emobility_landscape.json $emobility_install_dir/dist/assets/config.json
sudo chown $emobility_user.$emobility_group $emobility_install_dir
