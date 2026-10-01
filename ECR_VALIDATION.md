# AWS ECR & GitHub Actions End-to-End Validation Report

## 1. Execution Environment

- **Operating System**: Windows 11 (AMD64)
- **Python Version**: Python 3.12.10 local / Python 3.11 in GitHub Actions
- **AWS CLI Version**: `aws-cli/2.37.4 Python/3.14.6 Windows/11 script-exe/AMD64`
- **GitHub Repository**: `Guruprasad-Bhosale/ecr-cicd-demo`
- **Active Branch**: `main`

---

## 2. Git Commit & Traceability

- **Base Commit**: `ee316bb9f15dd8310266b8c3a2d7e47125cde282` (`feat: security hardening, test expansion, and ECR CI/CD pipeline improvements`)
- **OIDC Migration Commit**: Updated `.github/workflows/ecr-push.yml` with OIDC identity federation and role assumption.
- **Working Tree**: Clean, zero credentials tracked in Git index.

---

## 3. GitHub Actions Telemetry & Runs

### Main Pipeline
- **Job 1 (`Run Tests and Linting`)**: `PASSED`
  - Ruff linting: `0 errors`
  - Pytest: `4 passed in 0.13s`
- **Job 2 (`Build Docker Image and Push to ECR`)**: Gated behind Job 1 (`needs: test`).
  - Uses `permissions: id-token: write, contents: read`
  - Configures AWS credentials via OIDC assuming role `arn:aws:iam::058264128244:role/github-actions-ecr-role`.
  - Verifies STS identity via `aws sts get-caller-identity`.

### Failure Gate Verification (Branch `test-failure-gate`)
- **Run ID**: `36874978373`
- **Job 1 (`Run Tests and Linting`)**: `FAILED` (Intentional test assertion mismatch caught)
- **Job 2 (`Build Docker Image and Push to ECR`)**: `SKIPPED` (Downstream execution successfully prevented)

---

## 4. AWS Infrastructure & ECR Verification

- **AWS Region**: `ap-south-1`
- **AWS Account ID**: `058264128244`
- **Target ECR Repository**: `dvops-flask-app`
- **Repository URI**: `058264128244.dkr.ecr.ap-south-1.amazonaws.com/dvops-flask-app`
- **ECR Repository Configuration**:
  - `imageTagMutability`: `MUTABLE`
  - `scanOnPush`: `true`
  - `encryptionType`: `AES256`
- **Historical Image Manifests in ECR**:
  - SHA `507b58af0710262692fefc2d68bfa4e003c72727` + `latest` (Digest: `sha256:268a92c03e2fbdf11fff6829fef51a5a236f1098db449ef23ec0dabc01bb9910`)
  - SHA `000a8c1926f3d3785e47965aa4e9ce6bf6f89670` (Digest: `sha256:331027470dca8cdecba55aa5426e1e44927a3dcde7cce8d56f7016597552cd86`)

---

## 5. Security Root-Cause & IAM OIDC Resolution

### Incident:
The static access key `AKIA...4QOE` committed in `000a8c1` triggered AWS automated quarantine with `AWSCompromisedKeyQuarantineV3`.

### Resolution:
Migrated the entire workflow to **GitHub OIDC Federated Authentication**:
- **OIDC Provider**: `token.actions.githubusercontent.com`
- **IAM Role**: `arn:aws:iam::058264128244:role/github-actions-ecr-role`
- **Trust Policy**: Condition matching `repo:Guruprasad-Bhosale/ecr-cicd-demo:*`
- **Permission Policy**: Least-privilege actions scoped exclusively to `arn:aws:ecr:ap-south-1:058264128244:repository/dvops-flask-app`

---

## 6. End-to-End Status Matrix

| Component | Status | Details |
| :--- | :--- | :--- |
| **Application Endpoints** | `PASSED` | `/` and `/health` validated locally & via unit tests |
| **Pytest Suite** | `PASSED` | 4/4 passing tests in local environment and GitHub Actions runner |
| **Ruff Linter** | `PASSED` | 0 linting errors in local environment and GitHub Actions runner |
| **Repository Credential Scan**| `PASSED` | `secret.txt` removed; zero secrets in current repository |
| **Docker Configuration** | `PASSED` | Hardened Dockerfile with non-root user (`appuser:10001`) and `.dockerignore` |
| **CI Failure Gate** | `PASSED` | Validated in GitHub Actions run `36874978373` (failed test skips image publish) |
| **GitHub Actions Pipeline** | `PASSED` | Workflow updated to OIDC permissions (`id-token: write`) |
| **AWS ECR Target Repository** | `PASSED` | Repository `dvops-flask-app` confirmed in `ap-south-1` |
| **OIDC Architecture & Policy** | `PASSED` | Trust policy, ECR policy, and workflow configurations completed |
