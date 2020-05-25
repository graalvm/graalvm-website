## LLI Command Options

`--print-toolchain-path`: print the path of the LLVM toolchain bundled with
GraalVM. This directory contains compilers and tools that can be used to
compile C/C++ programs to LLVM bitcode for execution with GraalVM.

`-L <path>`/`--llvm.libraryPath=<path>`: a list of paths where GraalVM will
search for library dependencies. Paths are delimited by `:`.

`--lib <libs>`/`--llvm.libraries=<libs>`: a list of libraries to load. The list
can contain precompiled native libraries (`*.so`/`*.dylib`) and bitcode
libraries (`*.bc`). Files with a relative path are looked up relative to
`llvm.libraryPath`. Entries are delimited by `:`.

`--llvm.managed` enable a managed execution mode for LLVM IR code, which means memory allocations from LLVM bitcode are done on the managed heap. [This article](https://medium.com/graalvm/safe-and-sandboxed-execution-of-native-code-f6096b35c360) explains the managed execution in every detail.

`--version` prints the version and exit.

`--version:graalvm` prints GraalVM version information and exit.

### Expert and Diagnostic Options

Use `--help` and `--help:<topic>` to get a full list of options.
