'use client';

import { useState, useMemo } from 'react';
import { Search, Eye } from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { mockReports } from '@/lib/mock-data';
import type { ReportStatus, PriorityLevel } from '@/lib/types';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 8;

const incidentTypes = [
  'Flood',
  'Fire',
  'Earthquake',
  'Typhoon',
  'Landslide',
  'Vehicular Accident',
  'Medical Emergency',
  'Power Outage',
  'Structural Collapse',
  'Drowning',
];

function getStatusBadge(status: ReportStatus) {
  const styles: Record<ReportStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    acknowledged: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    dispatched: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    invalid: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return (
    <Badge className={`${styles[status]} border-0 capitalize`}>{status}</Badge>
  );
}

function getPriorityBadge(priority: PriorityLevel) {
  const styles: Record<PriorityLevel, string> = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <Badge className={`${styles[priority]} border-0 capitalize`}>{priority}</Badge>
  );
}

function formatTimestamp(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EmergencyReports() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredReports = useMemo(() => {
    return mockReports.filter((report) => {
      const matchesSearch =
        search === '' ||
        report.id.toLowerCase().includes(search.toLowerCase()) ||
        report.type.toLowerCase().includes(search.toLowerCase()) ||
        report.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesType = typeFilter === 'all' || report.type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });
  }, [search, statusFilter, typeFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / ITEMS_PER_PAGE));
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleViewReport = (reportId: string) => {
    toast.info(`Viewing report ${reportId}`, {
      description: 'Report detail view will be available in a future update.',
    });
  };

  const renderPageNumbers = () => {
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Emergency Reports</h2>
        <p className="text-sm text-muted-foreground">
          Monitor and manage all emergency incident reports
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, type, or location..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="invalid">Invalid</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {incidentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(value) => { setPriorityFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No reports found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {report.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{report.type}</span>
                        {getPriorityBadge(report.priority)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate text-muted-foreground">
                      {report.location}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatTimestamp(report.timestamp)}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleViewReport(report.id)}
                      >
                        <Eye className="size-4" />
                        <span className="hidden sm:inline">View</span>
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredReports.length)} of{' '}
            {filteredReports.length} reports
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(1, p - 1)); }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {renderPageNumbers().map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}
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
                  onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(totalPages, p + 1)); }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
