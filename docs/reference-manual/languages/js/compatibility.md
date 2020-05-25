## GraalVM JavaScript Compatibility

GraalVM is [ECMAScript 2020](https://tc39.es/ecma262/2020) compliant and fully compatible with a diverse range of active Node.js (npm) modules. 
More than 100,000 npm packages are regularly tested and are compatible with GraalVM, including modules like express, react, async, request, browserify, grunt, mocha, and underscore.
The latest release of GraalVM is based on Node.js version 12.15.0.

## Nashorn Compatibility Mode

[GraalVM announced support for Nashorn migration](https://medium.com/graalvm/oracle-graalvm-announces-support-for-nashorn-migration-c04810d75c1f)
due to the announced deprecation of Nashorn in the JDK. GraalVM JavaScript
provides a Nashorn compatibility mode for some of the functionality not exposed
by default, but necessary to run an application that was built for Nashorn
specifically. [Check the list of extensions](https://github.com/graalvm/graaljs/blob/master/docs/user/NashornMigrationGuide.md#extensions-only-available-in-nashorn-compatibility-mode)
to JavaScript (ECMAScript) that are available in GraalVM JavaScript. Some of
them provide features that are available in Nashorn as well. For ECMAScript
compatibility, most of those features are deactivated by default in GraalVM but
can be activated with flags. Note that using the Nashorn compatibility mode
allows your application to bypass the GraalVM security model.

If the source code includes some Nashorn-specific extensions, the Nashorn
compatibility mode should be enabled. It can be activated:
1. with the `js.nashorn-compat` option from the command line:
```
js --experimental-options --js.nashorn-compat=true
```
2. by using the Polyglot API:
```
import org.graalvm.polyglot.Context;
try (Context context = Context.newBuilder().allowExperimentalOptions(true).option("js.nashorn-compat", "true").build()) {
  context.eval("js", "print(__LINE__)");
}
```
3. by using a system property when starting a Java application:
```
java -Dpolyglot.js.nashorn-compat=true MyApplication
```

We strongly encourage you to use the Nashorn compatibility mode only as a means
of getting your application running on GraalVM JavaScript initially. Enabling
the Nashorn compatibility mode gives your application full access to the Java
mode. This bypasses the GraalVM security model of limiting JavaScript user code
to "less trusted code" that is consistent with all other GraalVM languages. It
is highly recommended not to use the Nashorn compatibility mode in production
code if you execute less trusted user code. Some features of the Nashorn
compatibility mode might in the future conflict with new ECMAScript and/or
GraalVM JavaScript features.

We provide migration guides for code previously targeted to the [Nashorn](https://github.com/graalvm/graaljs/blob/master/docs/user/NashornMigrationGuide.md) or [Rhino](https://github.com/graalvm/graaljs/blob/master/docs/user/RhinoMigrationGuide.md) engines.
See the [JavaInterop.md](https://github.com/graalvm/graaljs/blob/master/docs/user/JavaInterop.md) for an overview of supported Java interoperability features.
For additional information, see the [Polyglot Reference]({{ "/docs/reference-manual/polyglot/" | relative_url }}) and the
[Embedding documentation]({{ "/docs/graalvm-as-a-platform/embed/" | relative_url }})
for more information about interoperability with other programming languages.

### Is GraalVM compatible with the JavaScript language?

_What version of ECMAScript do we support?_

GraalVM is compatible to the ECMAScript 2019 specification.
Some features of ECMAScript 2020 including some proposed features and extensions are available as well, but might not be fully implemented, compliant, or stable, yet.

_How do we know it?_

The compatibility of GraalVM JavaScript is verified by external sources, like the [Kangax ECMAScript compatibility table](https://kangax.github.io/compat-table/es6/).

On our CI system, we test GraalVM JavaScript against a set of test engines, like the official test suite of ECMAScript, [test262](https://github.com/tc39/test262), as well as tests published by V8 and Nashorn, Node.js unit tests, and GraalVM's own unit tests.

For a reference of the JavaScript APIs that GraalVM supports, see [GRAAL.JS-API](https://github.com/graalvm/graaljs/blob/master/docs/user/JavaScriptCompatibility.md).

### Is GraalVM compatible with the original node implementation?

Node.js based on GraalVM is largely compatible with the original Node.js (based on the V8 engine).
This leads to a high number of npm-based modules being compatible with GraalVM (out of the 95k modules we test, more than 90% of them pass all tests).
Several sources of differences have to be considered.

- **Setup:**
GraalVM mostly mimicks the original setup of Node, including the `node` executable, `npm`, and similar. However, not all command-line options are supported (or behave exactly identically), you need to (re-)compile native modules against our v8.h file, etc.

- **Internals:**
GraalVM is implemented on top of a JVM, and thus has a different internal architecture. This implies that some internal mechanisms behave differently and cannot exactly replicate V8 behavior. This will hardly ever affect user code, but might affect modules implemented natively, depending on V8 internals.

- **Performance:**
Due to GraalVM being implemented on top of a JVM, performance characteristics vary from the original native implementation. While GraalVM's peak performance can match V8 on many benchmarks, it will typically take longer to reach the peak (known as _warmup_). Be sure to give the GraalVM compiler some extra time when measuring (peak) performance.

_How do we determine GraalVM's JavaScript compatibility?_

GraalVM is compatible to ECMAScript 2019, guaranteeing compatibility on the language level.
In addition, GraalVM uses the following approaches to check and retain compatibility to Node.js code:

* node-compat-table: GraalVM is compared against other engines using the _node-compat-table_ module, highlighting incompatibilities that might break Node.js code.
* automated mass-testing of modules using _mocha_: in order to test a large set of modules, GraalVM is tested against 95k modules that use the mocha test framework. Using mocha allows automating the process of executing the test and comprehending the test result.
* manual testing of popular modules: a select list of npm modules is tested in a manual test setup. These highly-relevant modules are tested in a more sophisticated manner.

If you want your module to be tested by GraalVM in the future, ensure the module provides some mocha tests (and send us an email so we can ensure it is on the list of tested modules).

_How can one verify GraalVM works on their application?_

If your module ships with tests, execute them with GraalVM.
Of course, this will only test your app, but not its dependencies.
You can use the [compatibility checker]({{"/docs/reference-manual/compatibility/" | relative_url}}) to find whether the module you're interested in is tested on GraalVM, whether the tests pass successfully and so on.
Additionally, you can upload your `package-lock.json` or `package.json` file into that utility and it'll analyze all your dependencies at once.
