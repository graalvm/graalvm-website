#!/bin/bash
set -ex
export JEKYLL_ENV=production

# Build Oracle GraalVM for JDK 20 documentation for Oracle Help Center

# bundle config --local path vendor/bundle
# bundle install

cp _layouts/ohc.html _layouts/docs.html
cp _layouts/ohc.html _layouts/ni-docs.html
cp _layouts/ohc.html _layouts/docs-experimental.html
cp _includes/snippet-highlight-ohc _includes/snippet-highlight

# This is required to point to index page JDK 20
cp ohc-index-jdk20.md index.md
cp robots-ohc.txt robots.txt

# This is required to point to JDK 20 Release Notes
rm -rf release-notes/enterprise/graalvm-enterprise-release-notes-21.md
rm -rf release-notes/enterprise/graalvm-enterprise-release-notes-22.md
rm -rf release-notes/enterprise/graalvm-for-jdk17.md
cp toc-jdk20.md toc.md

# Clone docs sources from graal into graalvm.org
./pull-extra-ee.sh release/graal-vm/23.0

# Add titles for all pages
ruby process_front_matter.rb --add-title pages release-notes/enterprise docs truffle/docs

# Build the documentation for JDK 20. The output saved in _site.
bundle exec jekyll build --config _config_enterprise_jdk20.yml

# Move the output to html directory (required for OHC)
mv _site html
zip -r html html/ -x *.DS_Store
rm -rf html/

# Restore the defaults
git checkout release-notes/enterprise/graalvm-enterprise-release-notes-21.md
git checkout release-notes/enterprise/graalvm-enterprise-release-notes-22.md
git checkout release-notes/enterprise/graalvm-for-jdk17.md
git checkout toc.md
git checkout _layouts/docs.html
git checkout _layouts/docs-experimental.html
git checkout _layouts/ni-docs.html
git checkout _includes/snippet-highlight
git checkout index.md
git checkout robots.txt
git checkout Gemfile.lock