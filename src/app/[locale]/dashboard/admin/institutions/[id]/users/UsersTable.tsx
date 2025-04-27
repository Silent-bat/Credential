"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Mail, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { removeUserFromInstitution, updateUserInstitutionRole } from "./actions";

type InstitutionUser = {
  id: string;
  role: string;
  institutionId: string;
  userId: string;
  User: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: Date;
  };
};

type Props = {
  locale: string;
  institutionId: string;
  institutionName: string;
  institutionUsers: InstitutionUser[];
};

export default function UsersTable({ locale, institutionId, institutionName, institutionUsers }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Institution Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {institutionUsers.map((institutionUser) => (
          <TableRow key={institutionUser.userId}>
            <TableCell className="font-medium">
              {institutionUser.User.name || "No Name"}
            </TableCell>
            <TableCell>{institutionUser.User.email}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                institutionUser.User.role === "ADMIN" 
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" 
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              }`}>
                {institutionUser.User.role}
              </span>
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                institutionUser.role === "ADMIN" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
              }`}>
                {institutionUser.role}
              </span>
            </TableCell>
            <TableCell>
              {new Date(institutionUser.User.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/dashboard/admin/users/${institutionUser.User.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit User
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`mailto:${institutionUser.User.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Email User
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {institutionUser.role === "ADMIN" ? (
                    <form action={async () => {
                      await updateUserInstitutionRole(
                        institutionId,
                        institutionUser.userId,
                        "MEMBER",
                        locale
                      );
                    }}>
                      <DropdownMenuItem className="text-orange-600 dark:text-orange-400" asChild>
                        <button className="w-full flex items-center">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Change to Member
                        </button>
                      </DropdownMenuItem>
                    </form>
                  ) : (
                    <form action={async () => {
                      await updateUserInstitutionRole(
                        institutionId,
                        institutionUser.userId,
                        "ADMIN",
                        locale
                      );
                    }}>
                      <DropdownMenuItem className="text-blue-600 dark:text-blue-400" asChild>
                        <button className="w-full flex items-center">
                          <Pencil className="mr-2 h-4 w-4" />
                          Make Admin
                        </button>
                      </DropdownMenuItem>
                    </form>
                  )}
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-red-600 dark:text-red-400" onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove User
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove {institutionUser.User.name || institutionUser.User.email} from {institutionName}. 
                          They will no longer have access to this institution.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <form action={async () => {
                          await removeUserFromInstitution(
                            institutionId,
                            institutionUser.userId,
                            locale
                          );
                        }}>
                          <AlertDialogAction type="submit" className="bg-red-600 hover:bg-red-700">
                            Remove
                          </AlertDialogAction>
                        </form>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 