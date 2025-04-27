import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clear the database first
  await prisma.invitation.deleteMany()
  await prisma.passwordReset.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.institutionUser.deleteMany()
  await prisma.institution.deleteMany()
  await prisma.user.deleteMany()

  console.log('Database cleared')

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: await bcrypt.hash('password123', 10),
      role: 'ADMIN',
    },
  })

  console.log('Created admin:', admin)

  // Create institutions with different statuses
  const institutions = await Promise.all([
    // Approved institution
    prisma.institution.create({
      data: {
        name: 'State University',
        description: 'A premier state university offering quality education since 1980',
        logo: 'https://example.com/logo1.png',
        website: 'https://stateuniversity.edu',
        address: '123 University Avenue, State City, SC 12345',
        phone: '+1 (555) 123-4567',
        status: 'APPROVED',
        isApproved: true,
        type: 'UNIVERSITY',
      },
    }),
    // Pending institution
    prisma.institution.create({
      data: {
        name: 'Technology Institute',
        description: 'Focused on technology education and innovation',
        logo: 'https://example.com/logo2.png',
        website: 'https://techinstitute.edu',
        address: '456 Tech Boulevard, Innovation Park, IP 67890',
        phone: '+1 (555) 987-6543',
        status: 'PENDING',
        isApproved: false,
        type: 'TRAINING_CENTER',
      },
    }),
    // Rejected institution
    prisma.institution.create({
      data: {
        name: 'Dubious College',
        description: 'An unaccredited institution',
        logo: 'https://example.com/logo3.png',
        website: 'https://dubiouscollege.com',
        address: '789 Questionable Road, Skeptic Town, ST 54321',
        phone: '+1 (555) 555-5555',
        status: 'REJECTED',
        isApproved: false,
        type: 'COLLEGE',
      },
    }),
  ])

  console.log('Created institutions:', institutions)

  // Create institution admin users
  const institutionAdmins = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@stateuniversity.edu',
        name: 'University Admin',
        password: await bcrypt.hash('password123', 10),
        role: 'INSTITUTION',
        institutionUsers: {
          create: {
            institutionId: institutions[0].id,
            role: 'ADMIN',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@techinstitute.edu',
        name: 'Tech Institute Admin',
        password: await bcrypt.hash('password123', 10),
        role: 'INSTITUTION',
        institutionUsers: {
          create: {
            institutionId: institutions[1].id,
            role: 'ADMIN',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@dubiouscollege.com',
        name: 'Dubious College Admin',
        password: await bcrypt.hash('password123', 10),
        role: 'INSTITUTION',
        institutionUsers: {
          create: {
            institutionId: institutions[2].id,
            role: 'ADMIN',
          },
        },
      },
    }),
  ])

  console.log('Created institution admins:', institutionAdmins)

  // Create regular users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'student1@example.com',
        name: 'Student One',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'student2@example.com',
        name: 'Student Two',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'student3@example.com',
        name: 'Student Three',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      },
    }),
  ])

  console.log('Created users:', users)

  // Associate one user with the approved institution
  const institutionUser = await prisma.institutionUser.create({
    data: {
      userId: users[0].id,
      institutionId: institutions[0].id,
      role: 'STAFF',
    },
  })

  console.log('Associated user with institution:', institutionUser)

  // Create certificates for the approved institution
  const now = new Date()
  const oneYearLater = new Date(now)
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

  const certMetadata1 = JSON.stringify({
    skills: ['Programming', 'Software Design', 'Algorithms'],
    title: 'Bachelor of Computer Science',
    description: 'Awarded for completing the requirements of the Computer Science program',
    recipientName: 'Student One',
    recipientEmail: 'student1@example.com',
    issueDate: now.toISOString(),
    institution: {
      id: institutions[0].id,
      name: institutions[0].name,
    },
    additionalFields: {
      GPA: '3.9',
      Honors: 'Magna Cum Laude',
    },
    issuedBy: 'University Admin',
    issuedAt: now.toISOString(),
  })

  const certMetadata2 = JSON.stringify({
    skills: ['Software Engineering', 'Project Management', 'Testing'],
    title: 'Software Engineering Certification',
    description: 'Certification in advanced software engineering practices',
    recipientName: 'Student Two',
    recipientEmail: 'student2@example.com',
    issueDate: now.toISOString(),
    institution: {
      id: institutions[0].id,
      name: institutions[0].name,
    },
    additionalFields: {
      Grade: 'A',
      Duration: '6 months',
    },
    issuedBy: 'University Admin',
    issuedAt: now.toISOString(),
  })

  const certificates = await Promise.all([
    // Verified certificate
    prisma.certificate.create({
      data: {
        title: 'Bachelor of Computer Science',
        description: 'Awarded for completing the requirements of the Computer Science program',
        recipientName: 'Student One',
        recipientEmail: 'student1@example.com',
        issueDate: now,
        institutionId: institutions[0].id,
        metadata: certMetadata1,
        blockchainTxId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        pdfUrl: 'https://example.com/certificates/1.pdf',
        pdfHash: 'abcdef1234567890',
        type: 'DEGREE',
        status: 'ISSUED',
      },
    }),
    // Pending certificate
    prisma.certificate.create({
      data: {
        title: 'Software Engineering Certification',
        description: 'Certification in advanced software engineering practices',
        recipientName: 'Student Two',
        recipientEmail: 'student2@example.com',
        issueDate: now,
        expiryDate: oneYearLater,
        institutionId: institutions[0].id,
        metadata: certMetadata2,
        type: 'CERTIFICATE',
        status: 'ISSUED',
      },
    }),
  ])

  console.log('Created certificates:', certificates)

  // Return summary of created data
  return {
    admin,
    institutions,
    institutionAdmins,
    users,
    certificates,
  }
}

main()
  .then(async (data) => {
    console.log('Seed data completed:')
    console.log('Admin user:', data.admin.email)
    console.log('Password for all users:', 'password123')
    console.log('Number of institutions:', data.institutions.length)
    console.log('Number of users:', data.users.length + data.institutionAdmins.length + 1) // +1 for admin
    console.log('Number of certificates:', data.certificates.length)
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 