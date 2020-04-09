PROJECT_NAME?=evse
NAME:=dashboard
DOCKER_ECR_REGISTRY?=166296450311.dkr.ecr.eu-west-3.amazonaws.com
DOCKER_ECR_REGION?=eu-west-3
DOCKER_ECR_REGISTRY_NAME?=ev_dashboard

.PHONY: all

default: all

submodule-update:
	git submodule update --init --recursive

$(NAME): submodule-update
	docker-compose -p $(PROJECT_NAME) up -d

$(NAME)-force: submodule-update
	docker-compose -p $(PROJECT_NAME) up -d --build --force-recreate

all: $(NAME)

clean-containers:
	-docker-compose -p $(PROJECT_NAME) down

clean-images:
	-docker rmi $(PROJECT_NAME)_$(NAME)

clean: clean-containers clean-images

docker-ecr-tag:
	docker tag $(PROJECT_NAME)_$(NAME):latest $(DOCKER_ECR_REGISTRY)/$(DOCKER_ECR_REGISTRY_NAME):latest

docker-ecr-push: $(NAME)-force docker-ecr-tag
	aws ecr get-login-password --region $(DOCKER_ECR_REGION) | docker login --username AWS --password-stdin $(DOCKER_ECR_REGISTRY)/$(DOCKER_ECR_REGISTRY_NAME)
	docker push $(DOCKER_ECR_REGISTRY)/$(DOCKER_ECR_REGISTRY_NAME):latest

dist-clean-images:
	docker image prune -a -f

dist-clean-volumes:
	docker volume prune -f

dist-clean: clean-containers dist-clean-volumes dist-clean-images
