check-deps:
	pnpm run check-deps

# Set of tasks related to the database
# --------------------------------------------------
startup-database:
	docker-compose up --build -d database

shutdown-database:
	docker-compose down -v --rmi local database

# Set of tasks related to the monorepo applications
# --------------------------------------------------
startup-all:
	docker-compose up --build -d client server

startup-client:
	docker-compose up --build -d client

startup-server:
	docker-compose up --build -d server

# Shutdown all applications
shutdown-all:
	docker-compose down -v --rmi local client server

shutdown-client:
	docker-compose down -v --rmi local client

shutdown-server:
	docker-compose down -v --rmi local server
