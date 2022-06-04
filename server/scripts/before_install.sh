#!/bin/bash
cd /home/ec2-user/server
set -e
yum update -y
#ps aux | grep "[n]ode" | awk '{print $2}' | sudo xargs kill -KILL
killall node
