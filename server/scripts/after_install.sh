#!/bin/bash
cd /home/ec2-user/server
#npm install
docker ps -aq | xargs docker stop | xargs docker rm
docker image prune --force
docker build -t server.
