## Getting Started Guide

GraalVM Dashboard is a web-based dashboard for visualizing arbitrary aspects of
dynamic and static compilations in GraalVM, in particular, in [GraalVM Native Image](https://www.graalvm.org/docs/reference-manual/native-image). The
tool has been designed to display the information on methods compilation,
reachability, class usability, profiling data, and even information about
dynamic compilation pressure, compiled code lifetime, compilation count,
deoptimization etc..

Some visualizations examples in GraalVM Dashboard are:
- Code Size Breakdown -- presents a visual summary of the sizes of the different packages,
  classes and methods that were included into a native image.
- Heap Size Breakdown -- presents a visual summary of the sizes of the objects
  of the different classes, which were included into the heap of a native image.
- Points-to Exploration -- this component is used to, starting from a particular method
  that is included in a native image, illustrate why this particular method of the program
  was included in the native image.

Here you can find information about the basic usage instructions.

## Dumping the Data for GraalVM Dashboard
GraalVM Dashboard is organized around the concept of "data formats". To generate
report files for the GraalVM Dashboard, you need to pass certain flags when
building a native image.

* `-H:+DashboardDump=<path>` - to define the path for the dump file
* `-H:+DashboardAll` - to dump all available data
* `-H:+DashboardHeap` - to dump the breakdown of the image heap
* `-H:+DashboardCode` - to dump the breakdown of the code size per method
* `-H:+DashboardPointsTo` - to dump the point-to analysis information

By selecting just a subset of all data, you receive a smaller dump file.

### Hello World sample application

It is possible to test the features of GraalVM Dashboard in sample application provided here:

1. Download <a href=/docs/tools/dashboard/docs/sample.zip download>Hello world sample</a> application
2. Unzip it on your local disk
3. Use **Add Data** button to open `sample.dump` you recently downloaded

Or using direct [link](/docs/tools/dashboard/?dumpUrl=http://graalvm.org/docs/tools/dashboard/docs/sample/sample.dump).

For demonstration purposes the following `Hello` program will be used:

```java
public class Hello {

    static Hello hello = new Hello();
    Printer printer;
    public Printer createStdOutPrinter() {
        return new StdOutPrinter();
    }

    public void setup(String[] args) {
        if (args.length > 0) {
            printer = createStdOutPrinter();
        } else {
            printer = new NullPrinter();
        }
    }

    public static void main(final String[] args) {
        Thread t = new Thread(new Runnable() {
            @Override
            public void run() {
                hello.setup(args);
            }
        });
        t.start();
        try {
            t.join();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        for (String s : args) {
            hello.printer.print(s);
        }
    }
}

abstract class Printer {
    public abstract void print(String s);
}

class NullPrinter extends Printer {
    public void print(String s) {
    }
}

class StdOutPrinter extends Printer {
    public void print(String s) {
        System.out.println(s);
    }
}
```

An abstract base `Printer` class, which has one undefined `Print()` method that
takes a String as an argument, and two implementations of this class:
`NullPrinter()` which returns no data type and `StdOutPrinter()` which uses a
standard output to print that String out.

The `main` method first creates a thread which initializes the state of this
`Hello` class. Then is starts that thread and waits for it to finish. The
`setup()` method takes an argument from the command line and if its length is
bigger than zero, prints it with a standard output. Otherwise, create a
`NullPrinter`.

Compile it and build a native image:

```
javac Hello.java
native-image -H:DashboardDump=dashboard.dump -H:+DashboardAll Hello
```

The `dashboard.dump` file dumped during the native image build will be in Native
Image Dump Format, which is the only format readable by the tool.

## Opening Report Files In The Dashboard
To open the dumped file in GraalVM Dashboard, click on the "Add data" button
on the left, which will open a dialog box. Here you can select the dumped file,
obtained during the native-image build:
<br>
<img src="/docs/tools/dashboard/resources/img/import_dump_file.png" alt="import-dump" width="450" height=200/>

### Terms of Use
The server that hosts the GraalVM website delivers an HTML version of the GraalVM
Dashboard tool. All the subsequent logic happens offline, in the client-side
HTML page. No data collection by Oracle, re-use, and sharing to a server happens
when using the tool.

According to the [Terms of Use](https://www.oracle.com/legal/terms.html) for
accessing or using any Oracle site or the content, the content accessed or
obtained through the use of GraalVM Dashboard is to be used at your own
discretion and risk. Given the experimental state of the tool, Oracle shall have
no responsibility for any damage to the processed file or loss of data.
