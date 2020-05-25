## Native Image Configuration

The `native-image` tool supports a wide range of options to configure a native image build process.

A recommended way to provide configuration is to embed a
**native-image.properties** file into a project jar file. The Native Image tool
will automatically pick up all configuration options provided anywhere below the
resource location `META-INF/native-image/` and use it to construct
`native-image` command line arguments.

To avoid a situation when constituent parts of a non-trivial project are built
with overlapping configurations, we recommend to use "subdirectories" within
`META-INF/native-image`. That way a jar file built from multiple maven projects
cannot suffer from overlapping `native-image` configurations. For example:
* _foo.jar_ has its configurations in `META-INF/native-image/foo_groupID/foo_artifactID`
* _bar.jar_ has its configurations in `META-INF/native-image/bar_groupID/bar_artifactID`

A jar file that contains `foo` and `bar` will then contain both configurations
without conflicting with one another. Therefore the recommended layout for
storing native-image configuration data in jar files is the following:
```
META-INF/
└── native-image
    └── groupID
        └── artifactID
            └── native-image.properties
```

Note that the use of `${.}` in a native-image.properties file expands to the
resource location that contains that exact configuration file. This can be
useful if the native-image.properties file wants to refer to resources within
its "subfolder", for example,
`-H:SubstitutionResources=${.}/substitutions.json`.

By having such a composable _native-image.properties_ file, building an image
does not require any additional arguments specified on command line. It is
sufficient to just run the following command:
```
$JAVA_HOME/bin/native-image -jar target/<name>.jar
```

To debug which configuration data gets applied for the image building use `native-image
--verbose`. This will show from where `native-image` picks up the
configurations to construct the final composite configuration command line
options for the image builder.
```
$ native-image --verbose -jar build/basic-app-0.1-all.jar
Apply jar:file://~/build/basic-app-0.1-all.jar!/META-INF/native-image/io.netty/common/native-image.properties
Apply jar:file://~/build/basic-app-0.1-all.jar!/META-INF/native-image/io.netty/buffer/native-image.properties
Apply jar:file://~/build/basic-app-0.1-all.jar!/META-INF/native-image/io.netty/transport/native-image.properties
Apply jar:file://~/build/basic-app-0.1-all.jar!/META-INF/native-image/io.netty/handler/native-image.properties
Apply jar:file://~/build/basic-app-0.1-all.jar!/META-INF/native-image/io.netty/codec-http/native-image.properties
...
Executing [
    <composite configuration command line options for the image builder>
]
```

Typical examples of `META-INF/native-image` based native image configuration can be found in [Native Image configuration examples](https://github.com/graalvm/graalvm-demos/tree/master/native-image-configure-examples).

### Properties File Format
A `native-image.properties` file is a regular Java properties file that can be
used to specify native image configurations. The following properties are
supported.

**Args**

Use this property if your project requires custom `native-image` command line options to build correctly. For example, the `native-image-configure-examples/configure-at-runtime-example` has `Args = --initialize-at-build-time=com.fasterxml.jackson.annotation.JsonProperty$Access`  in its `native-image.properties` file to ensure the class `com.fasterxml.jackson.annotation.JsonProperty$Access` gets initialized at image built time.

**JavaArgs**

Sometimes it can be necessary to provide custom options to the JVM that runs the
image builder. The `JavaArgs` property can used in this case.

**ImageName**

This property can be used to specify a user-defined name for the image. If
`ImageName` is not used, a name gets automatically chosen:
* `native-image -jar <name.jar>` has a default image name `<name>`
* `native-image -cp ... fully.qualified.MainClass` has a default image name `fully.qualified.mainclass`

Note that using `ImageName` does not prevent the user to override the name later via command line. For example, if `foo.bar` contains `ImageName=foo_app`,
* `native-image -jar foo.bar` generates the image `foo_app` but
* `native-image -jar foo.bar application` generates the image `application`.

### Order of Arguments Evaluation

The arguments passed to `native-image` are evaluated left-to-right. This also
extends to arguments that get passed indirectly via `META-INF/native-image`
based native-image configuration. Suppose you have a jar file that contains
_native-image.properties_ with `Args = -H:Optimize=0`. Then by using the
`-H:Optimize=2` option after `-cp <jar-file>` you can override the setting that
comes from the jar file.

### Specifying Default Options for Native Image


If there is a need to pass some options for every image build unconditionally, for
example, to always generate an image in verbose mode (`--verbose`), we can
make use of the `NATIVE_IMAGE_CONFIG_FILE` environment variable.
If it is set to a Java properties file, the Native Image builder will use the
default setting defined in there on each invocation. We have to write a
configuration file and export
`NATIVE_IMAGE_CONFIG_FILE=$HOME/.native-image/default.properties` in
`~/.bash_profile`. Every time `native-image` gets used, it will implicitly use
the arguments specified as `NativeImageArgs`, plus the arguments specified on the
command line. Here is an example of a configuration file, saved as
`~/.native-image/default.properties`:

```
NativeImageArgs = --configurations-path /home/user/custom-image-configs \
                  -O1
```


## Runtime vs Build Time Initialization

Building your application into a native image allows you to decide which parts
of your application should be run at image build time and which parts have to
run at image runtime.

Since GraalVM 19.0 all class-initialization code (static initializers and static
field initialization) of the application you build an image for will be executed
at image runtime by default. Sometimes it is beneficial to allow class
initialization code to get executed at image build time for faster startup (e.g.
if some static fields get initialized to runtime independent data). This can be
controlled with the following native-image options:

* `--initialize-at-build-time=<comma-separated list of packages and classes>`
* `--initialize-at-run-time=<comma-separated list of packages and classes>`

In addition to that we allow arbitrary computations at built time that can be put into `ImageSingletons` that are
accessible at image runtime. For more information please have a look at [Native Image configuration examples](https://github.com/graalvm/graalvm-demos/tree/master/native-image-configure-examples).

To learn more on the topic, continue reading on [Application Initialization at Build Time](http://www.christianwimmer.at/Publications/Wimmer19a/Wimmer19a.pdf).

## Integration with Maven

To simplify the generation of native images, GraalVM Native Image now works out
of [Maven](https://maven.apache.org/what-is-maven.html) with the [Native Image Maven Plugin](https://search.maven.org/artifact/com.oracle.substratevm/native-image-maven-plugin/).

As demonstrated in the [Native Image configuration examples](https://github.com/graalvm/graalvm-demos/tree/master/native-image-configure-examples), one can build a native image directly with Maven
using the `mvn package` command without running the `native-image` tool as a
separate step. It is sufficient to add `native-image-maven-plugin` into the
`<plugins>` section of the `pom.xml` file:
```
<plugin>
    <groupId>org.graalvm.nativeimage</groupId>
    <artifactId>native-image-maven-plugin</artifactId>
    <version>${graalvm.version}</version>
    <executions>
        <execution>
            <goals>
                <goal>native-image</goal>
            </goals>
            <phase>package</phase>
        </execution>
    </executions>
    <configuration>
        <skip>false</skip>
        <imageName>example</imageName>
        <buildArgs>
            --no-fallback
        </buildArgs>
    </configuration>
</plugin>
```
and the `org.graalvm.sdk` library dependency in the `<dependencies>` list:

```
<dependency>
    <groupId>org.graalvm.sdk</groupId>
    <artifactId>graal-sdk</artifactId>
    <version>${graalvm.version}</version>
    <scope>provided</scope>
</dependency>
```

The plugin figures out what jar files it needs to pass to the native image and
what the executable main class should be. If the heuristics fails with the `no
main manifest attribute, in target/<name>.jar` error, the main class should be
specified in the `<configuration>` node of the plugin (see Plugin Customization
section). When `mvn package` completes, an executable, generated in the _target_
directory of the project, is ready for use.

**Note:** As of the GraalVM version 19.3, the Maven `<groupId>` for the GraalVM Native
Image related artifacts, including the plugin, changes from
`com.oracle.substratevm` to `org.graalvm.nativeimage`
(`<groupId>org.graalvm.nativeimage</groupId>`).

### Plugin Customization

When using [GraalVM Enterprise Edition](https://docs.oracle.com/en/graalvm/index.html) as the `JAVA_HOME`
environment, the plugin builds a native image with enterprise features enabled, e.g., an executable will automatically be built with [compressed references](https://medium.com/graalvm/isolates-and-compressed-references-more-flexible-and-efficient-memory-management-for-graalvm-a044cc50b67e)
and other optimizations enabled.

It is also possible to customize `native-image-maven-plugin` within a
`<configuration>` node. The following configurations are available.

1. Configuration parameter `<mainClass>`. If the execution fails with the `no main manifest attribute, in target/<name>.jar` error, the main class should be specified. By default the plugin consults several locations in the  `pom.xml` file in the following order to determine what the main class of the image should be:
* `<maven-shade-plugin> <transformers> <transformer> <mainClass>`
* `<maven-assembly-plugin> <archive> <manifest> <mainClass>`
* `<maven-jar-plugin> <archive> <manifest> <mainClass>`
2. Configuration parameter `<imageName>`. If an image filename is not set explicitly, use parameter `<imageName>` to provide a custom filename for the image.
3. Configuration parameter `<buildArgs>`. If you want to pass additional options for the image building, use the `<buildArgs>` parameter the definition of the plugin. For example, to build a native image with assertions enabled that uses _com.test.classname_ as a main class, add:

```
<configuration>
    <imageName>executable-name</imageName>
    <mainClass>com.test.classname</mainClass>
    <buildArgs>
        --no-fallback
    </buildArgs>
    <skip>false</skip>
</configuration>
```
