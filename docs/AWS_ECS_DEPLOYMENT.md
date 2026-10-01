# AWS ECS Fargate Deployment Guide

## 1. Overview

This document defines the deployment architecture and execution procedures for hosting the containerized Flask Gunicorn application on **AWS ECS Fargate** behind an **Application Load Balancer (ALB)** in AWS Region `ap-south-1`.

---

## 2. Infrastructure Architecture

```text
                                  Internet
                                     │
                                     ▼ (HTTP Port 80)
                       ┌───────────────────────────┐
                       │ Application Load Balancer │
                       │    (Multi-AZ Public)      │
                       └─────────────┬─────────────┘
                                     │ Forward to Target Group
                                     ▼ (/health check matcher: 200)
                       ┌───────────────────────────┐
                       │  ECS Fargate Task (vCPU)  │
                       │ ┌───────────────────────┐ │
                       │ │ Gunicorn + Flask      │ │
                       │ │ Port 5000 (Non-root)  │ │
                       │ └───────────────────────┘ │
                       └─────────────┬─────────────┘
                                     │ Logs Driver: awslogs
                                     ▼
                       ┌───────────────────────────┐
                       │ CloudWatch: /ecs/flask-app│
                       └───────────────────────────┘
```

---

## 3. Component Specifications

### A. Networking & VPC
- **VPC CIDR**: `10.0.0.0/16`
- **Subnets**: Two public subnets across `ap-south-1a` (`10.0.1.0/24`) and `ap-south-1b` (`10.0.2.0/24`) to satisfy AWS ALB high-availability requirements.
- **Internet Gateway**: Attached to the VPC with default 0.0.0.0/0 route.

### B. Security Groups & Network Isolation
- **ALB Security Group (`flask-app-alb-sg`)**:
  - Ingress: Port 80 (TCP) from `0.0.0.0/0`.
  - Egress: All traffic allowed.
- **ECS Task Security Group (`flask-app-ecs-sg`)**:
  - Ingress: Port 5000 (TCP) restricted exclusively to `flask-app-alb-sg`. Direct Internet traffic to port 5000 is blocked.
  - Egress: Port 443 (TCP) allowed to pull images from ECR and stream logs to CloudWatch.

### C. Application Load Balancer & Health Check Contract
- **Type**: Application Load Balancer (Internet-facing).
- **Listener**: Port 80 (HTTP) forwarding to `flask-app-tg`.
- **Target Group**: Port 5000 (`HTTP`, Target Type: `ip`).
- **Health Check Path**: `/health`
  - Matcher: `200`
  - Interval: `30s`
  - Timeout: `5s`
  - Healthy Threshold: `2`
  - Unhealthy Threshold: `3`

### D. ECS Task Definition & Fargate Service
- **Launch Type**: `FARGATE`
- **CPU / Memory**: `256` (0.25 vCPU) / `512` (0.5 GB RAM)
- **Container Name**: `flask-app`
- **Image**: `058264128244.dkr.ecr.ap-south-1.amazonaws.com/dvops-flask-app:<IMAGE_TAG>`
- **Port Mapping**: `5000/tcp`
- **Execution Role**: `arn:aws:iam::058264128244:role/flask-app-ecs-execution-role` with `AmazonECSTaskExecutionRolePolicy`.
- **Task Role**: None (Application requires zero direct AWS API access; least privilege).
- **Log Driver**: `awslogs` streaming to `/ecs/flask-app`.

---

## 4. Deployment Execution via Terraform / AWS CLI

### Step 1: Initialize Terraform
```bash
cd infra
terraform init
```

### Step 2: Plan & Apply
```bash
terraform plan -out=tfplan
terraform apply tfplan
```

### Step 3: Retrieve Public Endpoint
```bash
terraform output alb_http_url
```

---

## 5. Continuous Deployment Integration

The GitHub Actions workflow [.github/workflows/ecr-push.yml](file:///g:/me/FInal%20Year/DevOps/ecr-cicd-demo/.github/workflows/ecr-push.yml) builds and pushes immutable images tagged with `${{ github.sha }}`. ECS Fargate updates can be triggered automatically using `aws ecs update-service` or the `aws-actions/amazon-ecs-deploy-task-definition` action.
