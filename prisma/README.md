# Prisma PostgreSQL Setup

This directory contains the Prisma schema and database migrations for the credential management system.

## PostgreSQL Setup

1. Make sure you have PostgreSQL installed and running on your system:
   - [Download PostgreSQL](https://www.postgresql.org/download/)

2. Create a new PostgreSQL database:
   ```bash
   createdb credential_db
   ```

3. Create a `.env` file in the project root with your PostgreSQL connection URL:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/credential_db?schema=public"
   ```
   
   Replace `username`, `password`, and other values with your actual PostgreSQL credentials.

## Prisma Commands

### Generate Prisma Client
```bash
npx prisma generate
```

### Apply Migrations to Database
```bash
npx prisma migrate dev
```

### Seed the Database
```bash
npx prisma db seed
```

### View Database (Prisma Studio)
```bash
npx prisma studio
```

## Switching from SQLite to PostgreSQL

If you're migrating from SQLite to PostgreSQL:

1. Create your PostgreSQL database
2. Update the DATABASE_URL in your .env file
3. Run the following to create the tables in PostgreSQL:
   ```bash
   npx prisma migrate deploy
   ```
4. To seed the database with initial data:
   ```bash
   npx prisma db seed
   ```