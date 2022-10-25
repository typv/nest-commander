ps:
	docker-compose ps
build:
	docker-compose up -d --build
up:
	docker-compose up -d
down:
	docker-compose down -v
stop:
	docker-compose stop
node:
	docker-compose exec node bash
db:
	docker-compose exec db bash
install:
	docker-compose exec node npm i
dev:
	docker-compose exec node npm run start:dev
buildNest:
	docker-compose exec node npm run build
setup:
	make build
	docker-compose exec node npm i -g @nestjs/cli
	make install
migrationCreate:
	npm run migrate:create src/database/migrations/$(n)
migrationGen:
	docker-compose exec node npm run migrate:gen src/database/migrations/$(n)
migrate:
	docker-compose exec node npm run migrate:run $(d)
migrationRevert:
	docker-compose exec node npm run migrate:revert
seedConfig:
	docker-compose exec node npm run seed:config
seedRun:
	docker-compose exec node npm run seed:run
seedRunOne:
	docker-compose exec node npm run seed:runOne $(class)
ut:
	docker-compose exec node npm run test
e2e:
	docker-compose exec node npm run test:e2e
genModule:
	docker-compose exec node npx @nestjs/cli g res $(n)