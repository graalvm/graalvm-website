#!/bin/sh

dir="`dirname $0`"
echo "cd $dir"
cd "$dir"

################

if [ -z "$JAVA_HOME" ]
then
	echo 'Usage: JAVA_HOME=/path/to/graalvm  generate.sh'
	exit 1
fi

echo "JAVA_HOME=$JAVA_HOME"

if ! grep GRAALVM_VERSION "$JAVA_HOME/release"
then
	echo '$JAVA_HOME must be a GraalVM'
	exit 1
fi

################

dest="`git rev-parse --show-toplevel`/resources/lib/fiddle"
echo "dest=$dest"

rm -rfv "$dest"
mvn -P fiddle-compiler-aotjs,fiddle-editor-aotjs clean package
rm -v target/fiddle/fiddle.css
mv -Tv target/fiddle "$dest"
