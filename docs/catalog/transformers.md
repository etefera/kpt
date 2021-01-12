# go functions

| Image | Description |
| ----- | ----------- |
| [gcr.io/kpt-functions/set-namespace](https://github.com/GoogleContainerTools/kpt-functions-catalog/blob/master/functions/go/set-namespace/main.go) | Sets the namespace field of all configs passed in. 
| [gcr.io/kubeflow-images-public/kustomize-fns/remove-namespace](https://github.com/kubeflow/kfctl/tree/master/kustomize-fns/remove-namespace/) | Removes the namespace field of cluster-scoped configs.
| [gcr.io/kustomize-functions/example-tshirt](https://github.com/kubernetes-sigs/kustomize/blob/master/functions/examples/injection-tshirt-sizes/image/main.go) | Sets CPU and memory reservations on all containers for Resources annotated with tshirt size. 

# ts functions

| Image | Description | Example |
| ----- | ----------- | ------- |
| [gcr.io/kpt-functions/mutate-psp](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/demo-functions/src/mutate_psp.ts) | [Demo] Mutates PodSecurityPolicy objects by setting spec.allowPrivilegeEscalation to false. | 
| [gcr.io/kpt-functions/label-namespace](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/hello-world/src/label_namespace.ts) | [Demo] Adds a label to all Namespaces. | 
| [gcr.io/kpt-functions/helm-template](https://github.com/GoogleContainerTools/kpt-functions-catalog/blob/master/functions/ts/src/helm_template.ts) | Render chart templates locally using helm template. | [Example](https://github.com/GoogleContainerTools/kpt-functions-catalog/tree/master/examples/helm-template/) |
| [gcr.io/kpt-functions/annotate-config](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/demo-functions/src/annotate_config.ts) | [Demo] Adds an annotation to all configs. | 

# Miscellaneous functions

| Description | Source | SDK |
| ----------- | ------ | --- |
| Sets the namespace field of all configs passed in. | [Source](https://github.com/GoogleContainerTools/kpt-functions-catalog/blob/master/functions/starlark/set_namespace.star) | [Starlark Runtime](../../../../producer/functions/starlark/) 