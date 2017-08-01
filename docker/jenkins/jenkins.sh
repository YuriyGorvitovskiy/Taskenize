#!/bin/sh

# is a useful one-liner which will give you the full directory name of the script no matter where it is being called from.
location="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $location
docker build --tag taskenize/jenkins .
docker-compose -p taskenize_jenkins -f ./jenkins.yml up -d
