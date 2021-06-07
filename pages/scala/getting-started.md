<!--  ---
layout: docs
title: Scala
link_title: Get Started with Scala
permalink: /docs/scala/getting-started/
toc_group: docs
--- -->

# Running Scala on GraalVM

GraalVM is a JVM, so you can run Java and Scala programs normally using the `java` command:

```
export GRAALVM_HOME=<path to GraalVM>/Content/Home
export PATH=$GRAALVM_HOME/bin:$PATH

$GRAALVM_HOME/bin/java -version
java version "1.8.0_271"
Java(TM) SE Runtime Environment (build 1.8.0_271-b09)
Java HotSpot(TM) 64-Bit Server VM GraalVM EE 20.3.0-dev (build 25.271-b09-jvmci-20.3-b05, mixed mode)
```

If you are using sbt as the build tool, you can specify `JAVA_HOME` it will use from the command line:

```
sbt -java-home $GRAALVM_HOME
```

GraalVM performs really well on the Scala benchmarks, for example you can look at [Renaissance benchmarks suite](https://renaissance.dev/). Note that Scala compiler is a Scala application as well, and it benefits from GraalVM runtime and runs faster too.


### Native Image of Scala Compiler

In this guide, you will learn how to get started with running Scala programs on
top of GraalVM and build a native image of `scalac` -- the Scala compiler.

1. Make `SCALA_HOME` and `GRAALVM_HOME` environment variables resolve to Scala 2.12.x and GraalVM respectively
on macOS:
```
export GRAALVM_HOME=<path to GraalVM>/Content/Home
export SCALA_HOME=/usr/local/opt/scala
```
and on Linux platforms:
```
export GRAALVM_HOME=<path to GraalVM>
export SCALA_HOME=/usr/local/share
```
2. Clone or download the repository and navigate to the _scalac-native_ directory:
```
git clone https://github.com/graalvm/graalvm-demos
cd graalvm-demos/scala-days-2018/scalac-native
```
3. Build the `sbt` project from the _scalac-substitutions_ directory:
```
cd scalac-substitutions
sbt package
cd ../
```
4. Build the native image of the Scala compiler by running:
```
./scalac-image.sh
```
The script `scalac-native.sh` calls the generated compiler and passes all the required parameters.
If you check the directory, the produced native image, called `scalac`, with no dependencies on the JDK, should have appeared.
5. Compare the execution time to the JVM:

```
$ time $SCALA_HOME/bin/scalac HelloWorld.scala

real	0m2.315s
user	0m5.868s
sys	0m0.248s

& time ./scalac-native HelloWorld.scala

real	0m0.177s
user	0m0.129s
sys	0m0.034s
```

When the Scala compiler is ahead-of-time compiled with the profile-guided
optimization (PGO) enabled, the native `scalac` is as fast as the one running on
the JVM (the C2 compiler).

**Important:** Profile-guided optimizations are available with GraalVM Enterprise Edition.

### Support for Scala Macros

To support **macros** -- functions that are called by the compiler during compilation --
the macro classes must be known to the native image builder of the Scala compiler.
To build a scalac native image that includes macros run:
```
./scalac-native macros/GreetingMacros.scala -d macros/
./scalac-image-macros.sh
```

Now you can compile a project that uses macros from `GreetingMacros.scala`:
```
./scalac-native -cp macros/ HelloMacros.scala
```

Run the compiled program with:
```
$ scala HelloMacros
Hello, World!
```
