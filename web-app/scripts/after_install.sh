#!/bin/bash
cd /home/ec2-user/web-app 
docker stop webapp_container
docker rm webapp_container
docker image prune --force
docker build -t webapp .
