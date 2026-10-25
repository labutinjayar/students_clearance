import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Department, 
  Subject, 
  SubjectAssignment, 
  SignatureRequest, 
  DigitalSignature, 
  Notification,
  Student,
  Instructor,
  SignatureStatus
} from '../types';
import { supabase } from '../lib/supabase';
import { supabaseDb } from '../services/supabaseDb';

interface DbContextType {
  departments: Department[];
  subjects: Subject[];
  offerings: Subject[];
  catalogError: string | null;
  subjectAssignments: SubjectAssignment[];
  signatureRequests: SignatureRequest[];
  digitalSignatures: DigitalSignature[];
  notifications: Notification[];
  students: Student[];
  instructors: Instructor[];
  academicYear: string;
  semester: string;
  
  // Instructor Student Sync
  syncInstructorStudents: (instructorId: string) => { success: boolean; message: string; syncedCount: number };
  getInstructorStudents: (instructorId: string) => Student[];
  
  // Shared Subject Catalog & Selection Actions
  addSharedSubject: (params: {
    subjectCode: string;
    subjectName: string;
    instructorId: string;
    yearLevel: string;
    semester: string;
    section: string;
    units?: number;
    room?: string;
    scheduleTime?: string;
    autoSelectForStudentId?: string;
  }) => { success: boolean; isDuplicate?: boolean; existingSubject?: Subject; message: string; subject?: Subject };
  updateSharedSubject: (subjectId: string, params: Partial<Subject>) => { success: boolean; message: string };
  deleteSharedSubject: (subjectId: string) => { success: boolean; message: string };
  selectSubject: (studentId: string, subjectId: string, instructorId?: string) => { success: boolean; message: string };
  addEligibleSubject: (studentId: string, subjectId: string) => Promise<{ success: boolean; message: string }>;
  unselectSubject: (studentId: string, subjectId: string) => { success: boolean; message: string };
  toggleSelectSubject: (studentId: string, subjectId: string, instructorId?: string) => { success: boolean; isSelected: boolean; message: string };
  
  // Student Actions
  createSignatureRequest: (params: { studentId: string; subjectId: string; remarks?: string }) => { success: boolean; message: string };
  saveStudentSubject: (params: {
    studentId: string;
    assignmentId?: string;
    subjectId?: string;
    subjectCode: string;
    subjectName: string;
    instructorId: string;
    status: SignatureStatus;
    scheduleTime?: string;
    room?: string;
    units?: number;
    remarks?: string;
    instructorRemarks?: string;
  }) => { success: boolean; message: string };
  deleteStudentSubject: (params: { studentId: string; assignmentId: string; subjectId: string }) => { success: boolean; message: string };
  resetStudentSubjects: (studentId: string) => { success: boolean; message: string };
  
  // Instructor Actions
  submitInstructorGradeSignature: (params: {
    requestId: string;
    instructorId: string;
    grade: number;
    signatureSvg: string;
    remarks?: string;
  }) => Promise<{ success: boolean; message: string }>;
  rejectRequest: (requestId: string, instructorId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  addInstructorRemarks: (requestId: string, remarks: string) => void;
  
  // Notification Actions
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;
  
  // Admin Actions
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<{ success: boolean; message: string }>;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  submitInstructorOffering: (subject: Omit<Subject, 'id'>) => { success: boolean; message: string };
  reviewSubjectOffering: (id: string, status: 'Approved' | 'Rejected') => { success: boolean; message: string };
  toggleSubjectOffering: (id: string) => { success: boolean; message: string };
  
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  toggleStudentStatus: (id: string) => void;
  changeStudentToInstructor: (id: string) => Promise<boolean>;
  
  addInstructor: (instructor: Omit<Instructor, 'id'>) => void;
  updateInstructor: (id: string, instructor: Partial<Instructor>) => void;
  toggleInstructorStatus: (id: string) => void;
  
  createSubjectAssignment: (assignment: Omit<SubjectAssignment, 'id'>) => void;
  updateSubjectAssignment: (id: string, assignment: Partial<SubjectAssignment>) => void;
  deleteSubjectAssignment: (id: string) => void;
  
  // Helpers
  getStudentSubjects: (studentId: string) => Array<{
    assignment: SubjectAssignment;
    subject: Subject;
    instructor?: Instructor;
    latestRequest?: SignatureRequest;
    digitalSignature?: DigitalSignature;
  }>;
  getInstructorRequests: (instructorId: string) => SignatureRequest[];
  getUserNotifications: (userId: string) => Notification[];
  refreshData: () => Promise<boolean>;
}

const DbContext = createContext<DbContextType | undefined>(undefined);

const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-cit', code: 'CIT', name: 'College of Industrial Technology' },
  { id: 'dept-cas', code: 'CAS', name: 'College of Arts and Sciences' },
  { id: 'dept-coed', code: 'COED', name: 'College of Education' },
  { id: 'dept-coe', code: 'COE', name: 'College of Engineering' },
];
const INITIAL_SUBJECTS: Subject[] = [];
const INITIAL_STUDENTS: Student[] = [];
const INITIAL_INSTRUCTORS: Instructor[] = [];
const INITIAL_ASSIGNMENTS: SubjectAssignment[] = [];
const INITIAL_REQUESTS: SignatureRequest[] = [];
const INITIAL_DIGITAL_SIGNATURES: DigitalSignature[] = [];
const INITIAL_NOTIFICATIONS: Notification[] = [];

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const dbVersion = localStorage.getItem('ssu_db_version_v4');
    const storedDb = localStorage.getItem('ssu_clearance_master_db');
    if (dbVersion === '4.0' && storedDb) {
      try {
        const parsed = JSON.parse(storedDb);
        if (parsed.subjects && Array.isArray(parsed.subjects)) {
          const map = new Map();
          parsed.subjects.forEach((s: Subject) => { if (s?.id) map.set(s.id, s); });
          return Array.from(map.values());
        }
      } catch (e) {
        console.error('Error parsing subjects', e);
      }
    }
    localStorage.setItem('ssu_db_version_v4', '4.0');
    const map = new Map();
    INITIAL_SUBJECTS.forEach(s => { if (s?.id) map.set(s.id, s); });
    return Array.from(map.values());
  });
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<Subject[]>([]);

  const [students, setStudents] = useState<Student[]>(() => {
    const dbVersion = localStorage.getItem('ssu_db_version_v4');
    const storedDb = localStorage.getItem('ssu_clearance_master_db');
    if (dbVersion === '4.0' && storedDb) {
      try {
        const parsed = JSON.parse(storedDb);
        if (parsed.students && Array.isArray(parsed.students)) {
          const map = new Map();
          parsed.students.forEach((s: Student) => { if (s?.id) map.set(s.id, s); });
          return Array.from(map.values());
        }
      } catch (e) {
        console.error('Error parsing students', e);
      }
    }
    const map = new Map();
    INITIAL_STUDENTS.forEach(s => { if (s?.id) map.set(s.id, s); });
    return Array.from(map.values());
  });

  const [instructors, setInstructors] = useState<Instructor[]>(() => {
    const dbVersion = localStorage.getItem('ssu_db_version_v4');
    const storedDb = localStorage.getItem('ssu_clearance_master_db');
    if (dbVersion === '4.0' && storedDb) {
      try {
        const parsed = JSON.parse(storedDb);
        if (parsed.instructors && Array.isArray(parsed.instructors)) {
          const map = new Map();
          parsed.instructors.forEach((i: Instructor) => { if (i?.id) map.set(i.id, i); });
          return Array.from(map.values());
        }
      } catch (e) {
        console.error('Error parsing instructors', e);
      }
    }
    const map = new Map();
    INITIAL_INSTRUCTORS.forEach(i => { if (i?.id) map.set(i.id, i); });
    return Array.from(map.values());
  });

  const [subjectAssignments, setSubjectAssignments] = useState<SubjectAssignment[]>(() => {
    const dbVersion = localStorage.getItem('ssu_db_version_v4');
    const storedDb = localStorage.getItem('ssu_clearance_master_db');
    if (dbVersion === '4.0' && storedDb) {
      try {
        const parsed = JSON.parse(storedDb);
        if (parsed.subjectAssignments && Array.isArray(parsed.subjectAssignments)) {
          const map = new Map();
          parsed.subjectAssignments.forEach((sa: SubjectAssignment) => {
            const key = sa?.id || `${sa?.studentId}-${sa?.subjectId}`;
            map.set(key, sa);
          });
          return Array.from(map.values());
        }
      } catch (e) {
        console.error('Error parsing subjectAssignments', e);
      }
    }
    const map = new Map();
    INITIAL_ASSIGNMENTS.forEach(sa => {
      const key = sa?.id || `${sa?.studentId}-${sa?.subjectId}`;
      map.set(key, sa);
    });
    return Array.from(map.values());
  });

  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>(() => {
    const dbVersion = localStorage.getItem('ssu_db_version_v4');
    const storedDb = localStorage.getItem('ssu_clearance_master_db');
    if (dbVersion === '4.0' && storedDb) {
      try {
        const parsed = JSON.parse(storedDb);
        if (parsed.signatureRequests && Array.isArray(parsed.signatureRequests)) {
          const map = new Map();
          parsed.signatureRequests.forEach((r: SignatureRequest) => { if (r?.id) map.set(r.id, r); });
          return Array.from(map.values());
        }
      } catch (e) {
        console.error('Error parsing signatureRequests', e);
      }
    }
    const map = new Map();
    INITIAL_REQUESTS.forEach(r => { if (r?.id) map.set(r.id, r); });
    return Array.from(map.values());
  });

  const [digitalSignatures, setDigitalSignatures] = useState<DigitalSignature[]>(() => {
    const dbVersion = localStorage.getItem('ssu_db_version_v4');
    const storedDb = localStorage.getItem('ssu_clearance_master_db');
    if (dbVersion === '4.0' && storedDb) {
      try {
        const parsed = JSON.parse(storedDb);
        if (parsed.digitalSignatures && Array.isArray(parsed.digitalSignatures)) {
          const map = new Map();
          parsed.digitalSignatures.forEach((ds: DigitalSignature) => { if (ds?.id) map.set(ds.id, ds); });
          return Array.from(map.values());
        }
      } catch (e) {
        console.error('Error parsing digitalSignatures', e);
      }
    }
    const map = new Map();
    INITIAL_DIGITAL_SIGNATURES.forEach(ds => { if (ds?.id) map.set(ds.id, ds); });
    return Array.from(map.values());
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const dbVersion = localStorage.getItem('ssu_db_version_v4');
    const storedDb = localStorage.getItem('ssu_clearance_master_db');
    if (dbVersion === '4.0' && storedDb) {
      try {
        const parsed = JSON.parse(storedDb);
        if (parsed.notifications && Array.isArray(parsed.notifications)) {
          const map = new Map();
          parsed.notifications.forEach((n: Notification) => { if (n?.id) map.set(n.id, n); });
          return Array.from(map.values());
        }
      } catch (e) {
        console.error('Error parsing notifications', e);
      }
    }
    const map = new Map();
    INITIAL_NOTIFICATIONS.forEach(n => { if (n?.id) map.set(n.id, n); });
    return Array.from(map.values());
  });

  const [academicYear] = useState('2026-2027');
  const [semester] = useState('1st Semester');

  // Background sync with Supabase on mount
  useEffect(() => {
    const syncProfiles = async () => {
      const remoteProfiles = await supabaseDb.fetchProfiles();
      setStudents(remoteProfiles
        .filter(profile => profile.role === 'student')
        .map(profile => ({
          id: profile.id,
          userId: profile.id,
          studentId: profile.studentId || '',
          name: profile.name,
          email: profile.email,
          course: profile.course || '',
          yearLevel: profile.yearLevel || '',
          section: profile.section || '',
          department: profile.department,
          isActive: profile.isActive === true
        })));
      setInstructors(remoteProfiles
        .filter(profile => profile.role === 'instructor' || profile.isInstructor)
        .map(profile => ({
          id: profile.id,
          userId: profile.id,
          name: profile.name,
          email: profile.email,
          department: profile.department,
          isActive: profile.isActive === true,
          isAdmin: profile.isAdmin,
          title: profile.title
        })));
    };

    const syncFromSupabase = async () => {
      try {
        const [remoteProfiles, remoteSubs, remoteCatalog, remoteAssignments, remoteRequests, remoteSigs, remoteNotifs] = await Promise.all([
          supabaseDb.fetchProfiles(),
          supabaseDb.fetchClassOfferings(),
          supabaseDb.fetchSubjects(),
          supabaseDb.fetchStudentSubjects(),
          supabaseDb.fetchSignatureRequests(),
          supabaseDb.fetchDigitalSignatures(),
          supabaseDb.fetchNotifications()
        ]);
        setCatalogError(null);
        setOfferings(remoteSubs);

        setStudents(remoteProfiles
          .filter(profile => profile.role === 'student')
          .map(profile => ({
            id: profile.id,
            userId: profile.id,
            studentId: profile.studentId || '',
            name: profile.name,
            email: profile.email,
            course: profile.course || '',
            yearLevel: profile.yearLevel || '',
            section: profile.section || '',
            department: profile.department,
            isActive: profile.isActive !== false
          })));

        setInstructors(remoteProfiles
          .filter(profile => profile.role === 'instructor' || profile.isInstructor)
          .map(profile => ({
            id: profile.id,
            userId: profile.id,
            name: profile.name,
            email: profile.email,
            department: profile.department,
            isActive: profile.isActive !== false,
            isAdmin: profile.isAdmin,
            title: profile.title
          })));

        if ((remoteSubs && remoteSubs.length > 0) || (remoteCatalog && remoteCatalog.length > 0)) {
          setSubjects(prev => {
            const map = new Map<string, Subject>();
            prev.forEach(s => map.set(s.id, s));
            remoteCatalog.forEach(s => map.set(s.id, s));
            remoteSubs.forEach(s => map.set(s.id, s));
            return Array.from(map.values());
          });
        }

        if (remoteAssignments && remoteAssignments.length > 0) {
          setSubjectAssignments(prev => {
            const map = new Map<string, SubjectAssignment>();
            prev.forEach(sa => map.set(sa.id || `${sa.studentId}-${sa.subjectId}`, sa));
            remoteAssignments.forEach(sa => map.set(sa.id || `${sa.studentId}-${sa.subjectId}`, sa));
            return Array.from(map.values());
          });
        }

        if (remoteRequests && remoteRequests.length > 0) {
          setSignatureRequests(prev => {
            const map = new Map<string, SignatureRequest>();
            prev.forEach(r => map.set(r.id, r));
            remoteRequests.forEach(r => map.set(r.id, r));
            return Array.from(map.values());
          });
        }

        if (remoteSigs && remoteSigs.length > 0) {
          setDigitalSignatures(prev => {
            const map = new Map<string, DigitalSignature>();
            prev.forEach(ds => map.set(ds.id, ds));
            remoteSigs.forEach(ds => map.set(ds.id, ds));
            return Array.from(map.values());
          });
        }

        if (remoteNotifs && remoteNotifs.length > 0) {
          setNotifications(prev => {
            const map = new Map<string, Notification>();
            prev.forEach(n => map.set(n.id, n));
            remoteNotifs.forEach(n => map.set(n.id, n));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn('[DbContext] Supabase background sync notice:', err);
        setCatalogError(err instanceof Error ? err.message : 'Unable to load subject offerings from the database.');
      }
    };

    syncFromSupabase();
    const profileChannel = supabase
      .channel('profiles-admin-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, syncProfiles)
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    const payload = {
      subjects,
      students,
      instructors,
      subjectAssignments,
      signatureRequests,
      digitalSignatures,
      notifications
    };
    localStorage.setItem('ssu_clearance_master_db', JSON.stringify(payload));
  }, [subjects, students, instructors, subjectAssignments, signatureRequests, digitalSignatures, notifications]);

  // Shared Subject Catalog: Add New Shared Subject with duplicate check
  const addSharedSubject = (params: {
    subjectCode: string;
    subjectName: string;
    instructorId: string;
    yearLevel: string;
    semester: string;
    section: string;
    units?: number;
    room?: string;
    scheduleTime?: string;
    autoSelectForStudentId?: string;
  }) => {
    const cleanCode = params.subjectCode.trim().toUpperCase();
    const cleanName = params.subjectName.trim();
    const cleanYear = params.yearLevel || '3rd Year';

    // Duplicate Check: Check if subject code already exists in that year level (or overall database)
    const existing = subjects.find(s => 
      s.subjectCode.trim().toUpperCase() === cleanCode && 
      (s.yearLevel === cleanYear || !s.yearLevel)
    );

    if (existing) {
      // If student asked to auto-select, we can still link them to the existing subject
      if (params.autoSelectForStudentId) {
        selectSubject(params.autoSelectForStudentId, existing.id, params.instructorId || existing.instructorId);
      }
      return {
        success: false,
        isDuplicate: true,
        existingSubject: existing,
        message: 'This subject already exists. You can use the existing subject instead.'
      };
    }

    const newSubId = `sub_${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now().toString(36)}`;
    const newSubject: Subject = {
      id: newSubId,
      subjectCode: cleanCode,
      subjectName: cleanName,
      instructorId: params.instructorId,
      yearLevel: cleanYear,
      semester: params.semester || '1st Semester',
      section: params.section || 'BS Info Tech 3D',
      units: params.units || 3,
      room: params.room || 'ACAD Bldg',
      scheduleTime: params.scheduleTime || 'TBA',
      createdBy: params.autoSelectForStudentId
    };

    setSubjects(prev => [...prev, newSubject]);

    // Async sync with Supabase
    supabaseDb.createSharedSubject({
      id: newSubId,
      subjectCode: cleanCode,
      subjectName: cleanName,
      instructorId: params.instructorId,
      yearLevel: cleanYear,
      semester: params.semester || '1st Semester',
      section: params.section || 'BS Info Tech 3D',
      units: params.units || 3,
      createdBy: params.autoSelectForStudentId
    });

    // Auto-select for creating student if requested
    if (params.autoSelectForStudentId) {
      const newAssignment: SubjectAssignment = {
        id: `sa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        studentId: params.autoSelectForStudentId,
        subjectId: newSubId,
        instructorId: params.instructorId,
        semester: params.semester || '1st Semester',
        academicYear
      };
      setSubjectAssignments(prev => [...prev, newAssignment]);
      supabaseDb.selectSubject(params.autoSelectForStudentId, newSubId, params.instructorId);
    }

    return {
      success: true,
      message: `Subject ${cleanCode} added to shared catalog successfully.`,
      subject: newSubject
    };
  };

  // Shared Subject Catalog: Edit Shared Subject (propagates updates)
  const updateSharedSubject = (subjectId: string, params: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          ...params,
          subjectCode: params.subjectCode ? params.subjectCode.trim().toUpperCase() : s.subjectCode,
          subjectName: params.subjectName ? params.subjectName.trim() : s.subjectName
        };
      }
      return s;
    }));

    // Async sync with Supabase
    supabaseDb.updateSharedSubject(subjectId, params);

    // If instructor changed, update subjectAssignments for all students assigned to this subject
    if (params.instructorId) {
      setSubjectAssignments(prev => prev.map(sa => {
        if (sa.subjectId === subjectId) {
          return { ...sa, instructorId: params.instructorId! };
        }
        return sa;
      }));
    }

    return { success: true, message: 'Shared subject updated for all students.' };
  };

  // Shared Subject Catalog: Delete Shared Subject
  const deleteSharedSubject = (subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    setSubjectAssignments(prev => prev.filter(sa => sa.subjectId !== subjectId));
    setSignatureRequests(prev => prev.filter(r => r.subjectId !== subjectId));
    setDigitalSignatures(prev => prev.filter(s => s.subjectId !== subjectId));

    // Async sync with Supabase
    supabaseDb.deleteSharedSubject(subjectId);

    return { success: true, message: 'Subject removed from shared database.' };
  };

  // Student selects a shared subject to add to their personal list
  const selectSubject = (studentId: string, subjectId: string, instructorId?: string) => {
    const existing = subjectAssignments.find(sa => sa.studentId === studentId && sa.subjectId === subjectId);
    if (existing) {
      return { success: true, message: 'Subject is already in your selected list.' };
    }

    const subject = subjects.find(s => s.id === subjectId);
    const resolvedInstructorId = subject?.instructorId || instructors[0]?.userId || 'u_sultan';

    const newAssignment: SubjectAssignment = {
      id: `sa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      subjectId,
      instructorId: resolvedInstructorId,
      semester: subject?.semester || semester,
      academicYear
    };

    setSubjectAssignments(prev => [...prev, newAssignment]);

    // Async sync with Supabase
    supabaseDb.selectSubject(studentId, subjectId, resolvedInstructorId);
    supabaseDb.enrollStudent(studentId, subjectId);

    return { success: true, message: `Added ${subject?.subjectCode || 'subject'} to My Selected Subjects.` };
  };

  const addEligibleSubject = async (studentId: string, subjectId: string) => {
    const existing = subjectAssignments.find(sa => sa.studentId === studentId && sa.subjectId === subjectId);
    if (existing) return { success: true, message: 'Subject is already in your selected list.' };

    const result = await supabaseDb.addEligibleSubject(subjectId);
    if (!result.success) return result;

    const subject = subjects.find(item => item.id === subjectId);
    const assignment: SubjectAssignment = {
      id: `sa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      subjectId,
      instructorId: subject?.instructorId || '',
      semester: subject?.semester || semester,
      academicYear: subject?.academicYear || academicYear
    };
    setSubjectAssignments(previous => [...previous, assignment]);
    return { success: true, message: `${subject?.subjectCode || 'Subject'} added to your selected list.` };
  };

  // Student unselects / removes a subject from their personal list
  const unselectSubject = (studentId: string, subjectId: string) => {
    setSubjectAssignments(prev => prev.filter(sa => !(sa.studentId === studentId && sa.subjectId === subjectId)));
    setSignatureRequests(prev => prev.filter(r => !(r.studentId === studentId && r.subjectId === subjectId)));
    setDigitalSignatures(prev => prev.filter(s => !(s.studentId === studentId && s.subjectId === subjectId)));

    // Async sync with Supabase
    supabaseDb.unselectSubject(studentId, subjectId);

    return { success: true, message: 'Subject removed from your selected list.' };
  };


  // Toggle selection
  const toggleSelectSubject = (studentId: string, subjectId: string, instructorId?: string) => {
    const isSelected = subjectAssignments.some(sa => sa.studentId === studentId && sa.subjectId === subjectId);
    if (isSelected) {
      unselectSubject(studentId, subjectId);
      return { success: true, isSelected: false, message: 'Subject deselected.' };
    } else {
      selectSubject(studentId, subjectId, instructorId);
      return { success: true, isSelected: true, message: 'Subject selected.' };
    }
  };

  // Core Rule: Student requests signature -> STRICTLY assigns request to the instructor mapped to student's subject assignment
  const createSignatureRequest = (params: { studentId: string; subjectId: string; remarks?: string }) => {
    // 1. Find the official subject assignment
    const assignment = subjectAssignments.find(sa => sa.studentId === params.studentId && sa.subjectId === params.subjectId);
    if (!assignment) {
      return { success: false, message: 'You are not officially assigned to this subject.' };
    }

    const assignedInstructorId = assignment.instructorId;
    const existingIndex = signatureRequests.findIndex(r => r.studentId === params.studentId && r.subjectId === params.subjectId);

    if (existingIndex >= 0) {
      const existingRequest = signatureRequests[existingIndex];
      if (existingRequest.status === 'Pending') {
        return { success: false, message: 'A clearance request is already pending for this subject.' };
      }
      if (existingRequest.status === 'Approved') {
        return { success: false, message: 'This subject clearance has already been approved.' };
      }
    }

    const newRequestId = existingIndex >= 0 ? signatureRequests[existingIndex].id : `req_${Date.now()}`;
    const newRequest: SignatureRequest = {
      id: newRequestId,
      studentId: params.studentId,
      subjectId: params.subjectId,
      instructorId: assignedInstructorId, // Strictly bound to assigned instructor!
      status: 'Pending',
      remarks: params.remarks || '',
      requestedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      // Replace existing with new request
      setSignatureRequests(prev => prev.map((r, idx) => idx === existingIndex ? newRequest : r));
    } else {
      setSignatureRequests(prev => [newRequest, ...prev]);
    }

    // Add notification for the instructor with enhanced details
    const subject = subjects.find(s => s.id === params.subjectId);
    const student = students.find(s => s.userId === params.studentId);
    const studentName = student ? student.name : 'A student';
    const studentId = student ? student.studentId : 'Unknown';
    const subCode = subject ? subject.subjectCode : 'a subject';
    const subName = subject ? subject.subjectName : 'Unknown Subject';

    const notif: Notification = {
      id: `notif_${Date.now()}`,
      userId: assignedInstructorId,
      title: '🔔 New Signature Request',
      message: `${studentName} (${studentId}) requested clearance for ${subCode} - ${subName}. ${params.remarks ? `Remarks: ${params.remarks}` : ''}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedRequestId: newRequestId,
      type: 'info'
    };
    setNotifications(prev => [notif, ...prev]);
    supabaseDb.createNotification(notif);

    // Browser notification for immediate attention (if permitted)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('New Signature Request', {
        body: `${studentName} submitted a clearance request for ${subCode}`,
        icon: '/favicon.ico'
      });
    }

    // Sync with Supabase
    supabaseDb.createSignatureRequest(params.studentId, params.subjectId, assignedInstructorId, params.remarks, newRequestId);

    return { success: true, message: 'Signature request sent to your assigned instructor successfully.' };
  };


  // Student CRUD: Add or Edit a Subject with its Code, Name, Instructor, and Status
  const saveStudentSubject = (params: {
    studentId: string;
    assignmentId?: string;
    subjectId?: string;
    subjectCode: string;
    subjectName: string;
    instructorId: string;
    status: SignatureStatus;
    scheduleTime?: string;
    room?: string;
    units?: number;
    remarks?: string;
    instructorRemarks?: string;
  }) => {
    const {
      studentId,
      assignmentId,
      subjectId,
      subjectCode,
      subjectName,
      instructorId,
      status,
      scheduleTime,
      room,
      units,
      remarks,
      instructorRemarks
    } = params;

    if (status === 'Approved') {
      return { success: false, message: 'An instructor must submit a valid grade and drawn signature to approve clearance.' };
    }

    let targetSubjectId = subjectId;

    // 1. Create or Update Subject Record
    if (targetSubjectId && subjects.some(s => s.id === targetSubjectId)) {
      setSubjects(prev => prev.map(s => s.id === targetSubjectId ? {
        ...s,
        subjectCode: subjectCode.trim().toUpperCase(),
        subjectName: subjectName.trim(),
        scheduleTime: scheduleTime || s.scheduleTime,
        room: room || s.room,
        units: units !== undefined ? units : (s.units || 3)
      } : s));
    } else {
      targetSubjectId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newSub: Subject = {
        id: targetSubjectId,
        subjectCode: subjectCode.trim().toUpperCase(),
        subjectName: subjectName.trim(),
        scheduleTime: scheduleTime || '8:00 - 10:00 AM',
        room: room || 'Main Acad Bldg',
        units: units || 3
      };
      setSubjects(prev => [...prev, newSub]);
    }

    // 2. Create or Update Subject Assignment for Student
    let targetAssignmentId = assignmentId;
    if (targetAssignmentId && subjectAssignments.some(sa => sa.id === targetAssignmentId)) {
      setSubjectAssignments(prev => prev.map(sa => sa.id === targetAssignmentId ? {
        ...sa,
        subjectId: targetSubjectId!,
        instructorId: instructorId,
        semester,
        academicYear
      } : sa));
    } else {
      targetAssignmentId = `sa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newAssignment: SubjectAssignment = {
        id: targetAssignmentId,
        studentId,
        subjectId: targetSubjectId,
        instructorId,
        semester,
        academicYear
      };
      setSubjectAssignments(prev => [...prev, newAssignment]);
    }

    const savedSubject = subjects.find(subject => subject.id === targetSubjectId);
    const subjectWrite = savedSubject
      ? supabaseDb.updateSharedSubject(targetSubjectId, {
          subjectCode: subjectCode.trim().toUpperCase(),
          subjectName: subjectName.trim(),
          units: units || 3,
          room,
        })
      : supabaseDb.createSharedSubject({
          id: targetSubjectId,
          subjectCode: subjectCode.trim().toUpperCase(),
          subjectName: subjectName.trim(),
          instructorId,
          yearLevel: '3rd Year',
          semester,
          section: '',
          units: units || 3,
          createdBy: studentId,
        });
    void subjectWrite;
    void supabaseDb.saveStudentSubject({
      studentId,
      subjectId: targetSubjectId,
      instructorId,
      academicYear,
      semester,
      status,
    });

    // 3. Synchronize Status (Not Requested / Pending / Approved / Rejected)
    const existingReqIndex = signatureRequests.findIndex(r => r.studentId === studentId && r.subjectId === targetSubjectId);
    const existingReq = existingReqIndex >= 0 ? signatureRequests[existingReqIndex] : null;
    const instructor = instructors.find(i => i.userId === instructorId || i.id === instructorId);
    const instructorName = instructor?.name || 'Assigned Instructor';

    if (status === 'Not Requested') {
      setSignatureRequests(prev => prev.filter(r => !(r.studentId === studentId && r.subjectId === targetSubjectId)));
      setDigitalSignatures(prev => prev.filter(s => !(s.studentId === studentId && s.subjectId === targetSubjectId)));
    } else if (status === 'Pending') {
      const newReqId = existingReq?.id || `req_${Date.now()}`;
      const reqObj: SignatureRequest = {
        id: newReqId,
        studentId,
        subjectId: targetSubjectId,
        instructorId,
        status: 'Pending',
        remarks: remarks || existingReq?.remarks || 'Clearance requirement submitted for review.',
        requestedAt: existingReq?.requestedAt || new Date().toISOString()
      };
      if (existingReqIndex >= 0) {
        setSignatureRequests(prev => prev.map((r, i) => i === existingReqIndex ? reqObj : r));
      } else {
        setSignatureRequests(prev => [reqObj, ...prev]);
      }
      setDigitalSignatures(prev => prev.filter(s => !(s.studentId === studentId && s.subjectId === targetSubjectId)));
    } else if (status === 'Rejected') {
      const newReqId = existingReq?.id || `req_${Date.now()}`;
      const reviewedAt = new Date().toISOString();
      const reqObj: SignatureRequest = {
        id: newReqId,
        studentId,
        subjectId: targetSubjectId,
        instructorId,
        status: 'Rejected',
        remarks: remarks || existingReq?.remarks || 'Clearance request submitted.',
        instructorRemarks: instructorRemarks || existingReq?.instructorRemarks || 'Please submit missing laboratory reports & project documents.',
        requestedAt: existingReq?.requestedAt || new Date().toISOString(),
        reviewedAt,
        reviewedBy: instructorName
      };
      if (existingReqIndex >= 0) {
        setSignatureRequests(prev => prev.map((r, i) => i === existingReqIndex ? reqObj : r));
      } else {
        setSignatureRequests(prev => [reqObj, ...prev]);
      }
      setDigitalSignatures(prev => prev.filter(s => !(s.studentId === studentId && s.subjectId === targetSubjectId)));
    }

    return { success: true, message: 'Subject information and status saved successfully.' };
  };

  // Student CRUD: Delete Subject from list
  const deleteStudentSubject = (params: { studentId: string; assignmentId: string; subjectId: string }) => {
    const { studentId, assignmentId, subjectId } = params;
    setSubjectAssignments(prev => prev.filter(sa => sa.id !== assignmentId));
    setSignatureRequests(prev => prev.filter(r => !(r.studentId === studentId && r.subjectId === subjectId)));
    setDigitalSignatures(prev => prev.filter(s => !(s.studentId === studentId && s.subjectId === subjectId)));
    return { success: true, message: 'Subject removed from your list.' };
  };

  // Student CRUD: Reset or Load BS Info Tech 3D Default Schedule
  const resetStudentSubjects = (studentId: string) => {
    const defaultAssignments: SubjectAssignment[] = [
      { id: `sa_${studentId}_1_${Date.now()}`, subjectId: 'sub_gee4', instructorId: 'u_sultan', studentId, semester: '1st Semester', academicYear: '2026-2027' },
      { id: `sa_${studentId}_2_${Date.now()}`, subjectId: 'sub_cdc101', instructorId: 'u_facultyp', studentId, semester: '1st Semester', academicYear: '2026-2027' },
      { id: `sa_${studentId}_3_${Date.now()}`, subjectId: 'sub_ws101', instructorId: 'u_facultyz', studentId, semester: '1st Semester', academicYear: '2026-2027' },
      { id: `sa_${studentId}_4_${Date.now()}`, subjectId: 'sub_gee3', instructorId: 'u_delrosario', studentId, semester: '1st Semester', academicYear: '2026-2027' },
      { id: `sa_${studentId}_5_${Date.now()}`, subjectId: 'sub_mad101', instructorId: 'u_niego', studentId, semester: '1st Semester', academicYear: '2026-2027' },
      { id: `sa_${studentId}_6_${Date.now()}`, subjectId: 'sub_sia101', instructorId: 'u_uy', studentId, semester: '1st Semester', academicYear: '2026-2027' },
      { id: `sa_${studentId}_7_${Date.now()}`, subjectId: 'sub_da101', instructorId: 'u_pangilinan', studentId, semester: '1st Semester', academicYear: '2026-2027' },
      { id: `sa_${studentId}_8_${Date.now()}`, subjectId: 'sub_sad101', instructorId: 'u_carbongquillo', studentId, semester: '1st Semester', academicYear: '2026-2027' }
    ];

    setSubjectAssignments(prev => {
      const withoutStudent = prev.filter(sa => sa.studentId !== studentId);
      return [...withoutStudent, ...defaultAssignments];
    });

    return { success: true, message: 'Loaded official BS Info Tech 3D curriculum subjects.' };
  };

  const submitInstructorGradeSignature = async (params: {
    requestId: string;
    instructorId: string;
    grade: number;
    signatureSvg: string;
    remarks?: string;
  }) => {
    const request = signatureRequests.find(item => item.id === params.requestId);
    const assignment = request && subjectAssignments.find(item =>
      item.studentId === request.studentId && item.subjectId === request.subjectId
    );
    if (!request || request.status !== 'Pending' || !assignment ||
        assignment.instructorId !== params.instructorId || request.instructorId !== params.instructorId) {
      return { success: false, message: 'This request is no longer pending or is not assigned to you.' };
    }
    if (!Number.isFinite(params.grade) || params.grade < 1 || params.grade > 5 ||
        Math.round(params.grade * 4) !== params.grade * 4) {
      return { success: false, message: 'Grade must be between 1.00 and 5.00 in 0.25 increments.' };
    }
    if (!params.signatureSvg.trim() || params.signatureSvg.length > 20000) {
      return { success: false, message: 'Draw and save your signature before submitting.' };
    }

    const result = await supabaseDb.submitInstructorGradeSignature(params);
    if (!result.success) return result;

    const reviewedAt = new Date().toISOString();
    const instructorName = instructors.find(item =>
      item.userId === params.instructorId || item.id === params.instructorId
    )?.name || 'Instructor';
    setSignatureRequests(previous => previous.map(item => item.id === params.requestId ? {
      ...item,
      status: 'Approved',
      instructorRemarks: params.remarks || '',
      reviewedAt,
      reviewedBy: instructorName
    } : item));
    const subject = subjects.find(item => item.id === request.subjectId);
    const signature: DigitalSignature = {
      id: `sig_${Date.now()}`,
      signatureRequestId: request.id,
      studentId: request.studentId,
      subjectId: request.subjectId,
      instructorId: params.instructorId,
      instructorName,
      signedAt: reviewedAt,
      signatureStatus: 'Approved',
      signatureSvg: params.signatureSvg,
      grade: params.grade,
      remarks: params.remarks,
      academicYear: assignment.academicYear,
      semester: assignment.semester
    };
    setDigitalSignatures(previous => [signature, ...previous.filter(item => item.signatureRequestId !== request.id)]);
    return { success: true, message: `${subject?.subjectCode || 'Subject'} grade signed and submitted.` };
  };

  // Instructor rejects clearance with required reason
  const rejectRequest = async (requestId: string, instructorId: string, reason: string) => {
    const request = signatureRequests.find(r => r.id === requestId);
    if (!request) return { success: false, message: 'Signature request was not found.' };

    const assignment = subjectAssignments.find(sa => sa.studentId === request.studentId && sa.subjectId === request.subjectId);
    if (request.status !== 'Pending' || !assignment || assignment.instructorId !== instructorId || request.instructorId !== instructorId) {
      return { success: false, message: 'This request is no longer pending or is not assigned to you.' };
    }
    if (!reason.trim()) return { success: false, message: 'A rejection reason is required.' };

    const rejected = await supabaseDb.rejectRequest(requestId, reason.trim());
    if (!rejected) return { success: false, message: 'The rejection could not be saved. Refresh and try again.' };

    const reviewedAt = new Date().toISOString();
    setSignatureRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'Rejected',
          instructorRemarks: reason.trim(),
          reviewedAt,
          reviewedBy: instructors.find(item => item.userId === instructorId || item.id === instructorId)?.name || 'Instructor'
        };
      }
      return r;
    }));

    return { success: true, message: 'Request rejected and the student has been notified.' };
  };


  const addInstructorRemarks = (requestId: string, remarks: string) => {
    setSignatureRequests(prev => prev.map(r => r.id === requestId ? { ...r, instructorRemarks: remarks } : r));
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    supabaseDb.markNotificationRead(notificationId);
  };

  const markAllNotificationsAsRead = (userId: string) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n));
    notifications.filter(n => n.userId === userId && !n.isRead).forEach(n => supabaseDb.markNotificationRead(n.id));
  };

  // Admin Actions
  const addSubject = async (sub: Omit<Subject, 'id'>) => {
    const newSub: Subject = { ...sub, id: `sub_${Date.now()}`, status: sub.status || 'Pending' };
    const result = await supabaseDb.createClassOffering(newSub);
    if (!result.success) {
      console.warn('[DbContext] addSubject failed:', result.message);
      return result;
    }
    setSubjects(prev => [...prev, newSub]);
    setOfferings(prev => [...prev, newSub]);
    return result;
  };

  const submitInstructorOffering = (sub: Omit<Subject, 'id'>) => {
    const id = `offering_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const offering: Subject = { ...sub, id, status: 'Pending', createdBy: sub.createdBy || 'instructor' };
    setSubjects(prev => [...prev, offering]);
    setOfferings(prev => [...prev, offering]);
    supabaseDb.createClassOffering(offering);
    return { success: true, message: 'Subject offering submitted for administrator approval.' };
  };

  const reviewSubjectOffering = (id: string, status: 'Approved' | 'Rejected') => {
    if (!subjects.some(subject => subject.id === id)) return { success: false, message: 'Subject offering not found.' };
    setSubjects(prev => prev.map(subject => subject.id === id ? { ...subject, status } : subject));
    setOfferings(prev => prev.map(subject => subject.id === id ? { ...subject, status } : subject));
    supabaseDb.updateClassOffering(id, { status });
    return { success: true, message: status === 'Approved' ? 'Offering approved. Activate it when ready.' : 'Offering rejected.' };
  };

  const toggleSubjectOffering = (id: string) => {
    const subject = subjects.find(item => item.id === id);
    if (!subject || !['Approved', 'Active', 'Inactive'].includes(subject.status || '')) {
      return { success: false, message: 'Only approved offerings can be activated.' };
    }
    const status = subject.status === 'Active' ? 'Inactive' : 'Active';
    setSubjects(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    setOfferings(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    supabaseDb.updateClassOffering(id, { status });
    return { success: true, message: `Offering is now ${status.toLowerCase()}.` };
  };

  const updateSubject = (id: string, sub: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...sub } : s));
    setOfferings(prev => prev.map(s => s.id === id ? { ...s, ...sub } : s));
    supabaseDb.updateSharedSubject(id, sub);
    supabaseDb.updateClassOffering(id, sub);
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setOfferings(prev => prev.filter(s => s.id !== id));
    setSubjectAssignments(prev => prev.filter(sa => sa.subjectId !== id));
    supabaseDb.deleteSharedSubject(id);
  };

  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent: Student = { ...student, id: `s_${Date.now()}` };
    setStudents(prev => [...prev, newStudent]);
    supabaseDb.upsertProfile({
      id: student.userId,
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      department: student.department,
      role: 'student',
      course: student.course,
      yearLevel: student.yearLevel,
      section: student.section,
      isActive: student.isActive
    });
  };

  const updateStudent = (id: string, student: Partial<Student>) => {
    setStudents(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...student } : s);
      const profile = updated.find(s => s.id === id);
      if (profile) {
        supabaseDb.upsertProfile({
          id: profile.userId,
          name: profile.name,
          email: profile.email,
          studentId: profile.studentId,
          department: profile.department,
          role: 'student',
          course: profile.course,
          yearLevel: profile.yearLevel,
          section: profile.section,
          isActive: profile.isActive
        });
      }
      return updated;
    });
  };

  const toggleStudentStatus = (id: string) => {
    setStudents(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s);
      const profile = updated.find(s => s.id === id);
      if (profile) supabaseDb.upsertProfile({
        id: profile.userId,
        name: profile.name,
        email: profile.email,
        studentId: profile.studentId,
        department: profile.department,
        role: 'student',
        course: profile.course,
        yearLevel: profile.yearLevel,
        section: profile.section,
        isActive: profile.isActive
      });
      return updated;
    });
  };

  const changeStudentToInstructor = async (id: string) => {
    const student = students.find(item => item.id === id);
    if (!student) return false;

    const updated = await supabaseDb.updateProfileRole(student.userId, 'instructor');
    if (!updated) return false;

    setStudents(prev => prev.filter(item => item.id !== id));
    setInstructors(prev => [...prev, {
      id: student.id,
      userId: student.userId,
      name: student.name,
      email: student.email,
      department: student.department,
      isActive: student.isActive,
      isAdmin: false,
      title: undefined
    }]);
    return true;
  };

  const addInstructor = (inst: Omit<Instructor, 'id'>) => {
    const newInst: Instructor = { ...inst, id: `inst_${Date.now()}` };
    setInstructors(prev => [...prev, newInst]);
    supabaseDb.upsertProfile({
      id: inst.userId,
      name: inst.name,
      email: inst.email,
      department: inst.department,
      role: 'instructor',
      isActive: inst.isActive,
      isAdmin: inst.isAdmin,
      title: inst.title
    });
  };

  const updateInstructor = (id: string, inst: Partial<Instructor>) => {
    setInstructors(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, ...inst } : i);
      const profile = updated.find(i => i.id === id);
      if (profile) supabaseDb.upsertProfile({
        id: profile.userId,
        name: profile.name,
        email: profile.email,
        department: profile.department,
        role: 'instructor',
        isActive: profile.isActive,
        isAdmin: profile.isAdmin,
        title: profile.title
      });
      return updated;
    });
  };

  const toggleInstructorStatus = (id: string) => {
    setInstructors(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, isActive: !i.isActive } : i);
      const profile = updated.find(i => i.id === id);
      if (profile) supabaseDb.upsertProfile({
        id: profile.userId,
        name: profile.name,
        email: profile.email,
        department: profile.department,
        role: 'instructor',
        isActive: profile.isActive,
        isAdmin: profile.isAdmin,
        title: profile.title
      });
      return updated;
    });
  };

  const createSubjectAssignment = (assignment: Omit<SubjectAssignment, 'id'>) => {
    const existing = subjectAssignments.find(sa => sa.studentId === assignment.studentId && sa.subjectId === assignment.subjectId);
    if (existing) return;
    const subject = subjects.find(item => item.id === assignment.subjectId);
    const resolvedInstructorId = subject?.instructorId || assignment.instructorId;
    const newAssignment: SubjectAssignment = { ...assignment, instructorId: resolvedInstructorId, id: `sa_${Date.now()}` };
    setSubjectAssignments(prev => [...prev, newAssignment]);
    if (assignment.studentId && assignment.subjectId) {
      supabaseDb.selectSubject(assignment.studentId, assignment.subjectId, resolvedInstructorId);
    }
  };

  const updateSubjectAssignment = (id: string, assignment: Partial<SubjectAssignment>) => {
    setSubjectAssignments(prev => prev.map(sa => sa.id === id ? { ...sa, ...assignment } : sa));
  };

  const deleteSubjectAssignment = (id: string) => {
    setSubjectAssignments(prev => prev.filter(sa => sa.id !== id));
  };

  // Query helpers
  const getStudentSubjects = (studentId: string) => {
    let assignments = subjectAssignments.filter(sa => sa.studentId === studentId);
    
    return assignments.map(assignment => {
      const subject = subjects.find(s => s.id === assignment.subjectId) || {
        id: assignment.subjectId,
        subjectCode: 'UNKNOWN',
        subjectName: 'Unknown Subject'
      };
      const instructor = instructors.find(i => i.userId === assignment.instructorId || i.id === assignment.instructorId);
      const latestRequest = signatureRequests.find(r => r.studentId === studentId && r.subjectId === assignment.subjectId);
      const digitalSignature = digitalSignatures.find(s => s.studentId === studentId && s.subjectId === assignment.subjectId);

      return {
        assignment,
        subject,
        instructor,
        latestRequest,
        digitalSignature
      };
    });
  };

  const getInstructorRequests = (instructorId: string) => {
    return signatureRequests.filter(r => r.instructorId === instructorId);
  };

  const getUserNotifications = (userId: string) => {
    return notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const refreshData = async (): Promise<boolean> => {
    try {
      const [remoteProfiles, remoteSubs, remoteCatalog, remoteAssignments, remoteRequests, remoteSigs, remoteNotifs] = await Promise.all([
        supabaseDb.fetchProfiles(),
        supabaseDb.fetchClassOfferings(),
        supabaseDb.fetchSubjects(),
        supabaseDb.fetchStudentSubjects(),
        supabaseDb.fetchSignatureRequests(),
        supabaseDb.fetchDigitalSignatures(),
        supabaseDb.fetchNotifications()
      ]);
      setCatalogError(null);
      setOfferings(remoteSubs);
      setStudents(remoteProfiles
        .filter(profile => profile.role === 'student')
        .map(profile => ({
          id: profile.id,
          userId: profile.id,
          studentId: profile.studentId || '',
          name: profile.name,
          email: profile.email,
          course: profile.course || '',
          yearLevel: profile.yearLevel || '',
          section: profile.section || '',
          department: profile.department,
          isActive: profile.isActive === true
        })));
      setInstructors(remoteProfiles
        .filter(profile => profile.role === 'instructor' || profile.isInstructor)
        .map(profile => ({
          id: profile.id,
          userId: profile.id,
          name: profile.name,
          email: profile.email,
          department: profile.department,
          isActive: profile.isActive === true,
          isAdmin: profile.isAdmin,
          title: profile.title
        })));
      if ((remoteSubs && remoteSubs.length > 0) || (remoteCatalog && remoteCatalog.length > 0)) {
        const mergedSubjects = new Map<string, Subject>();
        remoteCatalog.forEach(subject => mergedSubjects.set(subject.id, subject));
        remoteSubs.forEach(subject => mergedSubjects.set(subject.id, subject));
        setSubjects(Array.from(mergedSubjects.values()));
      }
      if (remoteAssignments && remoteAssignments.length > 0) setSubjectAssignments(remoteAssignments);
      if (remoteRequests && remoteRequests.length > 0) setSignatureRequests(remoteRequests);
      if (remoteSigs && remoteSigs.length > 0) setDigitalSignatures(remoteSigs);
      if (remoteNotifs && remoteNotifs.length > 0) setNotifications(remoteNotifs);
      return true;
    } catch (e) {
      console.error('Failed to refresh data from Supabase', e);
      setCatalogError(e instanceof Error ? e.message : 'Unable to load subject offerings from the database.');
      return false;
    }
  };

  // Instructor Student Sync - Get all students assigned to instructor's subjects
  const getInstructorStudents = (instructorId: string) => {
    // Find all subjects assigned to this instructor
    const instructorSubjects = subjects.filter(s => s.instructorId === instructorId);
    const instructorSubjectIds = instructorSubjects.map(s => s.id);
    
    // Find all student assignments for these subjects
    const studentAssignments = subjectAssignments.filter(sa => 
      instructorSubjectIds.includes(sa.subjectId)
    );
    
    // Get unique student IDs
    const uniqueStudentIds = Array.from(new Set(studentAssignments.map(sa => sa.studentId)));
    
    // Return student details
    return students.filter(s => uniqueStudentIds.includes(s.userId));
  };

  // Sync instructor with their students - creates notifications for better tracking
  const syncInstructorStudents = (instructorId: string) => {
    const instructorStudents = getInstructorStudents(instructorId);
    const instructorSubjects = subjects.filter(s => s.instructorId === instructorId);
    
    // Create sync notification
    const syncNotif: Notification = {
      id: `notif_sync_${Date.now()}`,
      userId: instructorId,
      title: 'Student Sync Complete',
      message: `Synced with ${instructorStudents.length} students across ${instructorSubjects.length} subjects.`,
      isRead: false,
      createdAt: new Date().toISOString(),
      type: 'success'
    };
    
    setNotifications(prev => [syncNotif, ...prev]);
    
    return {
      success: true,
      message: `Successfully synced with ${instructorStudents.length} students.`,
      syncedCount: instructorStudents.length
    };
  };

  return (
    <DbContext.Provider value={{
      departments,
      subjects,
      offerings,
      catalogError,
      subjectAssignments,
      signatureRequests,
      digitalSignatures,
      notifications,
      students,
      instructors,
      academicYear,
      semester,
      addSharedSubject,
      updateSharedSubject,
      deleteSharedSubject,
      selectSubject,
      addEligibleSubject,
      unselectSubject,
      toggleSelectSubject,
      createSignatureRequest,
      saveStudentSubject,
      deleteStudentSubject,
      resetStudentSubjects,
      submitInstructorGradeSignature,
      rejectRequest,
      addInstructorRemarks,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      addSubject,
      updateSubject,
      deleteSubject,
      submitInstructorOffering,
      reviewSubjectOffering,
      toggleSubjectOffering,
      addStudent,
      updateStudent,
      toggleStudentStatus,
      changeStudentToInstructor,
      addInstructor,
      updateInstructor,
      toggleInstructorStatus,
      createSubjectAssignment,
      updateSubjectAssignment,
      deleteSubjectAssignment,
      getStudentSubjects,
      getInstructorRequests,
      getUserNotifications,
      refreshData,
      syncInstructorStudents,
      getInstructorStudents
    }}>
      {children}
    </DbContext.Provider>
  );
}

export function useDb() {
  const context = useContext(DbContext);
  if (context === undefined) {
    throw new Error('useDb must be used within a DbProvider');
  }
  return context;
}
