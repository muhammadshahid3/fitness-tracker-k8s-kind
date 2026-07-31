# Pulse — Fitness Tracker (MERN Stack) — Deployment Guide

Ye README isliye likha gaya hai taake pura deployment flow samajh aaye —
pehle **Terraform** se AWS EC2 infra banaya, phir usi infra ko **Ansible**
se configure kiya, phir EC2 per **Kind (Kubernetes in Docker)** install
kiya, aur phir uss cluster per app ka **Kubernetes deployment** kiya.

---

## Project Overview

Pulse ek full-stack fitness tracking app hai (MongoDB + Express + React +
Node). Iska deployment 4 stages mein hota hai:

1. Terraform → Infra (EC2 instance) banana
2. Ansible → Uss EC2 ko configure karna (Docker, Kind, kubectl install)
3. Kind → EC2 ke andar hi ek Kubernetes cluster banana
4. Kubectl (K8s manifests) → App ko cluster per deploy karna + monitoring setup

---

## Stage 1 — Terraform se Infra Banana

Sab se pehle Terraform ka use karke AWS per infra (EC2 instance + security
group + key pair) throw kiya gaya hai. Ye sab `terraform/` folder mein hai:

```
terraform/
├── providers.tf     # AWS provider + region (ap-south-1)
├── ec2.tf           # EC2 instance, security group, key pair
└── outputs.tf       # EC2 public/private IP output
```

`ec2.tf` mein ye resources define hain:

- `aws_default_vpc` — default VPC use hoti hai
- `aws_key_pair` — SSH key (`terrakey.pub`) EC2 per attach hoti hai
- `aws_security_group` — sirf SSH (port 22) allow hai
- `aws_instance` — `t3.xlarge` instance, 20GB gp3 root volume

### Terraform Commands

```bash
cd terraform

# Terraform ko initialize karna (provider download karega)
terraform init

# Pehle dekh lo kya banega
terraform plan

# Ab actual infra create karo
terraform apply -auto-approve

# Output mein EC2 ka public IP milega
terraform output
```

Iske baad AWS per ek EC2 instance ready ho jata hai jisko hum next stage
mein configure karenge.

---

## Stage 2 — Ansible se Infra Configure Karna

Terraform se jo EC2 bana, usi ko ab **Ansible** ke through configure kiya
gaya hai. Sab kuch `ansible/` folder mein hai:

```
ansible/
├── ansible.conf        # inventory + SSH key config
├── hosts.yml            # EC2 ka IP + SSH user (ubuntu)
├── playbook.yml         # Docker, Kind, kubectl install
├── kind.yml              # Kind cluster create karna
├── create-kind.yml       # Kind config file copy karna
├── node_exporter.yml     # Monitoring: Node Exporter install
├── prometheus.yml        # Monitoring: Prometheus install
└── grafana.yml           # Monitoring: Grafana install
```

`hosts.yml` mein Terraform wala EC2 public IP daala jata hai, aur
`terrakey` (Terraform se banai gayi SSH key) use hoti hai connect karne ke
liye.

### Ansible Commands

```bash
cd ansible

# Connectivity test
ansible -i hosts.yml all -m ping

# Docker + Kind + kubectl install karna EC2 per
ansible-playbook -i hosts.yml playbook.yml

# Monitoring stack install karna (optional)
ansible-playbook -i hosts.yml node_exporter.yml
ansible-playbook -i hosts.yml prometheus.yml
ansible-playbook -i hosts.yml grafana.yml
```

`playbook.yml` ye kaam karta hai:

- apt cache update
- Docker install + start + `ubuntu` user ko docker group mein add
- System architecture detect karna (amd64/arm64)
- Kind binary download karna (`/usr/local/bin/kind`)
- Latest kubectl download karna (`/usr/local/bin/kubectl`)
- Docker, Kind, kubectl versions verify karna

---

## Stage 3 — Kind Se Kubernetes Install Karna (EC2 Per)

Ansible ne Docker aur Kind install kar diya, ab usi playbook (`kind.yml`)
ke through EC2 ke andar hi Kind ka use karke ek local Kubernetes cluster
banaya gaya hai:

```bash
ansible-playbook -i hosts.yml kind.yml
```

Ye playbook:

1. `kind.yaml` config file ko EC2 per copy karta hai
2. Check karta hai ke `tws-cluster` naam ka cluster pehle se hai ya nahi
3. Agar nahi hai to `kind create cluster --config=/tmp/kind.yaml` chalata hai
4. Nodes ke Ready hone ka wait karta hai
5. `kubectl get nodes -o wide` se cluster status dikhata hai

Is stage ke baad EC2 instance ke andar ek fully working Kubernetes cluster
ready hota hai (Kind = Kubernetes IN Docker).

---

## Stage 4 — Kubernetes Operations (App Deploy Karna)

Ab jab cluster ready hai, to `k8s/` folder ke manifests use karke poori
app deploy ki gayi hai:

```
k8s/
├── namespace.yaml          # "dev" namespace banana
├── pv.yaml                 # Persistent Volume (10Gi)
├── pvc.yaml                # Persistent Volume Claim (4Gi)
├── mongodb.yaml             # MongoDB StatefulSet
├── mongo-service.yaml        # MongoDB headless service
├── backend.yaml              # Backend Deployment (Node/Express)
├── backend-service.yaml       # Backend NodePort service (30050)
├── frontend.yaml               # Frontend Deployment (React + nginx)
└── frontend-service.yaml        # Frontend NodePort service
```

### Kubectl Commands (EC2 per, SSH karke)

```bash
# EC2 per SSH karo (Terraform ki key se)
ssh -i terrakey ubuntu@<EC2_PUBLIC_IP>

# Namespace banao
kubectl apply -f namespace.yaml

# Storage setup
kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml

# Secrets banao (JWT_SECRET, MONGO_URI, SMTP creds, ADMIN_PASSWORD)
kubectl create secret generic fitness-secret -n dev \
  --from-literal=JWT_SECRET=<value> \
  --from-literal=MONGO_URI=<value> \
  --from-literal=SMTP_USER=<value> \
  --from-literal=SMTP_PASS=<value> \
  --from-literal=ADMIN_PASSWORD=<value>

# Database deploy karo
kubectl apply -f mongodb.yaml
kubectl apply -f mongo-service.yaml

# Backend deploy karo
kubectl apply -f backend.yaml
kubectl apply -f backend-service.yaml

# Frontend deploy karo
kubectl apply -f frontend.yaml
kubectl apply -f frontend-service.yaml

# Status check karo
kubectl get all -n dev
kubectl get pods -n dev -w
```

App ke components:

| Component | Type            | Namespace | Notes                          |
|-----------|------------------|-----------|---------------------------------|
| mongo     | StatefulSet      | dev       | 10Gi PVC, headless service      |
| backend   | Deployment       | dev       | NodePort 30050, port 5000       |
| frontend  | Deployment       | dev       | NodePort, port 80               |

---

## Poora Flow — Summary

```
Terraform (infra banao)
      │  terraform init / plan / apply
      ▼
   AWS EC2 (Ubuntu) ready
      │
      ▼
Ansible (usi EC2 ko configure karo)
      │  ansible-playbook playbook.yml
      ▼
Docker + Kind + kubectl installed
      │
      ▼
Kind (EC2 ke andar Kubernetes cluster banao)
      │  ansible-playbook kind.yml
      ▼
Local K8s cluster (tws-cluster) ready
      │
      ▼
kubectl apply -f k8s/  (Namespace → PV/PVC → Mongo → Backend → Frontend)
      │
      ▼
App live on EC2 Public IP : NodePort
```

---

## Monitoring (Extra)

Ansible playbooks se EC2 per monitoring bhi setup ki gayi hai:

- **Node Exporter** — system metrics expose karta hai (port 9100)
- **Prometheus** — metrics scrape/store karta hai (port 9090)
- **Grafana** — dashboards ke liye

```bash
ansible-playbook -i hosts.yml node_exporter.yml
ansible-playbook -i hosts.yml prometheus.yml
ansible-playbook -i hosts.yml grafana.yml
```