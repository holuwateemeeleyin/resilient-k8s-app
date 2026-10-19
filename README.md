# Resilient Kubernetes Application

This project is a small web application deployed on Kubernetes. A project from Chizalearn k8s assignment to keep an application available during updates, recovering from Pod failures, storing database data persistently, and scaling based on CPU usage.

## What I used

- **Frontend:** HTML and NGINX
- **Backend:** Node.js and Express
- **Database:** PostgreSQL
- **Cache:** Redis
- **Containerisation:** Docker
- **Orchestration:** Kubernetes
- **Ingress:** NGINX Ingress Controller
- **Autoscaling:** Horizontal Pod Autoscaler (HPA)

## How it works

Users access the application through the NGINX Ingress Controller.

- Requests to `/` go to the frontend.
- Requests to `/api` go to the backend.
- Kubernetes Services route traffic to the application Pods.
- PostgreSQL stores its data on a PersistentVolumeClaim.
- Redis runs as a separate service.

The frontend and backend each run multiple replicas. The backend can scale between 2 and 5 replicas when CPU usage changes.

## Kubernetes features

The project includes:

- Rolling updates with `maxSurge: 1` and `maxUnavailable: 0`
- Liveness and readiness probes
- CPU and memory requests and limits
- Horizontal Pod Autoscaling
- PodDisruptionBudgets for the frontend and backend
- ConfigMaps and a Kubernetes Secret
- A NetworkPolicy for backend ingress
- Non-root container security settings
- PostgreSQL StatefulSet and persistent storage
- ClusterIP Services and Ingress routing

## Running the project

You need Docker, kubectl, Helm and a running Kubernetes cluster. The instructions below use my local OrbStack cluster.

First, create the namespace, ConfigMap and PostgreSQL Secret:

```bash
kubectl apply -f k8s/base/namespace-config.yaml

read -s "POSTGRES_PASSWORD?Enter PostgreSQL password: "
echo

kubectl create secret generic postgres-secret \
  -n resilient-app \
  --from-literal=POSTGRES_USER=resilientuser \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --from-literal=POSTGRES_DB=resilientdb

unset POSTGRES_PASSWORD
```

Then deploy the application:

```bash
kubectl apply -k k8s/base
```

Check the Pods:

```bash
kubectl get pods -n resilient-app
```

## Accessing the application

In my local setup, the Ingress controller is available on port `31655`.

Open the frontend:

```bash
curl http://localhost:31655/
```

Test the backend:

```bash
curl http://localhost:31655/api
```

The API returns a JSON response with its status and the name of the Pod handling the request.

## Tests I carried out

**1. Rolling update**

I restarted the backend Deployment while sending repeated requests to the API. The rollout completed, and all monitored requests returned HTTP 200.

**2. Self-healing**

I deleted a backend Pod manually. Kubernetes created a replacement, restoring the desired replica count.

**3. Database persistence**

I created a test record in PostgreSQL, deleted the PostgreSQL Pod, and checked the record after the Pod restarted. The data was still there.

**4. Autoscaling**

I created a temporary load generator to send requests to the backend. The HPA scaled the backend from 3 to 4 replicas. The load generator was removed after the test.

**5. Ingress routing**

Both the frontend route (`/`) and backend route (`/api`) returned HTTP 200.

## Project structure

```text
app/
  backend/
    server.js
  frontend/
    Dockerfile
    index.html

k8s/
  base/
    backend.yaml
    backend-hpa.yaml
    frontend.yaml
    ingress.yaml
    namespace-config.yaml
    network-policy.yaml
    pdb.yaml
    postgres.yaml
    redis.yaml
    kustomization.yaml
```

## Things to note

I tested this project on a single-node local Kubernetes cluster. It demonstrates Pod recovery and scaling, but it does not provide node-level high availability.

PostgreSQL and Redis are deployed, but the current demo API does not yet use them for application data. Redis is configured as an in-memory cache without persistence.

Before using this setup in production, I would add TLS, monitoring and alerting, database backups, verified NetworkPolicy enforcement, and a proper database high-availability strategy.
