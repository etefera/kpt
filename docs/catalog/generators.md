# go functions

| Image | Args | Description | Source |
| ----- | ---- | ----------- | ------ |
| gcr.io/kustomize-functions/example-nginx | | Generate configuration from go templates using the functionConfig as the template input. | [Source](https://github.com/kubernetes-sigs/kustomize/blob/master/functions/examples/template-go-nginx/image/main.go)
| gcr.io/kpt-dev/kpt | fn source | Reads a directory of Kubernetes configuration recursively. | [Source](https://github.com/kubernetes-sigs/kustomize/blob/master/cmd/config/internal/commands/source.go)
| gcr.io/kustomize-functions/create-application | | Add an Application CR to a group of resources. | [Source](https://github.com/kubernetes-sigs/kustomize/blob/master/functions/examples/application-cr/image/main.go)

# ts functions

| Image | Description | Example | Source |
| ----- | ----------- | ------- | ------ |
| gcr.io/kpt-functions/expand-team-cr |  [Demo] Reads custom resources of type Team and generates multiple Namespace and RoleBinding objects.  | | [Source](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/demo-functions/src/expand_team_cr.ts)
| gcr.io/kpt-functions/helm-template | Render chart templates locally using helm template. | [Example](https://github.com/GoogleContainerTools/kpt-functions-catalog/tree/master/examples/helm-template/) | [Source](https://github.com/GoogleContainerTools/kpt-functions-catalog/blob/master/functions/ts/src/helm_template.ts)
| gcr.io/kpt-functions/read-yaml | [Demo] Reads a directory of Kubernetes configuration recursively. | | [Source](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/demo-functions/src/read_yaml.ts)

# Miscellaneous functions

| Image | Args | Description | Source |
| ----- | ---- | ----------- | ------ |
| gcr.io/kustomize-functions/example-cockroachdb | | Generate configuration from heredoc template using the functionConfig as the template input. | [Source](https://github.com/kubernetes-sigs/kustomize/blob/master/functions/examples/template-heredoc-cockroachdb/image/cockroachdb-template.sh)
| gcr.io/cloud-builders/kubectl | get [...] -o yaml | Get one or many resources from a Kubernetes cluster. | [Source](https://github.com/GoogleCloudPlatform/cloud-builders/blob/master/kubectl/Dockerfile)