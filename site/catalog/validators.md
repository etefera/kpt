# go functions

| Image | Description | Args |
| ----- | ----------- | ---- |
| [gcr.io/kpt-dev/kpt](https://github.com/kubernetes-sigs/kustomize/blob/master/cmd/config/internal/commands/sink.go) | Writes a directory of Kubernetes configuration. It maintains the original directory structure as read by source functions. | fn sink 
| [gcr.io/kpt-functions/gatekeeper-validate](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/go/pkg/functions/gatekeeper/validate.go)  | Enforces OPA constraints on input objects. The constraints are also passed as part of the input to the function. | 
| [gcr.io/kustomize-functions/example-validator-kubeval](https://github.com/kubernetes-sigs/kustomize/blob/master/functions/examples/validator-kubeval/image/main.go) | [Demo] Validates that all containers have cpu and memory reservations set. | 
| [gcr.io/kustomize-functions/example-validator](https://github.com/kubernetes-sigs/kustomize/blob/master/functions/examples/validator-resource-requests/image/main.go) | Validates Kubernetes configuration files using schemas from the Kubernetes OpenAPI spec. |

# ts functions

| Image | Description | Example |
| ----- | ----------- | ------- |
| [gcr.io/kpt-functions/write-yaml](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/demo-functions/src/write_yaml.ts) | [Demo] Writes a directory of Kubernetes configuration. It maintains the original directory structure as read by source functions. |
| [gcr.io/kpt-functions/istioctl-analyze](https://github.com/GoogleContainerTools/kpt-functions-catalog/blob/master/functions/ts/src/istioctl_analyze.ts) | Istioctl analyze is a diagnostic tool that can detect potential issues with Istio configuration and output errors to the results field. | [Example](https://github.com/GoogleContainerTools/kpt-functions-catalog/tree/master/examples/istioctl-analyze/)
| [gcr.io/kpt-functions/validate-rolebinding](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/demo-functions/src/validate_rolebinding.ts)  | [Demo] Enforces a blacklist of subjects in RoleBinding objects. | 
| [gcr.io/kpt-functions/kubeval](https://github.com/GoogleContainerTools/kpt-functions-catalog/blob/master/functions/ts/src/kubeval.ts) | Validates configuration using kubeval. | 
| [gcr.io/kpt-functions/suggest-psp](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/demo-functions/src/suggest_psp.ts) | [Demo] Lints PodSecurityPolicy by suggesting 'spec.allowPrivilegeEscalation' field be set to 'false'. | 