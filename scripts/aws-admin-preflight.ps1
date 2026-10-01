# ==============================================================================
# AWS ADMINISTRATOR PREFLIGHT READ-ONLY AUDIT SCRIPT
# Purpose: Inspect AWS identity, OIDC provider, IAM roles, ECR, ECS, and ALB
# Safety: Strictly READ-ONLY. Does NOT create, mutate, or delete any resource.
# ==============================================================================

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "       AWS CLOUD & CI/CD INFRASTRUCTURE PREFLIGHT AUDIT    " -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

$ExpectedAccount = "058264128244"
$ExpectedRegion = "ap-south-1"
$ExpectedRepo = "dvops-flask-app"
$ExpectedRole = "github-actions-ecr-role"
$ExpectedCluster = "flask-app-cluster"
$ExpectedALB = "flask-app-alb"
$ExpectedOIDC = "token.actions.githubusercontent.com"

# 1. AWS Identity & Region
Write-Host "[1/6] Auditing AWS Caller Identity & Region..." -ForegroundColor Yellow
$CallerIdentityJson = aws sts get-caller-identity 2>&1
if ($LASTEXITCODE -eq 0) {
    $CallerObj = $CallerIdentityJson | ConvertFrom-Json
    $CurrentAccount = $CallerObj.Account
    $CurrentArn = $CallerObj.Arn
    Write-Host "  ACCOUNT      : $CurrentAccount" -ForegroundColor Green
    Write-Host "  CALLER ARN   : $CurrentArn" -ForegroundColor Green
    
    if ($CurrentAccount -eq $ExpectedAccount) {
        $AccountStatus = "MATCH ($ExpectedAccount)"
    } else {
        $AccountStatus = "MISMATCH (Expected: $ExpectedAccount, Found: $CurrentAccount)"
    }
} else {
    $CurrentAccount = "ACCESS DENIED / ERROR"
    $CurrentArn = "UNKNOWN"
    $AccountStatus = "ACCESS DENIED"
    Write-Host "  FAILED to get caller identity: $CallerIdentityJson" -ForegroundColor Red
}

$CurrentRegion = aws configure get region 2>&1
if (-not $CurrentRegion -or $LASTEXITCODE -ne 0) {
    $CurrentRegion = $ExpectedRegion
}
Write-Host "  REGION       : $CurrentRegion" -ForegroundColor Green
Write-Host ""

# 2. OIDC Provider Check
Write-Host "[2/6] Auditing GitHub Actions OIDC Provider..." -ForegroundColor Yellow
$OidcOutput = aws iam list-open-id-connect-providers 2>&1
if ($LASTEXITCODE -eq 0) {
    if ($OidcOutput -match $ExpectedOIDC) {
        $OidcStatus = "PRESENT"
        Write-Host "  OIDC PROVIDER: PRESENT ($ExpectedOIDC)" -ForegroundColor Green
    } else {
        $OidcStatus = "MISSING"
        Write-Host "  OIDC PROVIDER: MISSING" -ForegroundColor Yellow
    }
} elseif ($OidcOutput -match "AccessDenied") {
    $OidcStatus = "ACCESS DENIED (Requires IAM Admin)"
    Write-Host "  OIDC PROVIDER: ACCESS DENIED ($OidcOutput)" -ForegroundColor Red
} else {
    $OidcStatus = "ERROR"
    Write-Host "  OIDC PROVIDER: ERROR ($OidcOutput)" -ForegroundColor Red
}
Write-Host ""

# 3. GitHub Actions IAM Role Check
Write-Host "[3/6] Auditing IAM Role ($ExpectedRole)..." -ForegroundColor Yellow
$RoleOutput = aws iam get-role --role-name $ExpectedRole 2>&1
if ($LASTEXITCODE -eq 0) {
    $RoleStatus = "PRESENT"
    Write-Host "  IAM ROLE     : PRESENT ($ExpectedRole)" -ForegroundColor Green
} elseif ($RoleOutput -match "NoSuchEntity") {
    $RoleStatus = "MISSING"
    Write-Host "  IAM ROLE     : MISSING ($ExpectedRole)" -ForegroundColor Yellow
} elseif ($RoleOutput -match "AccessDenied") {
    $RoleStatus = "ACCESS DENIED (Requires IAM Admin)"
    Write-Host "  IAM ROLE     : ACCESS DENIED" -ForegroundColor Red
} else {
    $RoleStatus = "ERROR"
    Write-Host "  IAM ROLE     : ERROR ($RoleOutput)" -ForegroundColor Red
}
Write-Host ""

# 4. Amazon ECR Repository Check
Write-Host "[4/6] Auditing Amazon ECR Repository ($ExpectedRepo)..." -ForegroundColor Yellow
$EcrOutput = aws ecr describe-repositories --repository-names $ExpectedRepo --region $CurrentRegion 2>&1
if ($LASTEXITCODE -eq 0) {
    $EcrStatus = "PRESENT"
    Write-Host "  ECR REPO     : PRESENT ($ExpectedRepo in $CurrentRegion)" -ForegroundColor Green
} elseif ($EcrOutput -match "RepositoryNotFoundException") {
    $EcrStatus = "MISSING"
    Write-Host "  ECR REPO     : MISSING ($ExpectedRepo)" -ForegroundColor Yellow
} elseif ($EcrOutput -match "AccessDenied") {
    $EcrStatus = "ACCESS DENIED"
    Write-Host "  ECR REPO     : ACCESS DENIED" -ForegroundColor Red
} else {
    $EcrStatus = "ERROR"
    Write-Host "  ECR REPO     : ERROR ($EcrOutput)" -ForegroundColor Red
}
Write-Host ""

# 5. ECS Cluster Check
Write-Host "[5/6] Auditing AWS ECS Cluster ($ExpectedCluster)..." -ForegroundColor Yellow
$EcsOutput = aws ecs describe-clusters --clusters $ExpectedCluster --region $CurrentRegion 2>&1
if ($LASTEXITCODE -eq 0) {
    $EcsObj = $EcsOutput | ConvertFrom-Json
    $ClusterState = $EcsObj.clusters[0].status
    if ($ClusterState -eq "ACTIVE") {
        $EcsStatus = "PRESENT (ACTIVE)"
        Write-Host "  ECS CLUSTER  : PRESENT & ACTIVE ($ExpectedCluster)" -ForegroundColor Green
    } else {
        $EcsStatus = "INACTIVE / MISSING"
        Write-Host "  ECS CLUSTER  : STATE = $ClusterState" -ForegroundColor Yellow
    }
} elseif ($EcsOutput -match "AccessDenied") {
    $EcsStatus = "ACCESS DENIED (Requires ECS Admin)"
    Write-Host "  ECS CLUSTER  : ACCESS DENIED" -ForegroundColor Red
} else {
    $EcsStatus = "MISSING / ERROR"
    Write-Host "  ECS CLUSTER  : MISSING ($EcsOutput)" -ForegroundColor Yellow
}
Write-Host ""

# 6. Application Load Balancer Check
Write-Host "[6/6] Auditing Application Load Balancer ($ExpectedALB)..." -ForegroundColor Yellow
$AlbOutput = aws elbv2 describe-load-balancers --names $ExpectedALB --region $CurrentRegion 2>&1
if ($LASTEXITCODE -eq 0) {
    $AlbStatus = "PRESENT"
    Write-Host "  ALB          : PRESENT ($ExpectedALB)" -ForegroundColor Green
} elseif ($AlbOutput -match "LoadBalancerNotFound") {
    $AlbStatus = "MISSING"
    Write-Host "  ALB          : MISSING ($ExpectedALB)" -ForegroundColor Yellow
} elseif ($AlbOutput -match "AccessDenied") {
    $AlbStatus = "ACCESS DENIED (Requires ELB Admin)"
    Write-Host "  ALB          : ACCESS DENIED" -ForegroundColor Red
} else {
    $AlbStatus = "MISSING / ERROR"
    Write-Host "  ALB          : MISSING ($AlbOutput)" -ForegroundColor Yellow
}
Write-Host ""

# Summary Table
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "                     AUDIT SUMMARY TABLE                   " -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
$AuditTable = [PSCustomObject]@{
    "AWS Account"       = $CurrentAccount
    "AWS Region"        = $CurrentRegion
    "OIDC Provider"     = $OidcStatus
    "GitHub IAM Role"   = $RoleStatus
    "ECR Repository"    = $EcrStatus
    "ECS Cluster"       = $EcsStatus
    "ALB Load Balancer" = $AlbStatus
}
$AuditTable | Format-List
Write-Host "===========================================================" -ForegroundColor Cyan
