'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockResponseTeams } from '@/lib/mock-data';
import type { ResponseTeam, Availability } from '@/lib/types';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 5;

interface MemberForm {
  id: string;
  name: string;
  role: string;
  availability: Availability;
}

interface TeamForm {
  teamName: string;
  members: MemberForm[];
  availability: Availability;
}

const emptyTeamForm: TeamForm = {
  teamName: '',
  members: [{ id: `M-${Date.now()}`, name: '', role: '', availability: 'available' }],
  availability: 'available',
};

export function Responders() {
  const [teams, setTeams] = useState<ResponseTeam[]>([...mockResponseTeams]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [teamForm, setTeamForm] = useState<TeamForm>(emptyTeamForm);

  const filteredTeams = useMemo(() => {
    let result = [...teams];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.teamName.toLowerCase().includes(q) ||
          t.members.some((m) => m.name.toLowerCase().includes(q))
      );
    }

    if (availabilityFilter !== 'all') {
      result = result.filter((t) => t.availability === availabilityFilter);
    }

    return result;
  }, [teams, searchQuery, availabilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / ITEMS_PER_PAGE));
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = () => setCurrentPage(1);

  // Add Team
  const openAddDialog = () => {
    setTeamForm({
      ...emptyTeamForm,
      members: [{ id: `M-${Date.now()}`, name: '', role: '', availability: 'available' }],
    });
    setShowAddDialog(true);
  };

  const handleAddTeam = () => {
    if (!teamForm.teamName.trim()) {
      toast.error('Team name is required');
      return;
    }
    if (teamForm.members.some((m) => !m.name.trim())) {
      toast.error('All member names are required');
      return;
    }

    const newTeam: ResponseTeam = {
      id: `TM${String(teams.length + 1).padStart(3, '0')}`,
      teamName: teamForm.teamName.trim(),
      specializations: [],
      members: teamForm.members.map((m, i) => ({
        ...m,
        id: m.id || `M${Date.now()}-${i}`,
        name: m.name.trim(),
        role: m.role.trim() || 'Member',
      })),
      availability: teamForm.availability,
    };

    setTeams((prev) => [...prev, newTeam]);
    setShowAddDialog(false);
    toast.success(`${newTeam.teamName} created`, {
      description: 'New response team has been added successfully.',
    });
  };

  // Edit Team
  const openEditDialog = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    setEditingTeamId(teamId);
    setTeamForm({
      teamName: team.teamName,
      members: team.members.map((m) => ({ ...m })),
      availability: team.availability,
    });
    setShowEditDialog(true);
  };

  const handleEditTeam = () => {
    if (!editingTeamId) return;
    if (!teamForm.teamName.trim()) {
      toast.error('Team name is required');
      return;
    }
    if (teamForm.members.some((m) => !m.name.trim())) {
      toast.error('All member names are required');
      return;
    }

    setTeams((prev) =>
      prev.map((t) =>
        t.id === editingTeamId
          ? {
              ...t,
              teamName: teamForm.teamName.trim(),
              members: teamForm.members.map((m, i) => ({
                ...m,
                id: m.id || `M${Date.now()}-${i}`,
                name: m.name.trim(),
                role: m.role.trim() || 'Member',
              })),
              availability: teamForm.availability,
            }
          : t
      )
    );

    setShowEditDialog(false);
    setEditingTeamId(null);
    toast.success(`${teamForm.teamName} updated`, {
      description: 'Response team details have been updated.',
    });
  };

  // Delete Team
  const openDeleteDialog = (teamId: string) => {
    setDeletingTeamId(teamId);
    setShowDeleteDialog(true);
  };

  const handleDeleteTeam = () => {
    if (!deletingTeamId) return;
    const teamName = teams.find((t) => t.id === deletingTeamId)?.teamName;
    setTeams((prev) => prev.filter((t) => t.id !== deletingTeamId));
    setShowDeleteDialog(false);
    setDeletingTeamId(null);
    toast.success(`${teamName} deleted`, {
      description: 'Response team has been removed.',
    });
  };

  // Team form helpers
  const addMember = () => {
    setTeamForm((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        { id: `M-${Date.now()}`, name: '', role: '', availability: 'available' },
      ],
    }));
  };

  const removeMember = (memberId: string) => {
    if (teamForm.members.length <= 1) {
      toast.error('Team must have at least one member');
      return;
    }
    setTeamForm((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
    }));
  };

  const updateMember = (memberId: string, field: keyof MemberForm, value: string) => {
    setTeamForm((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === memberId ? { ...m, [field]: value } : m
      ),
    }));
  };

  // Team form dialog content (shared between add and edit)
  const renderTeamForm = () => (
    <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
      {/* Team Name */}
      <div className="space-y-2">
        <Label htmlFor="teamName">Team Name *</Label>
        <Input
          id="teamName"
          value={teamForm.teamName}
          onChange={(e) => setTeamForm((prev) => ({ ...prev, teamName: e.target.value }))}
          placeholder="Enter team name..."
        />
      </div>

      {/* Team Availability */}
      <div className="space-y-2">
        <Label>Team Availability</Label>
        <Select
          value={teamForm.availability}
          onValueChange={(v) =>
            setTeamForm((prev) => ({ ...prev, availability: v as Availability }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Members */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Members *</Label>
          <Button variant="outline" size="sm" onClick={addMember} className="gap-1">
            <UserPlus className="size-3" />
            Add Member
          </Button>
        </div>
        <ScrollArea className="max-h-[250px]">
          <div className="space-y-3 pr-2">
            {teamForm.members.map((member) => (
              <Card key={member.id} className="bg-muted/30">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Member</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member.id)}
                      className="size-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Input
                      placeholder="Name *"
                      value={member.name}
                      onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Role"
                      value={member.role}
                      onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                      className="text-sm"
                    />
                    <Select
                      value={member.availability}
                      onValueChange={(v) => updateMember(member.id, 'availability', v)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <ShieldCheck className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Response Teams</h2>
            <p className="text-sm text-muted-foreground">Manage emergency response teams &amp; personnel</p>
          </div>
        </div>
        <Button onClick={openAddDialog} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="size-4" />
          Add Team
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by team name or member name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleFilterChange();
                }}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={availabilityFilter}
                onValueChange={(v) => {
                  setAvailabilityFilter(v);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Availability</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>

              {(availabilityFilter !== 'all' || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAvailabilityFilter('all');
                    setSearchQuery('');
                    handleFilterChange();
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {paginatedTeams.length} of {filteredTeams.length} teams
      </p>

      {/* Teams List */}
      <div className="space-y-4">
        {paginatedTeams.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="size-10 text-muted-foreground/40" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">No teams found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          paginatedTeams.map((team) => (
            <Card key={team.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Team Header */}
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <ShieldCheck className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{team.teamName}</h3>
                      <p className="text-xs text-muted-foreground">{team.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`border-0 text-xs ${
                        team.availability === 'available'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {team.availability}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(team.id)}
                      className="gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <Pencil className="size-3" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(team.id)}
                      className="gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="size-3" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Team Content */}
                <div className="p-4 space-y-3">
                  {/* Members */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Users className="size-3" />
                      Members ({team.members.length})
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {team.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                          <Badge
                            className={`border-0 text-[10px] shrink-0 ml-2 ${
                              member.availability === 'available'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {member.availability}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Team Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5 text-blue-600" />
              Add Response Team
            </DialogTitle>
            <DialogDescription>
              Create a new emergency response team with members.
            </DialogDescription>
          </DialogHeader>
          {renderTeamForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTeam} className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-5 text-blue-600" />
              Edit Response Team
            </DialogTitle>
            <DialogDescription>
              Update team details and members.
            </DialogDescription>
          </DialogHeader>
          {renderTeamForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTeam} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Team Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="size-5 text-red-500" />
              Delete Response Team
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{teams.find((t) => t.id === deletingTeamId)?.teamName}</strong>? This action
              cannot be undone. All team members and assignments will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeam} className="bg-red-600 hover:bg-red-700">
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Responders;
