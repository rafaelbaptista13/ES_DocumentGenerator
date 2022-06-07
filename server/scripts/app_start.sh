#!/bin/bash
cd /home/ec2-user/server
#npm start > app.out.log 2> app.err.log < /dev/null &
docker run -d -p 4000:4000 server
