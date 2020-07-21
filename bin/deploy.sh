docker stop bot
docker rm bot
docker rmi bot
docker build -t bot .
docker run -d --name bot --env-file .env --restart=always bot