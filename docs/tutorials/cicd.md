# Integrate functions with a CI/CD pipeline

## Fetch the remote package
The `package-examples/function-export` subdirectory of the `kpt` repository features two functions, `gatekeeper-validate` and `label-namespace`, for us to integrate . It can be fetched with `pkg get`.

```sh
kpt pkg get https://github.com/GoogleContainerTools/kpt/package-examples/function-export example-package
```

The functions that will be run are specified in `example-package/functions.yaml`. Any other functions in the function catalog can be added here as well.

```sh
cat example-package/functions.yaml
```

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: label-namespace
  annotations:
    config.k8s.io/function: |
      container:
        image: gcr.io/kpt-functions/label-namespace
    config.kubernetes.io/local-config: "true"
data:
  label_name: color
  label_value: blue
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: gatekeeper
  annotations:
    config.k8s.io/function: |
      container:
        image: gcr.io/kpt-functions/gatekeeper-validate
    config.kubernetes.io/local-config: "true"
```

## Generate a workflow

`fn export` supports generating workflows for a variety of CI/CD platforms as specified on its [reference page](/reference/fn?id=export).

### Integrate with Cloud Build

[Cloud Build](https://pantheon.corp.google.com/cloud-build/builds) supports easily [building](https://cloud.google.com/cloud-build/docs/quickstart-build) and [deploying](https://cloud.google.com/cloud-build/docs/quickstart-deploy) containerized applications.

```sh
kpt fn export example-package --workflow cloud-build --output cloudbuild.yaml
cat cloudbuild.yaml
```

```yaml
steps:
  - name: gcr.io/kpt-dev/kpt:latest
    args:
      - fn
      - run
      - example-package
```

While the above content can be manually merged into an existing build configuration file, it is also fully functional standalone in the project directory root. After triggering a build, the result should be visible in the project's [build history](https://pantheon.corp.google.com/cloud-build/builds).

### Integrate with GitHub Actions

With [GitHub Actions](https://github.com/features/actions), `kpt` functions can be run on [various GitHub events](https://docs.github.com/en/actions/reference/events-that-trigger-workflows) alongside other scripts.

```sh
kpt fn export example-package --workflow github-actions --output main.yml
cat main.yml
```

```yaml
name: kpt
"on":
    push:
        branches:
          - master
jobs:
    Kpt:
        runs-on: ubuntu-latest
        steps:
          - name: Run all kpt functions
            uses: docker://gcr.io/kpt-dev/kpt:latest
            with:
                args: fn run example-package
```

The above configuration can be copied directly to a `.github/workflows` directory or manually pasted into an existing workflow. The two functions will run on pushes to the remote branch on GitHub.

### Integrate with Jenkins

Integrating with a [Jenkins pipeline](https://www.jenkins.io/doc/pipeline/tour/hello-world/) is as easy as copying the generated [`Jenkinsfile`](https://www.jenkins.io/doc/book/pipeline/jenkinsfile/) into any [agent](https://www.jenkins.io/doc/book/glossary/#agent) with `Docker` installed.

```sh
kpt fn export example-package --workflow jenkins --output Jenkinsfile
cat Jenkinsfile
```

```
pipeline {
    agent any

    stages {
        stage('Run kpt functions') {
            steps {
                // This requires that docker is installed on the agent.
                // And your user, which is usually "jenkins", should be added to the "docker" group to access "docker.sock".
                sh '''
                    docker run \
                    -v $PWD:/app \
                    -v /var/run/docker.sock:/var/run/docker.sock \
                    gcr.io/kpt-dev/kpt:latest \
                    fn run /app/example-package
                '''
            }
        }
    }
}
```
