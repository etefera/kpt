# kpt cfg

## Commands

### annotate

<!--mdtogo:AnnotateShort-->
Sets annotations on resources.
<!--mdtogo-->

<!--mdtogo:AnnotateLong-->
```
kpt cfg annotate DIR --kv KEY=VALUE...

DIR:
  Path to a package directory
  
FLAGS:
--apiVersion
  Only set annotations on resources with this apiVersion.

--kind
  Only set annotations on resources of this kind.

--kv
  The annotation key and value to set.  May be specified multiple times
  to set multiple annotations at once.

--namespace
  Only set annotations on resources in this namespace.

--name
  Only set annotations on resources with this name.

--recurse-subpackages, -R
  Add annotations recursively in all the nested subpackages
```
<!--mdtogo-->

This is useful when combined with other tools or commands that
read annotations to configure their behavior.

#### Examples

<!--mdtogo:AnnotateExamples-->
```sh
# set an annotation on all Resources: 'key: value'
kpt cfg annotate DIR --kv key=value
```

```sh
# set an annotation on all Service Resources
kpt cfg annotate DIR --kv key=value --kind Service
```

```sh
# set an annotation on the foo Service Resource only
kpt cfg annotate DIR --kv key=value --kind Service --name foo
```

```sh
# set multiple annotations
kpt cfg annotate DIR --kv key1=value1 --kv key2=value2
```
<!--mdtogo-->

### cat

<!--mdtogo:CatShort-->
Prints the resources in a package as yaml to stdout.
<!--mdtogo-->

<!--mdtogo:CatLong-->
```
kpt cfg cat DIR

DIR:
  Path to a package directory
  
FLAGS:
--annotate
  annotate resources with their file origins.

--dest string
  if specified, write output to a file rather than stdout

--exclude-non-local
  if true, exclude non-local-config in the output.

--format
  format resource config yaml before printing. (default true)

--function-config string
  path to function config to put in ResourceList -- only if wrapped in a ResourceList.

--include-local
  if true, include local-config in the output.

--recurse-subpackages, -R
  print resources recursively in all the nested subpackages. (default true)

--strip-comments
  remove comments from yaml.

--style
  yaml styles to apply.  may be 'TaggedStyle', 'DoubleQuotedStyle', 'LiteralStyle', 'FoldedStyle', 'FlowStyle'.

--wrap-kind string
  if set, wrap the output in this list type kind.

--wrap-version string
  if set, wrap the output in this list type apiVersion.
```
<!--mdtogo-->

This is useful for printing only the resources in a package which might
contain other non-resource files.

#### Examples

<!--mdtogo:CatExamples-->
```sh
# print Resource config from a directory
kpt cfg cat my-dir/
```
<!--mdtogo-->

### count

<!--mdtogo:CountShort-->
Summarizes the number of resources in a package.
<!--mdtogo-->

<!--mdtogo:CountLong-->
```
kpt cfg count [DIR]

DIR:
  Path to a package directory.  Defaults to stdin if unspecified.

FLAGS:
--kind
count resources by kind. (default true)

--recurse-subpackages, -R
  Prints count of resources recursively in all the nested subpackages. (default true)
```
<!--mdtogo-->

#### Examples

<!--mdtogo:CountExamples-->
```sh
# print Resource counts from a directory
kpt cfg count my-dir/
```

```sh
# print Resource counts from a cluster
kubectl get all -o yaml | kpt cfg count
```
<!--mdtogo-->

### create-setter

<!--mdtogo:CreateSetterShort-->
Creates a context-aware setter.
<!--mdtogo-->

<!--mdtogo:CreateSetterLong-->
```
kpt cfg create-setter DIR NAME VALUE

DIR:
  Path to a package directory

NAME:
  The name of the setter to create.  This is both the name that will
  be given to the *set* command, and that will be referenced by fields.
  e.g. replicas

VALUE
  The value of the field for which setter reference must be added.
  e.g. 3

FLAGS:
--description string
  record a description for the current setter value.

--field string
  name of the field to set, a suffix of the path to the field, or the full path
  to the field. Default is to match all fields.

--value
  Optional flag, alternative to specifying the value as an argument
  e.g. used to specify values that start with '-'

--recurse-subpackages, -R
  create setter recursively in all the nested subpackages

--required
  indicates that this setter must be set by package consumer before live apply/preview

--schema-path string
  openAPI schema file path for setter constraints -- file content
  e.g. {"type": "string", "maxLength": 15, "enum": ["allowedValue1", "allowedValue2"]}

--set-by string
  record who the field was default by.

--type string
  OpenAPI field type for the setter -- e.g. integer,boolean,string.

--value string
  alternative to specifying the value as an argument. e.g. used to specify values
  that start with '-'
```
<!--mdtogo-->

#### Examples

<!--mdtogo:CreateSetterExamples-->
```sh
# create a setter called replicas for fields matching value "3"
kpt cfg create-setter DIR/ replicas 3
```

```sh
# scope creating setter references to a specified field
kpt cfg create-setter DIR/ replicas 3 --field "replicas"
```

```sh
# scope creating setter references to a specified field path
kpt cfg create-setter DIR/ replicas 3 --field "spec.replicas"
```

```sh
# create a setter called replicas with a description and set-by
kpt cfg create-setter DIR/ replicas 3 --set-by "package-default" \
    --description "good starter value"
```

```sh
# scope create a setter with a type.  the setter will make sure the set fields
# always parse as strings with a yaml 1.1 parser (e.g. values such as 1,on,true
# will be quoted so they are parsed as strings)
# only the final part of the the field path is specified
kpt cfg create-setter DIR/ app nginx --field "annotations.app" --type string
```
<!--mdtogo-->

### create-subst

<!--mdtogo:CreateSubstShort-->
Creates a substitution on top of setters to replace part of a field.
<!--mdtogo-->

<!--mdtogo:CreateSubstLong-->
```
kpt cfg create-subst DIR NAME --field-value VALUE --pattern PATTERN

DIR
  Path to a package directory

NAME
  The name of the substitution to create.  This is simply the unique key
  which is referenced by fields which have the substitution applied.
  e.g. image-substitution

VALUE
  The current value of the field that will have PATTERN substituted.
  e.g. nginx:1.7.9

PATTERN
  A string containing one or more MARKER substrings which will be
  substituted for setter values.  The pattern may contain multiple
  different MARKERS, the same MARKER multiple times, and non-MARKER
  substrings.
  e.g. ${image-setter}:${tag-setter}

FLAGS:
--field string
  name of the field to set -- e.g. --field image

--field-value string
  value of the field to create substitution for -- e.g. --field-value nginx:0.1.0

--pattern string
  substitution pattern -- e.g. --pattern \${my-image-setter}:\${my-tag-setter}

--recurse-subpackages, -R
  create substitution recursively in all the nested subpackages
```
<!--mdtogo-->

#### Examples

<!--mdtogo:CreateSubstExamples-->
```sh

# Automatically create setters when creating the substitution, inferring
# the setter values.
#
# 1. create a substitution derived from 2 setters.  The user will never
# call the substitution directly, instead it will be computed when the
# setters are used.
kpt cfg create-subst DIR/ image-tag --field-value nginx:v1.7.9 \
  --pattern \${image-setter}:\${tag-setter}

# 2. update the substitution value by setting one of the 2 setters it is
# computed from
kpt cfg set . tag-setter v1.8.0

# Manually create setters and substitution.  This is preferred to configure
# the setters with a type, description, set-by, etc.
#
# 1. create the setter for the image name -- set the field so it isn't
# referenced
kpt cfg create-setter DIR/ image-setter nginx --field "none" \
    --set-by "package-default"

# 2. create the setter for the image tag -- set the field so it isn't
# referenced
kpt cfg create-setter DIR/ tag-setter v1.7.9 --field "none" \
    --set-by "package-default"

# 3. create the substitution computed from the image and tag setters
kpt cfg create-subst DIR/ image-tag nginx:v1.7.9 \
  --pattern \${image-setter}:\${tag-setter}

# 4. update the substitution value by setting one of the setters
kpt cfg set . tag-setter v1.8.0
```
<!--mdtogo-->

### delete-setter

<!--mdtogo:DeleteSetterShort-->
Deletes a setter.
<!--mdtogo-->

<!--mdtogo:DeleteSetterLong-->
```
kpt cfg delete-setter DIR NAME

DIR:
  Path to a package directory

NAME:
  The name of the setter to delete. e.g. replicas

FLAGS:
--recurse-subpackages, -R
  Delete setter recursively in all the nested subpackages
```
<!--mdtogo-->

#### Examples

<!--mdtogo:DeleteSetterExamples-->
```sh
# delete a setter named "replicas"
kpt cfg delete-setter DIR/ replicas
```
<!--mdtogo-->

### delete-subst

<!--mdtogo:DeleteSubstShort-->
Deletes a substitution.
<!--mdtogo-->

<!--mdtogo:DeleteSubstLong-->
```
kpt cfg delete-subst DIR NAME

DIR:
  Path to a package directory

NAME:
  The name of the substitution to delete. e.g. image-tag

FLAGS:
--recurse-subpackages, -R
  Delete substitution recursively in all the nested subpackages
```
<!--mdtogo-->

#### Examples

<!--mdtogo:DeleteSubstExamples-->
```sh
# delete a substitution named "image-tag"
kpt cfg delete-subst DIR/ image-tag
```
<!--mdtogo-->

### fmt

<!--mdtogo:FmtShort-->
Formats the field ordering in YAML configuration files.
<!--mdtogo-->

<!--mdtogo:FmtLong-->
```
kpt cfg fmt [DIR]

DIR:
  Path to a package directory.  Reads from STDIN if not provided.

FLAGS:
--keep-annotations
  if true, keep index and filename annotations set on Resources.

--override
  if true, override existing filepath annotations.

--pattern string
  pattern to use for generating filenames for resources -- may contain the following
  formatting substitution verbs {'%n': 'metadata.name', '%s': 'metadata.namespace', '%k': 'kind'}
  (default "%n_%k.yaml")

--recurse-subpackages, -R
  formats resource files recursively in all the nested subpackages

--set-filenames
  if true, set default filenames on Resources without them

--use-schema
  if true, uses openapi resource schema to format resources.
```
<!--mdtogo-->

Inputs may be directories, files or STDIN. Formatted resources must
include both `apiVersion` and `kind` fields.

- Stdin inputs are formatted and written to stdout
- File inputs (args) are formatted and written back to the file
- Directory inputs (args) are walked, each encountered .yaml and .yml file
  acts as an input

For inputs which contain multiple yaml documents separated by \n---\n,
each document will be formatted and written back to the file in the original
order.

Field ordering roughly follows the ordering defined in the source Kubernetes
resource definitions (i.e. go structures), falling back on lexicographical
sorting for unrecognized fields.

Unordered list item ordering is defined for specific Resource types and
field paths.

- .spec.template.spec.containers (by element name)
- .webhooks.rules.operations (by element value)

#### Examples

<!--mdtogo:FmtExamples-->
```sh
# format file1.yaml and file2.yml
kpt cfg fmt file1.yaml file2.yml
```

```sh
# format all *.yaml and *.yml recursively traversing directories
kpt cfg fmt my-dir/
```

```sh
# format kubectl output
kubectl get -o yaml deployments | kpt cfg fmt
```

```sh
# format kustomize output
kustomize build | kpt cfg fmt
```
<!--mdtogo:FmtExamples-->

### grep

<!--mdtogo:GrepShort-->
Reads resources from a package or stdin and filters them by their
field values.
<!--mdtogo-->

<!--mdtogo:GrepLong-->
```
kpt cfg grep QUERY DIR

QUERY:
  Query to match expressed as 'path.to.field=value'.
  Maps and fields are matched as '.field-name' or '.map-key'
  List elements are matched as '[list-elem-field=field-value]'
  The value to match is expressed as '=value'
  '.' as part of a key or value can be escaped as '\.'

DIR:
  Path to a package directory

FLAGS:
--annotate
  annotate resources with their file origins. (default true)

--invert-match, -v
  keep resources NOT matching the specified pattern

--recurse-subpackages, -R
  Grep recursively in all the nested subpackages
```
<!--mdtogo-->

Grep may have sources such as `kubectl get -o yaml` piped to it or may
be piped to other commands such as `kpt cfg tree` for display.

#### Examples

<!--mdtogo:GrepExamples-->
```sh
# find deployment resources
kpt cfg grep "kind=Deployment" my-dir/
```

```sh
# find resources named "nginx"
kpt cfg grep "metadata.name=nginx" my-dir/
```

```sh
# use tree to display matching resources
kpt cfg grep "metadata.name=nginx" my-dir/ | kpt cfg tree
```

```sh
# look for resources matching a specific container image
kpt cfg grep "spec.template.spec.containers[name=nginx].image=nginx:1\.7\.9" \
    my-dir/ | kpt cfg tree
```
<!--mdtogo-->

### list-setters

<!--mdtogo:ListSettersShort-->
Displays the setters that may be provided to the set command.
<!--mdtogo-->

<!--mdtogo:ListSettersLong-->
```
kpt cfg list-setters DIR [NAME]

DIR
  Path to a package directory

NAME
  Optional.  The name of the setter to display.
```
<!--mdtogo-->

It also displays the following:

- The current setter value
- A record of who last set the value
- A description of the value or setter
- The name of fields that would be updated by calling set

#### Examples

<!--mdtogo:ListSettersExamples-->
```
# list the setters in the hello-world package
kpt cfg list-setters hello-world/

  NAME     VALUE    SET BY    DESCRIPTION   COUNT  
replicas   4       isabella   good value    1
```
<!--mdtogo-->

### set

<!--mdtogo:SetShort-->
Modifies configuration by setting or substituting
a user provided value into resource fields.
<!--mdtogo-->

<!--mdtogo:SetLong-->
```
kpt cfg set DIR NAME VALUE

DIR
  Path to a package directory. e.g. hello-world/

NAME
  The name of the setter. e.g. replicas

VALUE
  The new value to set on fields. e.g. 3

FLAGS:
--description
  Optional description about the value.

--set-by
  Optional record of who set the value.  Clears the last set-by
  value if unset.

--values
  Optional flag, the values of the setter to be set to
  e.g. used to specify values that start with '-'
```
<!--mdtogo-->

Which fields are set or
have values substituted is configured by line comments on the configuration
fields.

- Calling *set* may change multiple fields at once.
- The *set* command may only be run on a directory containing a Kptfile.

#### Examples

<!--mdtogo:SetExamples-->
```sh
# set replicas to 3 using the 'replicas' setter
kpt cfg set hello-world/ replicas 3
```

```sh
# set the replicas to 5 and include a description of the value
kpt cfg set hello-world/ replicas 5 --description "need at least 5 replicas"
```

```sh
# set the replicas to 5 and record who set this value
kpt cfg set hello-world/ replicas 5 --set-by "mia"
```

```sh
# set the tag portion of the image field to '1.8.1' using the 'tag' setter
# the tag setter is referenced as a value by a substitution in the Kptfile
kpt cfg set hello-world/ tag 1.8.1
```
<!--mdtogo-->

### tree

<!--mdtogo:TreeShort-->
Displays the contents of a package using a tree structure to show
the relationships between directories, resources, and fields.
<!--mdtogo-->

<!--mdtogo:TreeLong-->
```
kpt cfg tree [DIR] [flags]

DIR:
  Path to a package directory.  Defaults to STDIN if not specified.

FLAGS:
--args
  if true, print the container args field

--command
  if true, print the container command field

--env
  if true, print the container env field

--field
  dot-separated path to a field to print

--image
  if true, print the container image fields

--name
  if true, print the container name fields

--ports
  if true, print the container port fields

--replicas
  if true, print the replica field

--resources
  if true, print the resource reservations
```
<!--mdtogo-->

Supports a number of built-in fields such as replicas, images, ports,
etc.  Additional fields may be printed by providing the `--field` flag

By default, `cfg tree` uses the resource graph structure if any relationships
between resources (ownerReferences) are detected e.g. when printing
remote cluster resources rather than local package resources.
Otherwise, directory graph structure is used.

#### Examples

<!--mdtogo:TreeExamples-->
```sh
# print Resources using directory structure
kpt cfg tree my-dir/
```

```sh
# print replicas, container name, and container image and fields for Resources
kpt cfg tree my-dir --replicas --image --name
```

```sh
# print all common Resource fields
kpt cfg tree my-dir/ --all
```

```sh
# print the "foo"" annotation
kpt cfg tree my-dir/ --field "metadata.annotations.foo"
```

```sh
# print the status of resources with status.condition type of "Completed"
kubectl get all -o yaml | kpt cfg tree \
  --field="status.conditions[type=Completed].status"
```

```sh
# print live Resources from a cluster using owners for graph structure
kubectl get all -o yaml | kpt cfg tree --replicas --name --image
```

```sh
# print live Resources with status condition fields
kubectl get all -o yaml | kpt cfg tree \
  --name --image --replicas \
  --field="status.conditions[type=Completed].status" \
  --field="status.conditions[type=Complete].status" \
  --field="status.conditions[type=Ready].status" \
  --field="status.conditions[type=ContainersReady].status"
```
<!--mdtogo-->