#!/bin/bash
cd /home/ec2-user/web-app/src
serve -s build > app.out.log 2> app.err.log < /dev/null &
teste -f
