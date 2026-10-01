# End-to-End Continuous Deployment Architecture

## 1. Complete CI/CD & Runtime Delivery Topology

```text
+─────────────────────────────────────────────────────────────────────────────+
|                            DEVELOPMENT WORKFLOW                             |
+─────────────────────────────────────────────────────────────────────────────+
                                       │
                                       ▼ (git push origin main)
+─────────────────────────────────────────────────────────────────────────────+
|                     GITHUB ACTIONS CI/CD PIPELINE                           |
|                                                                             |
|  [ Job 1: Quality Gate ]                                                    |
|    ├── Ruff Linting (ruff check .)                                          |
|    └── Pytest Unit Test Suite (pytest test_app.py -v)                       |
|                                                                             |
|  [ Job 2: Build & Publish Immutable ECR Image ]                             |
|    ├── GitHub OIDC Authentication (AssumeRoleWithWebIdentity)               |
|    ├── Docker Multi-Stage Build (python:3.11-slim, non-root user 10001)     |
|    ├── Tag Immutable Git SHA (<git-sha>) and latest                         |
|    ├── Push Image to Amazon ECR                                             |
|    └── Extract Immutable Image Digest (sha256:...)                          |
|                                                                             |
|  [ Job 3: Continuous Deployment to ECS Fargate ]                            |
|    ├── Fetch Current Task Definition (flask-app-task)                       |
|    ├── Render New Container Image URI (ECR repository + Git SHA)            |
|    ├── Register New Task Definition Revision                                |
|    ├── Update ECS Service (flask-app-service in flask-app-cluster)          |
|    └── Wait for Service Stabilization (aws ecs wait services-stable)        |
|                                                                             |
|  [ Job 4: Live Runtime ALB Smoke Tests ]                                    |
|    ├── Discover ALB Public DNS (flask-app-alb)                              |
|    ├── GET /           → 200 OK (Hello from E10 CI/CD Pipeline!)            |
|    ├── GET /health     → 200 OK ({"status":"healthy"})                      |
|    ├── GET /unknown    → 404 NOT FOUND                                      |
|    └── POST /health    → 405 METHOD NOT ALLOWED                             |
+─────────────────────────────────────────────────────────────────────────────+
                                       │
                                       ▼ (ECR Push & Task Definition)
+─────────────────────────────────────────────────────────────────────────────+
|                      AMAZON ELASTIC CONTAINER REGISTRY                      |
|                  058264128244.dkr.ecr.ap-south-1.amazonaws.com              |
|                          Repository: dvops-flask-app                        |
|                                                                             |
|   - Immutable Identity: dvops-flask-app:<commit-sha>                        |
|   - Mutable Tag: latest                                                     |
|   - Encryption: AES256                                                      |
|   - Security: scanOnPush = true                                             |
+─────────────────────────────────────────────────────────────────────────────+
                                       │
                                       ▼ (Task Definition Revision / Image Pull)
+─────────────────────────────────────────────────────────────────────────────+
|                       AWS ECS FARGATE & LOAD BALANCING                      |
|                               Region: ap-south-1                            |
|                                                                             |
|  [ Internet Traffic ]                                                       |
|       │                                                                     |
|       ▼ HTTP (Port 80)                                                      |
|  [ Application Load Balancer: flask-app-alb ]                               |
|       │ (Multi-AZ Public Subnets: public_a, public_b)                       |
|       ▼ Target Group: flask-app-tg (Health Check: /health, Port 5000)       |
|  [ ECS Fargate Service: flask-app-service ]                                 |
|       │                                                                     |
|       ▼ Task Definition: flask-app-task:<revision>                          |
|  [ Running Container: flask-app ]                                           |
|       ├── Ingress: Port 5000 (Isolated from Internet; ALB SG only)          |
|       ├── Runtime User: appuser (UID 10001, GID 10001)                      |
|       ├── WSGI Server: Gunicorn (2 workers, 2 threads, 30s timeout)         |
|       └── Application: Flask app.py                                         |
|                                                                             |
|  [ CloudWatch Logs: /ecs/flask-app ]                                        |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Image & Deployment Traceability Matrix

Every container running in ECS Fargate is deterministically traceable to the source Git commit:

```text
Git Commit SHA (e.g. 408a8d0...)
       ↓
Docker Image SHA Tag (058264128244.dkr.ecr.ap-south-1.amazonaws.com/dvops-flask-app:408a8d0...)
       ↓
ECR Image Digest (sha256:268a92c03e2fbdf11fff6829fef51a5a236f1098db449ef23ec0dabc01bb9910)
       ↓
ECS Task Definition Revision (arn:aws:ecs:ap-south-1:058264128244:task-definition/flask-app-task:N)
       ↓
Running ECS Task / ALB Target Group Endpoint
```

---

## 3. Infrastructure vs Application Delivery Boundaries

| Concern | Tool / Layer | Responsibilities |
| :--- | :--- | :--- |
| **Infrastructure Lifecycle** | **Terraform** (`infra/ecs-fargate.tf`) | VPC, Subnets, Gateways, Route Tables, Security Groups, ALB, Target Groups, Listeners, ECS Cluster, Base Task Definition, Base Service, IAM Execution Role, CloudWatch Log Group. |
| **Application Delivery** | **GitHub Actions** (`.github/workflows/ecr-push.yml`) | Code linting, unit testing, container build, OIDC authentication, ECR publication, Task Definition revision registration, ECS service rolling update, service stability polling, live ALB smoke testing. |

---

## 4. Security & Isolation Controls

1. **Authentication**: 100% ephemeral short-lived tokens via GitHub Actions OIDC (`AssumeRoleWithWebIdentity`). Zero static AWS access keys or passwords stored in GitHub secrets or code.
2. **Network Perimeter**: Port 5000 is blocked from external access and permitted exclusively through the ALB security group (`flask-app-alb-sg`).
3. **Application Security**: Container runs as non-root user `appuser:10001`. The filesystem excludes Git metadata, secret files, virtual environments, and caches.
4. **Health Check Contract**: ALB Target Group performs layer 7 HTTP health checks on `/health`, requiring `200 OK` status and `{"status":"healthy"}` JSON payload.

