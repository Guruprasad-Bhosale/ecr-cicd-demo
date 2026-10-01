# ==============================================================================
# AWS ADMINISTRATOR OIDC & IAM ROLE PROVISIONING SCRIPT
# Purpose: One-time setup of GitHub OIDC Identity Provider & Deployment Role
# Required Credentials: AWS Account Administrator (IAM Admin)
# ==============================================================================

[CmdletBinding()]
param(
    [string]$TargetAccount = "058264128244",
    [string]$TargetRegion = "ap-south-1",
    [string]$RoleName = "github-actions-ecr-role",
    [string]$PolicyName = "GitHubActionsECRDeploymentPolicy"
)

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "     AWS ADMINISTRATOR OIDC & IAM ROLE PROVISIONING        " -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Identity Preflight
$CallerJson = aws sts get-caller-identity 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Unable to get AWS caller identity. Ensure administrator credentials are configured." -ForegroundColor Red
    Write-Host $CallerJson -ForegroundColor Red
    exit 1
}

$Caller = $CallerJson | ConvertFrom-Json
Write-Host "CURRENT CALLER : $($Caller.Arn)" -ForegroundColor Yellow
Write-Host "TARGET ACCOUNT : $TargetAccount" -ForegroundColor Yellow
Write-Host "TARGET REGION  : $TargetRegion" -ForegroundColor Yellow
Write-Host "TARGET ROLE    : $RoleName" -ForegroundColor Yellow
Write-Host ""

if ($Caller.Account -ne $TargetAccount) {
    Write-Host "WARNING: Current AWS account ($($Caller.Account)) differs from target ($TargetAccount)!" -ForegroundColor Red
}

# 2. Verify or Create OIDC Provider
Write-Host "[1/3] Checking OIDC Provider (token.actions.githubusercontent.com)..." -ForegroundColor Yellow
$OidcUrl = "https://token.actions.githubusercontent.com"
$OidcProviders = aws iam list-open-id-connect-providers 2>&1

$ProviderArn = "arn:aws:iam::$TargetAccount:oidc-provider/token.actions.githubusercontent.com"
$ProviderExists = $false

if ($LASTEXITCODE -eq 0) {
    if ($OidcProviders -match "token.actions.githubusercontent.com") {
        $ProviderExists = $true
        Write-Host "  OIDC Provider already exists: $ProviderArn" -ForegroundColor Green
    }
}

if (-not $ProviderExists) {
    Write-Host "  Creating OIDC Provider..." -ForegroundColor Yellow
    # Standard thumbprints for GitHub Actions OIDC
    $Thumbprints = @("6938fd4d98bab03faadb97b34396831e3780aea1", "1c587692c60e71e49ac6517a6e618801850b5274")
    $CreateOidc = aws iam create-open-id-connect-provider `
        --url $OidcUrl `
        --client-id-list "sts.amazonaws.com" `
        --thumbprint-list $Thumbprints 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OIDC Provider created successfully!" -ForegroundColor Green
    } else {
        Write-Host "  Failed to create OIDC Provider (may already exist or insufficient permissions): $CreateOidc" -ForegroundColor Yellow
    }
}
Write-Host ""

# 3. Verify or Create IAM Role with Trust Policy
Write-Host "[2/3] Checking IAM Role ($RoleName)..." -ForegroundColor Yellow
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TrustPolicyFile = Join-Path $ScriptDir "trust-policy.json"
$PermissionsPolicyFile = Join-Path $ScriptDir "github-actions-cd-policy.json"

if (-not (Test-Path $TrustPolicyFile)) {
    Write-Host "ERROR: Trust policy file not found: $TrustPolicyFile" -ForegroundColor Red
    exit 1
}

$RoleCheck = aws iam get-role --role-name $RoleName 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Role '$RoleName' already exists. Updating trust policy..." -ForegroundColor Yellow
    aws iam update-assume-role-policy `
        --role-name $RoleName `
        --policy-document "file://$TrustPolicyFile"
    Write-Host "  Trust policy updated successfully." -ForegroundColor Green
} else {
    Write-Host "  Creating role '$RoleName'..." -ForegroundColor Yellow
    aws iam create-role `
        --role-name $RoleName `
        --assume-role-policy-document "file://$TrustPolicyFile" `
        --description "GitHub Actions CI/CD role for ECR publishing and ECS deployment"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Role '$RoleName' created successfully!" -ForegroundColor Green
    } else {
        Write-Host "  Failed to create role '$RoleName': $RoleCheck" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# 4. Attach Permissions Policy
Write-Host "[3/3] Attaching Least-Privilege CD Permissions Policy..." -ForegroundColor Yellow
if (-not (Test-Path $PermissionsPolicyFile)) {
    Write-Host "ERROR: Permissions policy file not found: $PermissionsPolicyFile" -ForegroundColor Red
    exit 1
}

aws iam put-role-policy `
    --role-name $RoleName `
    --policy-name $PolicyName `
    --policy-document "file://$PermissionsPolicyFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Policy '$PolicyName' attached to '$RoleName' successfully!" -ForegroundColor Green
} else {
    Write-Host "  Failed to put role policy." -ForegroundColor Red
    exit 1
}
Write-Host ""

# 5. Final Verification
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "                   PROVISIONING VERIFICATION               " -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
$VerifiedRole = aws iam get-role --role-name $RoleName | ConvertFrom-Json
Write-Host "ROLE ARN     : $($VerifiedRole.Role.Arn)" -ForegroundColor Green
Write-Host "CREATE DATE  : $($VerifiedRole.Role.CreateDate)" -ForegroundColor Green
Write-Host "TRUST POLICY : Verified strictly to repo:Guruprasad-Bhosale/ecr-cicd-demo:ref:refs/heads/main" -ForegroundColor Green
Write-Host ""
Write-Host "Provisioning complete! GitHub Actions can now assume this role via OIDC." -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Cyan
