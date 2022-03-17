# GraalVM Fiddle project for GraalVM Website

This project is not necessary to build the website (locally or in CI).
It is used to (re-)generate the contents of the `/resources/lib/fiddle/` directory in this repo.

Re-generating the directory is **not** necessary after updating the snippets.
It is only needed when files in this project (currently just the `pom.xml`) are updated.


## Prerequisites

- GraalVM with Aotjs installed. Aotjs is not yet available via gu. It must be built from
  [source](https://ol-bitbucket.us.oracle.com/projects/G/repos/graal-aotjs/browse).
  - Checkout revision 4db2d1f0331f1c6742fc85f4d8dc3864a52d409a (latest tested, newer may or may not work).
  - Execute `mx sforceimports`, `mx build`, `mx aotjs-maven-plugin-install` in the Aotjs repo.
  - Execute `mx --dynamicimports graal-aotjs --native-image=nic build` in the `vm` suite of the Graal repo.
  - GraalVM will be built in `/vm/latest_graalvm_home/` in the Graal repo.
- GraalVM Fiddle is not yet available via Maven Central Repository. It must be built from
  [source](https://ol-bitbucket.us.oracle.com/projects/G/repos/graalvm-fiddle/browse) too.
  - Clone the repository and run `JAVA_HOME=/path/to/graal/vm/latest_graalvm_home/ mvn clean install`
    - For example: `JAVA_HOME=$(pwd)/../graal/vm/latest_graalvm_home/ mvn clean install` if your Graal and Fiddle repos are next to each other


## Usage

Execute `JAVA_HOME=/path/to/graal/vm/latest_graalvm_home/ ./generate.sh`.
The `/resources/lib/fiddle/` directory will be removed and generated again.
Remember to run Jekyll to be able to test the Fiddle and its integration with the website.
