const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log("BCDiploma Admin User Creation");
  console.log("============================");

  const email = await question("Admin email: ");
  const name = await question("Admin name (optional): ");
  const password = await question("Admin password: ");

  // Validate inputs
  if (!email || !password) {
    console.error("Email and password are required.");
    process.exit(1);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.error(`User with email ${email} already exists.`);
    process.exit(1);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create admin user
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log(`Admin user created successfully with ID: ${user.id}`);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }

  rl.close();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}); 