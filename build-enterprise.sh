#!/bin/bash
set -ex
export JEKYLL_ENV=production

bundle config --local path vendor/bundle
bundle install

cp _layouts/ohc.html _layouts/docs.html
cp ohc-index.md index.md
bundle exec jekyll build --config _config_enterprise.yml
rm _site/toc.htm
cp toc.htm _site/_toc.htm
cp licensing-information.html _site/docs/overview/licensing-information.html
mv _site html
zip -r html html/ -x *.DS_Store
git checkout _layouts/docs.html
git checkout index.md
