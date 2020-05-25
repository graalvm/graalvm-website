## Tracing Agent

To overcome some restrictions of GraalVM Native Image and to simplify the
configuration process, we implemented a tracing agent which records the behavior
of a Java application running on GraalVM or any other compatible JVM that
supports Java VM Tool Interface (JVMTI). The tracing agent is supported in both
GraalVM Enterprise and Community Editions.

Note: The tracing agent is part of the GraalVM Native Image component, which must be [installed]({{ "/docs/reference-manual/aot-compilation/" | relative_url }}) first.

The tracing agent helps to deal with such features as [Reflection](https://github.com/oracle/graal/blob/master/substratevm/REFLECTION.md), [Java Native Interface](https://github.com/oracle/graal/blob/master/substratevm/JNI.md), [Class Path Resources](https://github.com/oracle/graal/blob/master/substratevm/RESOURCES.md), and [Dynamic Proxy](https://github.com/oracle/graal/blob/master/substratevm/DYNAMIC_PROXY.md) in the GraalVM environment. It is applicable when the static analysis cannot automatically determine what to put into a native image and undetected usages of these dynamic features need to be provided to the generation process in the form of configuration files. The tracing agent observes the application behavior and builds configuration files when running on the Java HotSpot VM, thus it can be enabled on the command line with the `java` command:
```
$JAVA_HOME/bin/java -agentlib:native-image-agent=config-output-dir=/path/to/config-dir/ ...
```
Please note that `-agentlib` must be specified before a `-jar` option or a class
name or any application parameters in the `java` command line.

During execution, the agent interfaces with the JVM to intercept all calls
that look up classes, methods, fields, resources or request proxy accesses. The
agent then generates the _jni-config.json_, _reflect-config.json_,
_proxy-config.json_ and _resource-config.json_ in the specified output
directory. The generated files are stand-alone configuration files in JSON
format which contain all intercepted dynamic accesses.

The generated configuration files can later be supplied to the native-image tool
by placing them in a `META-INF/native-image/` directory on the class path, for
example, in a JAR file. Not all of those files must be present. When multiple
files with the same name are found, all of them are included.

Read more about advanced usage of the tracing agent in [Assisted Configuration of Native Image Builds](https://github.com/oracle/graal/blob/master/substratevm/CONFIGURE.md) document.

### Java Reflection Support

Further below we will focus on GraalVM Native Image support of Java Reflection API.

Java Reflection provides the ability to inspect and modify applications runtime
behavior. It allows to inspect a class or an interface, get its methods and
fields information, invoke a method, and even create an object of a class at
runtime. The Reflection API classes are part of the `java.lang.reflect` package.

For GraalVM Native Image to handle the Reflection API, in some cases, a reflection
configuration has to be provided at image build time. Within a
closed-world assumption approach, an aggressive static analysis can see most
classes, methods and fields with certainty because they are used directly.
However, when the code accesses program elements by name via reflection, the
analysis cannot always determine ahead-of-time what program elements it refers
to, and the user's assistance is then needed to make these elements accessible
at runtime. For example, the analysis can discover all dynamic usages of the
`Class.forName("java.lang.String").getMethod("hashCode").invoke("Hello!");`
sequence because only constants are used, but in
`String.class.getMethod("hashCode".replace('K', 'C')).invoke("Hello!");` it
cannot. Where the static analysis fails to access the program elements
reflectively, they must be specified in a configuration file via the option
`-H:ReflectionConfigurationFiles=`. For more details, read our [documentation on reflection support](https://github.com/oracle/graal/blob/master/substratevm/REFLECTION.md).

In the given case, the tracing agent can simplify the configuration process and
write a reflection configuration file by tracing all reflective lookup
operations on the Java HotSpot VM. The traced operations are `Class.forName`, `Class.getMethod`, and `Class.getField`.

For demonstration purposes, save the following code as _ReflectionExample.java_ file:

```
import java.lang.reflect.Method;

class StringReverser {
    static String reverse(String input) {
        return new StringBuilder(input).reverse().toString();
    }
}

class StringCapitalizer {
    static String capitalize(String input) {
        return input.toUpperCase();
    }
}

public class ReflectionExample {
    public static void main(String[] args) throws ReflectiveOperationException {
        String className = args[0];
        String methodName = args[1];
        String input = args[2];

        Class<?> clazz = Class.forName(className);
        Method method = clazz.getDeclaredMethod(methodName, String.class);
        Object result = method.invoke(null, input);
        System.out.println(result);
    }
}
```

This is a simple Java program where non-constant strings for accessing program
elements by name must come as external inputs. The main method invokes a method
of a particular class (`Class.forName`) whose names are passed as command line
arguments. Providing any other class or method name on the command line leads to
an exception.

Having compiled the example, invoke each method:
```
$JAVA_HOME/bin/javac ReflectionExample.java
$JAVA_HOME/bin/java ReflectionExample StringReverser reverse "hello"
olleh
$JAVA_HOME/bin/java ReflectionExample StringCapitalizer capitalize "hello"
HELLO
```

<!-- If we create an object of a class and directly instantiate it, like
```
StringReverser stringReverser = new StringReverser();
Class<? extends StringReverser>  clazz = stringReverser.getClass();
```
this access will not be problematic for the GraalVM Compiler because `getClass()`
is always supported. To evidence a problematic usage of the Reflection API, we access the
class whose property is to be checked with `Class.forName()` method. -->

Now we are going to build a native image as regularly, without a reflection configuration file and run a resulting image:
```
$JAVA_HOME/bin/native-image ReflectionExample
Build on Server(pid: 59625, port: 58819)
[reflectionexample:59625]    classlist:     467.66 ms
...
Note: Image 'reflectionexample' is a fallback image that requires a JDK for execution (use --no-fallback to suppress fallback image generation).
$ ./reflectionexample
```
The `reflectionexample` binary is just a launcher for the Java HotSpot VM, a “fallback
image” as stated in the warning message. To generate a native image with
reflective lookup operations, we will apply the tracing agent to write a
configuration file to be later feed into the native image generation together
with a `--no-fallback` option.

1. Create a directory `META-INF/native-image` in the working directory:
```
mkdir -p META-INF/native-image
```
2. Enable the agent and pass necessary command line arguments:
```
$JAVA_HOME/bin/java -agentlib:native-image-agent=config-output-dir=META-INF/native-image ReflectionExample StringReverser reverse "hello"
```
This command creates a _reflection-config.json_ file which makes the `StringReverser` class and the `reverse()` method accessible via reflection. The _jni-config.json_, _proxy-config.json_ ,and _resource-config.json_ configuration files are written in that directory too.
![](/docs/img/reflect_config_file_example.png)
3. Build a native image:
```
$JAVA_HOME/bin/native-image --no-fallback ReflectionExample
```
The native image generator automatically picks up configuration files in
_META-INF/native-image_ directory or subdirectories. However, it is recommended
to have _META-INF/native-image_ location on the class path, either via a JAR
file or via the `-cp` flag. It will help to avoid confusion for IDE users where a
directory structure is defined by the tool.

4. Test the methods, but remember that we have not run the tracing agent twice to create a configuration
that supports both:
```
$ ./reflectionexample StringReverser reverse "hello"
olleh
$ ./reflectionexample  StringCapitalizer capitalize "hello"
Exception in thread "main" java.lang.ClassNotFoundException: StringCapitalizer
	at com.oracle.svm.core.hub.ClassForNameSupport.forName(ClassForNameSupport.java:60)
	at java.lang.Class.forName(DynamicHub.java:1161)
	at ReflectionExample.main(ReflectionExample.java:21)
```

Neither the tracing agent nor native images generator cannot automatically check
if the provided configuration files are complete. The agent only observes and
records which values are accessed through reflection so that the same accesses
are possible in a native image. You can either manually edit the
_reflection-config.json_ file, or re-run the tracing agent to transform the
existing configuration file, or extend it by using `config-merge-dir` option:

```
$JAVA_HOME/bin/java -agentlib:native-image-agent=config-merge-dir=META-INF/native-image ReflectionExample StringCapitalizer capitalize "hello"
```
Note, the different option `config-merge-dir` instructs the agent to extend the
existing configuration files instead of overwriting them. After re-building the
native image, the `StringCapitalizer` class and the `capitalize` method will be
accessible too.

![](/docs/img/reflect_config_file_merged.png)
