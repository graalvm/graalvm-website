## GraalVM Container Images

GraalVM Community container images are available for download from [GitHub Packages](https://github.com/graalvm/container/packages/237037).

As long as GitHub does not support anonymous access you need to login to the registry [to authenticate against the GitHub Package server](https://help.github.com/en/packages/using-github-packages-with-your-projects-ecosystem/configuring-docker-for-use-with-github-packages).
You can authenticate to GitHub Packages with Docker using the `docker login`
command. It is required to use a personal access token with the appropriate
scopes for authentication. Learn how to generate personal access tokens [here](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line).

As a best practice, it is suggested to save your
personal access token in a file locally. Then run the `docker
login` command non-interactively so you can set the `--password-stdin` flag to
provide a token. The following example shows how to read a token from a file and
pass it to the `docker login` command using STDIN:
```
cat ~/TOKEN.txt | docker login https://docker.pkg.github.com -u USERNAME --password-stdin
```
Substitute `USERNAME` with your GitHub username and `~/TOKEN.txt` with the file
path to the file containing your personal access token. Once you have
authenticated, there are two ways to install GraalVM Community container images
published as GitHub Packages.

1. Pull the image from GitHub with `docker pull`:
```
docker pull docker.pkg.github.com/graalvm/container/community:latest
```
2. Alternatively, use as the base image in [Dockerfile](https://docs.docker.com/engine/reference/builder/):
```
FROM docker.pkg.github.com/graalvm/container/community:latest
```

There are different GraalVM Community container images provided depending on the
architecture and Java version. A complete list can be found on the [All versions](https://github.com/graalvm/container/packages/237037/versions) page. The images are named per a _platform-os-jdk-version_ naming scheme, for example,
`docker.pkg.github.com/graalvm/container/community:ol8-java11-{{ site.product_version }}`. The
images for 64-bit ARM architecture are prefixed with the `arm64-` tag, e.g.,
`docker.pkg.github.com/graalvm/container/community:arm64-ol8-java11-{{ site.product_version }}`.

The container image is based on Oracle Linux and has GraalVM Community
downloaded, unzipped and made available. It means that Java, JavaScript, Node
and the LLVM interpreter are available out of the box.

You can start a container and enter the `bash` session with the following run command:
```
docker run -it docker.pkg.github.com/graalvm/container/community:{{ site.product_version }} bash
```
Check that `java`, `js` and other commands work as expected.
```
→ docker run -it docker.pkg.github.com/graalvm/container/community:{{ site.product_version }} bash
bash-4.4# java -version
openjdk version "11.0.7" 2020-04-14
OpenJDK Runtime Environment GraalVM CE 20.1.0 (build 11.0.7+10-jvmci-20.1-b02)
OpenJDK 64-Bit Server VM GraalVM CE 20.1.0 (build 11.0.7+10-jvmci-20.1-b02, mixed mode, sharing)
bash-4.4# node
Welcome to Node.js v12.15.0.
Type ".help" for more information.
> 1 + 1
2
> process.exit()
bash-4.4# lli --version
LLVM (GraalVM CE Native {{ site.product_version }})
bash-4.4#
```

Please note that the image contains only the components immediately available in the GraalVM Community distribution.
However, the [GraalVM Updater]({{ "/docs/reference-manual/graal-updater/" | relative_url}}) utility is on the `PATH`.
You can install the support for additional languages like Ruby, R, Python or WebAssembly at will.
For example, the following command installs the Ruby support (the output below is truncated for brevity):

```
docker run -it docker.pkg.github.com/graalvm/container/community:{{ site.product_version }} bash
bash-4.4# gu install ruby
Downloading: Component catalog
Processing component archive: Component ruby
Downloading: Component ruby
[######              ]
...
```

If you want to mount a directory from the host system to have it locally available in the container,
use [Docker volumes](https://docs.docker.com/storage/volumes/#choose-the--v-or---mount-flag).

Here is a sample command that maps the `/absolute/path/to/directory/no/trailing/slash` directory from the host system to the `/path/inside/container` inside the container.

```
docker run -it -v /absolute/path/to/directory/no/trailing/slash:/path/inside/container docker.pkg.github.com/graalvm/container/community:{{ site.product_version }} bash
```

If you want to create docker images that contain GraalVM Ruby, R, or Python implementation, you can use a Dockerfile like the example below, which uses `docker.pkg.github.com/graalvm/container/community:{{ site.product_version }}` as the base image, installs Ruby support using the `gu` utility, then creates and runs a sample Ruby program.

```
FROM docker.pkg.github.com/graalvm/container/community:{{ site.product_version }}
RUN gu install ruby
WORKDIR /workdir
RUN echo 'puts "Hello from Truffleruby!\nVersion: #{RUBY_DESCRIPTION}"' > app.rb
CMD ruby app.rb
```

If you put the above snippet in a Dockerfile in the current directory,
you can build and run it with the following commands:

```
docker build -t truffleruby-demo .
...
$ docker run -it --rm truffleruby-demo
Hello from Truffleruby!
Version: truffleruby {{ site.product_version }}, like ruby 2.6.5, GraalVM CE Native [x86_64-darwin]
```
