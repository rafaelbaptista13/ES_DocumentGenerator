#!/bin/bash
cd /home/ec2-user/server
set -e
yum update -y
ps aux | grep node | cut -d' ' -f7 | sudo xargs kill -KILL
