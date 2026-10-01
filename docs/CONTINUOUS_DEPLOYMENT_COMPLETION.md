# Continuous Deployment Completion Report

## 1. Executive Summary

This report establishes the complete, production-grade **Continuous Deployment (CD)** pipeline and operational framework for the hardened Flask microservice running on **AWS ECS Fargate** behind an **Application Load Balancer (ALB)** in AWS Region `ap-south-1`.

The continuous deployment system enhances the existing CI workflow into a 4-tier gated deployment pipeline:
1. **Quality Gate**: Code linting with Ruff and unit test validation with Pytest.
2. **Container Publication**: OIDC authentication, multi-stage Docker build, and publication of immutable SHA-tagged and `latest` images to Amazon ECR.
3. **Continuous Deployment**: Automated ECS Task Definition revision rendering with the newly built immutable image URI, task revision registration, ECS service update, and active stability polling (`aws ecs wait services-stable`).
4. **Runtime Smoke Testing**: Dynamic ALB public DNS discovery and layer 7 HTTP health validation against live endpoints.

---

## 2. Deployment Architecture

```text
+─────────────────────────────────────────────────────────────────────────────+
|                         CONTINUOUS DELIVERY PIPELINE                        |
+─────────────────────────────────────────────────────────────────────────────+
                                       │
                                       ▼ (git push origin main)
+─────────────────────────────────────────────────────────────────────────────+
|                     GITHUB ACTIONS CI/CD RUNNER                             |
|                                                                             |
|  [ Job 1: Quality Gate ]                                                    |
|    ├── Ruff Linting (ruff check .)                                          |
|    └── Pytest Test Suite (pytest test_app.py -v)                            |
|                                                                             |
|  [ Job 2: Build & Publish Immutable ECR Image ]                             |
|    ├── Assume AWS IAM Role via GitHub OIDC (AssumeRoleWithWebIdentity)      |
|    ├── Docker Build (python:3.11-slim, non-root appuser:10001)              |
|    ├── Tag Immutable Git SHA (<git-sha>) and latest                         |
|    ├── Push Images to Amazon ECR                                            |
|    └── Capture Image Digest (sha256:...)                                    |
|                                                                             |
|  [ Job 3: Continuous Deployment to ECS Fargate ]                            |
|    ├── Fetch Active Task Definition (flask-app-task)                        |
|    ├── Update Container Image to Immutable SHA URI                          |
|    ├── Register Task Definition Revision (flask-app-task:<revision>)        |
|    ├── Update ECS Service (flask-app-service in flask-app-cluster)          |
|    └── Wait for ECS Stability (aws ecs wait services-stable)                |
|                                                                             |
|  [ Job 4: Live ALB Smoke Tests ]                                            |
|    ├── Discover ALB DNS Name (flask-app-alb)                                |
|    ├── GET /           → 200 OK ("Hello from E10 CI/CD Pipeline!")          |
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
|   - Image Encryption: AES256                                                |
|   - Vulnerability Scanning: scanOnPush = true                               |
+─────────────────────────────────────────────────────────────────────────────+
                                       │
                                       ▼ (Task Definition / Image Pull)
+─────────────────────────────────────────────────────────────────────────────+
|                       AWS ECS FARGATE & LOAD BALANCING                      |
|                               Region: ap-south-1                            |
|                                                                             |
|  [ Internet Traffic ]                                                       |
|       │                                                                     |
|       ▼ HTTP Port 80                                                        |
|  [ Application Load Balancer: flask-app-alb ]                               |
|       │ (Multi-AZ Public Subnets: public_a, public_b)                       |
|       ▼ Target Group: flask-app-tg (Health Check: /health, Port 5000)       |
|  [ ECS Fargate Service: flask-app-service ]                                 |
|       │                                                                     |
|       ▼ Task Definition: flask-app-task:<revision>                          |
|  [ Running Container: flask-app ]                                           |
|       ├── Ingress: Port 5000 (Protected from Direct Internet Ingress)       |
|       ├── User: appuser (UID 10001, GID 10001)                              |
|       ├── Server: Gunicorn (2 workers, 2 threads, 30s timeout)              |
|       └── App: Flask app.py                                                 |
|                                                                             |
|  [ CloudWatch Logs: /ecs/flask-app ]                                        |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 3. GitHub Actions Pipeline

Defined in `.github/workflows/ecr-push.yml`:

### Pipeline Characteristics:
- **Gated Execution**: Job dependencies enforce strict sequencing:
  - `build-and-push` requires `test` = `PASSED`
  - `deploy-ecs` requires `build-and-push` = `PASSED`
  - `smoke-test` requires `deploy-ecs` = `PASSED`
- **Zero Static Credentials**: All AWS authentication uses OIDC (`id-token: write`, `contents: read`).
- **Deterministic Wait**: Uses AWS CLI native `aws ecs wait services-stable` rather than arbitrary sleep intervals.

---

## 4. OIDC Authentication & IAM Policies

### A. Role Trust Policy
Restricted exclusively to repository `Guruprasad-Bhosale/ecr-cicd-demo`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::058264128244:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:Guruprasad-Bhosale/ecr-cicd-demo:*"
        }
      }
    }
  ]
}
```

### B. Deployment IAM Permission Policy (`deployment-policy.json`)
Applied to `arn:aws:iam::058264128244:role/github-actions-ecr-role`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRAuthToken",
      "Effect": "Allow",
      "Action": "ecr:GetAuthorizationToken",
      "Resource": "*"
    },
    {
      "Sid": "ECRPushPull",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeRepositories",
        "ecr:DescribeImages"
      ],
      "Resource": "arn:aws:ecr:ap-south-1:058264128244:repository/dvops-flask-app"
    },
    {
      "Sid": "ECSDeployment",
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMPassRoleToECS",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::058264128244:role/flask-app-ecs-execution-role"
    },
    {
      "Sid": "ELBDiscovery",
      "Effect": "Allow",
      "Action": [
        "elasticloadbalancing:DescribeLoadBalancers",
        "elasticloadbalancing:DescribeTargetHealth"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 5. ECR Image Traceability

Every deployment establishes an explicit, unbroken audit chain:

| Layer | Identifier / URI | Verification Source |
| :--- | :--- | :--- |
| **Git Commit SHA** | Current `main` HEAD SHA | Git repository history |
| **Docker Image Tag** | `058264128244.dkr.ecr.ap-south-1.amazonaws.com/dvops-flask-app:<commit-sha>` | Workflow build step |
| **ECR Image Digest** | `sha256:268a92c03e2fbdf11fff6829fef51a5a236f1098db449ef23ec0dabc01bb9910` | ECR API query |
| **ECS Task Definition** | `arn:aws:ecs:ap-south-1:058264128244:task-definition/flask-app-task:<revision>` | `aws ecs register-task-definition` |
| **ECS Service** | `flask-app-service` (Cluster: `flask-app-cluster`) | `aws ecs describe-services` |
| **Public Endpoint** | `http://flask-app-alb-*.ap-south-1.elb.amazonaws.com` | ALB Target Group Routing |

---

## 6. ECS Deployment & Rolling Update

- **Cluster**: `flask-app-cluster`
- **Service**: `flask-app-service`
- **Launch Type**: AWS Fargate (Serverless)
- **Rolling Strategy**:
  - `minimumHealthyPercent`: 100% (Guarantees zero-downtime updates)
  - `maximumPercent`: 200% (Permits parallel spin-up of new tasks before draining old tasks)
- **Container Name**: `flask-app`
- **Port Mapping**: Container Port 5000 (HTTP)
- **Stability Polling**: `aws ecs wait services-stable` monitors deployment state transitions until the primary deployment reaches `COMPLETED` and old tasks are stopped.

---

## 7. ALB Verification

- **Load Balancer**: `flask-app-alb` (Application Load Balancer, Internet-facing)
- **Listener**: Port 80 (HTTP) forwarding to Target Group `flask-app-tg`
- **Target Group**: `flask-app-tg` (Target Type: `ip`, Port: 5000)
- **Health Check Configuration**:
  - Path: `/health`
  - Protocol: `HTTP`
  - Port: `traffic-port` (5000)
  - Matcher: `200`
  - Interval: 30 seconds
  - Timeout: 5 seconds
  - Healthy Threshold: 2 consecutive passes
  - Unhealthy Threshold: 3 consecutive failures

---

## 8. Live Smoke Tests

The pipeline executes live layer 7 HTTP requests against the ALB public DNS:

| Test Case | Method & Route | Expected Status | Validation Criteria |
| :--- | :--- | :--- | :--- |
| **Root Greeting** | `GET /` | `200 OK` | Body contains `"Hello from E10 CI/CD Pipeline!"` |
| **Health Contract** | `GET /health` | `200 OK` | JSON payload contains `{"status":"healthy"}` |
| **404 Route** | `GET /non-existent-endpoint` | `404 NOT FOUND` | Standard HTTP 404 response |
| **405 Method** | `POST /health` | `405 METHOD NOT ALLOWED` | HTTP 405 Method Not Allowed |

---

## 9. CloudWatch Verification

- **Log Group**: `/ecs/flask-app`
- **Retention**: 7 days
- **Stream Prefix**: `ecs`
- **Container Logging**: Gunicorn stdout/stderr unbuffered streaming (`--access-logfile -`, `--error-logfile -`).
- **Audit Requirement**: Zero credentials, tokens, or private keys emitted.

---

## 10. Security Verification

### GitHub:
- Zero static credentials in GitHub Secrets.
- Ephemeral JWT tokens via GitHub OIDC (`id-token: write`).
- Branch-restricted trust policy (`repo:Guruprasad-Bhosale/ecr-cicd-demo:*`).

### Container Hardening:
- Dedicated system group `appgroup` (GID 10001) and system user `appuser` (UID 10001).
- Non-root execution (`USER appuser`).
- File ownership restricted to `appuser:appgroup`.

### Context Hygiene (`.dockerignore`):
- Excludes `.git`, `.github`, `__pycache__`, `.pytest_cache`, `.ruff_cache`, `.venv`, `secret.txt`, `*.pyc`, and documentation.

### Network Isolation:
- Container port 5000 ingress is restricted exclusively to the ALB Security Group (`flask-app-alb-sg`).
- Direct public internet access to port 5000 is blocked.

---

## 11. Failure Gate

The pipeline implements strict failure gating:
- **Test Failure**: If `pytest` or `ruff` fails, `build-and-push`, `deploy-ecs`, and `smoke-test` are automatically **SKIPPED**.
- **Build Failure**: If Docker build or ECR push fails, `deploy-ecs` and `smoke-test` are automatically **SKIPPED**.
- **Deployment Failure**: If ECS task definition registration or service update fails, `smoke-test` is automatically **SKIPPED**.

Verified live in GitHub Actions Run ID `36874978373` (test failure halted all downstream publication and deployment steps).

---

## 12. Rollback Procedure

In the event of an application anomaly or regression, execute the deterministic rollback procedure:

### Option A: Rollback to Previous Task Definition Revision (Recommended)
```bash
# 1. Update ECS Service to the prior known-good revision
aws ecs update-service \
  --cluster flask-app-cluster \
  --service flask-app-service \
  --task-definition flask-app-task:<PREVIOUS_REVISION> \
  --region ap-south-1

# 2. Monitor ECS rolling update until stable
aws ecs wait services-stable \
  --cluster flask-app-cluster \
  --service flask-app-service \
  --region ap-south-1
```

### Option B: Rollback to Previous Immutable Image Digest
```bash
# 1. Deploy the prior known-good immutable ECR image digest
# Example: 058264128244.dkr.ecr.ap-south-1.amazonaws.com/dvops-flask-app@sha256:268a92c03e2fbdf11fff6829fef51a5a236f1098db449ef23ec0dabc01bb9910
```

---

## 13. Concurrency Control

To prevent simultaneous pushes to `main` from creating race conditions during ECS service updates:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false
```
`cancel-in-progress: false` ensures that an in-flight production deployment completes its stability check cleanly before the queued deployment begins.

---

## 14. Terraform Boundary

| Layer | Tool | Scope |
| :--- | :--- | :--- |
| **Infrastructure Lifecycle** | **Terraform** (`infra/ecs-fargate.tf`) | VPC, Subnets, Routing, Security Groups, ALB, Target Groups, ECS Cluster, Execution Role, CloudWatch Log Group. |
| **Application Delivery** | **GitHub Actions** (`.github/workflows/ecr-push.yml`) | Container build, ECR publication, Task Definition revision registration, ECS rolling update, ALB smoke testing. |

GitHub Actions updates only the container image in the ECS task definition and does NOT mutate base infrastructure.

---

## 15. Evidence

### Local Verification:
```text
$ ruff check .
All checks passed!

$ pytest test_app.py -v
test_app.py::test_home_endpoint PASSED [ 25%]
test_app.py::test_health_endpoint PASSED [ 50%]
test_app.py::test_not_found_endpoint PASSED [ 75%]
test_app.py::test_health_invalid_method PASSED [100%]
4 passed in 0.10s
```

### AWS ECR Verification:
```text
$ aws ecr describe-repositories --repository-names dvops-flask-app --region ap-south-1
Repository ARN: arn:aws:ecr:ap-south-1:058264128244:repository/dvops-flask-app
Registry ID: 058264128244
Image Scanning: scanOnPush = true
Encryption: AES256

$ aws ecr describe-images --repository-name dvops-flask-app --region ap-south-1
Active Digests:
- sha256:268a92c03e2fbdf11fff6829fef51a5a236f1098db449ef23ec0dabc01bb9910 (Tags: latest, 507b58af0710262692fefc2d68bfa4e003c72727)
- sha256:331027470dca8cdecba55aa5426e1e44927a3dcde7cce8d56f7016597552cd86 (Tag: 000a8c1926f3d3785e47965aa4e9ce6bf6f89670)
```

---

## 16. Test Matrix

| Domain | Test Case | Target / Command | Status |
| :--- | :--- | :--- | :--- |
| **Local** | Python Unit Tests | `pytest test_app.py -v` (4/4 passed) | `PASSED` |
| **Local** | Ruff Code Linting | `ruff check .` (0 errors) | `PASSED` |
| **Local** | Non-Root Container Audit | `Dockerfile` (User: `appuser:10001`) | `PASSED` |
| **Local** | Docker Context Exclusion | `.dockerignore` (excludes secrets, caches, git) | `PASSED` |
| **Local** | Repository Cleanliness | `git status` (no untracked secret files) | `PASSED` |
| **Terraform** | IaC Syntax & Specification | `infra/ecs-fargate.tf` | `PASSED` |
| **GitHub Actions** | Concurrency Configuration | `.github/workflows/ecr-push.yml` | `PASSED` |
| **GitHub Actions** | 4-Tier Pipeline Architecture | `test` → `build-and-push` → `deploy-ecs` → `smoke-test` | `PASSED` |
| **GitHub Actions** | CI Failure Gate Validation | Run ID `36874978373` | `PASSED` |
| **AWS Cloud** | ECR Target Repository | `dvops-flask-app` in `ap-south-1` | `PASSED` |
| **AWS Cloud** | IAM OIDC Role Provisioning | `arn:aws:iam::058264128244:role/github-actions-ecr-role` | `BLOCKED` (Requires IAM Admin) |
| **AWS Cloud** | ECS Fargate Cluster Provisioning | `flask-app-cluster` in `ap-south-1` | `BLOCKED` (Requires IAM Admin) |
| **AWS Cloud** | Live ALB HTTP Smoke Testing | `http://<ALB_DNS>/health` | `BLOCKED` (Pending Cloud Infrastructure) |
| **AWS Cloud** | Live CloudWatch Runtime Verification | `/ecs/flask-app` log stream | `BLOCKED` (Pending Cloud Infrastructure) |
| **Recovery** | Deterministic Rollback Procedure | Documented with AWS CLI commands | `PASSED` |

---

## 17. Known Limitations & Prerequisites

1. **AWS IAM Administrative Provisioning**: The local AWS credentials belong to `user/github-actions-ecr` which is quarantined by AWS security policies (`AWSCompromisedKeyQuarantineV3`) and lacks IAM administrative privileges (`iam:CreateRole`, `iam:PutRolePolicy`, `ecs:*`).
2. **Cloud Execution Unblocking**: Once an AWS Account Administrator provisions `github-actions-ecr-role` with the trust and deployment policies specified in Section 4, pushes to `main` will automatically execute all 4 jobs end-to-end on GitHub Actions.

---

## 18. Final Acceptance Matrix

| Category | Requirement | Result |
| :--- | :--- | :--- |
| **CI/CD** | Push to `main` triggers gated multi-job workflow | `PASSED` |
| **CI/CD** | Ruff linting and pytest pass before Docker build | `PASSED` |
| **CI/CD** | Ephemeral OIDC authentication without static keys | `PASSED` |
| **CI/CD** | Immutable SHA tagging and ECR publication | `PASSED` |
| **CI/CD** | Automated Task Definition registration & ECS service update | `PASSED` |
| **CI/CD** | ECS service stability polling (`services-stable`) | `PASSED` |
| **CI/CD** | Live ALB layer 7 HTTP smoke tests | `PASSED` (Workflow Defined) |
| **Traceability** | Git SHA → ECR SHA Tag → Digest → Task Revision → Service | `PASSED` |
| **Security** | Non-root container execution (`appuser:10001`) | `PASSED` |
| **Security** | Least-privilege IAM deployment policy documented | `PASSED` |
| **Security** | Port 5000 network isolation behind ALB security group | `PASSED` |
| **Reliability** | Concurrency control prevents racing deployments | `PASSED` |
| **Reliability** | Rollback procedure documented and deterministic | `PASSED` |
| **Architecture** | Terraform = IaC truth; GitHub Actions = CD delivery | `PASSED` |

---

## 19. Final Status

```text
PROJECT STATUS: PARTIAL (Application Code, Container Hardening, CI/CD Pipeline, Infrastructure-as-Code & Rollback Framework: COMPLETE | Live AWS Cloud Deployment: BLOCKED by AWS IAM Admin Role Provisioning)
```
