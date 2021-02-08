# Inflate a helm chart using functions

## Fetch the remote package

First, copy the `charts/kafka-operator` subdirectory from the following repository on GitHub using `pkg get`.

```sh
kpt pkg get https://github.com/banzaicloud/kafka-operator/charts/kafka-operator kafka-operator
```

Note: `pkg get` prints an error due to [this issue](https://github.com/GoogleContainerTools/kpt/issues/838).

This repository contains several helm templates in the `templates` directory.

```sh
ls kafka-operator/templates/
```

```
alertmanager-service.yaml  authproxy-service.yaml  _helpers.tpl                           operator-rbac.yaml
authproxy-rbac.yaml        crds.yaml               operator-deployment-with-webhook.yaml  operator-service.yaml
```

## Inflate the helm chart using `kpt fn`

Helm charts can be expanded into kubernetes configurations with the `helm-inflator` function. This function can be specified by creating the below `yaml` file.

```sh
mkdir kafka-operator/local-configs
cat <<EOF >kafka-operator/local-configs/fn-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: inflate-kafka
  annotations:
    config.kubernetes.io/function: |
      container:
        image: gcr.io/kpt-fn-contrib/helm-inflator:unstable
data:
  name: chart
  local-chart-path: /source
EOF
```

The `helm-inflator` function specified in the above file can then be run by calling `fn run`.

```sh
kpt fn run kafka-operator/local-configs/  --mount type=bind,src="$(pwd)"/kafka-operator,dst=/source --as-current-user
```

The resulting files can be validated using `cfg tree`.

```sh
kpt cfg tree kafka-operator/local-configs/
```

```
kafka-operator/local-configs
├── [clusterrole_chart-kafka-operator-authproxy.yaml]  ClusterRole chart-kafka-operator-authproxy
├── [clusterrole_chart-kafka-operator-operator.yaml]  ClusterRole chart-kafka-operator-operator
├── [clusterrolebinding_chart-kafka-operator-authproxy.yaml]  ClusterRoleBinding chart-kafka-operator-authproxy
├── [clusterrolebinding_chart-kafka-operator-operator.yaml]  ClusterRoleBinding chart-kafka-operator-operator
├── [fn-config.yaml]  ConfigMap inflate-kafka
├── [validatingwebhookconfiguration_kafka-operator-validating-webhook.yaml]  ValidatingWebhookConfiguration kafka-operator-validating-webhook
└── default
    ├── [deployment_chart-kafka-operator-operator.yaml]  Deployment default/chart-kafka-operator-operator
    ├── [secret_kafka-operator-serving-cert.yaml]  Secret default/kafka-operator-serving-cert
    ├── [service_chart-kafka-operator-alertmanager.yaml]  Service default/chart-kafka-operator-alertmanager
    ├── [service_chart-kafka-operator-authproxy.yaml]  Service default/chart-kafka-operator-authproxy
    ├── [service_chart-kafka-operator-operator.yaml]  Service default/chart-kafka-operator-operator
    ├── [serviceaccount_kafka-operator-authproxy.yaml]  ServiceAccount default/kafka-operator-authproxy
    └── [serviceaccount_kafka-operator.yaml]  ServiceAccount default/kafka-operator
```

## Apply kafka resources

We can initialize our package to generate a template resource with `live init`.

```sh
kpt live init kafka-operator/local-configs/
```

Once an `inventory-template.yaml` is created by the above command, we can directly
apply our resources with `live apply`.

```sh
kpt live apply kafka-operator/local-configs/
```

Each of the inflated templates will be created in the cluster.

```
serviceaccount/kafka-operator created
serviceaccount/kafka-operator-authproxy created
clusterrole.rbac.authorization.k8s.io/chart-kafka-operator-authproxy created
clusterrole.rbac.authorization.k8s.io/chart-kafka-operator-operator created
clusterrolebinding.rbac.authorization.k8s.io/chart-kafka-operator-authproxy created
clusterrolebinding.rbac.authorization.k8s.io/chart-kafka-operator-operator created
configmap/inflate-kafka created
secret/kafka-operator-serving-cert created
service/chart-kafka-operator-alertmanager created
service/chart-kafka-operator-authproxy created
service/chart-kafka-operator-operator created
deployment.apps/chart-kafka-operator-operator created
validatingwebhookconfiguration.admissionregistration.k8s.io/kafka-operator-validating-webhook created
```