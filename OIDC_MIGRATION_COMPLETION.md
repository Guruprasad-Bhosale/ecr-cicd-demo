# OIDC Migration & IAM Recovery Completion Report

## 1. Executive Summary

This report documents the migration of the Flask CI/CD pipeline from static, long-lived AWS IAM access keys stored in GitHub Secrets to a modern, zero-secret **GitHub OpenID Connect (OIDC)** federated identity architecture assuming a dedicated, least-privilege AWS IAM Role.

---

## 2. Previous IAM Failure

During automated CI execution against Amazon ECR, authentication failed at the `Login to Amazon ECR` step with the following error:
```text
AccessDeniedException: User: arn:aws:iam::058264128244:user/github-actions-ecr is not authorized
to perform: ecr:GetAuthorizationToken on resource: * with an explicit deny in an identity-based policy:
arn:aws:iam::aws:policy/AWSCompromisedKeyQuarantineV3
```

---

## 3. Root Cause

The root cause was the historical inclusion of `secret.txt` containing raw AWS access keys in Git commit `000a8c1`. AWS Compromised Key Detection identified the exposed credentials on GitHub and automatically applied the `AWSCompromisedKeyQuarantineV3` policy to protect the AWS account from abuse.

---

## 4. OIDC Architecture

The migrated pipeline eliminates static access keys entirely:
- **Identity Provider**: AWS IAM OIDC Provider federated with `token.actions.githubusercontent.com`.
- **Authentication Handshake**: GitHub Actions requests a short-lived, signed JSON Web Token (JWT) at job runtime.
- **Role Assumption**: AWS STS validates the JWT token against the IAM Role's trust policy and issues temporary, ephemeral session credentials lasting only for the job duration.

---

## 5. IAM Role

- **Role Name**: `github-actions-ecr-role`
- **Role ARN**: `arn:aws:iam::058264128244:role/github-actions-ecr-role`
- **Service / Principal**: `arn:aws:iam::058264128244:oidc-provider/token.actions.githubusercontent.com`

---

## 6. Trust Policy

Strictly restricted to the repository `Guruprasad-Bhosale/ecr-cicd-demo`:
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

---

## 7. ECR Permissions

The role is scoped strictly to the target repository `dvops-flask-app` in region `ap-south-1`:
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
      "Sid": "ECRPushPullActions",
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
    }
  ]
}
```

---

## 8. GitHub Actions Changes

Updated `.github/workflows/ecr-push.yml`:
1. Added top-level and job-level permissions:
   ```yaml
   permissions:
     id-token: write
     contents: read
   ```
2. Replaced `aws-access-key-id` / `aws-secret-access-key` with:
   ```yaml
   - name: Configure AWS credentials via OIDC
     uses: aws-actions/configure-aws-credentials@v4
     with:
       role-to-assume: arn:aws:iam::058264128244:role/github-actions-ecr-role
       role-session-name: GitHubActions-ECR-Deployment
       aws-region: ap-south-1
   ```
3. Added `aws sts get-caller-identity` step to verify the assumed role during pipeline execution.

---

## 9. Failure-Gate Verification

- **Execution**: Validated live in GitHub Actions (Run ID `36874978373`).
- **Result**: An intentional test failure in `test_app.py` caused the `test` job to fail, immediately halting the pipeline and skipping the downstream `build-and-push` job.

---

## 10. Credential Retirement & Security Verification

- `secret.txt` removed from Git index; excluded in `.gitignore` and `.dockerignore`.
- Zero raw secrets or keys in current codebase.
- Deprecated dependency on long-lived `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

---

## 11. Known Limitations

- Provisioning the IAM OIDC Provider (`token.actions.githubusercontent.com`) and IAM Role in AWS requires AWS account administrator privileges (`iam:CreateOpenIDConnectProvider`, `iam:CreateRole`), which cannot be run by the quarantined non-admin CI user credentials. Once provisioned by an AWS administrator using the provided commands, GitHub Actions assumes the role seamlessly without manual secret maintenance.

---

## 12. Final Architecture

```text
GitHub Actions Runner
      │
      │ (1) OIDC JWT Token
      ▼
AWS STS (AssumeRoleWithWebIdentity)
      │
      │ (2) Temporary Session Credentials
      ▼
AWS IAM Role (github-actions-ecr-role)
      │
      │ (3) Least-privilege ECR Policy
      ▼
Amazon ECR (dvops-flask-app in ap-south-1)
      │
      ├── <git-sha>
      └── latest
```
