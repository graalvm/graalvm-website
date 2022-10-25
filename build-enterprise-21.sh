#!/bin/bash
set -ex
export JEKYLL_ENV=production

# Build GraalVM Enterprise documentation ver 21 for Oracle Help Center

# bundle config --local path vendor/bundle
# bundle install

cp _layouts/ohc.html _layouts/docs.html
cp _layouts/ohc.html _layouts/docs-experimental.html
# This is required to point to index page 21
cp ohc-index-21.md index.md
cp robots-ohc.txt robots.txt
# This is required to point to Release Notes 21.x
rm -rf release-notes/enterprise/graalvm-enterprise-release-notes-22.md
cp toc-21.md toc.md

# Clone docs sources from graal, js, graalpy, fastr, truffleruby cpu/graal-vm/21.3 branch into graalvm.org
./pull-extra.sh cpu/graal-vm/21.3
# Add titles for all pages
ruby process_front_matter.rb --add-title pages release-notes docs truffle/docs
# Build the documentation version 21. The output saved in _site/.
bundle exec jekyll build --config _config_enterprise_21.yml

# Move the output to html directory (required for OHC)
mv _site html
zip -r html html/ -x *.DS_Store
rm -rf html/

git checkout _layouts/docs.html
git checkout _layouts/docs-experimental.html
git checkout index.md
git checkout robots.txt
git checkout Gemfile.lock
# Restore release notes 22.x
git checkout toc.md
git checkout release-notes/enterprise/graalvm-enterprise-release-notes-22.md
