#!/bin/bash
cd /home/ec2-user/web-app/src
npm start > app.out.log 2> app.err.log < /dev/null &
