## Polyglot Options

You can configure language engine for better throughput or startup. 

* `--engine.Mode=default`: Configures the execution mode of the engine. The execution mode automatically tunes the polyglot engine towards latency or throughput.
    * `throughput`: To collect the maximum amount of profiling information and compile using the
    maximum number of optimizations. This mode results in slower application startup
    but better throughput. This mode uses the compiler configuration `community` or 
    `enterprise` if not specified otherwise.
    * `default`: To use a balanced engine configuration. This mode uses the compiler configuration `community` or `enterprise` if not specified otherwise.
    * `latency`: To collect only minimal profiling information and compile as fast as possible
    with less optimal generated code. This mode results in faster application
    startup but less optimal throughput. This mode uses the compiler configuration
    `economy` if not specified otherwise.

#### Polyglot Options for Language Launchers

We have extended every language launcher with a set of so called _polyglot
options_. Polyglot options allow users of any language launcher to access the
options of other languages supported by GraalVM (implemented with the Truffle
Language Implementation Framework).
The format is: `--<languageID>.<property>=<value>`.
For example the `R` launcher also supports the `--js.atomics=true` JavaScript option.

Allowed values for the `languageID` are:
- `js` options for JavaScript.
- `python` options for Python.
- `r` options for R.
- `ruby` options for Ruby.
- `llvm` options for LLVM.

Use `--help:languages` to find out which options are available.

Options for polyglot tools work in the same way with the following format: `--<toolID>.<property>=<value>`.

Allowed values for `<toolID>` are:

- `inspect` allows debugging with Chrome DevTools.
- `cpusampler` collects data about CPU usage.
- `cputracer` captures trace information about CPU usage.
- `memtracer` captures trace information about memory usage.

Use `--help:tools` to find out which options are available.

### Passing Options Programmatically

Options can also be passed programmatically using the Java polyglot API.

Create a file called `OptionsTest.java`:

```
import org.graalvm.polyglot.*;

class OptionsTest {

    public static void main(String[] args) {
        Context polyglot = Context.newBuilder().allowExperimentalOptions(true)
            .option("js.shared-array-buffer", "true")
            .build();
        // the use of shared array buffer requires
        // the 'js.shared-array-buffer' option to be 'true'
        polyglot.eval("js", "new SharedArrayBuffer(1024)");
    }
}
```

Run:

```
$ javac OptionsTest.java
$ java OptionsTest
```

Please note that tool options can be passed in the same way.
Options cannot be modified after the context was created.


### Passing Options using JVM Arguments

Every polyglot option can also be passed as a Java system property.
Each available option translates to a system property with the `polyglot.` prefix.
For example: `-Dpolyglot.js.strict=true` sets the default value for a strict interpretation for all JavaScript code that runs in the JVM.
Options that were set programmatically take precedence over Java system properties.
For languages the following format can be used: `-Dpolyglot.<languageID>.<property>=<value>` and for tools it is: `-Dpolyglot.<toolID>.<property>=<value>`.

Create a file called `SystemPropertiesTest.java`:

```
import org.graalvm.polyglot.*;

class SystemPropertiesTest {

    public static void main(String[] args) {
        Context polyglot = Context.newBuilder().allowExperimentalOptions(true).build();
        // the use of shared array buffer requires
        // the 'js.shared-array-buffer' option to be 'true'
        polyglot.eval("js", "new SharedArrayBuffer(1024)");
    }
}
```

Run:

```
$ javac SystemPropertiesTest.java
$ java -Dpolyglot.js.strict=true SystemPropertiesTest
```


_Note_: System properties are read once when the polyglot context is created. Subsequent changes have no effect.
