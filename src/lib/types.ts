export type Role = 'admin' | 'dispatcher' | 'resident';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export type ReportStatus = 'pending' | 'acknowledged' | 'dispatched' | 'resolved' | 'invalid';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type Availability = 'available' | 'unavailable';

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
  members: { id: string; name: string; role: string; availability: Availability }[];
  availability: Availability;
  specializations: string[];
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  image?: string;
  postedAt: string;
  postedBy: string;
  category: string;
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

export type PageKey =
  | 'login'
  | 'register'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-reports'
  | 'admin-response-teams'
  | 'admin-announcements'
  | 'admin-audit-logs'
  | 'admin-incident-types'
  | 'dispatcher-dashboard'
  | 'dispatcher-reports'
  | 'dispatcher-report-detail'
  | 'dispatcher-responders';
