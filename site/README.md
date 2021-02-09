## Overview

- The [**pkg**](reference/pkg) command group contains subcommands which read remote upstream git repositories and write to local directories. They perform updates by merging resources rather than files and are focused on replacing workflows which wrap git commands.
- The [**cfg**](reference/cfg) command group contains subcommands which read and write local YAML files. They are focused on providing porcelain on top of workflows which would otherwise require viewing and editing YAML directly.
Many cfg subcommands may also read from STDIN, allowing them to be paired with other commands such as `kubectl get`.
They allow users to display and modify configuration files without ever dropping into an editor.
```
# Print a package using tree based structure.
$ kpt cfg tree helloworld --name --image --replicas
helloworld
├── [deploy.yaml]  Deployment helloworld-gke
│   ├── spec.replicas: 5
│   └── spec.template.spec.containers
│       └── 0
│           ├── name: helloworld-gke
│           └── image: gcr.io/kpt-dev/helloworld-gke:0.1.0
└── [service.yaml]  Service helloworld-gke
```
- The [**live**](reference/live) command group contains the next-generation versions of `kubectl apply` related commands for deploying local configuration packages to a cluster with manifest-based pruning and resource
status.
- The [**fn**](reference/fn) command group extends the built-in capabilities of kpt by allowing users to write functions that generate,
transform and validate configuration files. Functions can be packaged as container images, starlark scripts, or binary executables.

## Installation
Install via gcloud, homebrew, binaries or the source.

### gcloud
Install as a gcloud component.

```sh
gcloud components install kpt
kpt version
```

The version of kpt installed using `gcloud` may not be the latest released version.

### Binaries
Download and run statically compiled go binaries.

- [Linux (x64)][linux]
- [macOS (x64)][darwin]
- [Windows (x64)][windows]

```sh
# For linux/mac
chmod +x kpt
kpt version
```

**Note:** to run on **MacOS** the first time, it may be necessary to open the
program from the finder with *ctrl-click open*.

### Docker
Run kpt in a docker container.

[gcr.io/kpt-dev/kpt]

```sh
docker run gcr.io/kpt-dev/kpt version
```

### Homebrew
Install as a brew tap.

```sh
brew tap GoogleContainerTools/kpt https://github.com/GoogleContainerTools/kpt.git
brew install kpt
kpt version
```


### Source
Dust off your go compiler and install from source.

```sh
GO111MODULE=on go get -v github.com/GoogleContainerTools/kpt
# `kpt version` will return *unknown* for binaries installed with `go get`.
kpt help
```

## Contribution
We use a pull request workflow on [**GitHub**](https://github.com/GoogleContainerTools/kpt). New users are always welcome!


[linux]: https://storage.googleapis.com/kpt-dev/latest/linux_amd64/kpt
[darwin]: https://storage.googleapis.com/kpt-dev/latest/darwin_amd64/kpt
[windows]: https://storage.googleapis.com/kpt-dev/latest/windows_amd64/kpt.exe
[gcr.io/kpt-dev/kpt]: https://console.cloud.google.com/gcr/images/kpt-dev/GLOBAL/kpt?gcrImageListsize=30