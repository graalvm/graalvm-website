### Macro Options

Macro-options are mainly helpful for polyglot capabilities of native images:

  - `--language:nfi` to make Truffle Native Function Interface language available

  - `--language:regex` to make Truffle Regular Expression engine available that
  exposes regular expression functionality in GraalVM supported languages

  - `--language:js` to make sure JavaScript is available as a language for the image

  - `--language:llvm` to make sure LLVM bitcode is available for the image

  - `--language:python` to make sure Python is available as a language for the image

  - `--language:ruby` to make sure Ruby is available as a language for the image

  - `--language:R`  to make sure R is available as a language for the image

  - `--tool:chromeinspector`  adds debugging support to a Truffle framework based language image

  - `--tool:profiler` adds profiling support to a Truffle framework based language image

Please note, the `--language:python`, `--language:ruby` and `--language:R` polyglot macro options become available once the corresponding languages engines [are installed]({{ "/docs/reference-manual/graal-updater/" | relative_url}}) to the base GraalVM distribution.

### Non-standard Options

Get acquainted with the non-standard native image building options, that are subject to change through a deprecation cycle:

   - `--no-server` tells to not use server-based image building

   - `--server-list` lists current image-build servers

   - `--server-list-details` lists current image-build servers with more details

   - `--server-cleanup` removes stale image-build servers entries

   - `--server-shutdown` shuts down image-build servers under current session ID

   - `--server-shutdown-all` shuts down all image-build servers

   - `--server-session=<custom-session-name>` uses custom session name instead
   of system provided session ID of the calling process

   - `--verbose-server` enables verbose output for image-build server handling

### Server-side Options

   - `--debug-attach[=<port>]` attaches to debugger during image building (default  port is 8000)

   - `--dry-run` outputs the command line that would be used for image building

   - `--expert-options` lists image build options for experts

   - `--expert-options-all`  lists all image build options for experts (to be used at your own risk)

   - `--configurations-path <search path of option-configuration directories>` a separated list of directories to be treated as option-configuration directories

   - `-V<key>=<value>` provides values for placeholders in native-image.properties files
