#!/bin/bash
cd /home/ec2-user/web-app
docker run -d --name webapp_container -p 3000:3000 webapp 
