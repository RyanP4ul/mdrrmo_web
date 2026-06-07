'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Pencil,
  Trash2,
  UserPlus,
  Phone,
  CheckCircle2,
  XCircle,
  Eye,
  FileUp,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { mockUsers, mockResidents } from '@/lib/mock-data';
import type { User, Role, UserStatus, RegistrationStatus } from '@/lib/types';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 8;

// ── Badge helpers ────────────────────────────────────────────────────────────

function getRoleBadge(role: Role) {
  const styles: Record<Role, string> = {
    admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    dispatcher: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
    'driver/responder': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    resident: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  };
  const labels: Record<Role, string> = {
    admin: 'Admin',
    dispatcher: 'Dispatcher',
    'driver/responder': 'Driver / Responder',
    resident: 'Resident',
  };
  return (
    <Badge className={`${styles[role]} border-0`}>{labels[role]}</Badge>
  );
}

function getStatusBadge(status: UserStatus) {
  const styles: Record<UserStatus, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <Badge className={`${styles[status]} border-0 capitalize`}>{status}</Badge>
  );
}

function getRegistrationStatusBadge(status: RegistrationStatus) {
  const styles: Record<RegistrationStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <Badge className={`${styles[status]} border-0 capitalize`}>{status}</Badge>
  );
}

// ── Utilities ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function renderPageNumbers(currentPage: number, totalPages: number) {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
}

// ── Employee form ────────────────────────────────────────────────────────────

interface UserFormData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  role: Role;
  password?: string;
}

const emptyForm: UserFormData = {
  firstName: '',
  lastName: '',
  contactNumber: '',
  role: 'dispatcher',
  password: '',
};

function UserForm({
  mode,
  formData,
  setFormData,
}: {
  mode: 'add' | 'edit';
  formData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
}) {
  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${mode}-firstName`}>First Name</Label>
          <Input
            id={`${mode}-firstName`}
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="Enter first name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${mode}-lastName`}>Last Name</Label>
          <Input
            id={`${mode}-lastName`}
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Enter last name"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${mode}-contactNumber`}>Phone Number</Label>
        <Input
          id={`${mode}-contactNumber`}
          type="tel"
          value={formData.contactNumber}
          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
          placeholder="+63 9XX XXX XXXX"
        />
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value as Role })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="dispatcher">Dispatcher</SelectItem>
            <SelectItem value="driver/responder">Driver / Responder</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {mode === 'add' && (
        <div className="space-y-2">
          <Label htmlFor={`${mode}-password`}>Temporary Password</Label>
          <Input
            id={`${mode}-password`}
            type="text"
            value={formData.password || ''}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter temporary password"
          />
          <p className="text-[11px] text-muted-foreground">This is a temporary password. The employee must change it upon first login.</p>
        </div>
      )}
    </div>
  );
}

// ── Resident detail dialog ───────────────────────────────────────────────────

function ResidentDetailDialog({
  resident,
  open,
  onOpenChange,
  onAccept,
  onDecline,
}: {
  resident: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  if (!resident) return null;

  const isPending = resident.registrationStatus === 'pending';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Resident Details</DialogTitle>
          <DialogDescription>
            Registration information for {resident.firstName} {resident.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Name */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Last Name</p>
              <p className="text-sm font-medium">{resident.lastName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">First Name</p>
              <p className="text-sm font-medium">{resident.firstName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Middle Initial</p>
              <p className="text-sm font-medium">{resident.middleInitial || '—'}</p>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Address</p>
            <p className="text-sm font-medium">
              {resident.address.houseNo} {resident.address.street}, {resident.address.barangay}, {resident.address.city}, {resident.address.province}
            </p>
          </div>

          {/* Sex, Contact, Email */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Sex</p>
              <p className="text-sm font-medium">{resident.sex || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Contact Number</p>
              <p className="text-sm font-medium">{resident.contactNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium truncate">{resident.email || '—'}</p>
            </div>
          </div>

          {/* ID Type & Document */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">ID Type</p>
              <p className="text-sm font-medium">{resident.idType}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">ID Document</p>
              <div className="flex items-center gap-2">
                <FileUp className="size-4 text-muted-foreground" />
                {resident.idDocumentUrl ? (
                  <a
                    href={resident.idDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View Document
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground italic">No document uploaded</span>
                )}
              </div>
            </div>
          </div>

          {/* Registration Status & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Registration Status</p>
              {getRegistrationStatusBadge(resident.registrationStatus ?? 'pending')}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Registered</p>
              <p className="text-sm font-medium">{formatDate(resident.registeredAt)}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          {isPending ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDecline(resident.id);
                  onOpenChange(false);
                }}
              >
                <XCircle className="size-4" />
                Decline
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  onAccept(resident.id);
                  onOpenChange(false);
                }}
              >
                <CheckCircle2 className="size-4" />
                Accept
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function UserManagement() {
  // ── Employees state ──────────────────────────────────────────────────────
  const [employees, setEmployees] = useState<User[]>(
    mockUsers.filter((u) => u.role !== 'resident'),
  );
  const [empSearch, setEmpSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [empPage, setEmpPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null);

  // ── Residents state ──────────────────────────────────────────────────────
  const [residents, setResidents] = useState<User[]>([...mockResidents]);
  const [resSearch, setResSearch] = useState('');
  const [regStatusFilter, setRegStatusFilter] = useState<string>('all');
  const [resPage, setResPage] = useState(1);
  const [viewResident, setViewResident] = useState<User | null>(null);
  const [viewResidentOpen, setViewResidentOpen] = useState(false);
  const [deleteResidentId, setDeleteResidentId] = useState<string | null>(null);

  // ── Employees filtering ──────────────────────────────────────────────────
  const filteredEmployees = useMemo(() => {
    return employees.filter((user) => {
      const matchesSearch =
        empSearch === '' ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(empSearch.toLowerCase()) ||
        user.contactNumber.toLowerCase().includes(empSearch.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, empSearch, roleFilter, statusFilter]);

  const empTotalPages = Math.max(1, Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE));
  const paginatedEmployees = filteredEmployees.slice(
    (empPage - 1) * ITEMS_PER_PAGE,
    empPage * ITEMS_PER_PAGE,
  );

  // ── Residents filtering ──────────────────────────────────────────────────
  const filteredResidents = useMemo(() => {
    return residents.filter((r) => {
      const matchesSearch =
        resSearch === '' ||
        `${r.lastName}, ${r.firstName}`.toLowerCase().includes(resSearch.toLowerCase()) ||
        r.contactNumber.toLowerCase().includes(resSearch.toLowerCase()) ||
        r.address.barangay.toLowerCase().includes(resSearch.toLowerCase());
      const matchesStatus =
        regStatusFilter === 'all' || r.registrationStatus === regStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [residents, resSearch, regStatusFilter]);

  const resTotalPages = Math.max(1, Math.ceil(filteredResidents.length / ITEMS_PER_PAGE));
  const paginatedResidents = filteredResidents.slice(
    (resPage - 1) * ITEMS_PER_PAGE,
    resPage * ITEMS_PER_PAGE,
  );

  // ── Employee handlers ────────────────────────────────────────────────────
  const handleAddUser = () => {
    if (!formData.firstName || !formData.lastName || !formData.contactNumber) {
      toast.error('Please fill in all required fields');
      return;
    }
    const newUser: User = {
      id: `USR${String(employees.length + 1).padStart(3, '0')}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: '',
      contactNumber: formData.contactNumber,
      dateOfBirth: '',
      address: { houseNo: '', street: '', barangay: '', city: '', province: '' },
      idType: 'National ID',
      role: formData.role,
      status: 'inactive',
      registeredAt: new Date().toISOString(),
    };
    setEmployees((prev) => [newUser, ...prev]);
    setFormData(emptyForm);
    setAddDialogOpen(false);
    setEmpPage(1);
    toast.success(`User ${formData.firstName} ${formData.lastName} added successfully`);
  };

  const handleEditUser = () => {
    if (!selectedEmployee || !formData.firstName || !formData.lastName || !formData.contactNumber) {
      toast.error('Please fill in all required fields');
      return;
    }
    setEmployees((prev) =>
      prev.map((u) =>
        u.id === selectedEmployee.id
          ? { ...u, firstName: formData.firstName, lastName: formData.lastName, contactNumber: formData.contactNumber, role: formData.role }
          : u,
      ),
    );
    setEditDialogOpen(false);
    setSelectedEmployee(null);
    setFormData(emptyForm);
    toast.success(`User ${formData.firstName} ${formData.lastName} updated successfully`);
  };

  const handleDeleteEmployee = () => {
    if (!deleteEmployeeId) return;
    const user = employees.find((u) => u.id === deleteEmployeeId);
    setEmployees((prev) => prev.filter((u) => u.id !== deleteEmployeeId));
    setDeleteEmployeeId(null);
    if (user) {
      toast.success(`User ${user.firstName} ${user.lastName} deleted successfully`);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedEmployee(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      contactNumber: user.contactNumber,
      role: user.role,
    });
    setEditDialogOpen(true);
  };

  // ── Resident handlers ────────────────────────────────────────────────────
  const handleAcceptResident = (id: string) => {
    setResidents((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, registrationStatus: 'accepted' as RegistrationStatus, status: 'active' as UserStatus } : r,
      ),
    );
    toast.success('Resident registration accepted');
  };

  const handleDeclineResident = (id: string) => {
    setResidents((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, registrationStatus: 'declined' as RegistrationStatus } : r,
      ),
    );
    toast.error('Resident registration declined');
  };

  const handleDeleteResident = () => {
    if (!deleteResidentId) return;
    setResidents((prev) => prev.filter((r) => r.id !== deleteResidentId));
    setDeleteResidentId(null);
    toast.success('Resident deleted');
  };

  // ── Pagination rendering ─────────────────────────────────────────────────
  const renderPagination = (
    currentPage: number,
    totalPages: number,
    totalItems: number,
    setPage: (page: number) => void,
    label: string,
  ) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
          {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of{' '}
          {totalItems} {label}
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); setPage(Math.max(1, currentPage - 1)); }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {renderPageNumbers(currentPage, totalPages).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage(page); }}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); setPage(Math.min(totalPages, currentPage + 1)); }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  // ── Count helpers for residents ──────────────────────────────────────────
  const pendingCount = residents.filter((r) => r.registrationStatus === 'pending').length;
  const acceptedCount = residents.filter((r) => r.registrationStatus === 'accepted').length;
  const declinedCount = residents.filter((r) => r.registrationStatus === 'declined').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage employees and resident registrations
          </p>
        </div>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="residents">
            Residents
            {pendingCount > 0 && (
              <Badge className="ml-1.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0 px-1.5 py-0 text-[10px]">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════ EMPLOYEES TAB ═══════════════════════ */}
        <TabsContent value="employees" className="space-y-6">
          {/* Add Employee button */}
          <div className="flex justify-end">
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="size-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Create a new employee account. Status will be set to &quot;Inactive&quot; until the user logs into the mobile app.
                  </DialogDescription>
                </DialogHeader>
                <UserForm mode="add" formData={formData} setFormData={setFormData} />
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setAddDialogOpen(false); setFormData(emptyForm); }}>
                    Cancel
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddUser}>
                    Add Employee
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or phone number..."
                    value={empSearch}
                    onChange={(e) => { setEmpSearch(e.target.value); setEmpPage(1); }}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-3">
                  <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value); setEmpPage(1); }}>
                    <SelectTrigger className="w-[170px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="dispatcher">Dispatcher</SelectItem>
                      <SelectItem value="driver/responder">Driver / Responder</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setEmpPage(1); }}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employees Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No employees found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEmployees.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                                {getInitials(user.firstName, user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {user.firstName} {user.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="size-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{user.contactNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(user.registeredAt)}
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => openEditDialog(user)}
                            >
                              <Pencil className="size-4 text-muted-foreground" />
                            </Button>
                            <AlertDialog
                              open={deleteEmployeeId === user.id}
                              onOpenChange={(open) => { if (!open) setDeleteEmployeeId(null); }}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  onClick={() => setDeleteEmployeeId(user.id)}
                                >
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.firstName} {user.lastName}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-white hover:bg-destructive/90"
                                    onClick={handleDeleteEmployee}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {renderPagination(empPage, empTotalPages, filteredEmployees.length, setEmpPage, 'employees')}

          {/* Edit Employee Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Employee</DialogTitle>
                <DialogDescription>
                  Update employee information. Status is managed automatically and cannot be changed manually.
                </DialogDescription>
              </DialogHeader>
              <UserForm mode="edit" formData={formData} setFormData={setFormData} />
              <DialogFooter>
                <Button variant="outline" onClick={() => { setEditDialogOpen(false); setSelectedEmployee(null); setFormData(emptyForm); }}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleEditUser}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ═══════════════════════ RESIDENTS TAB ═══════════════════════ */}
        <TabsContent value="residents" className="space-y-6">
          {/* Filter tabs for registration status */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {[
                { value: 'all', label: 'All', count: residents.length },
                { value: 'pending', label: 'Pending', count: pendingCount },
                { value: 'accepted', label: 'Accepted', count: acceptedCount },
                { value: 'declined', label: 'Declined', count: declinedCount },
              ].map((tab) => (
                <Button
                  key={tab.value}
                  variant={regStatusFilter === tab.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setRegStatusFilter(tab.value); setResPage(1); }}
                  className="gap-1.5"
                >
                  {tab.label}
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                    {tab.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or barangay..."
                  value={resSearch}
                  onChange={(e) => { setResSearch(e.target.value); setResPage(1); }}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* Residents Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Sex</TableHead>
                      <TableHead>ID Type</TableHead>
                      <TableHead>Contact Number</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResidents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          No residents found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedResidents.map((resident) => (
                        <TableRow key={resident.id}>
                          {/* Name - clickable to view details */}
                          <TableCell>
                            <button
                              className="flex items-center gap-3 text-left hover:underline cursor-pointer"
                              onClick={() => { setViewResident(resident); setViewResidentOpen(true); }}
                            >
                              <Avatar className="size-8">
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">
                                  {getInitials(resident.firstName, resident.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium">
                                  {resident.lastName}, {resident.firstName}
                                </span>
                                {resident.middleInitial && (
                                  <span className="text-muted-foreground"> {resident.middleInitial}.</span>
                                )}
                              </div>
                            </button>
                          </TableCell>

                          {/* Address */}
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {resident.address.houseNo} {resident.address.street}, {resident.address.barangay}
                            </span>
                          </TableCell>

                          {/* Sex */}
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                resident.sex === 'Male'
                                  ? 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400'
                                  : 'border-pink-300 text-pink-700 dark:border-pink-700 dark:text-pink-400'
                              }
                            >
                              {resident.sex || '—'}
                            </Badge>
                          </TableCell>

                          {/* ID Type & Document */}
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{resident.idType}</span>
                              {resident.idDocumentUrl && (
                                <a
                                  href={resident.idDocumentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex"
                                >
                                  <FileUp className="size-3.5 text-blue-600 hover:text-blue-800 dark:text-blue-400" />
                                </a>
                              )}
                            </div>
                          </TableCell>

                          {/* Contact */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="size-3.5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{resident.contactNumber}</span>
                            </div>
                          </TableCell>

                          {/* Registered */}
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(resident.registeredAt)}
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            {getRegistrationStatusBadge(resident.registrationStatus ?? 'pending')}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* View */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => { setViewResident(resident); setViewResidentOpen(true); }}
                                title="View details"
                              >
                                <Eye className="size-4 text-muted-foreground" />
                              </Button>

                              {/* Accept / Decline for pending */}
                              {resident.registrationStatus === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => handleAcceptResident(resident.id)}
                                    title="Accept registration"
                                  >
                                    <CheckCircle2 className="size-4 text-green-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => handleDeclineResident(resident.id)}
                                    title="Decline registration"
                                  >
                                    <XCircle className="size-4 text-red-600" />
                                  </Button>
                                </>
                              )}

                              {/* Delete for all */}
                              <AlertDialog
                                open={deleteResidentId === resident.id}
                                onOpenChange={(open) => { if (!open) setDeleteResidentId(null); }}
                              >
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => setDeleteResidentId(resident.id)}
                                    title="Delete resident"
                                  >
                                    <Trash2 className="size-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Resident</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {resident.firstName} {resident.lastName}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-white hover:bg-destructive/90"
                                      onClick={handleDeleteResident}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {renderPagination(resPage, resTotalPages, filteredResidents.length, setResPage, 'residents')}

          {/* Resident Detail Dialog */}
          <ResidentDetailDialog
            resident={viewResident}
            open={viewResidentOpen}
            onOpenChange={setViewResidentOpen}
            onAccept={handleAcceptResident}
            onDecline={handleDeclineResident}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
