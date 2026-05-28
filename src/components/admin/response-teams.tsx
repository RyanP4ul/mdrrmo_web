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
import type { ResponseTeam, Availability } from '@/lib/types';

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

function getAvailabilityBadge(availability: Availability) {
  if (availability === 'available') {
    return (
      <Badge className="bg-green-100 text-green-800 border-0 dark:bg-green-900/30 dark:text-green-400">
        Available
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 border-0 dark:bg-red-900/30 dark:text-red-400">
      Unavailable
    </Badge>
  );
}

function getMemberAvailabilityBadge(availability: Availability) {
  if (availability === 'available') {
    return (
      <Badge className="bg-green-100 text-green-800 border-0 text-xs dark:bg-green-900/30 dark:text-green-400">
        Available
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 border-0 text-xs dark:bg-red-900/30 dark:text-red-400">
      Unavailable
    </Badge>
  );
}

export function ResponseTeams() {
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [specializationFilter, setSpecializationFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState<ResponseTeam | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredTeams = useMemo(() => {
    return mockResponseTeams.filter((team) => {
      const matchesSearch = team.teamName.toLowerCase().includes(search.toLowerCase());
      const matchesAvailability =
        availabilityFilter === 'all' || team.availability === availabilityFilter;
      const matchesSpecialization =
        specializationFilter === 'All' ||
        team.specializations.some((s) => s === specializationFilter);
      return matchesSearch && matchesAvailability && matchesSpecialization;
    });
  }, [search, availabilityFilter, specializationFilter]);

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
              value={availabilityFilter}
              onValueChange={(val) => {
                setAvailabilityFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
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
                <TableHead className="w-[130px]">Availability</TableHead>
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
                          <span key={m.id} className="text-sm">
                            {m.name} <span className="text-xs text-muted-foreground">({m.role})</span>
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getAvailabilityBadge(team.availability)}</TableCell>
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
      <div className="flex items-center justify-between">
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
              Team details and member availability
            </DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                {getAvailabilityBadge(selectedTeam.availability)}
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
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectedTeam.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-2 rounded-lg border p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                      {getMemberAvailabilityBadge(member.availability)}
                    </div>
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
