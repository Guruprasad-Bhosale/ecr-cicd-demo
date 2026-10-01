# AWS IAM Recovery & GitHub OIDC Migration Report

## 1. Executive Summary

This document records the analysis, security remediation, and architecture migration undertaken to resolve AWS IAM quarantine issues and transition the CI/CD pipeline from static credentials to **OpenID Connect (OIDC)** authentication with an IAM Role.

---

## 2. Historical Exposure & Incident Analysis

### Exposure Event:
In initial commit `000a8c1` (dated Sep 28, 2026), a plaintext file `secret.txt` containing AWS access credentials for the IAM user `github-actions-ecr` was committed and pushed to the remote GitHub repository.

### AWS Automated Security Response:
AWS Compromised Key Detection systems detected the public repository exposure and automatically attached the AWS-managed policy:
```text
arn:aws:iam::aws:policy/AWSCompromisedKeyQuarantineV3
```
to the IAM user:
```text
arn:aws:iam::058264128244:user/github-actions-ecr
```

### Operational Impact:
The quarantine policy applies explicit `Deny` rules across high-risk operations, resulting in the following failure during GitHub Actions ECR authentication:
```text
AccessDeniedException: User: arn:aws:iam::058264128244:user/github-actions-ecr is not authorized to perform:
ecr:GetAuthorizationToken on resource: * with an explicit deny in an identity-based policy:
arn:aws:iam::aws:policy/AWSCompromisedKeyQuarantineV3
```

---

## 3. Remediation Strategy: OIDC Migration

Rather than generating new long-lived access keys that could leak in the future, the pipeline is migrated to **GitHub OIDC federated authentication**.

### Architecture Comparison:

#### Previous Architecture (Vulnerable):
```text
GitHub Secrets (Static Access Key + Secret Key)
      ↓
AWS IAM User (github-actions-ecr)
      ↓
Amazon ECR (Blocked by AWSCompromisedKeyQuarantineV3)
```

#### New Architecture (Secure & Zero-Secret):
```text
GitHub Actions Runner (Ephemeral OIDC JWT Token)
      ↓
AWS Security Token Service (STS AssumeRoleWithWebIdentity)
      ↓
AWS IAM Role (github-actions-ecr-role)
      ↓
Amazon ECR (dvops-flask-app in ap-south-1)
```

---

## 4. AWS IAM OIDC Configuration Specifications

### A. IAM OpenID Connect Provider
- **Provider URL**: `https://token.actions.githubusercontent.com`
- **Audience (Client ID)**: `sts.amazonaws.com`
- **Thumbprint**: `6938fd4d98bab03faadb97b34396831e3780aea1` (or `1c587692c60e71e49ac6517a6e618801850b5274`)

### B. IAM Role Trust Policy (`trust-policy.json`)
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

### C. Least-Privilege ECR Permission Policy (`ecr-policy.json`)
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

## 5. Deployment Script for AWS Administrator

Run the following commands using an IAM Administrator identity to provision the OIDC provider and role:

```bash
# 1. Create OIDC Identity Provider (if not already existing)
aws iam create-open-id-connect-provider \
  --url "https://token.actions.githubusercontent.com" \
  --client-id-list "sts.amazonaws.com" \
  --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1"

# 2. Create the IAM Role with the Trust Policy
aws iam create-role \
  --role-name github-actions-ecr-role \
  --assume-role-policy-document file://trust-policy.json

# 3. Attach the ECR Least-Privilege Policy to the Role
aws iam put-role-policy \
  --role-name github-actions-ecr-role \
  --policy-name GitHubActionsECRPushPolicy \
  --policy-document file://ecr-policy.json
```

---

## 6. Old Credential Retirement Plan

1. **GitHub Secrets Cleanup**:
   - `AWS_ACCESS_KEY_ID`: Deprecated / Removed from workflow.
   - `AWS_SECRET_ACCESS_KEY`: Deprecated / Removed from workflow.
   - Optional Secret `AWS_ROLE_TO_ASSUME`: Can be set to `arn:aws:iam::058264128244:role/github-actions-ecr-role`.
2. **AWS IAM User Cleanup**:
   - Delete the quarantined access key for `github-actions-ecr`.
   - Remove or delete the user `github-actions-ecr` once OIDC is actively running.
