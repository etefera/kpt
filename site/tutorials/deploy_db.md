# Deploy CockroachDB with a Modified Configuration

## Fetch the remote package

First, copy the `staging/cockroachdb` subdirectory from the kubernetes example repository on GitHub using `pkg get`.

```sh
kpt pkg get https://github.com/kubernetes/examples/staging/cockroachdb my-cockroachdb
```

The repository can be inspected by using `pkg desc` to view the `Kptfile`. Observe that the remote repository,
relative path and commit are marked here, as well as how they map to the local directory `my-cockroachdb`.

```sh
kpt pkg desc my-cockroachdb/
```

```
my-cockroachdb/Kptfile
   PACKAGE NAME         DIR                         REMOTE                       REMOTE PATH       REMOTE REF   REMOTE COMMIT  
  my-cockroachdb   my-cockroachdb   https://github.com/kubernetes/examples   staging/cockroachdb   master       75f116a        
```

## Change the configuration

The kubernetes configuration can be inspected by using `cfg tree`.

```sh
kpt cfg tree my-cockroachdb --all
```

```
my-cockroachdb
├── [Kptfile]  Kptfile my-cockroachdb
├── [cockroachdb-statefulset.yaml]  Service cockroachdb
│   └── spec.ports: [{port: 26257, targetPort: 26257, name: grpc}, {port: 8080, targetPort: 8080, name: http}]
├── [cockroachdb-statefulset.yaml]  StatefulSet cockroachdb
│   ├── spec.replicas: 3
│   └── spec.template.spec.containers
│       └── 0
│           ├── name: cockroachdb
│           ├── image: cockroachdb/cockroach:v1.1.0
│           ├── command: ["/bin/bash", "-ecx", "# The use of qualified `hostname -f` is crucial:\n# Other nodes
    aren't able to look up the unqualified hostname.\nCRARGS=(\"start\" \"--logtostderr\"
    \"--insecure\" \"--host\" \"$(hostname -f)\" \"--http-host\" \"0.0.0.0\")\n# We
    only want to initialize a new cluster (by omitting the join flag)\n# if we're
    sure that we're the first node (i.e. index 0) and that\n# there aren't any other
    nodes running as part of the cluster that\n# this is supposed to be a part of
    (which indicates that a cluster\n# already exists and we should make sure not
    to create a new one).\n# It's fine to run without --join on a restart if there
    aren't any\n# other nodes.\nif [ ! \"$(hostname)\" == \"cockroachdb-0\" ] || \\\n
    \  [ -e \"/cockroach/cockroach-data/cluster_exists_marker\" ]\nthen\n  # We don't
    join cockroachdb in order to avoid a node attempting\n  # to join itself, which
    currently doesn't work\n  # (https://github.com/cockroachdb/cockroach/issues/9625).\n
    \ CRARGS+=(\"--join\" \"cockroachdb-public\")\nfi\nexec /cockroach/cockroach ${CRARGS[*]}\n"]
│           └── ports: [{containerPort: 26257, name: grpc}, {containerPort: 8080, name: http}]
├── [cockroachdb-statefulset.yaml]  PodDisruptionBudget cockroachdb-budget
└── [cockroachdb-statefulset.yaml]  Service cockroachdb-public
    └── spec.ports: [{port: 26257, targetPort: 26257, name: grpc}, {port: 8080, targetPort: 8080, name: http}]
```

We can create setters for the fields in the above output to modify the configuration for our purposes.

### Add setters to variable fields in configuration
In this case, we want to change the number of replicas of our database, so we'll create a setter that matches the
`replicas` field to change later.

```sh
kpt cfg create-setter my-cockroachdb/ replicas 3
```

### Substitute values

Let's scale the database by increasing the number of replicas to 5 for now.
```sh
kpt cfg set my-cockroachdb/ replicas 5
```

We can view currently set values with `cfg list-setters` to see that the `replicas` field has been correctly modified.

```sh
kpt cfg list-setters my-cockroachdb/
```

```
my-cockroachdb/
    NAME     VALUE   SET BY            DESCRIPTION             COUNT   REQUIRED   IS SET  
  replicas   5                The name of the field to         0       No         Yes     
                              manipulate        
```

Now we can deploy our configuration to a kubernetes cluster.

## Deploy CockroachDB

We can initialize our package to generate a template resource with `live init`.

```sh
kpt live init my-cockroachdb/
```

Once an `inventory-template.yaml` is created by the above command, we can directly
apply our package with `live apply`.

```sh
kpt live apply my-cockroachdb/
```

## Change the configuration and redeploy

We now have a database living in a cluster with a configuration we specified, but what if we want
to change that configuration? Let's scale up our database by increasing the number of `replicas` to 10.

```sh
kpt cfg set my-cockroachdb/ replicas 10
```

We can use `cfg list-setters` to confirm our local change.

```sh
kpt cfg list-setters my-cockroachdb/
```

```
my-cockroachdb/
    NAME     VALUE   SET BY            DESCRIPTION             COUNT   REQUIRED   IS SET  
  replicas   10               The name of the field to         0       No         Yes     
                              manipulate  
```

Once we're satisfied with our change, updating our configuration server-side is as easy as running `live apply` again.

```sh
kpt live apply my-cockroachdb/
```