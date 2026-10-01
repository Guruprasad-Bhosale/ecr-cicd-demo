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
- **Workflow Optimization Commit**: `72a22ddb8a085d5f4083a8ed3d77ff4e262dcb0d` (`ci: streamline ECR build and push sequence in GitHub Actions`)
- **Working Tree**: Clean, zero credentials tracked in Git index.

---

## 3. GitHub Actions Runs

### Run 1: Main Pipeline (Commit `72a22dd`)
- **Run ID**: `36874753655`
- **Run URL**: [https://github.com/Guruprasad-Bhosale/ecr-cicd-demo/actions/runs/36874753655](https://github.com/Guruprasad-Bhosale/ecr-cicd-demo/actions/runs/36874753655)
- **Job 1 (`Run Tests and Linting`)**: `PASSED` (ID: `110411209686`)
  - Ruff linting: `0 errors`
  - Pytest: `4 passed in 0.13s`
- **Job 2 (`Build Docker Image and Push to ECR`)**: `BLOCKED / FAILED` (ID: `110411292322`)
  - AWS Authentication Step: `PASSED`
  - ECR Login Step: `FAILED` (AWS Identity Quarantine Deny)

### Run 2: Failure Gate Verification (Branch `test-failure-gate`)
- **Run ID**: `36874978373`
- **Run URL**: [https://github.com/Guruprasad-Bhosale/ecr-cicd-demo/actions/runs/36874978373](https://github.com/Guruprasad-Bhosale/ecr-cicd-demo/actions/runs/36874978373)
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

## 5. Security Root-Cause Analysis: AWS IAM Quarantine

During live AWS authentication validation against the ECR API (`aws ecr get-login-password --region ap-south-1`), AWS returned the following explicit policy rejection:

```text
An error occurred (AccessDeniedException) when calling the GetAuthorizationToken operation:
User: arn:aws:iam::058264128244:user/github-actions-ecr is not authorized to perform:
ecr:GetAuthorizationToken on resource: * with an explicit deny in an identity-based policy:
arn:aws:iam::aws:policy/AWSCompromisedKeyQuarantineV3
```

### Cause:
The access key `AKIAQ3EGQBL2HMLD4QOE` was committed to Git in initial commit `000a8c1`. AWS automated detection identified the public credential leak and attached `AWSCompromisedKeyQuarantineV3` to isolate the IAM user.

### Required Remediation:
1. In the AWS IAM Console, delete the compromised access key for user `github-actions-ecr`.
2. Detach the `AWSCompromisedKeyQuarantineV3` policy from the IAM user.
3. Generate a new Access Key ID and Secret Access Key.
4. Update the GitHub repository secrets `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` under **Settings > Secrets and variables > Actions**.

---

## 6. End-to-End Status Matrix

| Component | Status | Details |
| :--- | :--- | :--- |
| **Application Endpoints** | `PASSED` | `/` and `/health` validated locally & via unit tests |
| **Pytest Suite** | `PASSED` | 4/4 passing tests in local environment and GitHub Actions runner |
| **Ruff Linter** | `PASSED` | 0 linting errors in local environment and GitHub Actions runner |
| **Repository Credential Scan**| `PASSED` | `secret.txt` and `.pyc` removed from Git index; `.gitignore` verified |
| **Docker Configuration** | `PASSED` | Hardened Dockerfile with non-root user (`appuser:10001`) and `.dockerignore` |
| **Docker Local Daemon** | `NOT EXECUTED` | Local Docker Desktop engine was not running |
| **CI Failure Gate** | `PASSED` | Validated in GitHub Actions run `36874978373` (`test` failure skips `build-and-push`) |
| **GitHub Actions Pipeline** | `PASSED` | Workflow runs automatically on push/PR with matrixed stages |
| **AWS ECR Target Repository** | `PASSED` | Repository `dvops-flask-app` confirmed in `ap-south-1` |
| **AWS ECR Push Execution** | `BLOCKED` | Blocked by AWS `AWSCompromisedKeyQuarantineV3` until key is rotated |
