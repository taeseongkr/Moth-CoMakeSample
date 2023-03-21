#
# Makefile for spider-device
#
ORG=cojam
NAME=moth-new
#NAME=spider-arm
BASE=$(ORG)/$(NAME)
VERSION=0.0.1
BUILD=$(VERSION).1
DIST=alpine-3.14
IMAGE=$(BASE):$(BUILD)-$(DIST)
PORT=3477
#----------------------------------------------------------------------------------
MYIP=192.168.0.22
REALM=moth.cojam.kr
USERS="teamgrit=teamgrit8266"

#----------------------------------------------------------------------------------
usage:
	@echo "usage: make [docker|compose] for $(NAME)"
#----------------------------------------------------------------------------------
docker d:
	@echo "> make (docker) [build|run|kill|ps] for $(IMAGE)"

docker-build db:
	docker build -t $(IMAGE) .

docker-run dr:
	docker run -d \
        -p 8276:8276 \
        -p 8277:8277 \
        -v $(PWD)/conf:/moth/conf \
        -v $(PWD)/cert:/moth/cert \
        --name $(NAME) $(IMAGE)

docker-run-base drb:
	docker run -d \
        -p $(PORT):$(PORT) \
        --name $(NAME) $(IMAGE)

docker-exec dx:
	docker exec -it $(NAME) /bin/bash

docker-kill dk:
	docker stop $(NAME) && docker rm $(NAME)

docker-test dt:
	docker inspect --format "{{json .State.Health }}" $(IMAGE) | jq

docker-logs dl:
	docker logs $(NAME) -f

docker-ps dp:
	docker ps -a

docker-image di:
	docker images $(BASE)

docker-security ds:
	docker scan $(IMAGE)

docker-push du:
	docker push $(IMAGE)

docker-build-push dbu:
	docker build -t $(IMAGE) .
	docker push $(IMAGE)

docker-clean dc:
	docker system prune -f
	docker network prune -f
	docker volume prune -f
#----------------------------------------------------------------------------------
COMPOSE=docker-compose.yml

compose c:
	@echo "> make (compose) [run|kill|ps] with $(COMPOSE)"

compose-run cr:
	docker-compose -f $(COMPOSE) up -d

compose-kill ck:
	docker-compose -f $(COMPOSE) down

compose-exec ce:
	docker-compose -f $(COMPOSE) exec spider spider -rtype=monitor

compose-ps cp:
	docker-compose ps

compose-logs cl:
	docker-compose logs -f
#----------------------------------------------------------------------------------

