# Design

## Background

The design of kpt mirrors the Kubernetes control-plane architecture: multiple programs
(e.g. controllers) are responsible for reading and writing shared configuration data (i.e. resources).

### Influences

#### Unix philosophy

Configuration packages should be small, modular, and reusable.

- [link](https://en.wikipedia.org/wiki/Unix_philosophy)

#### Resource / controller model

Kpt provides commands to fetch, update, modify, and apply configuration. This allows users to reuse and compose various packages of Kubernetes resources.

- [link](https://kubernetes.io/docs/concepts/architecture/controller/)

#### GitOps

GitOps refers to using a version control system as the source of truth for configuration.

- [link](https://www.weave.works/technologies/gitops/)

#### Configuration as data

Many configuration tools conflate data with the operations on that
data (e.g. YAML files embedding a templating language).
As configuration becomes complex, it becomes hard to read and understand.
Our design philosophy is to keep configuration as data in order to manage this complexity.
We do this by keeping resources serialized as either JSON or YAML configuration.

- [link](https://changelog.com/gotime/114#t=729)

#### kpt vs kubernetes

- While the Kubernetes control-plane reads / writes configuration data stored by the apiserver
  (e.g. in etcd or some other database), kpt reads / writes configuration data stored as local
  files (as well as supporting other sources / destinations -- http, git, etc).
- While controllers in the Kubernetes control-plane are implicitly triggered through watches,
  programs in kpt are explicitly triggered through invoking kpt, although this can be done by
  automation.

kpt provides a hybrid GitOps + resource-controller model.  Its architecture is designed to
enable **composing loosely coupled solutions** through reading and writing to a shared data model
(e.g. resources, controllers, OpenAPI).

### Design Principles

#### Configuration-as-Data vs Configuration-as-Code

kpt packages configuration as data (APIs) rather than as code (templates /  DSLs). In this model,
the configuration is static data, which many tools may read & write.

This model has its roots in the Unix Philosophy:

> Expect the output of every program to become the input to another, as yet unknown, program

As well as in the Kubernetes control-plane where resources are read and written by loosely coupled
controllers.

#### Shift-Left & GitOps

By enabling resource-controller style systems to be built on configuration files before
applying them to the cluster, kpt shifts the control-plane left -- enabling more issues to be
caught before they are pushed into a cluster.

- Cluster changes may be reviewed, approved, validated, audited and rolled back using git
- Git automation may be applied to changes to cluster state

#### Shift-Right vs Shift-Left

- Read resources from apiserver => Read resources from files
- Write resources to apiserver => Write resources to files
- Triggered by *watch* => triggered by `sh`

#### Composability

Design solutions to work together, expecting the output of each command to be read as input
by another.

- Commands read configuration and write configuration.
- The inputs and outputs should be symmetric.
- It should be possible to pipe kpt commands together, and it should be possible to write
  the output of a kpt command back to its source (updating it in-place).

Tools which read / write data may be developed in different languages and composed together.
Tools which write configuration back to the same source it was read from should retain comments
set on the input, as the comments may be used by kpt and other tools as metadata.

Programs may be developed independently of one another, with commands built directly into
the CLI -- e.g. `kpt cfg set`.

Additionally, kpt offers *functions* as an extension mechanism to simplify publishing logic,
and to provide deeper integration with kpt -- e.g. invoking functions automatically
after kpt commands.

#### kpt vs kubernetes

- kpt: resource configuration is read, modified and written back to its source (or another destination)
  - resources may be updated using 3-way merge (kpt pkg update)
- kubernetes: resources are read, modified, and written back to the apiserver
  - resources may be updated using 3-way merge (kubectl apply)

#### Resource oriented

Desired system state is expressed using Kubernetes resources -- declarative, static data structures.
The desired state is changed through modification of resources -- these may be done:

- programmatically by manually invoked tools -- e.g. `kpt cfg set`
- through direct text edits -- e.g. `vi`
- through forms of automation -- e.g. GitHub actions

High-level logic should be built into programs which understand configuration and are capable of
generating and transforming it given some context.

Since all tools read and write configuration data, multiple tools may be composed by
invoking them against the same configuration data and pipelining their commands.

#### kpt vs kubernetes

- kpt:
  - read / write files, http, ...
  - triggered explicitly (kpt invocations)
- kubernetes:
  - read / write http
  - triggered implicitly (watches)

### Schema driven

Type or object specific logic should NOT be built into the tool.
Static resource modifications (e.g. *set*) should be configured using type or object
metadata (e.g. schema).

OpenAPI is used for resource schema.  Tools may support their own OpenAPI
extensions which should co-exist with extensions owned by other tools.

Support for new types should be introduced through new OpenAPI definitions rather than
changes to the tool itself.

- Static per-type and per-object resource transformations should use OpenAPI to tell the
  tool how to modify a given object
  - e.g. where to set `image` for `set image` is defined in OpenAPI rather than hard-coded
  
- Configuration for individual objects / resources may define custom OpenAPI definitions for
  that specific instance
  - e.g. an nginx Deployment's `image` may be restricted to the regular expression `^nginx:.*$`

#### kpt vs kubernetes

- kpt: OpenAPI read from multiple sources -- can also be inlined into individual
  configuration objects as comments
- kubernetes: OpenAPI read from apiserver

### Layering

High-level layers should exist to reduce inherent complexity and simplify simple cases.
Lower-level layers should remain accessible, but in the background.

Example:  When high-level solutions generate lower-level resources, those resources
should be accessible to other tools to read and modify them.  If an
nginx abstraction generates a Deployment and Service, it should be possible
for other tools to observe and modify both.

### IO

Both kpt inputs and outputs should be recognized by Kubernetes project tools, published as
Kubernetes examples or published by the Kubernetes apiserver.

Examples:

- `kubectl get -o yaml`
- `kubectl apply -f -`
- `github.com/kubernetes/examples`

Much like Kubernetes controllers, kpt should be able to read its previous outputs and modify
them, rather than generating them from scratch -- e.g. read a directory of
configuration and write it back to the same directory.

**Note:** This principle requires symmetric inputs and outputs.

Dynamic logic may be written using templates or DSLs -- which would not support the read-write
workflow -- by merging the newly generated template / DSL output resources with the input
resources.

### Targets

Unlike the Kubernetes control-plane, which reads and writes from the apiserver, kpt
reads and writes from arbitrary sources, so long as they provide resource configuration.

- Local files
- Files stored in git
- Command stdin & stdout
- Apiserver endpoints

### CLI Conventions

Following are the CLI conventions used for building kpt.  This is a living document that should
be iterated upon.

#### Command IO Conventions

- Commands that read resources should be able to read them from files, directories or stdin
  - It should be possible to pipe `kubectl get -o yaml` to the input of these commands
- Commands that write resources should be able to write them to files, directories or stdout
  - It should be possible to pipe the output of these commands to `kubectl apply -f -`
- It should be possible to compose commands by piping them together
  - Metadata (such as which file a resource was read from) may need to be persisted to the
    resources (e.g. as annotations) or as part of the output format (e.g. ResourceList) so
    this state isn't lost between piped commands.
  - e.g. it should be possible to read resources from one command, and pipe them to another command
    which will write them back to files.

#### Arguments, subcommands and flags

- Directories and files should be arguments
  - e.g. `kpt live apply DIR/` vs `kubectl apply -f DIR/`
  - This makes it easier to compose with tools such as `find` and `xargs`
- Subcommands commands should be used in favor of mutually exclusive or complex flags
  - e.g. `kubectl create cronjob --schedule=X` vs `kubectl run --generator=cronjob --schedule=X`
  - This simplifies the documentation (subcommands support more documentation options than flags do)
- Features which are alpha should be guarded behind flags and documented as alpha in the command
  help or flag help.

#### Documentation

Documentation should be compiled into the command help itself.

- Reference documentation should be built into the help for each command
- Guides and concept docs should be built into their own "help" commands
- Reference documentation should have asciinema-style "images" that demonstrate
  how the commands are used.

### Resource Annotations

kpt uses the following annotations to store resource metadata.

#### Resource IO Annotations

##### config.kubernetes.io/path

`config.kubernetes.io/path` stores the file path that the resource was read from.

- When reading resources, if reading from a directory kpt should annotate each resource with the path of the file it was read from
- When writing resources, if writing to a directory kpt should read the annotation and write each to the file matching the path

##### config.kubernetes.io/index

`config.kubernetes.io/index` stores the index into the file that the resource was read from.

- When reading resources, if reading from a file kpt should annotate the resource with the index into the file
- When writing resources, if writing to a file kpt should write the resources in order specified by the indexes

#### Functions Annotations

##### config.kubernetes.io/function

`config.kubernetes.io/function` indicates that the resource may be provided to the specified function
as the ResourceList.functionConfig.

## Packaging goals and design decisions

The two primary sets of capabilities that are required to enable reuse are:

1. The ability to distribute/publish/share, compose, and update groups of
   configuration artifacts, commonly known as packages.
2. The ability to adapt them to your use cases, which we call customization.

In order to facilitate programmatic operations, kpt:

1. Relies upon git as the source of truth
2. Represents configuration as data, specifically represents Kubernetes object
   configuration as resources serialized in YAML or JSON format.

For compatibility with other arbitrary formats, kpt supports generating
resource configuration data from templates, configuration DSLs, and programs
using [source functions].

### Subpackages

A `subpackage` is a `kpt` package that is nested within the directory tree of
another `kpt` package.

Here is an example directory structure of a `kpt` package with subpackages:

```
foo # package
├── Kptfile
├── bar # subpackage
│   ├── Kptfile
│   ├── baz # subpackage
│   │   ├── Kptfile
│   │   └── cm.yaml
│   └── deploy.yaml
└── service.yaml
```

#### Use cases

1. Package publishers need a way to pick and choose multiple component packages
   which work well together, create a single single `kpt` package using them to
   ship an out of the box application, maintain the package and abstract the
   details from package consumers. Alternatively, package consumers may [update]
   individual `subpackages` directly from the upstream sources.
2. Package publishers need a way to create parameter values (e.g. [setters]) to
   be consistent across multiple `subpackages` and make it easy for package
   consumers to provide them with a single command.
3. (Under development) Package consumers need a way to apply a set of
   `subpackages` in a single command to a live cluster while maintaining
   the ability to manage them (e.g. add/destroy) independently.

#### Principles

Here are the core principles around `subpackages` concept:

1. Each kpt package is an independent building block and should contain resources
   (e.g. setter definitions) in its `Kptfile`.
2. Commands performed on a package are not performed on its subpackages unless
   `--recurse-subpackages(-R)` is provided. (only available with [cfg] commands currently
   and the default value of `-R` flag might vary for each command)

## Function goals and specifications

Config Functions are client-side programs that make it easy to operate on a
repository of Kubernetes configuration files.

Use cases:

- **Configuration Validation:** e.g. Require all `Namespace` configurations to
  have a `cost-center` label.
- **Configuration Generation:** e.g. Provide a package for new services by
  generating a `Namespace` with organization-mandated defaults for `RBAC`,
  `ResourceQuota`, etc.
- **Configuration Transformation:** e.g. Update all `PodSecurityPolicy`
  configurations to improve the security posture.

![Functions Demo](https://storage.googleapis.com/kpt-functions/docs/run.gif)

Config functions can be run locally or as part of a CI/CD pipeline.

In GitOps workflows, config functions read and write configuration files from a
Git repo. Changes to the system authored by humans and mutating config
functions are reviewed before being committed to the repo. Config functions can
be run as pre-commit or post-commit steps to validate configurations before
they are applied to a cluster.

### Why Functions

We build functions using the same [architecture influences] as the rest of kpt,
specifically:

- **Configuration as data:** enables us to programmatically manipulate
  configurations using stateless programs called _functions_.
- **Unix philosophy:** inspires us to develop a catalog of useful,
  interoperable functions which implement the
  [Configuration Functions Specification][spec].

### Functions Concepts

At a high level, a function can be conceptualized like so:

![Function diagram](../static/images/func.png)

- `FUNC`: A program that performs CRUD (Create, Read, Update, Delete)
  operations on the input. This program can be packaged as a container,
  executable, or starlark script.
- `input`: A Kubernetes List type containing objects to operate on.
- `output`: A Kubernetes List type containing the resultant Kubernetes objects.
- `functionConfig`: An optional Kubernetes object used to parameterize the
  function's behavior.

See [Configuration Functions Specification][spec] for further details.

There are two special-case functions: source functions and sink functions.

### Source Function

A Source Function takes no `input`:

![Source diagram](../static/images/source.png)

Instead, the function typically produces the `output` by reading configurations
from an external system (e.g. reading files from a filesystem). Find examples in
the [sources catalog].

### Sink Function

A Sink Function produces no `output`:

![Sink diagram](../static/images/sink.png)

Instead, the function typically writes configurations to an external system
(e.g. writing files to a filesystem). Find examples in the [sinks catalog].

### Pipeline

In order do something useful with a function, we need to compose a pipeline
with a source and a sink function.

![Pipeline diagram](../static/images/pipeline.png)

You can also use a container-based workflow orchestrator by exporting a workflow
pipeline. Get detailed tutorials on how to use `kpt fn export` from the
[Export a Workflow] guide.

## Next Steps

- See the [Configuration IO API Semantics] for when to use resource annotations.
- Consult the [FAQ] for answers to common questions.

[Configuration IO API Semantics]: https://github.com/kubernetes-sigs/kustomize/blob/master/cmd/config/docs/api-conventions/config-io.md
[functions concepts]: ../functions/
[FAQ]: ../../faq/
[source functions]: ../functions/#source-function
[update]: https://googlecontainertools.github.io/kpt/guides/consumer/update/
[setters]: https://googlecontainertools.github.io/kpt/guides/producer/setters/
[cfg]: https://googlecontainertools.github.io/kpt/reference/cfg/
[architecture influences]: ../architecture/#influences
[sources catalog]: ../../guides/consumer/function/sources
[sinks catalog]: ../../guides/consumer/function/sinks
[spec]: https://github.com/kubernetes-sigs/kustomize/blob/master/cmd/config/docs/api-conventions/functions-spec.md
[Export a Workflow]: ../../guides/consumer/function/export/
[function producer docs]: ../../guides/producer/functions/
[reference]: ../../reference/fn/run/

