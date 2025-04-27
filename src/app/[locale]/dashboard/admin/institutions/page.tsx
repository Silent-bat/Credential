import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import InstitutionsList from "./institutions-list";
import { InstitutionType } from "@prisma/client";

type Props = {
  params: {
    locale: string;
  };
};

// Define a type for the institution data structure that includes related entities
type InstitutionWithRelations = {
  id: string;
  name: string;
  type: InstitutionType;
  website: string | null;
  address: string | null;
  phone: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  isApproved: boolean;
  logo: string | null;
  certificates: { id: string }[];
  institutionUsers: {
    user: {
      id: string;
      name: string | null;
      email: string;
    }
  }[];
}

export default async function InstitutionsPage({ params }: Props) {
  const { locale } = params;
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  const institutions = await prisma.institution.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      certificates: {
        select: {
          id: true,
        },
      },
      institutionUsers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        take: 1,
      },
    },
  }) as unknown as InstitutionWithRelations[];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-600 ">Institutions</h1>
          <p className="text-gray-600 mt-2">
            Manage educational institutions in the system
          </p>
        </div>
        <Button asChild>
          <Link href={`/${locale}/dashboard/admin/institutions/new`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Institution
          </Link>
        </Button>
      </div>

      <InstitutionsList 
        initialInstitutions={institutions as any} 
        locale={locale} 
      />
    </div>
  );
} 