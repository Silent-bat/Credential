import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { addUserToInstitution } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Dashboard' });
  return {
    title: t('users.addUser.title'),
  };
}

export default async function AddUserPage({ params }: { params: { locale: string } }) {
  const session = await auth();
  const user = session?.user;

  // Redirect unauthenticated users or non-institution users
  if (!user || !user.role?.toUpperCase()?.includes('INSTITUTION')) {
    redirect(`/${params.locale}/auth/login`);
  }

  // Get the institution that the current user is an admin of
  const institutionUser = await prisma.institutionUser.findFirst({
    where: {
      userId: user.id,
      role: "ADMIN",
    },
    include: {
      institution: true,
    },
  });

  // If the user is not an admin of any institution, redirect to dashboard
  if (!institutionUser) {
    redirect(`/${params.locale}/dashboard`);
  }

  const t = await getTranslations({ locale: params.locale, namespace: 'Dashboard' });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('users.addUser.title')}</h1>
        <Link href={`/${params.locale}/dashboard/institution/users`}>
          <Button variant="outline">{t('common.back')}</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('users.addUser.formTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addUserToInstitution} className="space-y-4">
            {/* Hidden field for institutionId */}
            <input 
              type="hidden" 
              name="institutionId" 
              value={institutionUser.institutionId} 
            />
            {/* Hidden field for locale */}
            <input 
              type="hidden" 
              name="locale" 
              value={params.locale} 
            />

            <div className="grid gap-2">
              <Label htmlFor="email">{t('users.addUser.emailLabel')}</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder={t('users.addUser.emailPlaceholder')} 
                required 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">{t('users.addUser.nameLabel')}</Label>
              <Input 
                id="name" 
                name="name" 
                type="text" 
                placeholder={t('users.addUser.namePlaceholder')} 
              />
              <p className="text-sm text-gray-500">{t('users.addUser.nameHint')}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">{t('users.addUser.roleLabel')}</Label>
              <Select name="role" defaultValue="MEMBER">
                <SelectTrigger>
                  <SelectValue placeholder={t('users.addUser.rolePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">{t('users.roles.admin')}</SelectItem>
                  <SelectItem value="MEMBER">{t('users.roles.member')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">{t('users.addUser.submit')}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 