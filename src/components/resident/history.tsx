'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { mockResidentReports, mockIncidentTypes } from '@/lib/mock-data';
import { ReportStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Search,
  MapPin,
  Clock,
  Filter,
  History,
  User,
  Eye,
  Shield,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const statusColors: Record<ReportStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  dispatched: 'bg-blue-100 text-blue-800 border-blue-200',
  acknowledged: 'bg-orange-100 text-orange-800 border-orange-200',
  resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  invalid: 'bg-gray-100 text-gray-600 border-gray-200',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

const typeColors: Record<string, string> = {
  Fire: 'bg-red-100 text-red-700 border-red-200',
  'Medical Emergency': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Disaster: 'bg-blue-100 text-blue-700 border-blue-200',
  Vehicular: 'bg-amber-100 text-amber-700 border-amber-200',
  Trauma: 'bg-pink-100 text-pink-700 border-pink-200',
  Service: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function ResidentHistory() {
  const { currentUser } = useAppStore();
  const residentId = currentUser?.id || 'RES001';

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter reports for current resident
  const myReports = mockResidentReports.filter((r) => r.residentId === residentId);

  const filteredReports = useMemo(() => {
    let filtered = myReports;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.type.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((r) => r.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    return filtered;
  }, [myReports, searchQuery, typeFilter, statusFilter]);

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    myReports.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  }, [myReports]);

  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <History className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-emerald-900">Report History</h1>
          <p className="text-xs text-muted-foreground">{myReports.length} report{myReports.length !== 1 ? 's' : ''} total</p>
        </div>
      </motion.div>

      {/* Status Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="grid grid-cols-5 gap-2">
          {(['pending', 'dispatched', 'acknowledged', 'resolved', 'invalid'] as ReportStatus[]).map(
            (status) => (
              <div
                key={status}
                className={`p-2 rounded-lg text-center cursor-pointer transition-all ${
                  statusFilter === status
                    ? statusColors[status] + ' ring-2 ring-offset-1 ring-current/20'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              >
                <p className="text-lg font-bold">{statusCounts[status] || 0}</p>
                <p className="text-[9px] capitalize text-muted-foreground">{status}</p>
              </div>
            )
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-emerald-100">
          <CardContent className="p-3 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports..."
                className="pl-9 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>

            {/* Filters row */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="border-emerald-200 focus:border-emerald-400 h-9 text-xs">
                    <Filter className="h-3 w-3 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {mockIncidentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-emerald-200 focus:border-emerald-400 h-9 text-xs">
                    <Filter className="h-3 w-3 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {(['pending', 'dispatched', 'acknowledged', 'resolved', 'invalid'] as ReportStatus[]).map(
                      (status) => (
                        <SelectItem key={status} value={status}>
                          <span className="capitalize">{status}</span>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(typeFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setTypeFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Reports List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-emerald-100">
          <CardContent className="p-3 md:p-4">
            {filteredReports.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <History className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No reports found</p>
                <p className="text-xs mt-1">
                  {myReports.length === 0
                    ? 'You haven\'t submitted any reports yet'
                    : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filteredReports.map((report, idx) => (
                      <motion.div
                        key={report.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                        className="p-4 rounded-xl border border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm transition-all"
                      >
                        {/* Top row: type + status */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-xs ${typeColors[report.type] || 'bg-gray-100 text-gray-700'}`}
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {report.type}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${statusColors[report.status]}`}
                            >
                              {report.status}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${priorityColors[report.priority] || ''}`}
                            >
                              {report.priority}
                            </Badge>
                          </div>
                        </div>

                        {/* Reporter type badge */}
                        <div className="flex items-center gap-1 mb-2">
                          {report.reporterType === 'victim' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              <User className="h-2.5 w-2.5" /> Victim
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full">
                              <Eye className="h-2.5 w-2.5" /> Witness
                            </span>
                          )}
                          {report.assignedTeam && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                              <Shield className="h-2.5 w-2.5" /> {report.assignedTeam}
                            </span>
                          )}
                        </div>

                        {/* Description excerpt */}
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {report.description}
                        </p>

                        {/* Location and time */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {report.location}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(report.timestamp)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
