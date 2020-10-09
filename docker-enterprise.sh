#!/bin/bash
set -ex
DOCKER=$(which docker 2>/dev/null || which podman)
$DOCKER build . -f Dockerfile.enterprise -t graalvm.org:enterprise
$DOCKER run --privileged --rm -it -v $(pwd):/graalvm.org -p 4000:4000 graalvm.org:enterprise
