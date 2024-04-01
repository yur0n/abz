# abz

## 1. Rename and Configure Environment Variables

1. Rename the file named `EXAMPLE.env` to `.env`.
2. Edit the variables within the renamed `.env` file according to your specific configuration.

## 2. Run the Application

1. Run `docker compose up` to pull the required Docker images and start the containers.
```bash
docker compose up -d
```
2. You can always build by yourself with provided server and client using `docker compose build` command.
```bash
docker compose build
```
3. Inside the server container, `prisma migrate` and `prisma seed` have to be executed manually
```bash
docker exec -it server npx prisma migrate dev --name init
docker exec -it server npx prisma db seed
```

## Additional information

**CORS:**

- The CORS configuration restricts API server requests to those originating from `CLIENT_ORIGIN` specified in `.env` file. Remember to replace this placeholder with your actual client domain.

**TLS:**

- TLS for both the server and client is currently omitted.  You'll need to implement it manually to ensure secure communication.