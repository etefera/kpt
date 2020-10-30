---
title: "Set"
linkTitle: "set"
type: docs
draft: true
description: >
   Add a sync dependency to a Kptfile
---
<!--mdtogo:Short
    Add a sync dependency to a Kptfile
-->

`kpt pkg sync set` can be used to add or update Kptfile dependencies
programmatically.

Note: command must be run from within the directory containing Kptfile
to be updated.

### Examples
<!--mdtogo:Examples-->

#### Create a new package and add a dependency to it

```sh
# init a package so it can be synced
kpt pkg init

# add a dependency to the package
kpt pkg sync set https://github.com/GoogleContainerTools/kpt.git/package-examples/helloworld-set \
    hello-world

# sync the dependencies
kpt pkg sync .
```

#### Update an existing package dependency

```sh
# add a dependency to an existing package
kpt pkg sync set https://github.com/GoogleContainerTools/kpt.git/package-examples/helloworld-set@v0.2.0 \
    hello-world --strategy=resource-merge
```
<!--mdtogo-->

### Synopsis
<!--mdtogo:Long-->
```
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

    * If the directory does NOT exist: create the specified directory and write
      the package contents to it
    * If the directory DOES exist: create a NEW directory under the specified one,
      defaulting the name to the Base of REPO/PKG_PATH
    * If the directory DOES exist and already contains a directory with the same name
      of the one that would be created: fail
```

#### Flags

```
--strategy:
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
<!--mdtogo-->
