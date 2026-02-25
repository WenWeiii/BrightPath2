# Makefile for common build, tag, push and deploy tasks
PROJECT ?= $(shell gcloud config get-value project 2>/dev/null)
REGION ?= us-central1
TAG ?= latest
REPO ?= $(REGION)-docker.pkg.dev/$(PROJECT)/brightpath-repo

.PHONY: all build-frontend build-backend push-frontend push-backend push-all deploy-backend deploy-frontend deploy-all

all: build-all

build-frontend:
	docker build -t brightpath-frontend:local frontend/

build-backend:
	docker build -t brightpath-backend:local backend/

build-all: build-frontend build-backend

push-frontend:
	docker tag brightpath-frontend:local $(REPO)/brightpath-frontend:$(TAG)
	docker push $(REPO)/brightpath-frontend:$(TAG)

push-backend:
	docker tag brightpath-backend:local $(REPO)/brightpath-backend:$(TAG)
	docker push $(REPO)/brightpath-backend:$(TAG)

push-all: push-frontend push-backend

deploy-backend:
	gcloud run deploy brightpath-backend \
		--image $(REPO)/brightpath-backend:$(TAG) \
		--region $(REGION) --platform managed --allow-unauthenticated

deploy-frontend:
	gcloud run deploy brightpath-frontend \
		--image $(REPO)/brightpath-frontend:$(TAG) \
		--region $(REGION) --platform managed --allow-unauthenticated

deploy-all: deploy-backend deploy-frontend
