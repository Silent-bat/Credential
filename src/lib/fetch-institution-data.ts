import prisma from "@/lib/db";

type InstitutionData = {
  institutionId: string | null;
  staffCount: number;
  certificatesCount: number;
  pendingCertificatesCount: number;
  ticketsCount: number;
  dbConnectionError: boolean;
};

export async function fetchInstitutionData(userId: string): Promise<InstitutionData> {
  // Initialize with default values
  const data: InstitutionData = {
    institutionId: null,
    staffCount: 0,
    certificatesCount: 0,
    pendingCertificatesCount: 0,
    ticketsCount: 0,
    dbConnectionError: false,
  };
  
  try {
    // First, check if prisma is properly initialized
    if (!prisma) {
      throw new Error("Prisma client is not properly initialized");
    }

    // First, get the institution ID for this admin
    const institutionUser = await prisma.institutionUser.findFirst({
      where: {
        userId: userId,
      },
      select: {
        institutionId: true,
      },
    });
    
    data.institutionId = institutionUser?.institutionId || null;
    
    if (data.institutionId) {
      try {
        // Count staff members
        const staffCount = await prisma.institutionUser.count({
          where: {
            institutionId: data.institutionId,
          },
        });
        data.staffCount = staffCount;
      } catch (error) {
        console.error("Error counting staff:", error);
      }
      
      try {
        // Count certificates
        const certificatesCount = await prisma.certificate.count({
          where: {
            institutionId: data.institutionId,
          }
        });
        data.certificatesCount = certificatesCount;
      } catch (error) {
        console.error("Error counting certificates:", error);
      }
      
      try {
        // Count pending certificates  
        const pendingCertificatesCount = await prisma.certificate.count({
          where: {
            institutionId: data.institutionId,
            status: "ISSUED",
          }
        });
        data.pendingCertificatesCount = pendingCertificatesCount;
      } catch (error) {
        console.error("Error counting pending certificates:", error);
      }
      
      try {
        // Count support tickets
        const ticketsCount = await prisma.ticket.count({
          where: {
            userId: userId,
          }
        });
        data.ticketsCount = ticketsCount;
      } catch (error) {
        console.error("Error counting tickets:", error);
      }
    }
  } catch (error) {
    console.error("Database connection error:", error);
    data.dbConnectionError = true;
  }
  
  return data;
}

export async function fetchInstitutionUsers(userId: string) {
  let users = [];
  let dbConnectionError = false;
  let institutionId = null;
  
  try {
    // Check if prisma is properly initialized
    if (!prisma) {
      throw new Error("Prisma client is not properly initialized");
    }

    // First, get the institution ID for this admin
    const institutionUser = await prisma.institutionUser.findFirst({
      where: {
        userId: userId,
      },
      select: {
        institutionId: true,
      },
    });
    
    institutionId = institutionUser?.institutionId;
    
    if (institutionId) {
      // Fetch users associated with this institution
      const institutionUsers = await prisma.institutionUser.findMany({
        where: {
          institutionId,
        },
        include: {
          user: true,
        },
      });
      
      users = institutionUsers.map(iu => ({
        id: iu.userId,
        name: iu.user.name,
        email: iu.user.email,
        role: iu.role,
        createdAt: iu.createdAt ? iu.createdAt.toISOString() : null,
        status: "active", // Assuming active if they're in the system
      }));
      
      // Fetch pending invitations too
      const pendingInvitations = await prisma.invitation.findMany({
        where: {
          institutionId,
          status: "PENDING",
        },
      });
      
      // Add pending invitations to users list
      pendingInvitations.forEach(invitation => {
        users.push({
          id: invitation.id,
          name: "Invited User",
          email: invitation.email,
          role: invitation.role,
          createdAt: invitation.createdAt ? invitation.createdAt.toISOString() : null,
          status: "pending",
        });
      });
    }
  } catch (error) {
    console.error("Database connection error:", error);
    dbConnectionError = true;
  }
  
  return { users, dbConnectionError, institutionId };
} 