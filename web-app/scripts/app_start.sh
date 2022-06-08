#!/bin/bash
cd /home/ec2-user/web-app
docker run -d -p 3000:3000 webapp --name webapp_container
