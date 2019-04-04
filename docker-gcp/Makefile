PROJECT_NAME:=evse

.PHONY: all

default: all

dashboard:
	docker stack deploy -c docker-compose.yml $(PROJECT_NAME)

all: dashboard

clean-containers:
	docker stack rm $(PROJECT_NAME)

dist-clean-images:
	docker image prune -a -f

dist-clean: clean-containers dist-clean-images
