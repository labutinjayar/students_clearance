import { supabase } from '../lib/supabase';
import { User, Subject, SubjectAssignment, SignatureRequest, DigitalSignature, Notification, Student, Instructor, SignatureStatus, OfferingHierarchy } from '../types';

export const supabaseDb = {
  // ----------------------------------------------------
  // PROFILES / USERS
  // ----------------------------------------------------
  async getProfileById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        name: data.full_name || data.name || data.email.split('@')[0],
        email: data.email,
        studentId: data.student_id,
        department: data.department || 'CIT',
        role: String(data.role || 'student').trim().toLowerCase() as User['role'],
        course: data.course || 'BS Information Technology',
        yearLevel: data.year_level || '1st Year',
        section: data.section || '',
        academicYear: data.academic_year || '2026-2027',
        semester: data.semester || '1st Semester',
        title: data.title || '',
        isActive: data.is_active === true,
        isAdmin: data.is_admin ?? (data.role === 'admin'),
        isInstructor: data.is_instructor ?? (data.role === 'instructor'),
      };
    } catch (err) {
      console.error('[Supabase] getProfileById error:', err);
      throw err;
    }
  },

  async getProfileByStudentId(studentId: string): Promise<{ email: string; profile: User } | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('student_id', studentId.trim())
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const profile: User = {
        id: data.id,
        name: data.full_name || data.name || data.email.split('@')[0],
        email: data.email,
        studentId: data.student_id,
        department: data.department || 'CIT',
        role: String(data.role || 'student').trim().toLowerCase() as User['role'],
        course: data.course || 'BS Information Technology',
        yearLevel: data.year_level || '1st Year',
        section: data.section || '',
        academicYear: data.academic_year || '2026-2027',
        semester: data.semester || '1st Semester',
        title: data.title || '',
        isActive: data.is_active === true,
        isAdmin: data.is_admin ?? (data.role === 'admin'),
        isInstructor: data.is_instructor ?? (data.role === 'instructor'),
      };

      return { email: data.email, profile };
    } catch (err) {
      console.error('[Supabase] getProfileByStudentId error:', err);
      throw err;
    }
  },

  async checkStudentIdExists(studentId: string): Promise<boolean> {
    if (!studentId || !studentId.trim()) return false;
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('student_id', studentId.trim())
      .limit(1);
    if (error) throw error;
    return Boolean(data && data.length > 0);
  },

  async checkEmailExists(email: string): Promise<boolean> {
    if (!email || !email.trim()) return false;
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', email.trim())
      .limit(1);
    if (error) throw error;
    return Boolean(data && data.length > 0);
  },

  async fetchProfiles(): Promise<User[]> {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.warn('[Supabase] fetchProfiles error, using cache/fallback:', error.message);
        return [];
      }
      return (data || []).map((p: any) => ({
        id: p.id,
        name: p.full_name || p.name || p.email.split('@')[0],
        email: p.email,
        studentId: p.student_id,
        department: p.department,
        role: String(p.role || 'student').trim().toLowerCase() as User['role'],
        course: p.course,
        yearLevel: p.year_level,
        section: p.section,
        academicYear: p.academic_year || '2026-2027',
        semester: p.semester || '1st Semester',
        title: p.title,
        isActive: p.is_active === true,
        isAdmin: p.is_admin ?? false,
        isInstructor: p.is_instructor ?? false,
      }));
    } catch (err) {
      console.error('[Supabase] fetchProfiles exception:', err);
      return [];
    }
  },

  async upsertProfile(user: User): Promise<boolean> {
    try {
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        student_id: user.studentId || null,
        department: user.department || null,
        role: user.role || 'student',
        course: user.course || null,
        year_level: user.yearLevel || null,
        section: user.section || null,
        academic_year: user.academicYear || '2026-2027',
        semester: user.semester || '1st Semester',
        title: user.title || null,
        is_active: user.isActive === true,
        is_admin: user.isAdmin ?? false,
        is_instructor: user.isInstructor ?? false,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
      if (!error) return true;

      // Keep registration compatible with databases that have not run the term migration yet.
      if (/academic_year|semester/i.test(error.message)) {
        const legacyPayload = { ...payload } as Record<string, unknown>;
        delete legacyPayload.academic_year;
        delete legacyPayload.semester;
        const { error: retryError } = await supabase.from('profiles').upsert(legacyPayload, { onConflict: 'id' });
        if (!retryError) return true;
        console.warn('[Supabase] legacy upsertProfile retry error:', retryError.message);
      }

      console.warn('[Supabase] upsertProfile error:', error.message);
      return false;
    } catch (err) {
      console.error('[Supabase] upsertProfile exception:', err);
      return false;
    }
  },

  async updateOwnProfile(userId: string, updates: Partial<Pick<User, 'name' | 'department' | 'course' | 'yearLevel' | 'section' | 'title'>>): Promise<boolean> {
    try {
      const payload = {
        ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
        ...(updates.department !== undefined ? { department: updates.department.trim() || null } : {}),
        ...(updates.course !== undefined ? { course: updates.course.trim() || null } : {}),
        ...(updates.yearLevel !== undefined ? { year_level: updates.yearLevel.trim() || null } : {}),
        ...(updates.section !== undefined ? { section: updates.section.trim() || null } : {}),
        ...(updates.title !== undefined ? { title: updates.title.trim() || null } : {}),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId)
        .select('id')
        .maybeSingle();
      if (error) {
        console.error('[Supabase] updateOwnProfile error:', error.message);
        return false;
      }
      if (!data) {
        console.error('[Supabase] updateOwnProfile failed: no profile row was updated.');
        return false;
      }
      return true;
    } catch (err) {
      console.error('[Supabase] updateOwnProfile exception:', err);
      return false;
    }
  },

  async upsertInstructorRecord(user: User, instructorId: string, position?: string): Promise<boolean> {
    const { error } = await supabase.from('instructors').upsert({
      user_id: user.id,
      instructor_id: instructorId,
      position: position || user.title || null
    }, { onConflict: 'user_id' });
    if (error) console.warn('[Supabase] upsertInstructorRecord error:', error.message);
    return !error;
  },

  async updateProfileRole(userId: string, role: User['role']): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({
        role,
        is_instructor: role === 'instructor',
        is_admin: role === 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    if (error) console.warn('[Supabase] updateProfileRole error:', error.message);
    return !error;
  },

  async checkInstructorRegistrationCode(code: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_instructor_registration_code', {
      input_code: code.trim()
    });
    if (error) {
      console.error('[Supabase] Instructor code validation error:', error.message);
      throw new Error('Instructor registration is not configured in the database. Please run the instructor code SQL setup.');
    }
    return data === true;
  },

  async consumeInstructorRegistrationCode(code: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('consume_instructor_registration_code', {
      input_code: code.trim()
    });
    if (error) {
      console.error('[Supabase] Instructor code consumption error:', error.message);
      throw new Error('Instructor registration is not configured in the database. Please run the instructor code SQL setup.');
    }
    return data === true;
  },

  // ----------------------------------------------------
  // SHARED SUBJECTS CATALOG
  // ----------------------------------------------------
  async fetchSubjects(): Promise<Subject[]> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('subject_code', { ascending: true });

      if (error) {
        console.warn('[Supabase] fetchSubjects error:', error.message);
        return [];
      }

      return (data || []).map((s: any) => ({
        id: s.id,
        subjectCode: s.subject_code,
        subjectName: s.subject_name,
        instructorId: s.instructor_id || '',
        yearLevel: s.year_level || '1st Year',
        semester: s.semester || '1st Semester',
        section: s.section || '',
        course: s.course || 'BS Information Technology',
        units: s.units || 3,
        description: s.description || '',
        department: s.department || '',
        academicYear: s.academic_year || '2026-2027',
        days: s.class_days || '',
        startTime: s.start_time || '',
        endTime: s.end_time || '',
        room: s.room || '',
        status: s.status || 'Pending',
      }));
    } catch (err) {
      console.error('[Supabase] fetchSubjects exception:', err);
      return [];
    }
  },

  async fetchClassOfferings(): Promise<Subject[]> {
    try {
      const { data, error } = await supabase.from('class_offerings').select('*, subjects(*)').order('created_at', { ascending: false });
      if (error) {
        console.warn('[Supabase] fetchClassOfferings error:', error.message);
        throw new Error(`Could not load subject offerings: ${error.message}`);
      }
      return (data || []).map((offering: any) => {
        const subject = offering.subjects || {};
        return {
          id: subject.id || offering.subject_id,
          subjectCode: subject.subject_code || 'UNKNOWN',
          subjectName: subject.subject_name || 'Unknown Subject',
          description: subject.description || '',
          instructorId: offering.instructor_id || subject.instructor_id || '',
          instructorName: offering.instructor || subject.instructor || '',
          course: offering.course || subject.course || '',
          department: offering.department || subject.department || '',
          academicYear: offering.academic_year || subject.academic_year || '2026-2027',
          semester: offering.semester || subject.semester || '1st Semester',
          yearLevel: offering.year_level || subject.year_level || '',
          section: offering.section || subject.section || '',
          days: offering.class_days || subject.class_days || '',
          startTime: offering.start_time || subject.start_time || '',
          endTime: offering.end_time || subject.end_time || '',
          room: offering.room || subject.room || '',
          status: offering.status || subject.status || 'Pending',
          units: subject.units || 3
        };
      });
    } catch (err) {
      console.warn('[Supabase] fetchClassOfferings exception:', err);
      throw err instanceof Error ? err : new Error('Unable to load subject offerings from Supabase.');
    }
  },

  async fetchActiveOfferingHierarchy(): Promise<OfferingHierarchy[]> {
    const { data, error } = await supabase.rpc('get_active_offering_hierarchy');
    if (error) {
      console.error('[Supabase] fetchActiveOfferingHierarchy error:', error.message);
      throw new Error(`Could not load academic choices: ${error.message}`);
    }
    return (data || []).map((row: any) => ({
      department: row.department || '',
      course: row.course || '',
      yearLevel: row.year_level || '',
      section: row.section || '',
    })).filter((row: OfferingHierarchy) => row.department && row.course && row.yearLevel && row.section);
  },

  async createClassOffering(subject: Subject): Promise<{ success: boolean; message: string }> {
    try {
      const subjectId = subject.id || `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const subjectPayload = {
        id: subjectId,
        subject_code: subject.subjectCode.trim().toUpperCase(),
        subject_name: subject.subjectName.trim(),
        instructor_id: subject.instructorId || null,
        instructor: subject.instructorName || null,
        course: subject.course || 'BS Information Technology',
        year_level: subject.yearLevel || '1st Year',
        semester: subject.semester || '1st Semester',
        section: subject.section || '',
        units: subject.units || 3,
        description: subject.description || null,
        department: subject.department || 'CIT',
        academic_year: subject.academicYear || '2026-2027',
        class_days: subject.days || '',
        start_time: subject.startTime || null,
        end_time: subject.endTime || null,
        room: subject.room || 'TBA',
        status: subject.status || 'Pending',
        created_by: subject.createdBy || subject.instructorId || null,
        updated_at: new Date().toISOString()
      };
      let { error: subjectError } = await supabase.from('subjects').upsert(subjectPayload, { onConflict: 'id' });
      if (subjectError && /column .* does not exist|schema cache/i.test(subjectError.message)) {
        const legacyPayload = {
          id: subjectId,
          subject_code: subject.subjectCode.trim().toUpperCase(),
          subject_name: subject.subjectName.trim(),
          instructor_id: subject.instructorId || null,
          course: subject.course || 'BS Information Technology',
          year_level: subject.yearLevel || '1st Year',
          semester: subject.semester || '1st Semester',
          section: subject.section || '',
          units: subject.units || 3,
          created_by: subject.createdBy || subject.instructorId || null,
          updated_at: new Date().toISOString()
        };
        ({ error: subjectError } = await supabase.from('subjects').upsert(legacyPayload, { onConflict: 'id' }));
      }
      if (subjectError) {
        console.warn('[Supabase] createClassOffering subject error:', subjectError.message);
        return { success: false, message: `Subject insert failed: ${subjectError.message}` };
      }
      const { error } = await supabase.from('class_offerings').insert({
        subject_id: subjectId,
        instructor_id: subject.instructorId || null,
        course: subject.course || 'BS Information Technology',
        department: subject.department || 'CIT',
        academic_year: subject.academicYear || '2026-2027',
        semester: subject.semester || '1st Semester',
        year_level: subject.yearLevel || '1st Year',
        section: subject.section || '',
        class_days: subject.days || '',
        start_time: subject.startTime || '00:00',
        end_time: subject.endTime || '00:00',
        room: subject.room || 'TBA',
        status: subject.status || 'Pending',
        created_by: subject.createdBy || subject.instructorId || null,
      });
      if (error) {
        console.warn('[Supabase] createClassOffering error:', error.message);
        if (/class_offerings|schema cache|does not exist/i.test(error.message)) {
          return {
            success: false,
            message: 'Subject saved, but class offerings are unavailable until the latest database schema is applied.'
          };
        }
        await supabase.from('subjects').delete().eq('id', subjectId);
        return { success: false, message: `Class offering insert failed: ${error.message}` };
      }
      return { success: true, message: 'Subject saved successfully.' };
    } catch (err) {
      console.warn('[Supabase] createClassOffering exception:', err);
      return { success: false, message: err instanceof Error ? err.message : 'Unable to connect to Supabase.' };
    }
  },

  async updateClassOffering(subjectId: string, updates: Partial<Subject>): Promise<boolean> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.instructorId !== undefined) payload.instructor_id = updates.instructorId || null;
    if (updates.course !== undefined) payload.course = updates.course;
    if (updates.department !== undefined) payload.department = updates.department;
    if (updates.academicYear !== undefined) payload.academic_year = updates.academicYear;
    if (updates.semester !== undefined) payload.semester = updates.semester;
    if (updates.yearLevel !== undefined) payload.year_level = updates.yearLevel;
    if (updates.section !== undefined) payload.section = updates.section;
    if (updates.days !== undefined) payload.class_days = updates.days;
    if (updates.startTime !== undefined) payload.start_time = updates.startTime || null;
    if (updates.endTime !== undefined) payload.end_time = updates.endTime || null;
    if (updates.room !== undefined) payload.room = updates.room;
    if (updates.status !== undefined) payload.status = updates.status;
    const { error } = await supabase.from('class_offerings').update(payload).eq('subject_id', subjectId);
    if (error) console.warn('[Supabase] updateClassOffering error:', error.message);
    return !error;
  },

  async createSharedSubject(params: {
    id?: string;
    subjectCode: string;
    subjectName: string;
    instructorId: string;
    yearLevel: string;
    semester: string;
    section: string;
    course?: string;
    department?: string;
    academicYear?: string;
    status?: Subject['status'];
    units?: number;
    createdBy?: string;
  }): Promise<{ success: boolean; isDuplicate?: boolean; existingSubject?: Subject; message: string; subject?: Subject }> {
    try {
      // 1. Check duplicate first
      const { data: existingData } = await supabase
        .from('subjects')
        .select('*')
        .ilike('subject_code', params.subjectCode.trim())
        .eq('year_level', params.yearLevel)
        .limit(1);

      if (existingData && existingData.length > 0) {
        const match = existingData[0];
        const existingSubject: Subject = {
          id: match.id,
          subjectCode: match.subject_code,
          subjectName: match.subject_name,
          instructorId: match.instructor_id || '',
          yearLevel: match.year_level,
          semester: match.semester,
          section: match.section,
            course: match.course || 'BS Information Technology',
          units: match.units || 3,
        };
        return {
          success: false,
          isDuplicate: true,
          existingSubject,
          message: 'This subject already exists. You can use the existing subject instead.',
        };
      }

      const id = params.id || `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const payload = {
        id,
        subject_code: params.subjectCode.trim().toUpperCase(),
        subject_name: params.subjectName.trim(),
        instructor_id: params.instructorId,
        year_level: params.yearLevel,
        semester: params.semester,
        section: params.section,
        course: params.course || 'BS Information Technology',
        department: params.department || 'CIT',
        academic_year: params.academicYear || '2026-2027',
        status: params.status || 'Active',
        units: params.units || 3,
        created_by: params.createdBy || 'student',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('subjects').insert(payload).select().single();

      if (error) {
        console.warn('[Supabase] createSharedSubject error:', error.message);
        return { success: false, message: `Failed to save subject: ${error.message}` };
      }

      const newSubject: Subject = {
        id: data.id,
        subjectCode: data.subject_code,
        subjectName: data.subject_name,
        instructorId: data.instructor_id || '',
        yearLevel: data.year_level,
        semester: data.semester,
        section: data.section,
        course: data.course || 'BS Information Technology',
        units: data.units || 3,
      };

      return {
        success: true,
        subject: newSubject,
        message: `Subject ${newSubject.subjectCode} added to shared catalog.`,
      };
    } catch (err: any) {
      console.error('[Supabase] createSharedSubject exception:', err);
      return { success: false, message: 'Unable to connect to Supabase database.' };
    }
  },

  async updateSharedSubject(subjectId: string, updates: Partial<Subject>): Promise<{ success: boolean; message: string }> {
    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.subjectCode) payload.subject_code = updates.subjectCode;
      if (updates.subjectName) payload.subject_name = updates.subjectName;
      if (updates.instructorId) payload.instructor_id = updates.instructorId;
      if (updates.yearLevel) payload.year_level = updates.yearLevel;
      if (updates.semester) payload.semester = updates.semester;
      if (updates.section) payload.section = updates.section;
      if (updates.course) payload.course = updates.course;
      if (updates.units !== undefined) payload.units = updates.units;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.department !== undefined) payload.department = updates.department;
      if (updates.academicYear !== undefined) payload.academic_year = updates.academicYear;
      if (updates.days !== undefined) payload.class_days = updates.days;
      if (updates.startTime !== undefined) payload.start_time = updates.startTime || null;
      if (updates.endTime !== undefined) payload.end_time = updates.endTime || null;
      if (updates.room !== undefined) payload.room = updates.room;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.instructorName !== undefined) payload.instructor = updates.instructorName;

      const { error } = await supabase.from('subjects').update(payload).eq('id', subjectId);
      if (error) {
        return { success: false, message: `Update failed: ${error.message}` };
      }
      return { success: true, message: 'Shared subject updated successfully across all enrolled students.' };
    } catch (err: any) {
      return { success: false, message: 'Failed to update shared subject.' };
    }
  },

  async deleteSharedSubject(subjectId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
      if (error) {
        return { success: false, message: `Delete failed: ${error.message}` };
      }
      return { success: true, message: 'Subject removed from shared catalog.' };
    } catch (err: any) {
      return { success: false, message: 'Error deleting subject from Supabase.' };
    }
  },

  // ----------------------------------------------------
  // STUDENT SUBJECT SELECTIONS
  // ----------------------------------------------------
  async fetchStudentSubjects(studentId?: string): Promise<SubjectAssignment[]> {
    try {
      let query = supabase.from('student_subjects').select('*');
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('[Supabase] fetchStudentSubjects error:', error.message);
        return [];
      }
      return (data || []).map((row: any) => ({
        id: row.id,
        studentId: row.student_id,
        subjectId: row.subject_id,
        instructorId: row.instructor_id || '',
        semester: row.semester || '1st Semester',
        academicYear: row.academic_year || '2026-2027',
      }));
    } catch (err) {
      console.error('[Supabase] fetchStudentSubjects exception:', err);
      return [];
    }
  },

  async selectSubject(studentId: string, subjectId: string, instructorId?: string): Promise<{ success: boolean; message: string }> {
    try {
      const payload = {
        student_id: studentId,
        subject_id: subjectId,
        instructor_id: instructorId || null,
        selected_at: new Date().toISOString(),
        clearance_status: 'Not Requested',
        instructor_signature_status: 'Unsigned',
      };
      const { error } = await supabase.from('student_subjects').upsert(payload, { onConflict: 'student_id,subject_id' });
      if (error) {
        return { success: false, message: `Selection failed: ${error.message}` };
      }
      return { success: true, message: 'Subject added to your selected list.' };
    } catch (err: any) {
      return { success: false, message: 'Unable to select subject in Supabase.' };
    }
  },

  async addEligibleSubject(subjectId: string): Promise<{ success: boolean; message: string }> {
    const { data, error } = await supabase.rpc('select_student_subject', {
      input_subject_id: subjectId
    });
    if (error) {
      console.error('[Supabase] addEligibleSubject error:', error.message);
      return { success: false, message: `Could not add subject: ${error.message}` };
    }
    if (data !== true) {
      return { success: false, message: 'This subject is not an active offering for your department, course, year level, and section.' };
    }
    return { success: true, message: 'Subject added to your selected list.' };
  },

  async enrollStudent(studentId: string, subjectId: string): Promise<boolean> {
    const { data: offering, error: offeringError } = await supabase
      .from('class_offerings')
      .select('id')
      .eq('subject_id', subjectId)
      .eq('status', 'Active')
      .maybeSingle();
    if (offeringError || !offering) return false;
    const { error } = await supabase.from('enrollments').upsert({
      student_id: studentId,
      class_offering_id: offering.id
    }, { onConflict: 'student_id,class_offering_id' });
    if (error) console.warn('[Supabase] enrollStudent error:', error.message);
    return !error;
  },

  async unselectSubject(studentId: string, subjectId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('student_subjects')
        .delete()
        .eq('student_id', studentId)
        .eq('subject_id', subjectId);

      if (error) {
        return { success: false, message: `Removal failed: ${error.message}` };
      }
      return { success: true, message: 'Subject removed from your selected list.' };
    } catch (err: any) {
      return { success: false, message: 'Unable to unselect subject.' };
    }
  },

  // ----------------------------------------------------
  // SIGNATURE REQUESTS & APPROVALS
  // ----------------------------------------------------
  async fetchSignatureRequests(): Promise<SignatureRequest[]> {
    try {
      const { data, error } = await supabase.from('signature_requests').select('*');
      if (error) return [];
      return (data || []).map((r: any) => ({
        id: r.id,
        studentId: r.student_id,
        subjectId: r.subject_id,
        instructorId: r.instructor_id,
        status: r.status as SignatureStatus,
        remarks: r.remarks || '',
        instructorRemarks: r.instructor_remarks || '',
        requestedAt: r.requested_at,
        reviewedAt: r.reviewed_at || r.processed_at,
        reviewedBy: r.reviewed_by || '',
      }));
    } catch (err) {
      return [];
    }
  },

  async createSignatureRequest(studentId: string, subjectId: string, instructorId: string, remarks?: string, requestId?: string): Promise<{ success: boolean; message: string }> {
    try {
      const id = requestId || `req_${Date.now()}`;
      const payload = {
        id,
        student_id: studentId,
        subject_id: subjectId,
        instructor_id: instructorId,
        status: 'Pending',
        remarks: remarks || 'Clearance signature requested',
        requested_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('signature_requests').upsert(payload, { onConflict: 'student_id,subject_id' });
      if (error) return { success: false, message: error.message };

      // Also update student_subjects status
      await supabase
        .from('student_subjects')
        .update({
          clearance_status: 'Pending',
          instructor_signature_status: 'Awaiting Sign',
        })
        .eq('student_id', studentId)
        .eq('subject_id', subjectId);

      const { error: notificationError } = await supabase.from('notifications').insert({
        id: `notif_${Date.now()}`,
        user_id: instructorId,
        title: 'New Signature Request',
        message: remarks || 'A student submitted a clearance signature request.',
        type: 'info',
        read: false,
        created_at: new Date().toISOString(),
      });
      if (notificationError) {
        console.warn('[Supabase] createSignatureRequest notification error:', notificationError.message);
      }

      return { success: true, message: 'Signature request sent successfully to instructor.' };
    } catch (err: any) {
      return { success: false, message: 'Failed to create signature request.' };
    }
  },

  async submitInstructorGradeSignature(params: {
    requestId: string;
    instructorId: string;
    grade: number;
    signatureSvg: string;
    remarks?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.rpc('submit_instructor_grade_signature', {
        input_request_id: params.requestId,
        input_grade: params.grade,
        input_signature_svg: params.signatureSvg,
        input_remarks: params.remarks?.trim() || null
      });
      if (error) {
        console.error('[Supabase] submitInstructorGradeSignature error:', error.message);
        return { success: false, message: `Grade submission failed: ${error.message}` };
      }
      if (data !== true) {
        return { success: false, message: 'The request is no longer pending, is not assigned to you, or has already been signed.' };
      }
      return { success: true, message: 'Grade and signature submitted successfully.' };
    } catch (error) {
      console.error('[Supabase] submitInstructorGradeSignature exception:', error);
      return { success: false, message: 'Unable to submit the grade and signature. Check your connection and retry.' };
    }
  },

  async rejectRequest(
    requestId: string,
    reason: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('reject_instructor_signature_request', {
        input_request_id: requestId,
        input_reason: reason.trim()
      });
      if (error) {
        console.error('[Supabase] rejectRequest error:', error.message);
        return false;
      }
      return data === true;
    } catch (error) {
      console.error('[Supabase] rejectRequest exception:', error);
      return false;
    }
  },

  // ----------------------------------------------------
  // DIGITAL SIGNATURES & NOTIFICATIONS
  // ----------------------------------------------------
  async fetchDigitalSignatures(): Promise<DigitalSignature[]> {
    try {
      const { data, error } = await supabase.from('digital_signatures').select('*');
      if (error) return [];
      return (data || []).map((ds: any) => ({
        id: ds.id,
        signatureRequestId: ds.request_id || ds.id,
        instructorId: ds.instructor_id,
        instructorName: ds.instructor_name || 'Instructor',
        studentId: ds.student_id,
        subjectId: ds.subject_id,
        signatureStatus: 'Approved',
        signatureHash: ds.signature_hash,
        signatureSvg: ds.signature_svg || undefined,
        grade: ds.grade === null || ds.grade === undefined ? undefined : Number(ds.grade),
        remarks: ds.remarks || '',
        academicYear: ds.academic_year || undefined,
        semester: ds.semester || undefined,
        signedAt: ds.signed_at,
      }));
    } catch (err) {
      return [];
    }
  },

  async fetchNotifications(userId?: string): Promise<Notification[]> {
    try {
      let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error) return [];
      return (data || []).map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.read ?? false,
        createdAt: n.created_at,
      }));
    } catch (err) {
      return [];
    }
  },

  async createNotification(notification: Notification): Promise<boolean> {
    const { error } = await supabase.from('notifications').insert({
      id: notification.id,
      user_id: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      read: notification.isRead,
      created_at: notification.createdAt,
    });
    if (error) console.warn('[Supabase] createNotification error:', error.message);
    return !error;
  },

  async markNotificationRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
    if (error) console.warn('[Supabase] markNotificationRead error:', error.message);
    return !error;
  },

  async saveStudentSubject(params: {
    studentId: string;
    subjectId: string;
    instructorId: string;
    academicYear: string;
    semester: string;
    status: SignatureStatus;
  }): Promise<boolean> {
    const { error } = await supabase.from('student_subjects').upsert({
      student_id: params.studentId,
      subject_id: params.subjectId,
      instructor_id: params.instructorId || null,
      academic_year: params.academicYear,
      semester: params.semester,
      clearance_status: params.status === 'Not Requested' ? 'Not Requested' : params.status,
      instructor_signature_status: params.status === 'Approved' ? 'Signed' : params.status === 'Pending' ? 'Awaiting Sign' : 'Unsigned',
    }, { onConflict: 'student_id,subject_id' });
    if (error) console.warn('[Supabase] saveStudentSubject error:', error.message);
    return !error;
  },

};
