# Customize a local package by substituting values into fields.



<!-- @makeWorkplace @verifyGuides-->
```
# Set up workspace for the test.
TEST_HOME=$(mktemp -d)
cd $TEST_HOME
```



*Dynamic needs for packages are built into tools which read and write
configuration data.*

## Topics

[kpt cfg set], [setters], [substitutions], [Kptfile]

Substitutions are like setters, but instead of setting a entire field
value, **they use setters to set only parts of a field value.** -- e.g.
only set the *tag* portion of the `image` field.

- Substitutions are defined in OpenAPI definitions
- OpenAPI is referenced from configuration through field line comments
- Substitutions are **performed by running `kpt cfg set`**

Because setters are defined using data as part of the package as OpenAPI data,
they don’t need to be compiled into the tool and **can be created
for an instance of a package** without modifying kpt.

To see more on how to create a substitution: [create substitution guide]

## Substitutions explained

Following is a short explanation of the command that will be demonstrated
in this guide.

### Data model

- Fields reference substitutions through OpenAPI definitions specified as
  line comments -- e.g. `# { "$kpt-set": "my-substitution" }`
- OpenAPI definitions are provided through the Kptfile
- Substitution OpenAPI definitions contain patterns and values to compute
  the field value

### Command control flow

1. Read the package Kptfile and resources.
2. Change the setter OpenAPI value in the Kptfile
3. Locate all fields which reference the setter indirectly through a
   substitution.
4. Compute the new substitution value by substituting the setter values into
   the pattern.
5. Write both the modified Kptfile and resources back to the package.

![Substitute command](../../../static/images/substitute-command.svg)

## Steps

1. [Fetch a remote package](#fetch-a-remote-package)
2. [List the setters](#list-the-setters)
3. [Substitute a value](#substitute-a-value)

## Fetch a remote package

### Fetch Command

<!-- @fetchPackage @verifyGuides-->
```sh
export SRC_REPO=https://github.com/GoogleContainerTools/kpt.git
kpt pkg get $SRC_REPO/package-examples/helloworld-set@v0.3.0 helloworld
```

Grab the setters package, which contains setters and substitutions.

### Fetch Output

```sh
fetching package /package-examples/helloworld-set from https://github.com/GoogleContainerTools/kpt to helloworld
```

## List the setters

List the [setters] -- find the **image-tag setter**.  When set it will perform
a substitution.

There is no command to list substitutions because they are not invoked directly,
but are instead performed when a setter referenced by the substitution is
invoked.

Substitutions can be found by looking in the Kptfile under
`openAPI.definitions`, and identified in configuration through referencing
a definition with the prefix `io.k8s.cli.substitutions.`

In this example the substitution name and setter name happen to match, but this
is not required, and substitutions may have multiple setters.

### List Command

```sh
kpt cfg list-setters helloworld/ --include-subst
```

### List Output

```sh
    NAME      VALUE       SET BY             DESCRIPTION        COUNT
  http-port   80      package-default   helloworld port         3
  image-tag   0.1.0   package-default   hello-world image tag   1
  replicas    5       package-default   helloworld replicas     1
  ------------   ------------------------------------------   ----------
  SUBSTITUTION                      PATTERN                       REFERENCES
  image-tag      gcr.io/kpt-dev/helloworld-gke:IMAGE_TAG_SETTER   [image-tag]
```



<!-- @verifyListSubst @verifyGuides-->
```
# Verify that we get the expected output
kpt cfg list-setters helloworld/ --include-subst | tr -s ' ' | grep "image-tag gcr.io/kpt-dev/helloworld-gke:IMAGE_TAG_SETTER \[image-tag\]"
```



## Substitute a value

### Package contents

```yaml
# helloworld/deploy.yaml
kind: Deployment
metadata:
 name: helloworld-gke
...
    spec:
      containers:
      - name: helloworld-gke
        image: gcr.io/kpt-dev/helloworld-gke:v0.1.0 # {"$kpt-set":"image-tag"}
...
```

### Command

<!-- @setImageTag @verifyGuides-->
```sh
 kpt cfg set helloworld/ image-tag v0.2.0
```

Change the tag portion of the image field using the `image-tag` setter.

### Output

```sh
set 1 fields
```

### Updated package contents

```yaml
kind: Deployment
metadata:
 name: helloworld-gke
...
    spec:
      containers:
      - name: helloworld-gke
        image: gcr.io/kpt-dev/helloworld-gke:v0.2.0 # {"$kpt-set":"image-tag"}
...
```



<!-- @verifySubst @verifyGuides-->
```
# Verify that the sustitution was updated
grep "image: gcr.io/kpt-dev/helloworld-gke:v0.2.0" helloworld/deploy.yaml
```



## Customizing setters

See [setters] and [substitutions] for how to add or update them in the
package [Kptfile].

[Kptfile]: ../../../api-reference/kptfile/
[kpt cfg set]: ../../../reference/cfg#set
[setters]: ../../../reference/cfg#create-setter
[substitutions]: ../../../reference/cfg#create-subst
[create substitution guide]: ../../producer/substitutions/
