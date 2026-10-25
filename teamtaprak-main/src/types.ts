export type Role = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  studentId?: string; // e.g. 2026-0001
  department: string; // e.g. College of Industrial Technology
  role: Role;
  isAdmin?: boolean; // Can be true for instructors who also hold admin privileges (e.g. Dept Chair, Dean, Clearance Officer)
  isInstructor?: boolean; // Can be true for admins who also teach and sign student clearances
  title?: string; // e.g. "Department Chairperson & Associate Professor"
  course?: string;
  yearLevel?: string;
  section?: string;
  academicYear?: string;
  semester?: string;
  isActive?: boolean;
}

export interface Student {
  id: string;
  userId: string;
  studentId: string;
  name: string;
  email: string;
  course: string;
  yearLevel: string;
  section: string;
  department: string;
  isActive: boolean;
}

export interface Instructor {
  id: string;
  userId: string;
  name: string;
  email: string;
  department: string;
  isActive: boolean;
  isAdmin?: boolean; // Has Administrator Privileges (Department Chair / Dean)
  title?: string; // e.g. "Dept Chair & Faculty"
}

export interface Subject {
  id: string;
  subjectCode: string;
  subjectName: string;
  units?: number;
  scheduleTime?: string;
  room?: string;
  yearLevel?: '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | string;
  semester?: '1st Semester' | '2nd Semester' | string;
  section?: string;
  course?: string;
  instructorId?: string;
  instructorName?: string;
  createdBy?: string;
  description?: string;
  department?: string;
  academicYear?: string;
  days?: string;
  startTime?: string;
  endTime?: string;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Inactive';
  rejectionReason?: string;
}

export interface SubjectAssignment {
  id: string;
  studentId: string; // user ID or student ID
  subjectId: string;
  instructorId: string; // user ID of instructor
  semester: string;
  academicYear: string;
}

export type SignatureStatus = 'Not Requested' | 'Pending' | 'Approved' | 'Rejected';

export interface SignatureRequest {
  id: string;
  studentId: string;
  subjectId: string;
  instructorId: string;
  status: SignatureStatus;
  remarks?: string;
  instructorRemarks?: string;
  requestedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface DigitalSignature {
  id: string;
  signatureRequestId: string;
  studentId: string;
  subjectId: string;
  instructorId: string;
  instructorName: string;
  signedAt: string;
  signatureStatus: SignatureStatus;
  signatureHash?: string;
  signatureSvg?: string;
  grade?: number;
  remarks?: string;
  academicYear?: string;
  semester?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedRequestId?: string;
  type?: 'success' | 'warning' | 'info' | 'error';
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface OfferingHierarchy {
  department: string;
  course: string;
  yearLevel: string;
  section: string;
}
