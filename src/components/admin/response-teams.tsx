'use client';

import { useState, useMemo } from 'react';
import { Shield, Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { mockResponseTeams } from '@/lib/mock-data';
import type { ResponseTeam, MemberStatus } from '@/lib/types';

const ITEMS_PER_PAGE = 5;

const ALL_SPECIALIZATIONS = [
  'All',
  'Flood Rescue',
  'Fire Response',
  'Medical Emergency',
  'First Aid',
  'Search Operations',
  'Water Rescue',
  'Structural Assessment',
  'Utility Repair',
  'Fire Suppression',
  'Hazmat Response',
];

const MEMBER_STATUS_OPTIONS: { value: MemberStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'inactive', label: 'Inactive', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'on-leave', label: 'On Leave', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'off-duty', label: 'Off Duty', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
];

function getStatusBadge(status: MemberStatus) {
  const opt = MEMBER_STATUS_OPTIONS.find((s) => s.value === status);
  return (
    <Badge className={`${opt?.color ?? 'bg-gray-100 text-gray-800'} border-0`}>
      {opt?.label ?? status}
    </Badge>
  );
}

export function ResponseTeams() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specializationFilter, setSpecializationFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState<ResponseTeam | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredTeams = useMemo(() => {
    return mockResponseTeams.filter((team) => {
      const matchesSearch = team.teamName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || team.status === statusFilter;
      const matchesSpecialization =
        specializationFilter === 'All' ||
        team.specializations.some((s) => s === specializationFilter);
      return matchesSearch && matchesStatus && matchesSpecialization;
    });
  }, [search, statusFilter, specializationFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / ITEMS_PER_PAGE));
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleRowClick = (team: ResponseTeam) => {
    setSelectedTeam(team);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Shield className="size-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Response Teams</h2>
          <p className="text-sm text-muted-foreground">View and monitor emergency response teams</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by team name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {MEMBER_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={specializationFilter}
              onValueChange={(val) => {
                setSpecializationFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                {ALL_SPECIALIZATIONS.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec === 'All' ? 'All Specializations' : spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Team Name</TableHead>
                <TableHead className="min-w-[250px]">Members</TableHead>
                <TableHead className="w-[130px]">Status</TableHead>
                <TableHead>Specializations</TableHead>
                <TableHead className="w-[80px] text-center">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTeams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No teams found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTeams.map((team) => (
                  <TableRow
                    key={team.id}
                    className="cursor-pointer"
                    onClick={() => handleRowClick(team)}
                  >
                    <TableCell className="font-medium">{team.teamName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        {team.members.map((m) => (
                          <span key={m.id} className="text-sm">{m.name}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(team.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {team.specializations.map((spec) => (
                          <Badge
                            key={spec}
                            variant="outline"
                            className="text-xs border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(team);
                        }}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedTeams.length} of {filteredTeams.length} team(s)
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Team Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="size-5 text-blue-500" />
              {selectedTeam?.teamName}
            </DialogTitle>
            <DialogDescription>
              Team details and member status
            </DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge(selectedTeam.status)}
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-sm font-medium mr-1">Specializations:</span>
                {selectedTeam.specializations.map((spec) => (
                  <Badge
                    key={spec}
                    variant="outline"
                    className="text-xs border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400"
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Team Members ({selectedTeam.members.length})</h4>
                <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto pr-1">
                  {selectedTeam.members.map((member) => (
                    <span
                      key={member.id}
                      className="inline-flex items-center rounded-md bg-muted/50 px-3 py-1.5 text-sm font-medium"
                    >
                      {member.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
