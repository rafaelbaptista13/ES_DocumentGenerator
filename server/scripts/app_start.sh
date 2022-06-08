#!/bin/bash
cd /home/ec2-user/server
docker run -d --name server_container -p 4000:4000 server
