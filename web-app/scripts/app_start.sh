#!/bin/bash
cd /home/ec2-user/web-app
#npm start > app.out.log 2> app.err.log < /dev/null &
#serve -s build > app.out.log 2> app.err.log < /dev/null &
docker run -p 3000:3000 webapp
