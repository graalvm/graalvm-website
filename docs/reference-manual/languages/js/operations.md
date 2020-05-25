## GraalVM JavaScript Operations Manual

_What's the difference between running GraalVM's JavaScript in a Native Image compared to the JVM?_

In essence, the JavaScript engine of GraalVM is a plain Java application.
Running it on any JVM (JDK 8 or higher) is possible; for best performance, it should be the GraalVM or a compatible JVMCI-enabled JDK using the GraalVM compiler.
This mode gives the JavaScript engine full access to Java at runtime, but also requires the JVM to first (just-in-time) compile the JavaScript engine when executed, just like any other Java application.

Running in a Native Image means that the JavaScript engine, including all its dependencies from, e.g., the JDK, is pre-compiled into a native binary.
This will tremendously speed up the startup of any JavaScript application, as GraalVM can immediately start to compile JavaScript code, without itself requiring to be compiled first.
This mode, however, will only give GraalVM access to Java classes known at the time of image creation.
Most significantly, this means that the JavaScript-to-Java interoperability features are not available in this mode, as they would require dynamic class loading and execution of arbitrary Java code at runtime.

_How to achieve the best peak performance?_

Optimizing JVM-based applications is a science in itself.
Here are a few tips and tricks you can follow to analyse and improve peak performance:

* When measuring, ensure you have given the GraalVM compiler enough time to compile all hot methods before starting to measure peak performance. A useful command line option for that is `--vm.Dgraal.TraceTruffleCompilation=true` -- this outputs a message whenever a (JavaScript) method is compiled. As long as this still prints frequently, measurement should not yet start.
* Compare the performance between the Native Image and the JVM mode if possible. Depending on the characteristics of your application, one or the other might show better peak performance.
* The Polyglot API comes with several tools and options to inspect the performance of your application:
    * `--cpusampler` and `--cputracer` will print a list of the hottest methods when the application is terminated. Use that list to figure out where most time is spent in your application. More details about the command line options for the polyglot commands can be found from the
    [polyglot documentation]({{ "/docs/reference-manual/polyglot/#polyglot-options" | relative_url}}).
    * `--experimental-options --memtracer` can help you understand the memory allocations of your application. Refer to [Profiling command line tools reference]({{ "/docs/tools/profiler" | relative_url }}) for more detail.
