## Profile-guided Optimizations

For additional performance gain and higher throughput in GraalVM
ahead-of-time (AOT) mode, make use of profile-guided optimizations (PGO). With
PGO, you can collect the profiling data in advance and then feed it to the
GraalVM `native-image` utility, which will use this information to optimize the
performance of the resulting binary.

Note: Profile-guided optimizations (PGO) is a GraalVM Enterprise feature.

In GraalVM versions prior to 19.2.0, a commonly used technique to mitigate the
missing just-in-time (JIT) optimization is to gather the execution profiles at one run
and then use them to optimize subsequent compilation(s). In other words, one
needs to create a native image with the `--pgo-instrument` option to collect the
profile information. The `--pgo-instrument` builds an instrumented native image
with profile-guided optimization data collected of AOT compiled code
in the _default.iprof_ file, if nothing else is specified. Then you run an
example program, saving the result in _default.iprof_. Finally, you create a
second native image with `--pgo profile.iprof` flag that should be significantly
faster.

Starting from 19.2.0, you can collect profiles while running your
application in JIT mode and then use this information to generate
a highly-optimized native binary. This maximizes the performance even more.

1. Run a java program in JIT mode with a `-Dgraal.PGOInstrument` flag to gather the profiling information:
```
$ java -Dgraal.PGOInstrument=myclass.iprof MyClass
```
2. Use the collected data to generate a native image:
```
$ native-image --pgo=myclass.iprof MyClass
```
3. Run the resulting binary:
```
$ ./myclass
```
