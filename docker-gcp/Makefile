PROJECT_NAME:=evse

.PHONY: all

default: all

dashboard:
	docker stack deploy -c docker-compose.yml $(PROJECT_NAME)

all: dashboard

clean-images:
	docker image prune -f

clean-containers:
	docker stack rm $(PROJECT_NAME)

dist-clean: clean-containers
	docker image prune -a -f
