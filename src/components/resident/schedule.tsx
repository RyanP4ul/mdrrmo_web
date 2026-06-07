'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { mockServiceSchedules, mockResidents } from '@/lib/mock-data';
import { ScheduleStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarCheck,
  Clock,
  MapPin,
  Phone,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const serviceTypes = ['Medical Transport', 'Relief Goods Delivery', 'Evacuation Assistance', 'Other'];

const statusColors: Record<ScheduleStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  acknowledged: 'bg-orange-100 text-orange-800 border-orange-200',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  acknowledged: AlertCircle,
  confirmed: CheckCircle2,
  completed: CheckCircle2,
  cancelled: XCircle,
};

export function ResidentSchedule() {
  const { currentUser } = useAppStore();
  const residentId = currentUser?.id || 'RES001';

  // Pre-fill from user profile
  const resident = mockResidents.find((r) => r.id === residentId);
  const defaultAddress = resident
    ? `${resident.address.houseNo} ${resident.address.street}, ${resident.address.barangay}, ${resident.address.city}`
    : '';
  const defaultContact = resident?.contactNumber || '';

  // Form state
  const [serviceType, setServiceType] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [address, setAddress] = useState(defaultAddress);
  const [contactNumber, setContactNumber] = useState(defaultContact);
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Existing schedules
  const mySchedules = mockServiceSchedules.filter((s) => s.residentId === residentId);

  const handleSubmit = () => {
    if (!serviceType) {
      toast.error('Please select a service type');
      return;
    }
    if (!preferredDate) {
      toast.error('Please select a preferred date');
      return;
    }
    if (!preferredTime) {
      toast.error('Please select a preferred time');
      return;
    }
    if (!address.trim()) {
      toast.error('Please provide your address');
      return;
    }
    if (!contactNumber.trim()) {
      toast.error('Please provide your contact number');
      return;
    }

    setIsSubmitted(true);
    toast.success('Schedule request sent! Waiting for dispatcher confirmation.', {
      description: `${serviceType} — ${preferredDate} at ${preferredTime}`,
      duration: 4000,
    });

    setTimeout(() => {
      setIsSubmitted(false);
      setServiceType('');
      setPreferredDate('');
      setPreferredTime('');
      setNotes('');
    }, 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
          <CalendarCheck className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-teal-900">Schedule Service</h1>
          <p className="text-xs text-muted-foreground">Request assistance from MDRRMO</p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="border-teal-100">
          <CardContent className="p-4 md:p-6 space-y-4">
            {/* Service Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-teal-600" />
                Service Type
              </Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger className="border-teal-200 focus:border-teal-400 focus:ring-teal-400">
                  <SelectValue placeholder="Select a service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CalendarCheck className="h-3.5 w-3.5 text-teal-600" />
                  Preferred Date
                </Label>
                <Input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="border-teal-200 focus:border-teal-400 focus:ring-teal-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-teal-600" />
                  Preferred Time
                </Label>
                <Input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="border-teal-200 focus:border-teal-400 focus:ring-teal-400"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-600" />
                Address
              </Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                className="border-teal-200 focus:border-teal-400 focus:ring-teal-400"
              />
              {defaultAddress && (
                <p className="text-[10px] text-muted-foreground">Pre-filled from your profile</p>
              )}
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-teal-600" />
                Contact Number
              </Label>
              <Input
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+63 9XX XXX XXXX"
                className="border-teal-200 focus:border-teal-400 focus:ring-teal-400"
              />
              {defaultContact && (
                <p className="text-[10px] text-muted-foreground">Pre-filled from your profile</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Additional Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requirements or details..."
                rows={3}
                className="resize-none border-teal-200 focus:border-teal-400 focus:ring-teal-400"
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitted}
              className="w-full h-11 text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/25 transition-all duration-200"
            >
              {isSubmitted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Request Sent!
                </motion.div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Schedule Request
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Existing Schedules */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-teal-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-teal-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-600" />
              My Schedules
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {mySchedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No schedules yet</p>
                <p className="text-xs mt-1">Submit a request above to get started</p>
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                <div className="space-y-3">
                  {mySchedules.map((schedule, idx) => {
                    const StatusIcon = statusIcons[schedule.status] || Clock;
                    return (
                      <motion.div
                        key={schedule.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.05, duration: 0.3 }}
                        className="p-3 rounded-xl border border-gray-100 bg-white hover:bg-teal-50/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-gray-900">{schedule.serviceType}</p>
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${statusColors[schedule.status]}`}
                              >
                                <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                                {schedule.status}
                              </Badge>
                            </div>
                            <div className="mt-1 space-y-0.5">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <CalendarCheck className="h-3 w-3" />
                                {schedule.preferredDate} at {schedule.preferredTime}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{schedule.address}</span>
                              </p>
                            </div>
                            {schedule.notes && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1 italic">
                                &quot;{schedule.notes}&quot;
                              </p>
                            )}
                            {schedule.acknowledgedBy && (
                              <p className="text-[10px] text-teal-600 mt-1">
                                Confirmed by {schedule.acknowledgedBy}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
