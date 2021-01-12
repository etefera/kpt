# go functions

| Image | Description | Source |
| ----- | ----------- | ------ |
| gcr.io/kpt-functions/set-namespace | Sets the namespace field of all configs passed in. | [Source](https://github.com/GoogleContainerTools/kpt-functions-catalog/blob/master/functions/go/set-namespace/main.go)
| gcr.io/kubeflow-images-public/kustomize-fns/remove-namespace | Removes the namespace field of cluster-scoped configs. | [Source](https://github.com/kubeflow/kfctl/tree/master/kustomize-fns/remove-namespace/)
| gcr.io/kustomize-functions/example-tshirt | Sets cpu and memory reservations on all containers for Resources annotated with tshirt size. | [Source](https://github.com/kubernetes-sigs/kustomize/blob/master/functions/examples/injection-tshirt-sizes/image/main.go)

# ts functions

| Image | Description | Example | Source |
| ----- | ----------- | ------- | ------ |
| gcr.io/kpt-functions/mutate-psp | [Demo] Mutates PodSecurityPolicy objects by setting spec.allowPrivilegeEscalation to false. | | [Source](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/demo-functions/src/mutate_psp.ts)
| gcr.io/kpt-functions/label-namespace | [Demo] Adds a label to all Namespaces. | | [Source](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/hello-world/src/label_namespace.ts)
| gcr.io/kpt-functions/helm-template | Render chart templates locally using helm template. | [Example](https://github.com/GoogleContainerTools/kpt-functions-catalog/tree/master/examples/helm-template/) | [Source](https://github.com/GoogleContainerTools/kpt-functions-catalog/blob/master/functions/ts/src/helm_template.ts)
| gcr.io/kpt-functions/annotate-config | [Demo] Adds an annotation to all configs. | |  [Source](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/demo-functions/src/annotate_config.ts) 

# Miscellaneous functions

| Description | Source | SDK |
| ----------- | ------ | --- |
| Sets the namespace field of all configs passed in. | [Source](https://github.com/GoogleContainerTools/kpt-functions-catalog/blob/master/functions/starlark/set_namespace.star) | [Starlark Runtime](../../../../producer/functions/starlark/) 