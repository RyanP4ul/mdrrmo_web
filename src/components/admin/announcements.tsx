'use client';

import { useState, useMemo } from 'react';
import { Megaphone, Search, Plus, Pencil, Trash2, ImageIcon, Calendar, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { mockAnnouncements } from '@/lib/mock-data';
import type { Announcement } from '@/lib/types';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 4;

const CATEGORIES = [
  'Weather Advisory',
  'Evacuation',
  'Traffic Advisory',
  'Information',
  'Relief Operations',
];

const CATEGORY_COLORS: Record<string, string> = {
  'Weather Advisory': 'bg-amber-100 text-amber-800 border-0 dark:bg-amber-900/30 dark:text-amber-400',
  Evacuation: 'bg-red-100 text-red-800 border-0 dark:bg-red-900/30 dark:text-red-400',
  'Traffic Advisory': 'bg-orange-100 text-orange-800 border-0 dark:bg-orange-900/30 dark:text-orange-400',
  Information: 'bg-green-100 text-green-800 border-0 dark:bg-green-900/30 dark:text-green-400',
  'Relief Operations': 'bg-purple-100 text-purple-800 border-0 dark:bg-purple-900/30 dark:text-purple-400',
};

interface FormData {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
}

const emptyForm: FormData = {
  title: '',
  category: 'Weather Advisory',
  description: '',
  imageUrl: '',
};

export function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([...mockAnnouncements]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesSearch = ann.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || ann.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [announcements, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAnnouncements.length / ITEMS_PER_PAGE));
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setFormData({
      title: ann.title,
      category: ann.category,
      description: ann.description,
      imageUrl: ann.image || '',
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in the required fields.');
      return;
    }

    if (editingId) {
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann.id === editingId
            ? {
                ...ann,
                title: formData.title,
                category: formData.category,
                description: formData.description,
                image: formData.imageUrl || undefined,
              }
            : ann
        )
      );
      toast.success('Announcement updated successfully.');
    } else {
      const newAnn: Announcement = {
        id: `ANN${Date.now()}`,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        image: formData.imageUrl || undefined,
        postedAt: new Date().toISOString(),
        postedBy: 'Admin',
      };
      setAnnouncements((prev) => [newAnn, ...prev]);
      toast.success('Announcement created successfully.');
    }

    setFormOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleDelete = () => {
    if (deleteId) {
      setAnnouncements((prev) => prev.filter((ann) => ann.id !== deleteId));
      toast.success('Announcement deleted successfully.');
      setDeleteId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <Megaphone className="size-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Announcements</h2>
            <p className="text-sm text-muted-foreground">Manage public announcements and advisories</p>
          </div>
        </div>
        <Button onClick={handleOpenAdd} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="size-4 mr-1" />
          Add Announcement
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(val) => {
                setCategoryFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List (Card Layout) */}
      {paginatedAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
            No announcements found matching your filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginatedAnnouncements.map((ann) => (
            <Card key={ann.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Left: Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-base leading-tight">{ann.title}</h3>
                      <Badge className={CATEGORY_COLORS[ann.category] || 'bg-gray-100 text-gray-800 border-0'}>
                        {ann.category}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDate(ann.postedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {ann.postedBy}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {ann.description}
                    </p>
                    {/* Action buttons */}
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(ann)}
                      >
                        <Pencil className="size-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={() => setDeleteId(ann.id)}
                      >
                        <Trash2 className="size-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  {/* Right: Image placeholder */}
                  <div className="hidden sm:flex shrink-0">
                    <div className="flex size-[120px] items-center justify-center rounded-lg bg-muted/50 border border-dashed border-muted-foreground/25">
                      {ann.image ? (
                        <img
                          src={ann.image}
                          alt={ann.title}
                          className="size-full rounded-lg object-cover"
                        />
                      ) : (
                        <ImageIcon className="size-8 text-muted-foreground/40" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedAnnouncements.length} of {filteredAnnouncements.length} announcement(s)
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
              {editingId ? 'Edit Announcement' : 'Add Announcement'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the announcement details below.'
                : 'Fill in the details to create a new announcement.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ann-title">Title *</Label>
              <Input
                id="ann-title"
                placeholder="Enter announcement title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, category: val }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-desc">Description *</Label>
              <Textarea
                id="ann-desc"
                placeholder="Enter announcement description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-image">Image URL</Label>
              <Input
                id="ann-image"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
              />
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
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
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
