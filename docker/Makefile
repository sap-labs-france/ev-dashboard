PROJECT_NAME:=evse

.PHONY: all

default: all

dashboard:
	docker-compose -p $(PROJECT_NAME) up -d

all: dashboard

clean-images:
	docker image prune -f

clean-containers:
	-docker-compose -p $(PROJECT_NAME) down

dist-clean: clean-containers
	docker image prune -a -f