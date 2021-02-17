# Apply the contents of a local package to a remote cluster.


## Topics

[kpt live apply]

Because kpt packages are composed of resource configuration, they can be
applied with `kubectl apply -R -f DIR`. However, kpt includes the
next-generation **apply** commands developed out of the Kubernetes [cli-utils]
repository as the [kpt live apply] command.

Kpt live apply provides additional functionality beyond what is provided by
`kubectl apply`, such as communicating back resource status and pruning
resources for deleted configuration.

![Apply diagram](../../../static/images/apply.svg)

## Steps

- [Fetch a remote package](#fetch-a-remote-package)
  - [Command](#command)
  - [Output](#output)
- [Initialize the package inventory template](#initialize-the-package-inventory-template)
  - [Init Command](#init-command)
  - [Init Output](#init-output)
  - [Inventory template](#inventory-template)
- [Apply to a cluster](#apply-to-a-cluster)
  - [Apply Command](#apply-command)
  - [Apply Output](#apply-output)
- [Print the live resources](#print-the-live-resources)
  - [Print Command](#print-command)
  - [Print Output](#print-output)
  - [Command: `tree`](#command-tree)
  - [Output: `tree`](#output-tree)
- [Prune resources](#prune-resources)
  - [Prune Command](#prune-command)
  - [Prune Output](#prune-output)
  - [Print the live resources after pruning](#print-the-live-resources-after-pruning)

## Fetch a remote package

### Command

<!-- @fetchPackage @verifyGuides-->
```sh
export SRC_REPO=https://github.com/GoogleContainerTools/kpt.git
kpt pkg get $SRC_REPO/package-examples/helloworld-set@v0.5.0 helloworld
```

Grab a remote package to apply to a cluster.

### Output

```sh
fetching package /package-examples/helloworld-set from https://github.com/GoogleContainerTools/kpt to helloworld
```

## Initialize the package inventory template

The kpt version of apply uses a ConfigMap map to keep track of previously
applied resources so they can be pruned later if the configuration for
them is deleted. The [kpt live init] command will generate an inventory template
(which is just a normal ConfigMap manifest with a special annotation) used by
[kpt live apply] to generate an actual ConfigMap in the cluster which we refer
to as an inventory object.

The inventory template must be created for a package to be applied using
`kpt live apply`.

### Init Command

<!-- @liveInit @verifyGuides-->
```sh
kpt live init helloworld
```

### Init Output

```sh
namespace: default is used for inventory object
Initialized: helloworld/inventory-template.yaml
```

### Inventory template

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
...
  name: inventory
  labels:
    # DANGER: Do not change the value of this label.
    # Changing this value will cause a loss of continuity
    # with previously applied inventory objects. Set deletion
    # and pruning functionality will be impaired.
    cli-utils.sigs.k8s.io/inventory-id: 060da2f6-dc0e-4425-a286-9a4acbad063d
```

A ConfigMap with the `cli-utils.sigs.k8s.io/inventory-id` label has been
created, and will be used by apply to generate a history of previously
applied resources.  This file should be checked into `git` along with the
rest of the package, but otherwise ignored by users.

## Apply to a cluster

### Apply Command

<!-- @liveApply @verifyGuides-->
```sh
kpt live apply helloworld --reconcile-timeout=2m
```

Apply the resources to the cluster and block until the changes have
been fully rolled out -- e.g. until the Pods are running.

### Apply Output

```sh
configmap/inventory-17c4dd3c created
service/helloworld-gke created
deployment.apps/helloworld-gke created
3 resource(s) applied. 3 created, 0 unchanged, 0 configured
configmap/inventory-2911da3b is Current: Resource is always ready
service/helloworld-gke is Current: Service is ready
deployment.apps/helloworld-gke is InProgress: Available: 0/5
deployment.apps/helloworld-gke is InProgress: Available: 2/5
deployment.apps/helloworld-gke is Current: Deployment is available. Replicas: 5
resources failed to the reached Current status
0 resource(s) pruned
```

Apply prints the status of the resources as it waits for all changes to
be rolled out.

## Print the live resources

Display the resources in the cluster using kubectl.

### Print Command

```sh
kubectl get configmaps,deploy,services
```

### Print Output

```sh
NAME                                 DATA   AGE
configmap/inventory-28c4kc3c         2      2m47s

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/helloworld-gke   5/5     5            5           2m47s

NAME                     TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE
service/helloworld-gke   NodePort    10.48.2.143   <none>        80:32442/TCP   2m47s
service/kubernetes       ClusterIP   10.48.0.1     <none>        443/TCP        19m
```

<!-- @ @verifyApply-->
```
# Verify that apply was successful
kubectl get deployments | tr -s ' ' | grep "deployment.apps/helloworld-gke 5/5"
```

### Command: `tree`

```sh
kubectl get all -o yaml | kpt cfg tree
```

The output of kubectl can also be piped to [kpt cfg tree] to summarize
the resources.

### Output: `tree`

```sh
.
├── [Resource]  Deployment default/helloworld-gke
│   └── [Resource]  ReplicaSet default/helloworld-gke-5bf95f8869
│       ├── [Resource]  Pod default/helloworld-gke-5bf95f8869-mm7sq
│       ├── [Resource]  Pod default/helloworld-gke-5bf95f8869-ng8kh
│       ├── [Resource]  Pod default/helloworld-gke-5bf95f8869-nlh4r
│       ├── [Resource]  Pod default/helloworld-gke-5bf95f8869-phx85
│       └── [Resource]  Pod default/helloworld-gke-5bf95f8869-v4259
├── [Resource]  Service default/helloworld-gke
└── [Resource]  Service default/kubernetes
```

## Prune resources

Resources can be deleted from the cluster by deleting the corresponding
resource configuration.

### Prune Command

```sh
rm helloworld/deploy.yaml
kpt live apply helloworld/ --reconcile-timeout=2m
```

Apply uses the previously created inventory objects (ConfigMaps) to calculate
the set of resources to prune (delete) after applying.  In this case the
Deployment.

### Prune Output

```sh
service/helloworld-gke is Current: Service is ready
resources failed to the reached Current status
deployment.apps/helloworld-gke pruned
configmap/inventory-2911da3b pruned
2 resource(s) pruned
```

### Print the live resources after pruning

```sh
kubectl get deploy
```

```sh
No resources found in default namespace.
```

[kpt cfg tree]: ../../../reference/cfg#tree
[kpt live apply]: ../../../reference/live#apply
[kpt live init]: ../../../reference/live#init
[setters]: ../../../reference/cfg#create-setter
[substitutions]: ../../../reference/cfg#create-subst
[cli-utils]: https://github.com/kubernetes-sigs/cli-utils
