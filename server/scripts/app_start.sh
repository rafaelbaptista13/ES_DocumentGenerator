#!/bin/bash
cd /home/ec2-user/server
docker run -d -p 4000:4000 server --name server_container
