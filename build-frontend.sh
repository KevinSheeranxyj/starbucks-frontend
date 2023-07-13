#!/bin/bash
git reset --hard
git pull
yarn build
docker rmi monitor_nginx:2.0
if [[ $? == 1 ]]
then
        echo "no old image to delete, just ignore"
fi

docker build -t monitor_nginx:2.0 -f Dockerfile .
docker save -o ../deliver/nginx.tar monitor_nginx:2.0