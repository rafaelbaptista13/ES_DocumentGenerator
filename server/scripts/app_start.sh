#!/bin/bash
cd /home/ec2-user/server
npm start > app.out.log 2> app.err.log < /dev/null &
