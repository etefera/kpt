# kpt pkg

## Commands

### desc
Displays information about the upstream package in tabular format.

```sh
kpt pkg desc DIR

DIR:
  Path to a package directory
```

#### Examples

```sh
# display description for the local hello-world package
kpt pkg desc hello-world/
```

### diff
Displays differences between upstream and local packages.

```sh
kpt pkg diff [DIR@VERSION]

DIR:
  Local package to compare. Command will fail if the directory doesn\'t exist, or does not
  contain a Kptfile.  Defaults to the current working directory.

VERSION:
  A git tag, branch, ref or commit. Specified after the local_package with @ -- pkg_dir@version.
  Defaults to the local package version that was last fetched.

FLAGS:
--diff-type
  The type of changes to view (local by default). Following types are
  supported:

  local: shows changes in local package relative to upstream source package
         at original version
  remote: shows changes in upstream source package at target version
          relative to original version
  combined: shows changes in local package relative to upstream source
            package at target version
  3way: shows changes in local package and source package at target version
        relative to original version side by side

--diff-tool
  Commandline tool (diff by default) for showing the changes.
  Note that it overrides the KPT_EXTERNAL_DIFF environment variable.
  
  # Show changes using 'meld' commandline tool
  kpt pkg diff @master --diff-tool meld

--diff-opts
  Commandline options to use with the diffing tool.
  Note that it overrides the KPT_EXTERNAL_DIFF_OPTS environment variable.
  # Show changes using "diff" with recurive options
  kpt pkg diff @master --diff-tool meld --diff-opts "-r"

ENVIRONMENT VARIABLES:
    KPT_EXTERNAL_DIFF:
    Commandline diffing tool (diff by default) that will be used to show
    changes.
    # Use meld to show changes
    KPT_EXTERNAL_DIFF=meld kpt pkg diff

    KPT_EXTERNAL_DIFF_OPTS:
    Commandline options to use for the diffing tool. For ex.
    # Using "-a" diff option
    KPT_EXTERNAL_DIFF_OPTS="-a" kpt pkg diff --diff-tool meld
```

#### Examples
```sh
# Show changes in current package relative to upstream source package
kpt pkg diff
```

```sh
# Show changes in current package relative to upstream source package
# using meld tool with auto compare option.
kpt pkg diff --diff-tool meld --diff-tool-opts "-a"
```

```sh
# Show changes in upstream source package between current version and
# target version
kpt pkg diff @v4.0.0 --diff-type remote
```

```sh
# Show changes in current package relative to target version
kpt pkg diff @v4.0.0 --diff-type combined
```

```sh
# Show 3way changes between the local package, upstream package at original
# version and upstream package at target version using meld
kpt pkg diff @v4.0.0 --diff-type 3way --diff-tool meld --diff-tool-opts "-a"
```

### fix
Reads the local package, modifies the package to use the latest kpt features
and fixes any deprecated feature traces.

```sh
kpt pkg fix LOCAL_PKG_DIRECTORY [flags]

LOCAL_PKG_DIRECTORY:
    Local directory with kpt package. Directory must exist and
    contain a Kptfile.

FLAGS:
  --dry-run
    if set, the fix command shall only print the fixes which will be made to the
    package without actually fixing/modifying the resources.
```

#### Examples
```sh
# print the fixes which will be made to the package without actually modifying
# resources
kpt pkg fix . --dry-run
```

```sh
# fix the package if it is using deprecated features
kpt pkg fix .
```

### get
Fetches a remote package from a git subdirectory and writes it to a new
local directory.

```sh
kpt pkg get REPO_URI[.git]/PKG_PATH[@VERSION] LOCAL_DEST_DIRECTORY [flags]

REPO_URI:
  URI of a git repository containing 1 or more packages as subdirectories.
  In most cases the .git suffix should be specified to delimit the REPO_URI
  from the PKG_PATH, but this is not required for widely recognized repo
  prefixes.  If get cannot parse the repo for the directory and version,
  then it will print an error asking for '.git' to be specified as part of
  the argument.
  e.g. https://github.com/kubernetes/examples.git
  Specify - to read Resources from stdin and write to a LOCAL_DEST_DIRECTORY

PKG_PATH:
  Path to remote subdirectory containing Kubernetes resource configuration
  files or directories. Defaults to the root directory.
  Uses '/' as the path separator (regardless of OS).
  e.g. staging/cockroachdb

VERSION:
  A git tag, branch, ref or commit for the remote version of the package
  to fetch.  Defaults to the repository master branch.
  e.g. @master

LOCAL_DEST_DIRECTORY:
  The local directory to write the package to.
  e.g. ./my-cockroachdb-copy

    * If the directory does NOT exist: create the specified directory
      and write the package contents to it
    * If the directory DOES exist: create a NEW directory under the
      specified one, defaulting the name to the Base of REPO/PKG_PATH
    * If the directory DOES exist and already contains a directory with
      the same name of the one that would be created: fail
```

The local directory name does not need to match the upstream
directory name.

#### Examples

```sh
# fetch package cockroachdb from github.com/kubernetes/examples/staging/cockroachdb
# creates directory ./cockroachdb/ containing the package contents
kpt pkg get https://github.com/kubernetes/examples.git/staging/cockroachdb@master ./
```

```sh
# fetch a cockroachdb
# if ./my-package doesn't exist, creates directory ./my-package/ containing
# the package contents
kpt pkg get https://github.com/kubernetes/examples.git/staging/cockroachdb@master ./my-package/
```

```sh
# fetch package examples from github.com/kubernetes/examples
# creates directory ./examples fetched from the provided commit
kpt pkg get https://github.com/kubernetes/examples.git/@[COMMIT_HASH] ./
```

### init
Initializes an existing empty directory as an empty kpt package.

```sh
kpt pkg init DIR [flags]

DIR:
  Init fails if DIR does not already exist

FLAGS:
--description
  short description of the package. (default "sample description")

--name
  package name.  defaults to the directory base name.

--tag
  list of tags for the package.

--url
  link to page with information about the package.
```

**init is optional**: Any directory containing Kubernetes Resource
Configuration may be treated as remote package without the existence of
additional packaging metadata.

* Resource Configuration may be placed anywhere under DIR as *.yaml files.
* DIR may contain additional non-Resource Configuration files.
* DIR must be pushed to a git repo or repo subdirectory.

#### Examples
```sh
# writes Kptfile package meta if not found
mkdir my-pkg
kpt pkg init my-pkg --tag kpt.dev/app=cockroachdb \
    --description "my cockroachdb implementation"
```

### sync
Fetches and updates packages using a manifest to manage a collection
of dependencies.

```sh
kpt pkg sync LOCAL_PKG_DIR [flags]

LOCAL_PKG_DIR:
  Local package with dependencies to sync.  Directory must exist and
  contain a Kptfile.

ENVIRONMENT VARIABLES:
    KPT_CACHE_DIR:
    Controls where to cache remote packages during updates.
    Defaults to ~/.kpt/repos/
```

The manifest declares *all* direct dependencies of a package in a Kptfile.
When `sync` is run, it will ensure each dependency has been fetched at the
specified ref.

This is an alternative to managing package dependencies individually using
the `get` and `update` commands.

#### Examples

```sh
# print the dependencies that would be modified
kpt pkg sync . --dry-run
```

```sh
# sync the dependencies
kpt pkg sync .
```

<!-- #### Dependencies

For each dependency in the Kptfile, `sync` will ensure that it exists
locally with the matching repo and ref.

Dependencies are specified in the Kptfile `dependencies` field and can be
added or updated with `kpt pkg sync set`.  e.g.

```sh
kpt pkg sync set https://github.com/GoogleContainerTools/kpt.git/package-examples/helloworld-set \
    hello-world
```

The [sync-set] command must be run from within the local package directory and the
last argument specifies the local destination directory for the dependency.

Or edit the Kptfile directly:

```yaml
apiVersion: kpt.dev/v1alpha1
kind: Kptfile
dependencies:
- name: hello-world
  git:
    repo: "https://github.com/GoogleContainerTools/kpt.git"
    directory: "/package-examples/helloworld-set"
    ref: "master"
```

Dependencies have following schema:

```yaml
name: <local path (relative to the Kptfile) to fetch the dependency to>
git:
  repo: <git repository>
  directory: <sub-directory under the git repository>
  ref: <git reference -- e.g. tag, branch, commit, etc>
updateStrategy: <strategy to use when updating the dependency -- see kpt help update for more details>
ensureNotExists: <remove the dependency, mutually exclusive with git>
```

Dependencies maybe be updated by updating their `git.ref` field and running `kpt pkg sync`
against the directory.

[sync-set]: set -->

### sync set
Add or updates Kptfile dependencies programmatically.

```sh
kpt pkg set REPO_URI[.git]/PKG_PATH[@VERSION] LOCAL_DEST_DIRECTORY [flags]

REPO_URI:
  URI of a git repository containing 1 or more packages as subdirectories.
  In most cases the .git suffix should be specified to delimit the REPO_URI
  from the PKG_PATH, but this is not required for widely recognized repo
  prefixes.  If get cannot parse the repo for the directory and version,
  then it will print an error asking for '.git' to be specified as part of
  the argument.
  e.g. https://github.com/kubernetes/examples.git
  Specify - to read Resources from stdin and write to a LOCAL_DEST_DIRECTORY

PKG_PATH:
  Path to remote subdirectory containing Kubernetes Resource configuration
  files or directories.  Defaults to the root directory.
  Uses '/' as the path separator (regardless of OS).
  e.g. staging/cockroachdb

VERSION:
  A git tag, branch, ref or commit for the remote version of the package to
  fetch.  Defaults to the repository master branch.
  e.g. @master

LOCAL_DEST_DIRECTORY:
  The local directory to write the package to. e.g. ./my-cockroachdb-copy

    * If the directory does NOT exist, create the specified directory and write
      the package contents to it
    * If the directory DOES exist, create a NEW directory under the specified one,
      defaulting the name to the Base of REPO/PKG_PATH
    * If the directory DOES exist and already contains a directory with the same name
      of the one that would be created, fail

FLAGS:
--strategy
  Controls how changes to the local package are handled.
  Defaults to fast-forward.

    * resource-merge: perform a structural comparison of the original /
      updated Resources, and merge the changes into the local package.
      See `kpt help apis merge3` for details on merge.
    * fast-forward: fail without updating if the local package was modified
      since it was fetched.
    * alpha-git-patch: use 'git format-patch' and 'git am' to apply a
      patch of the changes between the source version and destination
      version.
      REQUIRES THE LOCAL PACKAGE TO HAVE BEEN COMMITTED TO A LOCAL GIT REPO.
    * force-delete-replace: THIS WILL WIPE ALL LOCAL CHANGES TO
      THE PACKAGE.  DELETE the local package at local_pkg_dir/ and replace
      it with the remote version.
```

Note: command must be run from within the directory containing Kptfile
to be updated.

#### Examples

```sh
# init a package so it can be synced
kpt pkg init

# add a dependency to the package
kpt pkg sync set https://github.com/GoogleContainerTools/kpt.git/package-examples/helloworld-set \
    hello-world

# sync the dependencies
kpt pkg sync .
```

```sh
# add a dependency to an existing package
kpt pkg sync set https://github.com/GoogleContainerTools/kpt.git/package-examples/helloworld-set@v0.2.0 \
    hello-world --strategy=resource-merge
```

### update
Pulls upstream changes and merges them into a local package.

```sh
kpt pkg update LOCAL_PKG_DIR[@VERSION] [flags]

LOCAL_PKG_DIR:
  Local package to update.  Directory must exist and contain a Kptfile
  to be updated.

VERSION:
  A git tag, branch, ref or commit.  Specified after the local_package
  with @ -- pkg@version.
  Defaults the local package version that was last fetched.

  Version types:
    * branch: update the local contents to the tip of the remote branch
    * tag: update the local contents to the remote tag
    * commit: update the local contents to the remote commit

FLAGS:
--strategy
  Controls how changes to the local package are handled.  Defaults to fast-forward.

    * resource-merge: perform a structural comparison of the original /
      updated Resources, and merge the changes into the local package.
    * fast-forward: fail without updating if the local package was modified
      since it was fetched.
    * alpha-git-patch: use 'git format-patch' and 'git am' to apply a
      patch of the changes between the source version and destination
      version.
    * force-delete-replace: WIPE ALL LOCAL CHANGES TO THE PACKAGE.
      DELETE the local package at local_pkg_dir/ and replace it
      with the remote version.

-r, --repo
  Git repo url for updating contents.  Defaults to the repo the package
  was fetched from.

--dry-run
  Print the 'alpha-git-patch' strategy patch rather than merging it.

ENVIRONMENT VARIABLES:
    KPT_CACHE_DIR:
    Controls where to cache remote packages when fetching them to update
    local packages.
    Defaults to ~/.kpt/repos/
```

Changes may be applied using one of several strategies. All
changes must be committed to git before running `update`.

#### Examples

```sh
# update my-package-dir/
git add . && git commit -m 'some message'
kpt pkg update my-package-dir/
```

```sh
# update my-package-dir/ to match the v1.3 branch or tag
git add . && git commit -m 'some message'
kpt pkg update my-package-dir/@v1.3
```

```sh
# update applying a git patch
git add . && git commit -m "package updates"
kpt pkg  update my-package-dir/@master --strategy alpha-git-patch
```