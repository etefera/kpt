# go functions

| Image | Args | Description | Source |
| ----- | ---- | ----------- | ------ |
| gcr.io/kpt-dev/kpt | fn sink | Writes a directory of Kubernetes configuration. It maintains the original directory structure as read by source functions. | [Source](https://github.com/kubernetes-sigs/kustomize/blob/master/cmd/config/internal/commands/sink.go) 
| gcr.io/kpt-functions/gatekeeper-validate | | Enforces OPA constraints on input objects. The constraints are also passed as part of the input to the function. | [Source](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/go/pkg/functions/gatekeeper/validate.go) 
| gcr.io/kustomize-functions/example-validator-kubeval | | [Demo] Validates that all containers have cpu and memory reservations set. | [Source](https://github.com/kubernetes-sigs/kustomize/blob/master/functions/examples/validator-kubeval/image/main.go)
| gcr.io/kustomize-functions/example-validator | | Validates Kubernetes configuration files using schemas from the Kubernetes OpenAPI spec. | [Source](https://github.com/kubernetes-sigs/kustomize/blob/master/functions/examples/validator-resource-requests/image/main.go) 

# ts functions

| Image | Description | Example | Source |
| ----- | ----------- | ------- | ------ |
| gcr.io/kpt-functions/write-yaml | [Demo] Writes a directory of Kubernetes configuration. It maintains the original directory structure as read by source functions. | | [Source](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/demo-functions/src/write_yaml.ts)
| gcr.io/kpt-functions/istioctl-analyze | Istioctl analyze is a diagnostic tool that can detect potential issues with Istio configuration and output errors to the results field. | [Example](https://github.com/GoogleContainerTools/kpt-functions-catalog/tree/master/examples/istioctl-analyze/) | [Source](https://github.com/GoogleContainerTools/kpt-functions-catalog/blob/master/functions/ts/src/istioctl_analyze.ts)
| gcr.io/kpt-functions/validate-rolebinding | [Demo] Enforces a blacklist of subjects in RoleBinding objects. | | [Source](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/demo-functions/src/validate_rolebinding.ts) 
| gcr.io/kpt-functions/kubeval | Validates configuration using kubeval. | | [Source](https://github.com/GoogleContainerTools/kpt-functions-catalog/blob/master/functions/ts/src/kubeval.ts)
| gcr.io/kpt-functions/suggest-psp | [Demo] Lints PodSecurityPolicy by suggesting 'spec.allowPrivilegeEscalation' field be set to 'false'. | | [Source](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/demo-functions/src/suggest_psp.ts)