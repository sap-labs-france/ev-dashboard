PROJECT_NAME:=evse

.PHONY: all

default: all

dashboard:
	git submodule update --init --recursive
	docker-compose -p $(PROJECT_NAME) up -d

all: dashboard

clean-containers:
	-docker-compose -p $(PROJECT_NAME) down

clean-images:
	-docker rmi $(PROJECT_NAME)_dashboard

clean: clean-containers clean-images

dist-clean-images:
	docker image prune -a -f

dist-clean-volumes:
	docker volume prune -f

dist-clean: clean-containers dist-clean-volumes dist-clean-images
