#!/bin/bash
cd /home/ec2-user/web-app/src
npm start > app.out.log 2> app.err.log < /dev/null &
pm2 start npm --name "app" -- start
pm2 startup
pm2 save
pm2 restart all
