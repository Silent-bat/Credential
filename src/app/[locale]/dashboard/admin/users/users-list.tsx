'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PencilIcon, TrashIcon, MoreVertical, Lock, UserCog, Building, Mail, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface UserInstitution {
  institutionId: string;
  institution: {
    name: string;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  institutionUsers?: UserInstitution[];
}

interface UsersListProps {
  initialUsers: User[];
  locale: string;
}

export default function UsersList({ initialUsers, locale }: UsersListProps) {
  const [users] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [institutionFilter, setInstitutionFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'email'>('newest');

  // Extract all unique institutions for the filter dropdown
  const institutions = useMemo(() => {
    const uniqueInstitutions = new Map<string, string>();
    
    users.forEach(user => {
      if (user.institutionUsers && user.institutionUsers.length > 0) {
        user.institutionUsers.forEach(inst => {
          if (inst.institution?.name) {
            uniqueInstitutions.set(inst.institutionId, inst.institution.name);
          }
        });
      }
    });
    
    return Array.from(uniqueInstitutions).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  // Apply filters and sorting
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      if (searchQuery && 
          !((user.name || '') + user.email).toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Role filter
      if (roleFilter && roleFilter !== "all" && user.role !== roleFilter) {
        return false;
      }

      // Institution filter
      if (institutionFilter && institutionFilter !== "all" && 
          (!user.institutionUsers || 
          !user.institutionUsers.some(inst => inst.institutionId === institutionFilter))) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by selected option
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'email') {
        return a.email.localeCompare(b.email);
      }
      return 0;
    });
  }, [users, searchQuery, roleFilter, institutionFilter, sortBy]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setRoleFilter("all");
    setInstitutionFilter("all");
    setSortBy('newest');
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              A list of all users registered in the system.
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-2">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'name' | 'email')}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="name">By name</SelectItem>
                  <SelectItem value="email">By email</SelectItem>
                </SelectContent>
              </Select>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Users</SheetTitle>
                    <SheetDescription>
                      Narrow down users by applying filters
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="role">User Role</Label>
                      <Select
                        value={roleFilter}
                        onValueChange={(value) => setRoleFilter(value)}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="All roles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All roles</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="INSTITUTION">Institution</SelectItem>
                          <SelectItem value="USER">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {institutions.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="institution">Institution</Label>
                        <Select
                          value={institutionFilter}
                          onValueChange={(value) => setInstitutionFilter(value)}
                        >
                          <SelectTrigger id="institution">
                            <SelectValue placeholder="All institutions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All institutions</SelectItem>
                            {institutions.map((inst) => (
                              <SelectItem key={inst.id} value={inst.id}>
                                {inst.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  <SheetFooter>
                    <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
                    <SheetClose asChild>
                      <Button type="submit">Apply Filters</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  Role
                </th>
                <th scope="col" className="px-6 py-3">
                  Institution
                </th>
                <th scope="col" className="px-6 py-3">
                  Date Joined
                </th>
                <th scope="col" className="px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {user.name || "No Name"}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === "ADMIN" 
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" 
                          : user.role === "INSTITUTION" 
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.institutionUsers && user.institutionUsers.length > 0 ? (
                        <div className="space-x-1">
                          {user.institutionUsers.map((inst, index) => (
                            <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                              {inst.institution?.name || "Unknown"}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      <Link href={`/${locale}/dashboard/admin/users/${user.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Manage</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Link href={`/${locale}/dashboard/admin/users/${user.id}/edit`} className="flex items-center text-gray-700 dark:text-gray-200">
                              <PencilIcon className="mr-2 h-4 w-4" />
                              <span>Edit User</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/${locale}/dashboard/admin/users/${user.id}/permissions`} className="flex items-center text-gray-700 dark:text-gray-200">
                              <UserCog className="mr-2 h-4 w-4" />
                              <span>Edit Permissions</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/${locale}/dashboard/admin/users/${user.id}/reset-password`} className="flex items-center text-gray-700 dark:text-gray-200">
                              <Lock className="mr-2 h-4 w-4" />
                              <span>Reset Password</span>
                            </Link>
                          </DropdownMenuItem>
                          {user.institutionUsers && user.institutionUsers.length > 0 && (
                            <DropdownMenuItem>
                              <Link 
                                href={`/${locale}/dashboard/admin/institutions/${user.institutionUsers[0].institutionId}`}
                                className="flex items-center text-gray-700 dark:text-gray-200"
                              >
                                <Building className="mr-2 h-4 w-4" />
                                <span>View Institution: {user.institutionUsers[0].institution?.name}</span>
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <a 
                              href={`mailto:${user.email}`}
                              className="flex items-center text-gray-700 dark:text-gray-200"
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              <span>Send Email</span>
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 dark:hover:text-red-400">
                            <TrashIcon className="mr-2 h-4 w-4" />
                            <span>Delete User</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </CardContent>
    </Card>
  );
} 