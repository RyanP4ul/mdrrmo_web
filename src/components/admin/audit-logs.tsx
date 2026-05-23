'use client';

import { useState, useMemo } from 'react';
import { Activity, Search, Calendar } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { mockAuditLogs } from '@/lib/mock-data';
import type { AuditLog } from '@/lib/types';

const ITEMS_PER_PAGE = 8;

const ACTION_TYPES = [
  'All',
  'LOGIN',
  'UPDATE_REPORT',
  'CREATE_ANNOUNCEMENT',
  'ASSIGN_TEAM',
  'UPDATE_USER',
  'CREATE_INCIDENT_TYPE',
  'RESOLVE_REPORT',
  'DELETE_ANNOUNCEMENT',
  'CREATE_USER',
] as const;

function getActionBadge(action: string) {
  const colorMap: Record<string, string> = {
    LOGIN: 'bg-green-100 text-green-800 border-0 dark:bg-green-900/30 dark:text-green-400',
    CREATE_ANNOUNCEMENT: 'bg-blue-100 text-blue-800 border-0 dark:bg-blue-900/30 dark:text-blue-400',
    CREATE_INCIDENT_TYPE: 'bg-blue-100 text-blue-800 border-0 dark:bg-blue-900/30 dark:text-blue-400',
    CREATE_USER: 'bg-blue-100 text-blue-800 border-0 dark:bg-blue-900/30 dark:text-blue-400',
    UPDATE_REPORT: 'bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400',
    UPDATE_USER: 'bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400',
    DELETE_ANNOUNCEMENT: 'bg-red-100 text-red-800 border-0 dark:bg-red-900/30 dark:text-red-400',
    RESOLVE_REPORT: 'bg-purple-100 text-purple-800 border-0 dark:bg-purple-900/30 dark:text-purple-400',
    ASSIGN_TEAM: 'bg-orange-100 text-orange-800 border-0 dark:bg-orange-900/30 dark:text-orange-400',
  };

  const colorClass = colorMap[action] || 'bg-gray-100 text-gray-800 border-0 dark:bg-gray-900/30 dark:text-gray-400';

  return (
    <Badge className={colorClass}>
      {action.replace(/_/g, ' ')}
    </Badge>
  );
}

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function AuditLogs() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter((log: AuditLog) => {
      const matchesSearch =
        log.userName.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase());
      const matchesAction = actionFilter === 'All' || log.action === actionFilter;
      const matchesDateFrom =
        !dateFrom || new Date(log.timestamp) >= new Date(dateFrom);
      const matchesDateTo =
        !dateTo || new Date(log.timestamp) <= new Date(dateTo + 'T23:59:59Z');
      return matchesSearch && matchesAction && matchesDateFrom && matchesDateTo;
    });
  }, [search, actionFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
          <Activity className="size-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Audit Logs</h2>
          <p className="text-sm text-muted-foreground">Track system activities and user actions</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, or details..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={actionFilter}
              onValueChange={(val) => {
                setActionFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full lg:w-[220px]">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action === 'All' ? 'All Actions' : action.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground shrink-0" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full lg:w-[150px]"
                placeholder="From"
              />
              <span className="text-sm text-muted-foreground shrink-0">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full lg:w-[150px]"
                placeholder="To"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Timestamp</TableHead>
                <TableHead className="w-[160px]">User</TableHead>
                <TableHead className="w-[180px]">Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-[140px]">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No audit logs found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium">{log.userName}</TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                      {log.details}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {log.ipAddress}
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
          Showing {paginatedLogs.length} of {filteredLogs.length} log(s)
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
