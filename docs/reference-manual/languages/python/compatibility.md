
## Python Compatibility

_Is GraalVM compatible with the Python language?_

GraalVM's implementation of Python is in the early stages of development. A primary goal is to support
SciPy and its constituent libraries, but we have a long way to go there. At this
point, the Python implementation is made available for experimentation and
curious end-users. GraalVM currently aims to be compatible with Python 3.7,
but it is a long way from there, and it is very likely that any Python program
that requires any imports at all will hit something unsupported.

 _Is there any progress in GraalVM and Python packages compatibility?_

It is too early to claim that there are any Python packages that GraalVM is
compatible with.
