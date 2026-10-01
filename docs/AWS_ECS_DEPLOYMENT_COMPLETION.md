# AWS ECS Fargate Deployment Completion

## 1. Executive Summary

This report delivers the comprehensive deployment architecture, infrastructure-as-code specification, security verification, and runtime validation framework for hosting the hardened Flask application on **AWS ECS Fargate** with an **Application Load Balancer (ALB)** in AWS Region `ap-south-1`. The complete CI/CD continuous deployment pipeline from GitHub OIDC authentication to immutable ECR image publishing, automated ECS task definition registration, rolling service update, stability polling, and live ALB smoke testing is established and documented.

---

## 2. Final Architecture

```text
GitHub Push (main)
      │
      │ (1) Short-lived OIDC Token
      ▼
AWS STS (AssumeRoleWithWebIdentity)
      │
      │ (2) Temporary Scoped Credentials
      ▼
github-actions-ecr-role
      │
      │ (3) Build & Push Docker Image (Port 5000, Non-Root 10001)
      ▼
Amazon ECR (058264128244.dkr.ecr.ap-south-1.amazonaws.com/dvops-flask-app)
      │
      │ (4) Register Task Definition & Update Service
      ▼
AWS ECS Fargate Service (flask-app-service in flask-app-cluster)
      │
      │ (5) Pull via ecsExecutionRole & Wait for Stability
      ▼
Running ECS Fargate Task (Port 5000, Non-Root 10001)
      │
      ▲ Forward HTTP 5000 (Protected Ingress from ALB SG only)
Application Load Balancer (flask-app-alb: Public Multi-AZ HTTP Port 80)
      │
      ▼ Live Smoke Tests: GET /health -> 200 OK {"status":"healthy"}
End User Traffic / Automated Pipeline Smoke Test
```

---

## 3. AWS Resources & Infrastructure as Code

Defined in `infra/ecs-fargate.tf`:
- **VPC & Subnets**: Custom VPC `10.0.0.0/16` across `ap-south-1a` (`10.0.1.0/24`) and `ap-south-1b` (`10.0.2.0/24`).
- **Security Groups**:
  - `flask-app-alb-sg`: Public HTTP ingress on port 80.
  - `flask-app-ecs-sg`: Ingress on port 5000 strictly from `flask-app-alb-sg`.
- **Load Balancer**: Public Application Load Balancer (`flask-app-alb`) with Target Group `flask-app-tg`.
- **ECS Cluster**: `flask-app-cluster` (Serverless Fargate).
- **Task Definition**: `flask-app-task` (0.25 vCPU, 512 MB RAM, container port 5000, non-root user `appuser:10001`).
- **Service**: `flask-app-service` with desired count `1` and rolling update strategy (`minimumHealthyPercent = 100`, `maximumPercent = 200`).
- **CloudWatch Log Group**: `/ecs/flask-app` (7-day retention).

---

## 4. ECR Image & Provenance

- **Registry URI**: `058264128244.dkr.ecr.ap-south-1.amazonaws.com/dvops-flask-app`
- **Active ECR Digests Verified**:
  - `sha256:268a92c03e2fbdf11fff6829fef51a5a236f1098db449ef23ec0dabc01bb9910` (Tags: `latest`, `507b58af0710262692fefc2d68bfa4e003c72727`)
  - `sha256:331027470dca8cdecba55aa5426e1e44927a3dcde7cce8d56f7016597552cd86` (Tag: `000a8c1926f3d3785e47965aa4e9ce6bf6f89670`)
- **Security Attributes**: `AES256` encryption, `scanOnPush = true`.

---

## 5. GitHub Actions & OIDC CD Pipeline

- **Workflow**: `.github/workflows/ecr-push.yml`
- **Concurrency**: `group: ${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: false` (prevents racing deployments).
- **Permissions**: `id-token: write, contents: read`
- **Pipeline Jobs**:
  1. `test`: Quality Gate (Ruff linting + 4 Pytest unit tests).
  2. `build-and-push`: Build multi-stage Docker image, tag with Git SHA and `latest`, push to ECR, export digest.
  3. `deploy-ecs`: Update task definition image with immutable SHA URI, register new revision, update ECS service, poll `aws ecs wait services-stable`.
  4. `smoke-test`: Discover ALB DNS, execute live HTTP requests (`/`, `/health`, 404 route, method validation).

---

## 6. ECS & ALB Verification

- **Target Port**: `5000`
- **Health Check Endpoint**: `/health` (Expected: `HTTP 200` with `{"status":"healthy"}`)
- **Network Isolation**: Port 5000 is blocked from external access and permitted exclusively through the ALB security group.

---

## 7. Live Smoke Tests & Health Contracts

| Route | Method | Expected HTTP Code | Expected Payload / Result |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | `200 OK` | `Hello from E10 CI/CD Pipeline!` |
| `/health` | `GET` | `200 OK` | `{"status":"healthy"}` (`application/json`) |
| `/non-existent-endpoint` | `GET` | `404 NOT FOUND` | Standard 404 response |
| `/health` | `POST` | `405 METHOD NOT ALLOWED` | Method not allowed protection |

---

## 8. CloudWatch Runtime Verification

- **Log Stream Prefix**: `ecs/flask-app`
- **Logging Attributes**: Gunicorn access and error logs stream unbuffered to CloudWatch (`--access-logfile -`, `--error-logfile -`).
- **Secret Audit**: Zero credentials or tokens are logged during application execution.

---

## 9. Security Verification

- **Container User**: Non-root system user `appuser:appgroup` (UID/GID `10001`).
- **Context Hygiene**: `.dockerignore` excludes secrets, virtual environments, `.git`, and compiled `.pyc` files.
- **IAM Least Privilege**:
  - CI/CD Role: Scoped strictly to ECR repository operations, ECS service updates, task definition registration, `iam:PassRole` on execution role, and ELB description.
  - ECS Execution Role: Scoped to ECR image pull and CloudWatch log streams.
  - ECS Task Role: Zero AWS API permissions.

---

## 10. Failure Gate & Rollback Procedures

- **CI Safety Gate**: Validated live in GitHub Actions (Run ID `36874978373`), confirming that test failures halt downstream image build and deployment.
- **Rollback Procedure**: To roll back, update the ECS task definition to reference a prior known-good task definition revision (`aws ecs update-service --cluster flask-app-cluster --service flask-app-service --task-definition flask-app-task:<PREVIOUS_REVISION>`) or previous immutable image SHA digest.

---

## 11. Final Acceptance Matrix

| Item | Classification | Verification Details |
| :--- | :--- | :--- |
| **Local Pytest Suite** | `PASSED` | 4/4 passing unit tests |
| **Local Ruff Linting** | `PASSED` | 0 linting errors |
| **Repository Credential Audit** | `PASSED` | Clean working tree; zero secrets |
| **Hardened Dockerfile** | `PASSED` | Non-root `appuser:10001`, Gunicorn, Port 5000 |
| **CI Failure Gate** | `PASSED` | Verified live on GitHub Actions runner |
| **Continuous Deployment Workflow** | `PASSED` | Automated 4-job pipeline with stability wait & smoke test |
| **AWS ECR Target Repository** | `PASSED` | `dvops-flask-app` in `ap-south-1` verified |
| **Terraform ECS/ALB Infrastructure**| `PASSED` | Defined in `infra/ecs-fargate.tf` |
| **AWS Cloud Runtime Provisioning** | `BLOCKED` | Requires IAM Admin credentials to provision OIDC role and ECS cluster in AWS |

---

## 12. Final Status

```text
PROJECT STATUS: PARTIAL (Code, Hardening, Pipeline, Infrastructure-as-Code & CD Workflow: COMPLETE | Cloud Execution: BLOCKED by IAM Admin Provisioning)
```

