# go functions

| Image | Description | Args |
| ----- | ----------- | ---- |
| [gcr.io/kustomize-functions/example-nginx](https://github.com/kubernetes-sigs/kustomize/blob/master/functions/examples/template-go-nginx/image/main.go) | Generate configuration from go templates using the functionConfig as the template input. |
| [gcr.io/kpt-dev/kpt](https://github.com/kubernetes-sigs/kustomize/blob/master/cmd/config/internal/commands/source.go) | Reads a directory of Kubernetes configuration recursively. | fn source
| [gcr.io/kustomize-functions/create-application](https://github.com/kubernetes-sigs/kustomize/blob/master/functions/examples/application-cr/image/main.go) | Add an Application CR to a group of resources. |

# ts functions

| Image | Description | Example 
| ----- | ----------- | ------- 
| [gcr.io/kpt-functions/expand-team-cr](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/demo-functions/src/expand_team_cr.ts) |  [Demo] Reads custom resources of type Team and generates multiple Namespace and RoleBinding objects.  | 
| [gcr.io/kpt-functions/helm-inflator](https://github.com/GoogleContainerTools/kpt-functions-catalog/blob/master/functions/ts/helm-inflator/src/helm_inflator.ts) | Render chart templates locally using helm template. | [Example](https://github.com/GoogleContainerTools/kpt-functions-catalog/tree/master/examples/helm-inflator/) 
| [gcr.io/kpt-functions/read-yaml](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/demo-functions/src/read_yaml.ts) | [Demo] Reads a directory of Kubernetes configuration recursively. | 

# Miscellaneous functions

| Image | Description | Args |
| ----- | ----------- | ---- |
| [gcr.io/kustomize-functions/example-cockroachdb](https://github.com/kubernetes-sigs/kustomize/blob/master/functions/examples/template-heredoc-cockroachdb/image/cockroachdb-template.sh) | Generate configuration from heredoc template using the functionConfig as the template input. |
| [gcr.io/cloud-builders/kubectl](https://github.com/GoogleCloudPlatform/cloud-builders/blob/master/kubectl/Dockerfile) | Get one or many resources from a Kubernetes cluster. | get [...] -o yaml 