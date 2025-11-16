SHELL := /bin/bash

.PHONY: install test up down logs clean docker-build

install:
	npm install --prefix mf-back
	npm install --prefix journey-simulator

test:
	npm test --prefix mf-back

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f api

clean:
	docker compose down -v || true
	docker system prune -f
	rm -rf mf-back/node_modules journey-simulator/node_modules

docker-build:
	docker build --build-arg INSTALL_DEV=false -t journey-mf-back:latest mf-back

