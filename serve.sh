#! /usr/bin/env bash
cd _site
echo "Server address: http://127.0.0.1:4000/"
ruby -run -e httpd . -p4000
