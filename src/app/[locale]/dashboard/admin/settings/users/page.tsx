"use client";

import { useState } from "react";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  UserPlus,
  Users,
  User,
  UserCog,
  Shield,
  Search,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  ShieldCheck,
  BadgeCheck,
  LockIcon,
  Building,
  Mail,
  Lock,
  KeySquare,
} from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Mock data for demonstration
const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "ADMIN",
    status: "active",
    lastActive: "2023-10-02T14:30:00",
    twoFactorEnabled: true,
  },
  {
    id: "2",
    name: "Certificate Manager",
    email: "manager@institution.com",
    role: "INSTITUTION",
    status: "active",
    lastActive: "2023-10-01T09:15:00",
    twoFactorEnabled: false,
  },
  {
    id: "3",
    name: "Standard User",
    email: "user@example.com",
    role: "USER",
    status: "inactive",
    lastActive: "2023-09-28T11:20:00",
    twoFactorEnabled: false,
  },
  {
    id: "4",
    name: "University Admin",
    email: "admin@university.edu",
    role: "INSTITUTION",
    status: "active",
    lastActive: "2023-10-02T10:45:00",
    twoFactorEnabled: true,
  },
  {
    id: "5",
    name: "New User",
    email: "newuser@example.com",
    role: "USER",
    status: "pending",
    lastActive: "2023-09-30T16:20:00",
    twoFactorEnabled: false,
  },
];

// Mock roles data
const roles = [
  { id: "ADMIN", name: "Administrator", description: "Full system access and management" },
  { id: "INSTITUTION", name: "Institution Manager", description: "Can manage certificates and users for their institution" },
  { id: "USER", name: "Standard User", description: "Can view and verify their own certificates" },
];

// Mock permissions data
const permissions = [
  { id: "1", name: "User Management", description: "Create, update, and delete users" },
  { id: "2", name: "Certificate Creation", description: "Create and issue new certificates" },
  { id: "3", name: "Certificate Verification", description: "Verify certificates in the system" },
  { id: "4", name: "System Settings", description: "Modify system settings and configurations" },
  { id: "5", name: "Institution Management", description: "Create and manage institutions" },
];

// Role permissions mapping
const rolePermissions = {
  ADMIN: ["1", "2", "3", "4", "5"],
  INSTITUTION: ["2", "3"],
  USER: ["3"],
};

export default function UsersSettingsPage() {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "USER",
    password: "",
    confirmPassword: "",
  });

  // Role management state
  const [activeRole, setActiveRole] = useState(roles[0]);
  const [rolePermissionMap, setRolePermissionMap] = useState(rolePermissions);

  const handleAddUser = () => {
    setIsLoading(true);
    
    // Validate form
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill in all required fields");
      setIsLoading(false);
      return;
    }
    
    if (newUser.password !== newUser.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      const id = Math.random().toString(36).substr(2, 9);
      
      setUsers([
        ...users,
        {
          id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: "active",
          lastActive: new Date().toISOString(),
          twoFactorEnabled: false,
        },
      ]);
      
      // Reset form
      setNewUser({
        name: "",
        email: "",
        role: "USER",
        password: "",
        confirmPassword: "",
      });
      
      setIsAddUserOpen(false);
      setIsLoading(false);
      toast.success("User added successfully");
    }, 1000);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsAddUserOpen(true);
    
    // Populate form with user data
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      confirmPassword: "",
    });
  };

  const handleDeleteUser = (userId: string) => {
    // Show confirmation dialog in a real app
    setUsers(users.filter(user => user.id !== userId));
    toast.success("User deleted successfully");
  };

  const handleUpdateRolePermissions = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsRoleDialogOpen(false);
      toast.success(`${activeRole.name} permissions updated successfully`);
    }, 1000);
  };

  const togglePermission = (permissionId: string) => {
    setRolePermissionMap(prev => {
      const role = activeRole.id;
      const currentPerms = [...prev[role as keyof typeof prev]];
      
      if (currentPerms.includes(permissionId)) {
        return {
          ...prev,
          [role]: currentPerms.filter(id => id !== permissionId),
        };
      } else {
        return {
          ...prev,
          [role]: [...currentPerms, permissionId],
        };
      }
    });
  };

  // Filter users based on search query and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      searchQuery === "" || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <SettingsLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Users & Permissions</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsRoleDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Manage Roles
            </Button>
            <Button 
              onClick={() => {
                setEditingUser(null);
                setNewUser({
                  name: "",
                  email: "",
                  role: "USER",
                  password: "",
                  confirmPassword: "",
                });
                setIsAddUserOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              <CardTitle>User Management</CardTitle>
            </div>
            <CardDescription>
              Manage users and their permissions
            </CardDescription>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="INSTITUTION">Institution</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>2FA</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                            {user.name[0].toUpperCase()}
                          </span>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : ''}
                          ${user.role === 'INSTITUTION' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : ''}
                          ${user.role === 'USER' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
                        `}>
                          {user.role === 'ADMIN' ? 'Admin' : user.role === 'INSTITUTION' ? 'Institution' : 'User'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${user.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
                          ${user.status === 'inactive' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' : ''}
                          ${user.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                        `}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(user.lastActive)}</TableCell>
                      <TableCell>
                        {user.twoFactorEnabled ? (
                          <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600 dark:text-red-400">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit User Dialog */}
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? "Update user information and permissions"
                  : "Create a new user and assign permissions"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="INSTITUTION">Institution Manager</SelectItem>
                    <SelectItem value="USER">Standard User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {!editingUser && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={newUser.confirmPassword}
                      onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser} disabled={isLoading}>
                {isLoading ? "Saving..." : editingUser ? "Update User" : "Add User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Management Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Role & Permission Management</DialogTitle>
              <DialogDescription>
                Configure roles and their associated permissions
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="roles" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="roles" className="space-y-4 pt-4">
                <div className="flex space-x-4">
                  <div className="w-1/3 space-y-2 border-r pr-4">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className={`cursor-pointer rounded-md p-2 ${
                          activeRole.id === role.id
                            ? "bg-blue-100 dark:bg-blue-900"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setActiveRole(role)}
                      >
                        <div className="font-medium">{role.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {role.description}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="w-2/3 space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{activeRole.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {activeRole.description}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Permissions</h4>
                      
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{permission.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {permission.description}
                            </div>
                          </div>
                          <Switch
                            checked={rolePermissionMap[activeRole.id as keyof typeof rolePermissionMap].includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="permissions" className="space-y-4 pt-4">
                <div className="space-y-4">
                  {permissions.map((permission) => (
                    <Card key={permission.id}>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{permission.name}</CardTitle>
                            <CardDescription>{permission.description}</CardDescription>
                          </div>
                          <div className="flex space-x-1">
                            {roles.map((role) => (
                              rolePermissionMap[role.id as keyof typeof rolePermissionMap].includes(permission.id) && (
                                <div
                                  key={role.id}
                                  className={`rounded-full px-2 py-1 text-xs font-medium
                                    ${role.id === 'ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : ''}
                                    ${role.id === 'INSTITUTION' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : ''}
                                    ${role.id === 'USER' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
                                  `}
                                >
                                  {role.name}
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRolePermissions} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SettingsLayout>
  );
} 