### Code Size Breakdown

The Code Size Breakdown component of GraalVM Dashboard displays the breakdown of
the code by packages, classes and methods that were
included into a native image using the visualization library. Package sizes are
proportional to the required memory in the native image.

This tool can be used to quickly understand what is in the native image, and to
characterize which packages or classes contribute most to its size. The
following screenshot demonstrates the Code Size breakdown of the `Hello`
program.  

<img src="/docs/tools/dashboard/resources/img/code-size-breakdown.png" alt="code-size" width="800" height="500"/>

On the left you see the partition of packages (e.g., `java.lang`, `java.util`)
coming from the JDK. On the right you see `com.oracle` package which corresponds
to the native image, taking most of the space (2MB). Explore it further, by
walking to the largest part of it. The actual classes and methods
(`NullPrinter`, `StdOutPrinter` etc.) take the tiny 171 kB. If you keep
navigating through that partition, for example, to the `StdOutPrinter()` method,
the other visualization component of GraalVM Dashboard will open: Points-to
Exploration diagram. The `StdOutPrinter()` method was included into the native image because a
call to it occurred somewhere. If you hover over the call, you will see an exact
line in a program where the call happened (`Hello.java:34`).  
