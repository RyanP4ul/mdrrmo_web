'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { mockIncidentTypes } from '@/lib/mock-data';
import { ReporterType, PriorityLevel } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertTriangle, MapPin, Phone, User, Eye, Navigation, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const DAGUPAN_LAT = 16.0433;
const DAGUPAN_LNG = 120.3372;

const priorityColors: Record<PriorityLevel, string> = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

export function ResidentReport() {
  const { currentUser } = useAppStore();
  const [reporterType, setReporterType] = useState<ReporterType>('victim');
  const [selectedType, setSelectedType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [pinPosition, setPinPosition] = useState<{ x: number; y: number } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedIncident = mockIncidentTypes.find((t) => t.name === selectedType);
  const autoPriority: PriorityLevel = selectedIncident?.priority || 'medium';

  // For victim: auto-pin center
  const pinCoords = reporterType === 'victim'
    ? { lat: DAGUPAN_LAT, lng: DAGUPAN_LNG }
    : pinPosition
      ? {
          lat: DAGUPAN_LAT + (pinPosition.y - 50) / 50 * -0.01,
          lng: DAGUPAN_LNG + (pinPosition.x - 50) / 50 * 0.01,
        }
      : null;

  const handleMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reporterType === 'witness') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPinPosition({ x, y });
    }
  }, [reporterType]);

  const handleSubmit = () => {
    if (!selectedType) {
      toast.error('Please select an incident type');
      return;
    }
    if (reporterType === 'witness' && !pinPosition) {
      toast.error('Please tap the map to pinpoint the incident location');
      return;
    }
    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }
    setIsSubmitted(true);
    toast.success('Report submitted! Dispatcher has been notified.', {
      description: `${selectedType} — Priority: ${autoPriority}`,
      duration: 4000,
    });
    // Reset after a delay
    setTimeout(() => {
      setIsSubmitted(false);
      setSelectedType('');
      setDescription('');
      setPinPosition(null);
    }, 2000);
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-emerald-900">Report Emergency</h1>
          <p className="text-xs text-muted-foreground">Submit an emergency report to MDRRMO</p>
        </div>
      </motion.div>

      {/* Reporter Type Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="border-emerald-100">
          <CardContent className="p-4">
            <Label className="text-sm font-medium text-gray-700 mb-3 block">I am a...</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setReporterType('victim');
                  setPinPosition(null);
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                  reporterType === 'victim'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200'
                }`}
              >
                <User className="h-4 w-4" />
                <span className="font-medium text-sm">I am a Victim</span>
              </button>
              <button
                onClick={() => {
                  setReporterType('witness');
                  setPinPosition(null);
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                  reporterType === 'witness'
                    ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-teal-200'
                }`}
              >
                <Eye className="h-4 w-4" />
                <span className="font-medium text-sm">I am a Witness</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Map / Location */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Incident Location
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Visual Map Placeholder */}
            <div
              className="relative w-full h-48 md:h-56 rounded-xl overflow-hidden cursor-pointer border border-emerald-200"
              style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 25%, #6ee7b7 50%, #a7f3d0 75%, #d1fae5 100%)',
              }}
              onClick={handleMapClick}
            >
              {/* Grid lines for map feel */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute w-full border-t border-emerald-800"
                    style={{ top: `${(i + 1) * 10}%` }}
                  />
                ))}
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute h-full border-l border-emerald-800"
                    style={{ left: `${(i + 1) * 10}%` }}
                  />
                ))}
              </div>

              {/* Road lines */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-emerald-900/40 -translate-y-1/2" />
                <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-emerald-900/30" />
                <div className="absolute top-0 bottom-0 left-2/3 w-0.5 bg-emerald-900/20" />
                <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-emerald-900/20" />
                <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-emerald-900/20" />
              </div>

              {/* Area labels */}
              <div className="absolute top-3 left-4 text-[9px] font-medium text-emerald-800/50">Poblacion</div>
              <div className="absolute top-3 right-4 text-[9px] font-medium text-emerald-800/50">Tapuac</div>
              <div className="absolute bottom-3 left-4 text-[9px] font-medium text-emerald-800/50">Pantal</div>
              <div className="absolute bottom-3 right-4 text-[9px] font-medium text-emerald-800/50">Bonuan</div>

              {/* Pin marker */}
              <AnimatePresence>
                {(reporterType === 'victim' || pinPosition) && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="absolute z-10 -translate-x-1/2 -translate-y-full"
                    style={{
                      left: reporterType === 'victim' ? '50%' : `${pinPosition?.x || 50}%`,
                      top: reporterType === 'victim' ? '50%' : `${pinPosition?.y || 50}%`,
                    }}
                  >
                    <div className="relative">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-3 rounded-full bg-emerald-400/20"
                      />
                      <div className="h-8 w-8 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-600 rotate-45" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Center crosshair for witness mode with no pin */}
              {reporterType === 'witness' && !pinPosition && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 border-2 border-dashed border-emerald-600/50 rounded-full" />
                  <div className="absolute h-6 w-0 border-l border-dashed border-emerald-600/50" />
                  <div className="absolute w-6 h-0 border-t border-dashed border-emerald-600/50" />
                </div>
              )}

              {/* Compass */}
              <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                <Navigation className="h-4 w-4 text-emerald-700 rotate-45" />
              </div>

              {/* Scale bar */}
              <div className="absolute bottom-2 left-2 bg-white/70 rounded px-1.5 py-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-12 h-0.5 bg-emerald-700/50" />
                  <span className="text-[8px] text-emerald-700/70">500m</span>
                </div>
              </div>
            </div>

            {/* Location message */}
            <div className="mt-3 flex items-center gap-2">
              {reporterType === 'victim' ? (
                <>
                  <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm text-emerald-700 font-medium">
                    📍 Your location has been pinned
                  </p>
                </>
              ) : pinPosition ? (
                <>
                  <MapPin className="h-4 w-4 text-teal-600 flex-shrink-0" />
                  <p className="text-sm text-teal-700 font-medium">
                    📍 Location pinned — {pinCoords?.lat.toFixed(4)}, {pinCoords?.lng.toFixed(4)}
                  </p>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-600">
                    👆 Tap the map to pinpoint the incident location
                  </p>
                </>
              )}
            </div>

            {/* Coordinates display */}
            {pinCoords && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Lat: {pinCoords.lat.toFixed(4)}</span>
                <span>•</span>
                <span>Lng: {pinCoords.lng.toFixed(4)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Incident Type */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-900">Incident Type</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {mockIncidentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.name)}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                    selectedType === type.name
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
                  }`}
                >
                  <p className="font-medium text-sm text-gray-800">{type.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{type.priority} priority</p>
                </button>
              ))}
            </div>

            {/* Auto-detected priority */}
            {selectedIncident && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3"
              >
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <span className="text-xs text-muted-foreground">Auto-set priority:</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${priorityColors[autoPriority]}`}
                  >
                    {autoPriority}
                  </Badge>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-emerald-100">
          <CardContent className="p-4">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the emergency situation in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Include details like number of people affected, visible hazards, etc.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Info (read-only, from profile) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="border-emerald-100">
          <CardContent className="p-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Contact Information</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input
                  value={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : ''}
                  readOnly
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <Input
                  value={currentUser?.contactNumber || ''}
                  readOnly
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={handleSubmit}
          disabled={isSubmitted}
          className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 transition-all duration-200"
          size="lg"
        >
          {isSubmitted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2"
            >
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Report Submitted!
            </motion.div>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Emergency Report
            </>
          )}
        </Button>
      </motion.div>

      {/* Emergency Call Fallback */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="pb-4"
      >
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">Can&apos;t submit online? Call directly:</p>
          <Button
            variant="outline"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={() => toast.success('Calling MDRRMO...')}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call MDRRMO Hotline
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
