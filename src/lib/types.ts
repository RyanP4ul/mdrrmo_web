export type Role = 'admin' | 'dispatcher' | 'driver/responder';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export type ReportStatus = 'pending' | 'acknowledged' | 'dispatched' | 'resolved' | 'invalid';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type Availability = 'available' | 'unavailable';

export type MemberStatus = 'active' | 'inactive' | 'on-leave' | 'off-duty';

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
  avatarUrl?: string;
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
  assignedTeam?: string;
  priority: PriorityLevel;
}

export interface ResponseTeam {
  id: string;
  teamName: string;
  members: { id: string; name: string; role: string; status: MemberStatus }[];
  status: MemberStatus;
  specializations: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
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
  /** A. To be filled by the administrative official authorizing */
  driverName: string;
  governmentCardPlateNo: string;
  authorizedPassenger: string;
  placeVisitedInspected: string;
  purpose: string;
  /** B. To be filled by the driver - Gasoline */
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

export type PageKey =
  | 'login'
  | 'register'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-reports'
  | 'admin-reports-page'
  | 'admin-response-teams'
  | 'admin-audit-logs'
  | 'admin-incident-types'
  | 'dispatcher-dashboard'
  | 'dispatcher-reports'
  | 'dispatcher-report-detail'
  | 'dispatcher-responders';
