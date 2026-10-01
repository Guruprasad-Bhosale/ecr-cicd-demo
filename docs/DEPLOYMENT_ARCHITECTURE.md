# End-to-End Deployment Architecture

## 1. Complete CI/CD & Runtime Topology

```text
+─────────────────────────────────────────────────────────────────────────────+
│                            DEVELOPMENT WORKFLOW                             │
+─────────────────────────────────────────────────────────────────────────────+
                                       │
                                       ▼ (git push origin main)
+─────────────────────────────────────────────────────────────────────────────+
│                       GITHUB ACTIONS RUNNER (CI/CD)                         │
│                                                                             │
│   1. Lint with Ruff (ruff check .)                                          │
│   2. Test with Pytest (pytest test_app.py -v)                               │
│   3. Acquire GitHub OIDC JWT Token                                          │
│   4. Assume AWS IAM Role (github-actions-ecr-role) via AWS STS              │
│   5. Docker Build (python:3.11-slim, non-root user: 10001)                  │
│   6. Tag Image (<git-sha> and latest)                                       │
│   7. Push Image to Amazon ECR                                               │
+─────────────────────────────────────────────────────────────────────────────+
                                       │
                                       ▼ (ECR Push)
+─────────────────────────────────────────────────────────────────────────────+
│                      AMAZON ELASTIC CONTAINER REGISTRY                      │
│                  058264128244.dkr.ecr.ap-south-1.amazonaws.com              │
│                          Repository: dvops-flask-app                        │
│                                                                             │
│   - Immutable Tag: <commit-sha>                                             │
│   - Mutable Tag: latest                                                     │
│   - Encryption: AES256                                                      │
│   - Security: scanOnPush = true                                             │
+─────────────────────────────────────────────────────────────────────────────+
                                       │
                                       ▼ (Image Pull via Execution Role)
+─────────────────────────────────────────────────────────────────────────────+
│                       AWS ECS FARGATE & LOAD BALANCING                      │
│                               Region: ap-south-1                            │
│                                                                             │
│  [ Internet ]                                                               │
│       │                                                                     │
│       ▼ HTTP (80)                                                           │
│  [ Application Load Balancer: flask-app-alb ]                               │
│       │                                                                     │
│       ▼ Target Group Health Check: GET /health -> 200 OK                    │
│  [ ECS Fargate Task: flask-app-task ]                                       │
│       │                                                                     │
│       ├── Container Port: 5000                                              │
│       ├── Runtime User: appuser (UID 10001)                                 │
│       ├── Web Server: Gunicorn (2 workers, 2 threads)                       │
│       └── Application: Flask app.py                                         │
│                                                                             │
│  [ CloudWatch Logs: /ecs/flask-app ]                                        │
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Security Boundaries & Zero-Secret Architecture

1. **Authentication**: Zero static AWS access keys or passwords. Authentication utilizes GitHub OIDC with cryptographic JWT validation against AWS STS.
2. **Network Perimeter**: Port 5000 is isolated inside the private container network and is accessible strictly from the ALB Security Group.
3. **Application Security**: Container runs as non-root user `appuser:10001`. The filesystem excludes Git metadata, secret files, virtual environments, and caches.
4. **Health Check Validation**: Infrastructure health checking relies strictly on explicit application status route `/health`.
