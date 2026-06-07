export type Role = 'admin' | 'dispatcher' | 'driver/responder' | 'resident';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export type ReportStatus = 'pending' | 'acknowledged' | 'dispatched' | 'resolved' | 'invalid';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type Availability = 'available' | 'unavailable';

export type MemberStatus = 'active' | 'inactive' | 'on-leave' | 'off-duty';

export type ShiftStatus = 'on-shift' | 'off-shift' | 'on-break';

export type ScheduleStatus = 'pending' | 'acknowledged' | 'confirmed' | 'declined' | 'completed' | 'cancelled';

export type ReporterType = 'victim' | 'witness';

export type ReportSource = 'emergency-call' | 'mobile-app';

export interface VictimInfo {
  name: string;
  age: string;
  sex: 'Male' | 'Female';
  address: string;
  contact: string;
}

export interface WitnessInfo {
  name: string;
  contact: string;
  statement: string;
}

export type RegistrationStatus = 'pending' | 'accepted' | 'declined';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: string;
  address: {
    houseNo: string;
    street: string;
    barangay: string;
    city: string;
    province: string;
  };
  idType: string;
  role: Role;
  status: UserStatus;
  registeredAt: string;
  middleInitial?: string;
  sex?: 'Male' | 'Female';
  idDocumentUrl?: string;
  registrationStatus?: RegistrationStatus;
  avatarUrl?: string;
  password?: string; // temporary password for employee accounts
}

export interface EmergencyReport {
  id: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: ReportStatus;
  description: string;
  reportedBy: {
    id: string;
    name: string;
    contact: string;
  };
  source: ReportSource;
  assignedTeam?: string;
  assignedDriver?: string;
  priority: PriorityLevel;
  reporterType?: ReporterType;
  victimInfo?: VictimInfo;
  witnessInfo?: WitnessInfo;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface ResponseTeam {
  id: string;
  teamName: string;
  members: { id: string; name: string; role: string; status: MemberStatus }[];
  status: MemberStatus;
  specializations: string[];
  currentShift?: ShiftInfo;
}

export interface ShiftInfo {
  shiftId: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  members: { id: string; name: string; role: string }[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  localId: string; // Changed from ipAddress to localId
}

export interface IncidentType {
  id: string;
  name: string;
  description: string;
  priority: PriorityLevel;
  createdAt: string;
}

export type IncidentCategory = 'Vehicular Accident' | 'Medical' | 'Pedia' | 'Ob/Gyne' | 'Others';

export interface AdminReportDriverSection {
  driverName: string;
  governmentCardPlateNo: string;
  authorizedPassenger: string;
  placeVisitedInspected: string;
  purpose: string;
  gasoline: {
    balanceInTank: string;
    issuedByOffice: string;
    asPurchased: string;
    deductUsed: string;
    balanceEndTrip: string;
  };
  passengerName: string;
  driverFilledName: string;
}

export interface AdminReportEmergencySection {
  timeReported: string;
  timeOfArrival: string;
  date: string;
  location: string;
  patientName: string;
  age: string;
  sex: 'Male' | 'Female';
  address: string;
  typeOfIncident: IncidentCategory;
  allergies: string;
  medications: string;
  assessmentComment: string;
  treatmentManagement: string;
  vitalSigns: {
    bloodPressure: string;
    pulseRate: string;
    respiration: string;
  };
  endorsedBy: string;
  endorsedByTime: string;
  endorsedByDate: string;
  endorsedTo: string;
  endorsedToTime: string;
  endorsedToDate: string;
}

export interface AdminReport {
  id: string;
  reportId: string;
  timestamp: string;
  status: ReportStatus;
  priority: PriorityLevel;
  incidentType: string;
  assignedTeam?: string;
  driver: AdminReportDriverSection;
  emergency: AdminReportEmergencySection;
}

// Resident types
export interface ResidentReport {
  id: string;
  residentId: string;
  residentName: string;
  type: string;
  reporterType: ReporterType;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: ReportStatus;
  description: string;
  assignedTeam?: string;
  priority: PriorityLevel;
}

export interface ServiceSchedule {
  id: string;
  residentId: string;
  residentName: string;
  residentContact: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  notes: string;
  status: ScheduleStatus;
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  declineReason?: string;
}

export interface ResidentNotification {
  id: string;
  residentId: string;
  title: string;
  message: string;
  type: 'schedule_confirmed' | 'schedule_cancelled' | 'report_update' | 'general';
  read: boolean;
  timestamp: string;
  relatedId?: string;
}

export type VehicleStatus = 'en-route' | 'on-scene' | 'available' | 'returning' | 'offline';

export interface Vehicle {
  id: string;
  teamId: string;
  teamName: string;
  vehicleType: 'ambulance' | 'fire-truck' | 'rescue-van' | 'police-car' | 'utility-truck';
  plateNumber: string;
  lat: number;
  lng: number;
  status: VehicleStatus;
  speed: number;
  heading: number;
  assignedReportId?: string;
  lastUpdated: string;
}

// Hospital recommendation types
export interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: number; // km from incident
  specialization: string[];
  availableBeds: number;
  contactNumber: string;
  estimatedArrivalMinutes: number;
}

export type PageKey =
  | 'login'
  | 'register'
  | 'resident-login'
  | 'resident-register'
  | 'resident-dashboard'
  | 'resident-report'
  | 'resident-schedule'
  | 'resident-history'
  | 'resident-notifications'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-reports-page'
  | 'admin-response-teams'
  | 'admin-audit-logs'
  | 'admin-incident-types'
  | 'dispatcher-dashboard'
  | 'dispatcher-reports'
  | 'dispatcher-report-detail'
  | 'dispatcher-responders'
  | 'dispatcher-map'
  | 'dispatcher-schedule'
  | 'driver-dashboard'
  | 'driver-assignments'
  | 'driver-reports'
  | 'driver-vehicle-tracking';
