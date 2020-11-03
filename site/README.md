<!-- Kpt (pronounced “kept”) is an OSS tool for building declarative workflows
on top of resource configuration.

Its git + YAML architecture means it just works with existing tools,
frameworks, and platforms.

Kpt includes solutions to fetch, display, customize, update, validate, and
apply Kubernetes configuration. -->

<!-- A packaging solution for resource configuration.
Fetch and update configuration using git and YAML.

A cli UX layer on top of YAML
Display and modify configuration files without ever dropping into an editor.

The next-generation of apply with manifest based pruning and resource
status.

Extend the built-in capabilities of kpt by writing functions to generate,
transform and validate configuration. -->
## Tools

- pkg: Fetch and update configuration using git and YAML.
- cfg: A cli UX layer on top of YAML.
Display and modify configuration files without ever dropping into an editor.
- live: The next-generation of apply with manifest based pruning and resource
status.
- fn: Extend the built-in capabilities of kpt by writing functions to generate,
transform and validate configuration.

## Installation
Install via gcloud, homebrew, binaries or the source.

### gcloud
Install as a gcloud component.

```sh
gcloud components install kpt
```

```sh
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
```

**Note:** to run on **MacOS** the first time, it may be necessary to open the
program from the finder with *ctrl-click open*.

```sh
kpt version
```

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
```

```sh
kpt version
```


### Source
Dust off your go compiler and install from source.

```sh
GO111MODULE=on go get -v github.com/GoogleContainerTools/kpt
```

**Note:** `kpt version` will return *unknown* for binaries installed
with `go get`.

```sh
kpt help
```

## Contribution
We use a pull request workflow on [**GitHub**](https://github.com/GoogleContainerTools/kpt). New users are always welcome!


[linux]: https://storage.googleapis.com/kpt-dev/latest/linux_amd64/kpt
[darwin]: https://storage.googleapis.com/kpt-dev/latest/darwin_amd64/kpt
[windows]: https://storage.googleapis.com/kpt-dev/latest/windows_amd64/kpt.exe
[gcr.io/kpt-dev/kpt]: https://console.cloud.google.com/gcr/images/kpt-dev/GLOBAL/kpt?gcrImageListsize=30