# Credential Verifier

A secure platform for issuing, managing, and verifying academic credentials.

## Features

- Issue digital credentials with blockchain verification
- Multi-language support
- User role management (Admin, Institution, User)
- Dashboard for each user type
- Certificate verification system

## Development Setup

### Prerequisites

- Node.js 16.x or later
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/credential-verifier.git
cd credential-verifier
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the `.env` file with your database credentials and other configurations

```bash
cp .env.example .env
```

### Database Setup

This application uses PostgreSQL with Prisma ORM. You need to set up your database properly:

1. Create a PostgreSQL database (locally or using a service like Neon, Supabase, etc.)

2. Update your `.env` file with the database connection string:
```
DATABASE_URL="postgresql://username:password@localhost:5432/credential_db?schema=public"
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

### Common Database Issues

If you encounter the error `Can't reach database server at...`, check the following:

1. **Connection String Format**: Make sure your DATABASE_URL in the .env file is correctly formatted.

2. **Database Server**: Ensure your PostgreSQL server is running.

3. **Firewall/Network**: Check if there are any firewall rules blocking the connection.

4. **For Neon.tech Users**: 
   - Make sure your project is active (not in sleep mode)
   - Check if your IP is whitelisted if IP restrictions are enabled
   - Verify your connection credentials (username/password)

5. **Connection Pooling**: If using a connection pooler, make sure it's configured correctly.

### Running the Application

1. Start the development server:
```bash
npm run dev
# or
yarn dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `src/app` - Next.js application routes and pages
- `src/components` - Reusable React components
- `src/lib` - Utility functions and shared code
- `prisma` - Database schema and migrations
- `public` - Static files
- `src/i18n` - Internationalization files

## Deployment

The application can be deployed to Vercel, Netlify, or any other platform supporting Next.js.

1. Configure your deployment platform to set the required environment variables
2. Deploy the application following your platform's guidelines

### Deploying with Vercel

```bash
npm install -g vercel
vercel
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Next.js and React teams
- Prisma team
- OpenAI for assistance in development
