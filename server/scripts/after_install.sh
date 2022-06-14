#!/bin/bash
cd /home/ec2-user/server
#docker ps -aq | xargs docker stop | xargs docker rm
docker stop server_container
docker rm server_container
docker image prune --force
docker build -t server .
