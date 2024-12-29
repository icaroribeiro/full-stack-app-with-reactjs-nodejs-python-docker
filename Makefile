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
startup-client:
	docker-compose up --build -d client

startup-server1:
	docker-compose up --build -d server1

startup-server2:
	docker-compose up --build -d server2

# Shutdown all applications
shutdown-client:
	docker-compose down -v --rmi local client

shutdown-server1:
	docker-compose down -v --rmi local server1

shutdown-server2:
	docker-compose down -v --rmi local server2
