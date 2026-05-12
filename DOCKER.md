# Docker

Run the full project with MySQL, NestJS API, and Next.js:

```bash
docker compose up --build
```

Services:

- App: http://localhost:3001
- API: http://localhost:3000/api
- MySQL: localhost:3307

The database is initialized from `docker/mysql/init/01-init.sql` on the first creation of the `mysql_data` volume.

Default admin login:

- Phone: `admin`
- Password: `123456`

If you change the SQL init file after the database has already been created, recreate the database volume:

```bash
docker compose down -v
docker compose up --build
```
