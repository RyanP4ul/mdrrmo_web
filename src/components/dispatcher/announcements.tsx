'use client';

import { useState, useMemo } from 'react';
import { Megaphone, Search, Calendar, User, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mockAnnouncements } from '@/lib/mock-data';

const ITEMS_PER_PAGE = 4;

const CATEGORIES = [
  'Weather Advisory',
  'Evacuation',
  'Traffic Advisory',
  'Information',
  'Relief Operations',
];

const CATEGORY_COLORS: Record<string, string> = {
  'Weather Advisory': 'bg-sky-100 text-sky-800 border-0 dark:bg-sky-900/30 dark:text-sky-400',
  Evacuation: 'bg-red-100 text-red-800 border-0 dark:bg-red-900/30 dark:text-red-400',
  'Traffic Advisory': 'bg-blue-100 text-blue-800 border-0 dark:bg-blue-900/30 dark:text-blue-400',
  Information: 'bg-green-100 text-green-800 border-0 dark:bg-green-900/30 dark:text-green-400',
  'Relief Operations': 'bg-purple-100 text-purple-800 border-0 dark:bg-purple-900/30 dark:text-purple-400',
};

export function DispatcherAnnouncements() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAnnouncements = useMemo(() => {
    return mockAnnouncements.filter((ann) => {
      const matchesSearch = ann.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || ann.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAnnouncements.length / ITEMS_PER_PAGE));
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Megaphone className="size-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Announcements</h2>
          <p className="text-sm text-muted-foreground">View public announcements and advisories</p>
        </div>
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

      {/* Announcements List (Card Layout - Read Only) */}
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
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {ann.description}
                    </p>
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
    </div>
  );
}
