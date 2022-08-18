#!/bin/bash
set -ex
export JEKYLL_ENV=production

# bundle config --local path vendor/bundle
# bundle install

cp original_website_index.md index.md
cp robots-original.txt robots.txt

# Build nonversioned site and the dev documentation (faster)
./pull-extra.sh master
ruby process_front_matter.rb --add-title pages release-notes
ruby process_front_matter.rb --add-title --version-permalinks --add-redirects docs truffle/docs
bundle exec jekyll build --config _config_community.yml

# Use ./serve.sh to serve the website without rebuilding
