# kpt live

## Commands

### apply
Creates, updates and deletes resources in the cluster to make the remote
cluster resources match the local package configuration.

```sh
kpt live apply DIR [flags]


DIR:
  Path to a package directory.  The directory must contain exactly
  one ConfigMap with the inventory object annotation.

FLAGS:
--poll-period
  The frequency with which the cluster will be polled to determine
  the status of the applied resources. The default value is every 2 seconds.

--reconcile-timeout
  The threshold for how long to wait for all resources to reconcile before
  giving up. If this flag is not set, kpt live apply will not wait for
  resources to reconcile.

--prune-timeout
  The threshold for how long to wait for all pruned resources to be
  deleted before giving up. If this flag is not set, kpt live apply will not
  wait. In most cases, it would also make sense to set the
  --prune-propagation-policy to Foreground when this flag is set.

--prune-propagation-policy
  The propagation policy kpt live apply should use when pruning resources. The
  default value here is Background. The other options are Foreground and Orphan.

--output
  This determines the output format of the command. The default value is
  events, which will print the events as they happen. The other option is
  table, which will show the output in a table format.
```

This is an extended version of kubectl apply, with added support
for pruning and blocking on resource status. It has a different usage pattern (args + flags)
from kubectl to make it consistent with other kpt commands.

#### `kubectl apply` vs `kpt live apply`

|                     | `kubectl apply`            | `kpt live apply`          |
|---------------------|----------------------------|---------------------------|
|Usage                | kubectl apply -f /dir      | kpt live apply /dir       |
|Applied resource set | Not tracked                | Tracked                   |
|Prune                | Imperative and error prone | Declarative and reliable  |
|Status               | Not supported              | Supported                 |

<!--
##### Applied resource set

This refers to the set of resources in the directory applied to cluster as a
group.  `kpt live apply` tracks the state of your applied resource set and
related configuration. This helps `kpt` to reliably reconcile the real world
resources with your configuration changes.

### Client-Side Apply versus Server-Side Apply

kpt live apply defaults to client-side apply, so the updates are accomplished
by calculating and sending a patch from the client. Server-side apply
with the `--server-side` flag sends the entire resource to the server
for the update. The server-side flags and functionality are the same
as kubectl.

### Prune

kpt live apply will automatically delete resources which have been
previously applied, but which are no longer included. This clean-up
functionality is called pruning. For example, consider a package
which has been applied with the following three resources:

```
service-1 (Service)
deployment-1 (Deployment)
config-map-1 (ConfigMap)
```

Then imagine the package is updated to contain the following resources,
including a new ConfigMap named `config-map-2` (Notice that `config-map-1`
is not part of the updated package):

```
service-1 (Service)
deployment-1 (Deployment)
config-map-2 (ConfigMap)
```

When the updated package is applied, `config-map-1` is automatically
deleted (pruned) since it is omitted.

In order to take advantage of this automatic clean-up, a package must contain
an **Inventory Template**, which is a ConfigMap with a special label. An example is:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: inventory-78889725
  namespace: default
  labels:
    cli-utils.sigs.k8s.io/inventory-id: b49dd93f-28db-4626-b42d-749dd4c5ba2f
```

And the special label is:

```
cli-utils.sigs.k8s.io/inventory-id: *b49dd93f-28db-4626-b42d-749dd4c5ba2f*
```

`kpt live apply` recognizes this template from the special label, and based
on this kpt will create new inventory object with the metadata of all applied
objects in the ConfigMap's data field. Subsequent `kpt live apply` commands can
then query the inventory object, and calculate the omitted objects, cleaning up
accordingly. On every subsequent apply operation, the inventory object is updated
to reflect the current set of resources.

### Ordering

`kpt live apply` will sort the resources before applying them. This makes sure
namespaces are applied before resources going into the namespace, configmaps
are applied before Deployments and StatefulSets, and other known dependencies
between the builtin kubernetes resource types. Kpt does not analyze the actual
dependencies between the resources, but sorts the resources based on the Kind
of resources. Custom ordering of resources is not supported.

During pruning, the same rules are used, but resources will be deleted in
reverse order. Note that this does not wait for a resource to be deleted
before continuing to delete the remaining resources.

The following resources will be applied first in this order:

* Namespace
* ResourceQuota
* StorageClass
* CustomResourceDefinition
* MutatingWebhookConfiguration
* ServiceAccount
* PodSecurityPolicy
* Role
* ClusterRole
* RoleBinding
* ClusterRoleBinding
* ConfigMap
* Secret
* Service
* LimitRange
* PriorityClass
* Deployment
* StatefulSet
* CronJob
* PodDisruptionBudget

Following this, any resources that are not mentioned will be applied.

The following resources will be applied last in the following order:

* ValidatingWebhookConfiguration

### Status (reconcile-timeout=\<DURATION\>)

kpt live apply also has support for computing status for resources. This is
useful during apply for making sure that not only are the set of resources applied
into the cluster, but also that the desired state expressed in the resource are
fully reconciled in the cluster. An example of this could be applying a deployment. Without
looking at the status, the operation would be reported as successful as soon as the
deployment resource has been created in the apiserver. With status, kpt live apply will
wait until the desired number of pods have been created and become available.

Status is computed through a set of rules for the built-in types, and
functionality for polling a set of resources and computing the aggregate status
for the set. For CRDs, the status computation make a set of assumptions about
the fields in the status object of the resource and the conditions that
are set by the custom controller. If CRDs follow the recommendations below,
kpt live apply will be able to correctly compute status

#### Recommendations for CRDs

The custom controller should use the following conditions to signal whether
a resource has been fully reconciled, and whether it has encountered any
problems:

**Reconciling**: Indicates that the resource does not yet match its spec. i.e.
the desired state as expressed in the resource spec object has not been
fully realized in the cluster. A value of True means the controller
is in the process of reconciling the resource while a value of False means
there are no work left for the controller.

**Stalled**: Indicates that the controller is not able to make the expected
progress towards reconciling the resource. The cause of this status can be
either that the controller observes an actual problem (like a pod not being
able to start), or that something is taking longer than expected (similar
to the `progressDeadlineSeconds` timeout on Deployments). If this condition
is True, it should be interpreted that something might be wrong. It does not
mean that the resource will never be reconciled. Most process in Kubernetes
retry forever, so this should not be considered a terminal state.

These conditions adhere to the [Kubernetes design principles]
which include expressing conditions using abnormal-true polarity. There is
currently a [proposal] to change to guidance for conditions. If this is
accepted, the recommended conditions for kpt might also change, but we will
continue to support the current set of conditions.

CRDs should also set the `observedGeneration` field in the status object, a
pattern already common in the built-in types. The controller should update
this field every time it sees a new generation of the resource. This allows
the kpt library to distinguish between resources that do not have any
conditions set because they are fully reconciled, from resources that have no
conditions set because they have just been created.

An example of a resource where the latest change has been observed by
the controller which is currently in the process of reconciling would be:

```yaml
apiVersion: example.com
kind: Foo
metadata:
  generation: 12
  name: bar
spec:
  replicas: 1
status:
  observedGeneration: 12
  conditions:
  - lastTransitionTime: "2020-03-25T21:20:38Z"
    lastUpdateTime: "2020-03-25T21:20:38Z"
    message: Resource is reconciling
    reason: Reconciling
    status: "True"
    type: Reconciling
  - lastTransitionTime: "2020-03-25T21:20:27Z"
    lastUpdateTime: "2020-03-25T21:20:39Z"
    status: "False"
    type: Stalled
```

The status for this resource state will be InProgress. So if the
`--reconcile-timeout` flag is set, kpt live apply will wait until
the `Reconciling` condition is `False` before pruning and exiting. -->

#### Examples

```sh
# apply resources and prune
kpt live apply my-dir/
```

```sh
# apply resources and wait for all the resources to be reconciled before pruning
kpt live apply --reconcile-timeout=15m my-dir/
```

```sh
# apply resources and specify how often to poll the cluster for resource status
kpt live apply --reconcile-timeout=15m --poll-period=5s my-dir/
```

### destroy
Removes all files belonging to a package from the cluster.

```sh
kpt live destroy DIR

DIR:
  Path to a package directory.  The directory must contain exactly
  one ConfigMap with the grouping object annotation.
```

#### Examples

```sh
# remove all resources in a package from the cluster
kpt live destroy my-dir/
```

### diff
Compares the live cluster state of each pacakge
resource against the local package config.

```sh
kpt live diff DIR

DIR:
  Path to a package directory.  The directory must contain exactly one ConfigMap with the inventory annotation.

ENVIRONMENT VARIABLES:
  KUBECTL_EXTERNAL_DIFF:
  Commandline diffing tool (diff by default) that will be used to show
  changes.
```

The output is always YAML.

|Exit Status          | Description                     |
|---------------------|---------------------------------|
|0                    | No differences were found.      |
|1                    | Differences were found.         |
|>1                   | Failed with an error.           |

KUBECTL_EXTERNAL_DIFF, if used, is expected to follow the preceding convention.

#### Examples
```sh
# diff the config in "my-dir" against the live cluster resources
kpt live diff my-dir/
```

### fetch-k8s-schema
Downloads and prints the OpenAPI schema from the cluster
given by the context.

```sh
kpt live fetch-k8s-schema [flags]

FLAGS:
  --pretty-print
    Format the output before printing.
```

#### Examples
```sh
# print the schema for the cluster given by the current context
kpt live fetch-k8s-schema

# print the schema after formatting using a named context
kpt live fetch-k8s-schema --context=myContext --pretty-print
```

### init
Initializes a package with an object to track previously applied resources.

```sh
kpt live init DIR [flags]

DIR:
  Path to a package directory.  The directory must contain exactly
  one ConfigMap with the grouping object annotation.

FLAGS:
--inventory-id
  Identifier for group of applied resources. Must be composed of valid label characters.
  
--namespace
  namespace for the inventory object. If not provided, kpt will check if all the resources
  in the package belong in the same namespace. If they are, that namespace will be used. If
  they are not, the namespace in the user's context will be chosen.
```

The template resource is required by other live commands
such as apply, preview and destroy.

#### Examples
```sh
# initialize a package
kpt live init my-dir/
```

```sh
# initialize a package with a specific name for the group of resources
kpt live init --namespace=test my-dir/
```

### preview
Prints the changes `apply` would make to the cluster.

```sh
kpt live preview DIR [flags]

DIR:
  One directory that contain k8s manifests. The directory
  must contain exactly one ConfigMap with the grouping object annotation.

FLAGS:
  --destroy
    If true, dry-run deletion of all resources.
```


#### Examples
```sh
# preview apply for a package
kpt live preview my-dir/
```

```sh
# preview destroy for a package
kpt live preview --destroy my-dir/
```

### status
Print the status for all resources in the live state
that belong to the current inventory.

```sh
kpt live status (DIR | STDIN) [flags]

DIR | STDIN:
  Path to a directory if an argument is provided or reading from stdin if left
  blank. In both situations one of the manifests must contain exactly one
  ConfigMap with the inventory template annotation.

FLAGS:
--poll-period (duration)
  The frequency with which the cluster will be polled to determine the status
  of the applied resources. The default value is every 2 seconds.

--poll-until (string)
  When to stop polling for status and exist. Must be one of the following:
    known:   Exit when the status for all resources have been found.
    current: Exit when the status for all resources have reached the Current status.
    deleted: Exit when the status for all resources have reached the NotFound
             status, i.e. all the resources have been deleted from the live state.
    forever: Keep polling for status until interrupted.
  The default value is ‘known’.

--output (string)
  Determines the output format for the status information. Must be one of the following:
    events: The output will be a list of the status events as they become available.
    table:  The output will be presented as a table that will be updated inline
            as the status of resources become available.
  The default value is ‘events’.

--timeout (duration)
  Determines how long the command should run before exiting. This deadline will
  be enforced regardless of the value of the --poll-until flag. The default is
  to wait forever.
```

The [Inventory Template] is used to look up the set of 
resources in the inventory in the live state and poll all
those resources for their status until either an exit criteria has been met
or the process is cancelled.

#### Examples
```sh
# Monitor status for a set of resources based on manifests. Wait until all
# resources have reconciled.
kpt live status my-app/
```

```sh
# Monitor status for a set of resources based on manifests. Output in table format:
kpt live status my-app/ --poll-until=forever --output=table
```

```sh
# Check status for a set of resources read from stdin with output in events format
kpt cfg cat my-app | kpt live status
```

[Inventory Template]: https://googlecontainertools.github.io/kpt/reference/live/apply/#prune
