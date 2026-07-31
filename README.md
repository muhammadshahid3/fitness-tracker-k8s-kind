# 🚀 End-to-End DevOps Deployment of MERN Fitness Tracker on Kubernetes (KIND)

## 📌 Project Overview

This project demonstrates a complete **End-to-End DevOps workflow** for deploying a **MERN Fitness Tracker** application on a Kubernetes cluster using modern DevOps tools and best practices.

The infrastructure is provisioned on AWS using **Terraform**, configured automatically with **Ansible**, containerized with **Docker**, orchestrated using **Kubernetes (KIND)**, and automated through a **GitHub Actions CI/CD pipeline**.

---

# 🏗️ Architecture

```
GitHub Repository
        │
        ▼
GitHub Actions (CI/CD)
        │
        ▼
Docker Hub
        │
        ▼
AWS EC2
        │
        ▼
Terraform → Infrastructure Provisioning
        │
        ▼
Ansible → Server Configuration
        │
        ▼
Docker + KIND + kubectl
        │
        ▼
Kubernetes Cluster
        │
 ┌──────────────┬──────────────┐
 ▼              ▼              ▼
Frontend     Backend       MongoDB
Deployment   Deployment    Deployment
      │           │
      └──────┬────┘
             ▼
        Kubernetes Services
             │
             ▼
        Kubernetes Ingress
```

---

# 🛠 Technologies Used

## Cloud

* AWS EC2

## Infrastructure as Code

* Terraform

## Configuration Management

* Ansible

## Containerization

* Docker
* Docker Hub

## Container Orchestration

* Kubernetes (KIND)

## CI/CD

* GitHub Actions

## Application

* MongoDB
* Express.js
* React.js
* Node.js

---

# 📂 Project Structure

```
project/
│
├── terraform/
│   ├── main.tf
│   ├── provider.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── terraform.tfvars
│   └── ssh key
│
├── ansible/
│   ├── inventory.ini
│   ├── playbook.yml
│   └── roles/
│
├── kubernetes/
│   ├── namespace.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── mongo-deployment.yaml
│   ├── mongo-service.yaml
│   ├── secret.yaml
│   ├── configmap.yaml
│   └── ingress.yaml
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
└── README.md
```

---

# ⚙ Infrastructure Provisioning

Terraform was used to provision the AWS infrastructure.

### Resources Created

* EC2 Instance
* Security Group
* SSH Key Pair

Terraform commands:

```bash
terraform init
terraform plan
terraform apply
```

---

# ⚙ Configuration Management

Ansible automatically configured the EC2 instance by installing:

* Docker
* kubectl
* KIND
* Git

This eliminated manual server configuration.

Run:

```bash
ansible-playbook playbook.yml
```

---

# 🐳 Docker

The application was containerized into separate Docker images.

Images were pushed to Docker Hub automatically using GitHub Actions.

---

# ☸ Kubernetes Deployment

The application was deployed inside a KIND Kubernetes cluster.

Resources created:

* Namespace
* Deployments
* Services
* ConfigMap
* Secret
* Ingress

Application components:

* Frontend
* Backend
* MongoDB

---

# 🔐 Kubernetes Secret

Sensitive application configuration is managed using Kubernetes Secrets.

Examples:

* JWT Secret
* MongoDB URI
* SMTP Credentials
* Admin Password

---

# 🚀 CI/CD Pipeline

GitHub Actions automates the deployment workflow.

Pipeline Steps:

1. Push code to GitHub
2. Build Docker Images
3. Push Images to Docker Hub
4. Pull Latest Images
5. Kubernetes Deployment Update

---

# 📦 Kubernetes Resources

* Namespace
* Deployment
* Service
* Secret
* ConfigMap
* Ingress

---

# 📋 Deployment Commands

```bash
kubectl apply -f namespace.yaml

kubectl apply -f mongo-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

kubectl apply -f mongo-service.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-service.yaml

kubectl apply -f ingress.yaml
```

---

# 📊 Verification Commands

```bash
kubectl get pods -n dev

kubectl get svc -n dev

kubectl get ingress -n dev

kubectl get deployments -n dev
```

---

# 🎯 DevOps Workflow

```
Developer
     │
     ▼
GitHub Push
     │
     ▼
GitHub Actions
     │
     ▼
Build Docker Images
     │
     ▼
Push Images to Docker Hub
     │
     ▼
AWS EC2
     │
     ▼
KIND Kubernetes Cluster
     │
     ▼
Deploy MERN Application
```

---

# 📚 Skills Demonstrated

* AWS Cloud
* Terraform
* Ansible
* Docker
* Docker Hub
* GitHub Actions
* Kubernetes
* KIND
* Kubernetes Secrets
* ConfigMaps
* Ingress
* MERN Stack Deployment
* Infrastructure as Code
* Configuration Management
* Continuous Integration
* Continuous Deployment

---

# 📌 Future Improvements

* Deploy on Amazon EKS
* Use AWS Application Load Balancer (ALB)
* Route 53 Integration
* TLS with Cert-Manager
* Prometheus Monitoring
* Grafana Dashboards
* Horizontal Pod Autoscaler (HPA)
* External Secrets with AWS Secrets Manager
* Argo CD (GitOps)

---

# 👨‍💻 Author

**Muhammad Shahid**

DevOps & Cloud Engineer

GitHub: *Add your GitHub profile*

LinkedIn: *Add your LinkedIn profile*
