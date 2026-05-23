'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { mockIncidentTypes } from '@/lib/mock-data';
import type { IncidentType, PriorityLevel } from '@/lib/types';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 6;

const PRIORITY_LEVELS: PriorityLevel[] = ['low', 'medium', 'high', 'critical'];

function getPriorityBadge(priority: PriorityLevel) {
  const styles: Record<PriorityLevel, string> = {
    low: 'bg-green-100 text-green-800 border-0 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-800 border-0 dark:bg-orange-900/30 dark:text-orange-400',
    critical: 'bg-red-100 text-red-800 border-0 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <Badge className={`${styles[priority]} capitalize`}>
      {priority}
    </Badge>
  );
}

interface FormData {
  name: string;
  description: string;
  priority: PriorityLevel;
}

const emptyForm: FormData = {
  name: '',
  description: '',
  priority: 'medium',
};

export function IncidentTypes() {
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([...mockIncidentTypes]);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredTypes = useMemo(() => {
    return incidentTypes.filter((it) => {
      const matchesSearch = it.name.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || it.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [incidentTypes, search, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTypes.length / ITEMS_PER_PAGE));
  const paginatedTypes = filteredTypes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormOpen(true);
  };

  const handleOpenEdit = (it: IncidentType) => {
    setEditingId(it.id);
    setFormData({
      name: it.name,
      description: it.description,
      priority: it.priority,
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Please fill in the required fields.');
      return;
    }

    if (editingId) {
      setIncidentTypes((prev) =>
        prev.map((it) =>
          it.id === editingId
            ? {
                ...it,
                name: formData.name,
                description: formData.description,
                priority: formData.priority,
              }
            : it
        )
      );
      toast.success('Incident type updated successfully.');
    } else {
      const newType: IncidentType = {
        id: `IT${Date.now()}`,
        name: formData.name,
        description: formData.description,
        priority: formData.priority,
        createdAt: new Date().toISOString(),
      };
      setIncidentTypes((prev) => [...prev, newType]);
      toast.success('Incident type created successfully.');
    }

    setFormOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleDelete = () => {
    if (deleteId) {
      setIncidentTypes((prev) => prev.filter((it) => it.id !== deleteId));
      toast.success('Incident type deleted successfully.');
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <AlertTriangle className="size-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Incident Types</h2>
            <p className="text-sm text-muted-foreground">Manage emergency incident categories and priorities</p>
          </div>
        </div>
        <Button onClick={handleOpenAdd} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="size-4 mr-1" />
          Add Type
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={priorityFilter}
              onValueChange={(val) => {
                setPriorityFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITY_LEVELS.map((p) => (
                  <SelectItem key={p} value={p}>
                    <span className="capitalize">{p}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[130px]">Priority</TableHead>
                <TableHead className="w-[130px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No incident types found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTypes.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">{it.name}</TableCell>
                    <TableCell className="max-w-[400px] truncate text-muted-foreground">
                      {it.description}
                    </TableCell>
                    <TableCell>{getPriorityBadge(it.priority)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(it)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                          onClick={() => setDeleteId(it.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedTypes.length} of {filteredTypes.length} type(s)
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

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Incident Type' : 'Add Incident Type'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the incident type details below.'
                : 'Define a new incident type with its priority level.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="it-name">Name *</Label>
              <Input
                id="it-name"
                placeholder="e.g., Flood, Fire, Earthquake"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="it-desc">Description *</Label>
              <Textarea
                id="it-desc"
                placeholder="Describe this incident type"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="it-priority">Priority Level</Label>
              <Select
                value={formData.priority}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, priority: val as PriorityLevel }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map((p) => (
                    <SelectItem key={p} value={p}>
                      <span className="capitalize">{p}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white">
              {editingId ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Incident Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this incident type? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
