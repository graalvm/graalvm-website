#! /usr/bin/env bash
## Pull open source documentation from GitHub /graalvm/docs/
set -e
release_branch="$1"
echo "Release branch: $release_branch"
# set -x

# How to use:
# Set SOURCE_WORKSPACE to your workspace dir with graal,js,truffleruby,graalpython,fastr repos
# Then git worktrees will automatically be created to save space and time

mkdir -p "repos"

# Clean docs before pulling them again. absolutize.rb modifies files under docs/,
# not in the repo (otherwise it cannot know if relative files exist).
git clean -Xdf docs

function clone_or_pull() {
  name="$1"
  branch="$2"
  dir="$PWD/repos/$name"
  if [ -d "$dir" ]; then
    pushd $dir
    git checkout website
    if [ -z "$NOFETCH" ]; then
      echo "git fetch origin"
      git fetch origin
    fi
    if git branch -r | grep origin/$branch; then
      git reset --hard origin/$branch
    else
      git reset --hard $branch
    fi
    popd
  else
    if [ -n "$SOURCE_WORKSPACE" ]; then
      pushd "$SOURCE_WORKSPACE/$name"
      git worktree prune
      git branch -D website || true
      git worktree add -b website "$dir"
      popd
    else
      git clone --branch $branch ssh://git@ol-bitbucket.us.oracle.com:7999/g/$name.git "$dir"
      pushd "$dir"
      git checkout -b website
      popd
    fi
  fi
}

if [ -z "$NOCOPY" ]; then
  clone_or_pull graal $release_branch
  DOCS_SRC="repos/graal/docs"
  DOCS_DST=docs/
  mkdir -p ${DOCS_DST}
  cp -r "${DOCS_SRC}/"* "${DOCS_DST}"

  # Truffle Framework
  TRUFFLE_SRC="repos/graal/truffle/docs"
  TRUFFLE_DST=truffle/docs
  mkdir -p ${TRUFFLE_DST}
  cp -r "${TRUFFLE_SRC}/"* "${TRUFFLE_DST}"

  # JS
  JS_SRC="repos/js/docs/user"
  JS_DST=docs/reference-manual/js
  mkdir -p ${JS_DST}
  clone_or_pull js $release_branch
  cp -r "${JS_SRC}/"* "${JS_DST}"

  # Python
  PY_SRC="repos/graalpython/docs/user"
  PY_DST=docs/reference-manual/python
  mkdir -p ${PY_DST}
  clone_or_pull graalpython $release_branch
  cp -r "${PY_SRC}/"* "${PY_DST}"

  # R
  clone_or_pull fastr $release_branch
  R_SRC="repos/fastr/documentation/user"
  R_DST=docs/reference-manual/r
  mkdir -p ${R_DST}
  cp -r "${R_SRC}/"* "${R_DST}"

  # Ruby
  clone_or_pull truffleruby $release_branch
  RUBY_SRC="repos/truffleruby/doc/user"
  RUBY_DST=docs/reference-manual/ruby
  mkdir -p ${RUBY_DST}
  ruby $RUBY_SRC/../../tool/generate-user-doc.rb
  cp -r "${RUBY_SRC}/"* "${RUBY_DST}"
fi

echo
for file in $(find docs truffle/docs -name '*.md'); do
  # echo $file
  ruby absolutize.rb $file
done
