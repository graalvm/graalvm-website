#!/bin/bash
set -ex
export JEKYLL_ENV=production

bundle config --local path vendor/bundle
bundle install

cp original_website_index.md index.md
cp _layouts/original_docs_layout.html _layouts/docs.html

bundle exec jekyll build --config _config_community.yml
bundle exec jekyll serve --config _config_community.yml --incremental
