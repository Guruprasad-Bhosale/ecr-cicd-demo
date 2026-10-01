# Phase Completion Report: Security Hardening & ECR Deployment Validation

## 1. Application

- **Framework**: Flask (Python 3.11/3.12 compatible)
- **Endpoints**:
  - `GET /`: Returns greeting text message (`200 OK`)
  - `GET /health`: Returns JSON `{"status": "healthy"}` with `200 OK`
- **Testing (`test_app.py`)**:
  - `test_home_endpoint`: Verifies HTTP 200 and expected response content
  - `test_health_endpoint`: Verifies HTTP 200, JSON Content-Type, and `{"status": "healthy"}` payload
  - `test_not_found_endpoint`: Verifies HTTP 404 on unhandled routes
  - `test_health_invalid_method`: Verifies HTTP 405 on disallowed HTTP methods (`POST /health`)

---

## 2. Security

- **Secret Scan & Removal**:
  - Identified `secret.txt` tracked in Git history (`commit 000a8c1`).
  - Removed `secret.txt` and `__pycache__` artifacts from Git index using `git rm --cached`.
  - Scanned codebase for lingering credentials or access keys (none present).
- **Git Ignore (`.gitignore`)**:
  - Added comprehensive ignore rules for `__pycache__/`, `.pytest_cache/`, `.ruff_cache/`, virtual environments (`.venv/`, `venv/`), `.env`, and `secret.txt`.
- **Docker Ignore (`.dockerignore`)**:
  - Excluded `.git`, `.github`, `__pycache__`, `.pytest_cache`, `.ruff_cache`, `.venv`, `.env`, `secret.txt`, and markdown files from Docker build context.
- **AWS Key Rotation Notice**:
  - **CRITICAL**: The AWS access credentials previously committed in `secret.txt` should be immediately revoked and rotated within the AWS IAM Console to prevent unauthorized access.

---

## 3. Docker

- **Base Image**: `python:3.11-slim`
- **Hardening Applied**:
  - `PYTHONDONTWRITEBYTECODE=1` & `PYTHONUNBUFFERED=1` environment variables configured.
  - Dedicated non-root system user and group created (`appuser:appgroup`, UID/GID `10001`).
  - Strict file ownership assigned to `appuser`.
  - Process runs under `USER appuser`.
  - Only required port `5000` exposed.
  - Multi-worker Gunicorn server configuration with standard logging output (`--access-logfile -`, `--error-logfile -`).

---

## 4. CI/CD (GitHub Actions)

- **Workflow File**: `.github/workflows/ecr-push.yml`
- **Stages**:
  1. `test` (Runs on push/PR to `main`):
     - Checkout code (`actions/checkout@v4`)
     - Set up Python 3.11 with pip caching (`actions/setup-python@v5`)
     - Deterministic dependency installation
     - Linting with Ruff (`ruff check .`)
     - Test execution with Pytest (`pytest test_app.py -v`)
  2. `build-and-push` (`needs: test`, triggered only on `push` to `main`):
     - Set up Docker Buildx (`docker/setup-buildx-action@v3`)
     - Configure AWS credentials using GitHub Secrets (`aws-actions/configure-aws-credentials@v4`)
     - Authenticate Docker to Amazon ECR (`aws-actions/amazon-ecr-login@v2`)
     - Build and push container with Docker Buildx (`docker/build-push-action@v6`)
- **Image Tagging**:
  - Tag 1: `<registry>/<repository>:<git-sha>` (Immutable release tag)
  - Tag 2: `<registry>/<repository>:latest` (Pointer to latest build)

---

## 5. AWS Infrastructure & IAM Requirements

- **AWS Region**: Parameterized via `${{ secrets.AWS_REGION }}` (e.g., `us-east-1` or `ap-south-1`)
- **ECR Repository**: Parameterized via `${{ secrets.ECR_REPOSITORY }}`
- **Authentication Method**:
  - Current: IAM User access keys stored in GitHub Secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
  - Recommended Production Alternative: GitHub OpenID Connect (OIDC) with AWS IAM Role (`role-to-assume`), avoiding long-lived credentials entirely.
- **Least-Privilege IAM Policy**:
  The IAM identity used by CI should have only the following scoped permissions:
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
        "Sid": "ECRPushPermissions",
        "Effect": "Allow",
        "Action": [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:DescribeRepositories"
        ],
        "Resource": "arn:aws:ecr:<REGION>:<ACCOUNT_ID>:repository/<REPOSITORY_NAME>"
      }
    ]
  }
  ```

---

## 6. Verification Results

| Item | Status | Details |
| :--- | :--- | :--- |
| **Pytest** | `VALIDATED LOCALLY` | 4/4 unit tests passed (`test_home`, `test_health`, `test_not_found`, `test_invalid_method`) |
| **Ruff Linting** | `VALIDATED LOCALLY` | Passed cleanly (`ruff check .`) |
| **CI Failure Handling** | `VALIDATED LOCALLY` | Injected deliberate test failure; confirmed pytest detects error and exits with code 1 |
| **Git & Secret Cleanup** | `VALIDATED LOCALLY` | `secret.txt` and `.pyc` files removed from Git tracking; `.gitignore` & `.dockerignore` verified |
| **Docker Engine Build/Run** | `NOT EXECUTED` (Local Daemon inactive) | Dockerfile & .dockerignore hardened; local Docker Desktop engine was not running |
| **ECR Push Execution** | `NOT EXECUTED` (Awaiting GitHub trigger) | Workflow definition verified and hardened with build-push action |
