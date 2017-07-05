!!!!
http://www.dedoimedo.com/computers/docker-networking.html
!!!!

To build Docker container locally

* `docker build -t {whatever tag you want} .`

To deploy Docker container locally

* `mvn package`
* `docker build --rm -t [your-name-here] .`
* `docker run -it -p 8080:8080 [your-name-here]`

To deploy brand new Docker container to Google (must be built locally first)

* If necessary, retag to match Google Cloud style
  * `docker tag [your-name-here] gcr.io/xponentialworks-skycubed-pilot/java-api:[version-tag]`
  * Note that `java-api` is used throughout. This is a variable but currently the name of the running container, so it should be kept.
* `gcloud docker -- push gcr.io/xponentialworks-skycubed-pilot/java-api:[version-tag]`
* If necessary, authorize with the cluster
  * `gcloud container clusters get-credentials etlpipeline`
* `kubectl run java-api --image=gcr.io/xponentialworks-skycubed-pilot/java-api:[version-tag] --port=8080`
  * Optionally, include `--replicas=N` for future load balancing or `--labels="whatever"` for organizing
  * `kubectl get deployments java-api` and `kubectl describe deployments java-api` for info about the deployment
  *  `kubectl get replicasets` and `kubectl describe replicasets` to show the ReplicaSet objects, related to Load Balancers
* `kubectl expose deployment java-api --type=LoadBalancer --name=java-api-service --cluster-ip=104.196.239.203`
* Visit 104.196.239.203:8080

To redeploy edits to Google with "v2" tag as an example

* `mvn package`
* `docker build --rm -t gcr.io/xponentialworks-skycubed-pilot/java-api:v2 .`
  * Tag in gcr.io format and bump version
* `gcloud docker -- push gcr.io/xponentialworks-skycubed-pilot/java-api:v2`
* `kubectl set image deployment/java-api java-api=gcr.io/xponentialworks-skycubed-pilot/java-api:v2`

To rollback most recent change

* `kubectl rollout undo deployment/java-api`

To "burn the forest"

* `kubectl delete deployments/java-api services/java-api-service`

BigQuery errors? Make sure you have the right perms.

* Or add a new node pool with: `gcloud container node-pools create java-api-np --cluster etlpipeline --scopes default,bigquery`
* and delete the old node pool

When creating a new cluster, ensure at least the bigquery scope is present.
```
gcloud container clusters create whatever-name \
    --scopes default,bigquery
```
