# AWS Live Runtime Validation & Smoke Test Specifications

## 1. Scope & Verification Strategy

This document specifies the validation procedures for live runtime observation, smoke testing, CloudWatch log auditing, and failure/recovery checks for the Flask application hosted on AWS ECS Fargate.

---

## 2. Live Smoke Test Procedures

Once the Application Load Balancer is active and targets are healthy, execute the following HTTP validations against the ALB DNS name:

### Test 1: Root Greeting Endpoint
```bash
curl -i http://<ALB_DNS_NAME>/
```
- **Expected Status**: `HTTP/1.1 200 OK`
- **Expected Body**: `Hello from E10 CI/CD Pipeline!`
- **Expected Content-Type**: `text/html; charset=utf-8`

### Test 2: Health Check Contract Endpoint
```bash
curl -i http://<ALB_DNS_NAME>/health
```
- **Expected Status**: `HTTP/1.1 200 OK`
- **Expected Body**: `{"status":"healthy"}`
- **Expected Content-Type**: `application/json`

### Test 3: Unhandled Route (404 Behavior)
```bash
curl -i http://<ALB_DNS_NAME>/non-existent-route
```
- **Expected Status**: `HTTP/1.1 404 NOT FOUND`

### Test 4: Disallowed HTTP Method (405 Behavior)
```bash
curl -i -X POST http://<ALB_DNS_NAME>/health
```
- **Expected Status**: `HTTP/1.1 405 METHOD NOT ALLOWED`

---

## 3. CloudWatch Log Auditing

Inspect CloudWatch log group `/ecs/flask-app` for container logs:
```bash
aws logs tail /ecs/flask-app --region ap-south-1 --follow
```

### Verification Criteria:
1. **Startup Banner**: Gunicorn master process starting with workers.
2. **Access Logs**: Streaming HTTP access logs with client IP, timestamp, method, path, and response code.
3. **No Secret Leakage**: Zero environment variables, tokens, or private keys printed to stdout.
4. **No Unhandled Tracebacks**: Zero unhandled exceptions or crash loops.

---

## 4. Rollback & Disaster Recovery Procedures

### Rollback via Immutable Image Digest / Commit SHA
To revert to a prior known-good deployment:

```bash
# 1. Update task definition with previous immutable ECR image tag
aws ecs update-service \
  --cluster flask-app-cluster \
  --service flask-app-service \
  --force-new-deployment \
  --region ap-south-1
```

### ECS Rolling Update Guarantee:
- `minimumHealthyPercent`: `100`
- `maximumPercent`: `200`
- The ALB will route traffic to the newly created task only after it passes 2 consecutive `/health` checks, ensuring zero downtime during rollbacks and deployments.
