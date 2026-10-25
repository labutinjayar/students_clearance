import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { OfferingHierarchy, SignatureStatus, Subject } from '../../types';
import { supabaseDb } from '../../services/supabaseDb';
import { 
  FileSignature, 
  Eye, 
  RotateCcw, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  X, 
  Send,
  BookOpen,
  Pencil,
  Trash2,
  Search,
  Check,
  ShieldCheck,
  AlertTriangle,
  User,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Building2,
  GraduationCap
} from 'lucide-react';

export function StudentBooklets() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAddSubjectPage = location.pathname === '/student/add-subject';
  const { user, updateProfile } = useAuth();
  const { 
    offerings,
    getStudentSubjects, 
    instructors,
    departments,
    catalogError,
    addEligibleSubject,
    updateSharedSubject,
    deleteSharedSubject,
    unselectSubject,
    createSignatureRequest,
    refreshData 
  } = useDb();

  // Get current student's selected subjects
  const studentItems = user ? getStudentSubjects(user.id) : [];

  // Filter & Search states
  const selectedYearLevel = user?.yearLevel || '3rd Year';
  const [searchQuery, setSearchQuery] = useState('');
  const [offeringHierarchy, setOfferingHierarchy] = useState<OfferingHierarchy[]>([]);
  const [hierarchyError, setHierarchyError] = useState<string | null>(null);
  const [isLoadingHierarchy, setIsLoadingHierarchy] = useState(false);
  const [isApplyingAcademicInfo, setIsApplyingAcademicInfo] = useState(false);
  const [browseDepartment, setBrowseDepartment] = useState(user?.department || '');
  const [browseCourse, setBrowseCourse] = useState(user?.course || '');
  const [browseYearLevel, setBrowseYearLevel] = useState(user?.yearLevel || '');
  const [browseSection, setBrowseSection] = useState(user?.section || '');

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  // Confirmation Dialog States
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [pendingEditPayload, setPendingEditPayload] = useState<any>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  // Request & Signature Detail Modals
  const [selectedItemForRequest, setSelectedItemForRequest] = useState<any | null>(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<any | null>(null);
  const [requestRemarks, setRequestRemarks] = useState('');

  // Form Fields
  const [formSubjectCode, setFormSubjectCode] = useState('');
  const [formSubjectName, setFormSubjectName] = useState('');
  const [formInstructorId, setFormInstructorId] = useState('');
  const [formYearLevel, setFormYearLevel] = useState('3rd Year');
  const [formSemester, setFormSemester] = useState('1st Semester');
  const [formSection, setFormSection] = useState('BSIT 3-D');

  // UI state
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addingSubjectId, setAddingSubjectId] = useState<string | null>(null);

  const normalize = (value?: string) => value?.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || '';
  const departmentValuesMatch = (first?: string, second?: string) => {
    if (normalize(first) === normalize(second)) return true;
    const department = departments.find(item =>
      [normalize(item.code), normalize(item.name)].includes(normalize(first))
    );
    return Boolean(department && [normalize(department.code), normalize(department.name)].includes(normalize(second)));
  };
  const profileIsComplete = Boolean(user?.department && user.course && user.yearLevel && user.section);

  useEffect(() => {
    if (!isAddSubjectPage) return;
    let isMounted = true;
    setIsLoadingHierarchy(true);
    setHierarchyError(null);
    supabaseDb.fetchActiveOfferingHierarchy()
      .then(rows => {
        if (isMounted) setOfferingHierarchy(rows);
      })
      .catch(error => {
        if (isMounted) setHierarchyError(error instanceof Error ? error.message : 'Could not load academic choices.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingHierarchy(false);
      });
    return () => {
      isMounted = false;
    };
  }, [isAddSubjectPage]);

  useEffect(() => {
    setBrowseDepartment(user?.department || '');
    setBrowseCourse(user?.course || '');
    setBrowseYearLevel(user?.yearLevel || '');
    setBrowseSection(user?.section || '');
  }, [user?.department, user?.course, user?.yearLevel, user?.section]);

  const distinctValues = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const availableDepartments = useMemo(
    () => distinctValues(offeringHierarchy.map(row => row.department)),
    [offeringHierarchy]
  );
  const availableCourses = useMemo(
    () => distinctValues(offeringHierarchy.filter(row => normalize(row.department) === normalize(browseDepartment)).map(row => row.course)),
    [offeringHierarchy, browseDepartment]
  );
  const availableYearLevels = useMemo(
    () => distinctValues(offeringHierarchy
      .filter(row => normalize(row.department) === normalize(browseDepartment) && normalize(row.course) === normalize(browseCourse))
      .map(row => row.yearLevel)),
    [offeringHierarchy, browseDepartment, browseCourse]
  );
  const availableSections = useMemo(
    () => distinctValues(offeringHierarchy
      .filter(row => normalize(row.department) === normalize(browseDepartment) &&
        normalize(row.course) === normalize(browseCourse) &&
        normalize(row.yearLevel) === normalize(browseYearLevel))
      .map(row => row.section)),
    [offeringHierarchy, browseDepartment, browseCourse, browseYearLevel]
  );

  useEffect(() => {
    if (!offeringHierarchy.length) return;
    const department = distinctValues(offeringHierarchy.map(row => row.department))
      .find(value => departmentValuesMatch(value, user?.department));
    const departmentRows = offeringHierarchy.filter(row => department && normalize(row.department) === normalize(department));
    const course = distinctValues(departmentRows.map(row => row.course))
      .find(value => normalize(value) === normalize(user?.course));
    const courseRows = departmentRows.filter(row => course && normalize(row.course) === normalize(course));
    const yearLevel = distinctValues(courseRows.map(row => row.yearLevel))
      .find(value => normalize(value) === normalize(user?.yearLevel));
    const yearRows = courseRows.filter(row => yearLevel && normalize(row.yearLevel) === normalize(yearLevel));
    const section = distinctValues(yearRows.map(row => row.section))
      .find(value => normalize(value) === normalize(user?.section));
    if (department) setBrowseDepartment(department);
    if (course) setBrowseCourse(course);
    if (yearLevel) setBrowseYearLevel(yearLevel);
    if (section) setBrowseSection(section);
  }, [offeringHierarchy, user?.department, user?.course, user?.yearLevel, user?.section]);

  // The offering table is authoritative; the base subject catalog may include unpublished records.
  const catalogSubjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const studentDepartment = normalize(user?.department);
    const studentDepartmentAliases = departments
      .filter(department => [normalize(department.code), normalize(department.name)].includes(studentDepartment))
      .flatMap(department => [normalize(department.code), normalize(department.name)]);
    const knownStudentDepartments = new Set([studentDepartment, ...studentDepartmentAliases]);

    return offerings.filter(subject => {
      if (subject.status !== 'Active' || !profileIsComplete) return false;
      const departmentMatches = knownStudentDepartments.has(normalize(subject.department));
      const matchesProfile = departmentMatches &&
        normalize(subject.course) === normalize(user?.course) &&
        normalize(subject.yearLevel) === normalize(user?.yearLevel) &&
        normalize(subject.section) === normalize(user?.section) &&
        normalize(subject.academicYear || '2026-2027') === normalize(user?.academicYear || '2026-2027') &&
        normalize(subject.semester || '1st Semester') === normalize(user?.semester || '1st Semester');
      if (!matchesProfile) return false;
      if (!query) return true;
      const instructorName = instructors.find(i => i.userId === subject.instructorId || i.id === subject.instructorId)?.name || subject.instructorName || '';
      return subject.subjectCode.toLowerCase().includes(query) ||
        subject.subjectName.toLowerCase().includes(query) ||
        instructorName.toLowerCase().includes(query) ||
        (subject.section || '').toLowerCase().includes(query);
    });
  }, [offerings, searchQuery, instructors, departments, user, profileIsComplete]);

  const isSubjectEligible = (subject: Subject) => {
    const studentDepartment = normalize(user?.department);
    const subjectDepartment = normalize(subject.department);
    const matchingDepartment = departments.some(department => {
      const codesAndNames = [normalize(department.code), normalize(department.name)];
      return codesAndNames.includes(studentDepartment) && codesAndNames.includes(subjectDepartment);
    });
    const departmentMatches = Boolean(studentDepartment && subjectDepartment) &&
      (studentDepartment === subjectDepartment || matchingDepartment);
    return subject.status === 'Active' && profileIsComplete &&
      departmentMatches &&
      normalize(subject.course) === normalize(user.course) &&
      normalize(subject.yearLevel) === normalize(user.yearLevel) &&
      normalize(subject.section) === normalize(user.section) &&
      normalize(subject.academicYear || '2026-2027') === normalize(user.academicYear || '2026-2027') &&
      normalize(subject.semester || '1st Semester') === normalize(user.semester || '1st Semester');
  };

  // Selected subject IDs set for fast lookup
  const selectedSubjectIds = useMemo(() => {
    return new Set(studentItems.map(item => item.subject.id));
  }, [studentItems]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const refreshed = await refreshData();
    setIsRefreshing(false);
    setFeedbackMsg(refreshed
      ? { type: 'success', text: 'Clearance catalog synchronized.' }
      : { type: 'error', text: catalogError || 'Could not refresh subject offerings.' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleApplyAcademicInfo = async () => {
    if (!user || !browseDepartment || !browseCourse || !browseYearLevel || !browseSection) {
      setFeedbackMsg({ type: 'warning', text: 'Choose a department, course, year level, and section first.' });
      return;
    }
    const selectedCombinationExists = offeringHierarchy.some(row =>
      normalize(row.department) === normalize(browseDepartment) &&
      normalize(row.course) === normalize(browseCourse) &&
      normalize(row.yearLevel) === normalize(browseYearLevel) &&
      normalize(row.section) === normalize(browseSection)
    );
    if (!selectedCombinationExists) {
      setFeedbackMsg({ type: 'error', text: 'That academic combination is not part of an active offering. Refresh the choices and try again.' });
      return;
    }
    setIsApplyingAcademicInfo(true);
    const saved = await updateProfile({
      department: browseDepartment,
      course: browseCourse,
      yearLevel: browseYearLevel,
      section: browseSection,
    });
    if (!saved) {
      setFeedbackMsg({ type: 'error', text: 'Could not save your academic information. Check your connection or ask an administrator to update your profile.' });
      setIsApplyingAcademicInfo(false);
      return;
    }
    const refreshed = await refreshData();
    setFeedbackMsg(refreshed
      ? { type: 'success', text: 'Academic information saved. Active subject offerings have been refreshed.' }
      : { type: 'error', text: catalogError || 'Academic information was saved, but subject offerings could not be refreshed.' });
    setIsApplyingAcademicInfo(false);
  };

  // Open "Edit Subject" Modal
  const handleOpenEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormSubjectCode(subject.subjectCode);
    setFormSubjectName(subject.subjectName);
    setFormInstructorId(subject.instructorId || (instructors[0]?.userId || ''));
    setFormYearLevel(subject.yearLevel || selectedYearLevel);
    setFormSemester(subject.semester || '1st Semester');
    setFormSection(subject.section || 'BSIT');
    setIsEditModalOpen(true);
  };

  // Prompt confirmation dialog before updating shared subject
  const handleEditSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    // Prepare payload and show required confirmation dialog
    setPendingEditPayload({
      subjectId: editingSubject.id,
      data: {
        subjectCode: formSubjectCode,
        subjectName: formSubjectName,
        instructorId: formInstructorId,
        yearLevel: formYearLevel,
        semester: formSemester,
        section: formSection
      }
    });
    setShowEditConfirmModal(true);
  };

  // Confirm and save edit to shared database
  const handleConfirmEdit = () => {
    if (!pendingEditPayload) return;
    const { subjectId, data } = pendingEditPayload;

    const result = updateSharedSubject(subjectId, data);
    setShowEditConfirmModal(false);
    setIsEditModalOpen(false);
    setEditingSubject(null);
    setPendingEditPayload(null);

    setFeedbackMsg({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Confirm delete subject
  const handleConfirmDelete = () => {
    if (!subjectToDelete) return;
    const result = deleteSharedSubject(subjectToDelete.id);
    setSubjectToDelete(null);
    setFeedbackMsg({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Toggle Selection
  const handleToggleSelect = async (subject: Subject) => {
    if (!user) return;
    if (selectedSubjectIds.has(subject.id)) return;
    setAddingSubjectId(subject.id);
    const result = await addEligibleSubject(user.id, subject.id);
    setAddingSubjectId(null);
    setFeedbackMsg({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Signature Request Handler
  const handleSubmitSignatureRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedItemForRequest) return;

    setIsSubmitting(true);
    const result = createSignatureRequest({
      studentId: user.id,
      subjectId: selectedItemForRequest.subject.id,
      remarks: requestRemarks
    });

    setIsSubmitting(false);
    setSelectedItemForRequest(null);
    setFeedbackMsg({
      type: result.success ? 'success' : 'error',
      text: result.message
    });

    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {isAddSubjectPage && <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-sky-950">Add Subject</h1>
          <p className="text-sky-900/75 text-sm font-medium">Choose your department, course, year level, and section to load matching live offerings.</p>
        </div>

        {/* Catalog refresh */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-white hover:bg-sky-50 text-sky-950 border border-sky-200 rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Refresh shared database"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-yellow-600' : 'text-sky-600'}`} />
          </button>
        </div>
      </div>}

      {/* Feedback Toast Banner */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all shadow-xs animate-in fade-in slide-in-from-top-2 duration-150 ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
            : feedbackMsg.type === 'warning'
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-red-50 border-red-300 text-red-950'
        }`}>
          <div className="flex items-center gap-2.5 text-sm font-bold">
            {feedbackMsg.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
            {feedbackMsg.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
            {feedbackMsg.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setFeedbackMsg(null)}
            className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live administrator offerings, browsed in the student's academic hierarchy */}
      {isAddSubjectPage && (
        <div className="space-y-4 rounded-2xl border border-sky-200 bg-white p-4 shadow-xs sm:p-6">
          {catalogError && (
            <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-sm text-red-900">
              <strong>Could not load live subject offerings.</strong> {catalogError}
              <p className="mt-1">Check the database connection and apply the latest Supabase schema/migration.</p>
            </div>
          )}
          {hierarchyError && (
            <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-sm text-red-900">
              <strong>Could not load academic choices.</strong> {hierarchyError}
              <p className="mt-1">Apply the latest Supabase migration, then refresh the page.</p>
            </div>
          )}
          {isLoadingHierarchy ? (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm font-semibold text-sky-900">
              Loading active departments, courses, year levels, and sections…
            </div>
          ) : offeringHierarchy.length === 0 ? (
            !hierarchyError && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                No active offering choices were found. Ask an administrator to activate offerings with department, course, year level, and section set.
              </div>
            )
          ) : (
            <div className="space-y-5 border-b border-sky-200 pb-5">
              <p className="text-sm text-slate-600">
                Choose an academic combination from active offerings. Applying it updates your student profile so the database can return only eligible subjects.
              </p>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">1. Department</span>
                <span className="relative block">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-500" />
                  <select value={browseDepartment} onChange={event => {
                    setBrowseDepartment(event.target.value);
                    setBrowseCourse('');
                    setBrowseYearLevel('');
                    setBrowseSection('');
                  }} className="w-full appearance-none rounded-xl border border-sky-200 bg-white py-3 pl-11 pr-11 text-sm font-semibold text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100">
                    <option value="">Choose department</option>
                    {availableDepartments.map(value => (
                      <option key={value} value={value}>
                        {departments.find(department => [normalize(department.code), normalize(department.name)].includes(normalize(value)))?.name || value}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700" />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">2. Course</span>
                <span className="relative block">
                  <GraduationCap className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-500" />
                  <select disabled={!browseDepartment} value={browseCourse} onChange={event => {
                    setBrowseCourse(event.target.value);
                    setBrowseYearLevel('');
                    setBrowseSection('');
                  }} className="w-full appearance-none rounded-xl border border-sky-200 bg-white py-3 pl-11 pr-11 text-sm font-semibold text-slate-800 outline-none disabled:bg-slate-100">
                    <option value="">Choose course</option>
                    {availableCourses.map(value => <option key={value} value={value}>{value}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700" />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">3. Year Level</span>
                <select disabled={!browseCourse} value={browseYearLevel} onChange={event => {
                  setBrowseYearLevel(event.target.value);
                  setBrowseSection('');
                }} className="w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100">
                  <option value="">Choose year level</option>
                  {availableYearLevels.map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">4. Section</span>
                <select disabled={!browseYearLevel} value={browseSection} onChange={event => setBrowseSection(event.target.value)} className="w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100">
                  <option value="">Choose section</option>
                  {availableSections.map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Current profile: {user?.department || 'No department'} · {user?.course || 'No course'} · {user?.yearLevel || 'No year level'} · {user?.section || 'No section'}
                </p>
                <button
                  type="button"
                  onClick={handleApplyAcademicInfo}
                  disabled={isApplyingAcademicInfo || !browseDepartment || !browseCourse || !browseYearLevel || !browseSection}
                  className="rounded-xl bg-sky-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isApplyingAcademicInfo ? 'Applying...' : 'Apply Academic Selection'}
                </button>
              </div>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subject code, name, or instructor..."
              className="w-full rounded-xl border border-sky-200 bg-slate-50 py-3 pl-10 pr-10 text-sm font-medium text-sky-950 placeholder-slate-500 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-500 hover:text-sky-800" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-sky-950 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-yellow-600" />
                Available Subjects
              </h2>
            </div>
            <span className="text-xs font-extrabold text-sky-600 bg-sky-100 px-3 py-1 rounded-full border border-sky-200">
              Live data · {catalogSubjects.length}
            </span>
          </div>

          {catalogSubjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sky-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-sky-950">
                {!profileIsComplete ? 'Choose Your Academic Information' : catalogError ? 'Offerings Could Not Be Loaded' : 'No Matching Active Offerings'}
              </h3>
              <p className="text-xs text-sky-700 max-w-md mx-auto font-medium">
                {!profileIsComplete
                  ? 'Choose a department, course, year level, and section above, then apply the selection to load matching subjects.'
                  : catalogError
                    ? 'The database request failed. Review the error above and ask an administrator to check the Supabase setup.'
                    : 'No active subjects match your department, course, year level, section, and current term. Check your profile or ask an administrator to publish the correct offering.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {catalogSubjects.map((subject) => {
                const isSelected = selectedSubjectIds.has(subject.id);
                const isEligible = isSubjectEligible(subject);
                const instructor = instructors.find(i => i.userId === subject.instructorId || i.id === subject.instructorId);
                const instructorName = instructor?.name || 'Assigned Instructor';

                return (
                  <article
                    key={subject.id}
                    className={`rounded-2xl border bg-white p-4 transition-colors sm:flex sm:items-center sm:justify-between sm:gap-5 ${
                      isSelected ? 'border-emerald-300 ring-1 ring-emerald-300/50 bg-emerald-50/20' : 'border-sky-200 hover:border-sky-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900">{subject.subjectName}</h3>
                      <p className="mt-1 text-sm text-slate-600">Subject code: {subject.subjectCode}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                        <User className="h-3.5 w-3.5 text-sky-500" />
                        Instructor: {instructorName}
                      </p>
                      {subject.description && <p className="mt-2 text-sm leading-relaxed text-slate-600">{subject.description}</p>}
                      {(subject.days || subject.startTime || subject.room) && (
                        <p className="mt-2 text-xs font-medium text-slate-500">
                          {[subject.days, subject.startTime && `${subject.startTime}${subject.endTime ? `-${subject.endTime}` : ''}`, subject.room].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex shrink-0 items-center gap-3 sm:mt-0">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(subject)}
                        disabled={isSelected || !isEligible || addingSubjectId === subject.id}
                        title={!isSelected && !isEligible ? (subject.status !== 'Active'
                          ? 'This offering is not active yet. An administrator must activate it before students can add it.'
                          : 'This offering does not match your department, course, year level, or section.') : undefined}
                        className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-sky-900 text-white hover:bg-sky-800'
                        }`}
                      >
                        {isSelected ? (
                          <span>Already Added</span>
                        ) : (
                          <span>{addingSubjectId === subject.id ? 'Adding...' : 'Add Subject'}</span>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: MY SELECTED SUBJECTS */}
      {!isAddSubjectPage && (
        <div className="space-y-4 pt-4 border-t border-sky-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-sky-950 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                My Selected Subjects
              </h2>
              <p className="text-xs text-sky-800/80 font-medium">
                Selected subjects currently active in your personal clearance list.
              </p>
            </div>
            <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 self-start">
              {studentItems.length} Enrolled Subject{studentItems.length !== 1 ? 's' : ''}
            </span>
          </div>

          {studentItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sky-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-sky-950">No Subjects Selected Yet</h3>
              <p className="text-xs text-sky-700 max-w-md mx-auto font-medium">
                Add an active offering from the Add Subject page to populate your personal clearance list and request instructor signatures.
              </p>
              <button
                type="button"
                onClick={() => navigate('/student/add-subject')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-900 hover:bg-sky-950 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                <span>Browse Available Subjects</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-sky-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-sky-50/80 border-b border-sky-200 text-[11px] font-black text-sky-900 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Subject Code</th>
                      <th className="py-3.5 px-4">Subject Name</th>
                      <th className="py-3.5 px-4">Assigned Instructor</th>
                      <th className="py-3.5 px-4">Section</th>
                      <th className="py-3.5 px-4">Clearance Status</th>
                      <th className="py-3.5 px-4">Grade</th>
                      <th className="py-3.5 px-4 text-center">Instructor Signature</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100 text-xs font-medium text-sky-950">
                    {studentItems.map((item) => {
                      const reqStatus = item.latestRequest?.status || 'Not Requested';
                      const instructorName = item.instructor?.name || 'Assigned Instructor';

                      return (
                        <tr key={item.subject.id} className="hover:bg-sky-50/40 transition-colors">
                          {/* Subject Code */}
                          <td className="py-3.5 px-4">
                            <span className="font-black text-sky-950 bg-sky-100 text-sky-900 px-2.5 py-1 rounded-md border border-sky-200">
                              {item.subject.subjectCode}
                            </span>
                          </td>

                          {/* Subject Name */}
                          <td className="py-3.5 px-4 font-bold text-sky-950 max-w-xs">
                            {item.subject.subjectName}
                          </td>

                          {/* Instructor */}
                          <td className="py-3.5 px-4 text-sky-900">
                            <div className="font-semibold text-sky-950">{instructorName}</div>
                            <div className="text-[10px] text-sky-700">{item.instructor?.department || 'Faculty Member'}</div>
                          </td>

                          {/* Section */}
                          <td className="py-3.5 px-4 font-bold text-sky-800">
                            {item.subject.section || 'BSIT 3-D'}
                          </td>

                          {/* Clearance Status Badge */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border ${
                              reqStatus === 'Approved'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : reqStatus === 'Pending'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : reqStatus === 'Rejected'
                                ? 'bg-red-100 text-red-900 border-red-300'
                                : 'bg-gray-100 text-gray-800 border-gray-300'
                            }`}>
                              {reqStatus === 'Approved' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                              {reqStatus === 'Pending' && <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />}
                              {reqStatus === 'Rejected' && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                              {reqStatus === 'Not Requested' && <HelpCircle className="w-3.5 h-3.5 text-gray-500" />}
                              <span>{reqStatus === 'Approved' ? 'Signed ✓' : reqStatus}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-black text-sky-950">
                            {item.digitalSignature?.grade?.toFixed(2) || '—'}
                          </td>

                          {/* Instructor Signature Status */}
                          <td className="py-3.5 px-4 text-center">
                            {item.digitalSignature ? (
                              <button
                                type="button"
                                onClick={() => setSelectedItemForDetails(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[10px] font-black transition-colors cursor-pointer"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>View Signature</span>
                              </button>
                            ) : reqStatus === 'Pending' ? (
                              <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Awaiting Sign
                              </span>
                            ) : reqStatus === 'Rejected' ? (
                              <span className="text-[11px] text-red-800 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                Re-submit Required
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-500 font-medium">Unsigned</span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {reqStatus !== 'Approved' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedItemForRequest(item);
                                    setRequestRemarks('');
                                  }}
                                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black rounded-lg text-xs transition-colors shadow-2xs border border-yellow-500 flex items-center gap-1 cursor-pointer"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>{reqStatus === 'Rejected' ? 'Re-request' : 'Request Sign'}</span>
                                </button>
                              )}

                              {item.digitalSignature && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedItemForDetails(item)}
                                  className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-lg text-xs transition-colors cursor-pointer"
                                  title="View Digital Signature"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  if (user) {
                                    unselectSubject(user.id, item.subject.id);
                                    setFeedbackMsg({
                                      type: 'success',
                                      text: `Removed ${item.subject.subjectCode} from My Selected Subjects.`
                                    });
                                    setTimeout(() => setFeedbackMsg(null), 3000);
                                  }
                                }}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs transition-colors cursor-pointer"
                                title="Remove from selected list"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 2: EDIT SUBJECT MODAL */}
      {isEditModalOpen && editingSubject && (
        <div className="fixed inset-0 bg-sky-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-sky-200 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-sky-900 to-sky-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-yellow-400" />
                  Edit Shared Subject
                </h3>
                <p className="text-xs text-sky-200 font-medium mt-0.5">
                  Update subject details in the shared database catalog.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                className="text-sky-300 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubjectSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-sky-950 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    value={formSubjectCode}
                    onChange={(e) => setFormSubjectCode(e.target.value)}
                    className="w-full px-3 py-2 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-950 focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-sky-950 mb-1">Year Level *</label>
                  <select
                    value={formYearLevel}
                    onChange={(e) => setFormYearLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-950 focus:ring-2 focus:ring-sky-500 outline-hidden cursor-pointer"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-sky-950 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={formSubjectName}
                  onChange={(e) => setFormSubjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-950 focus:ring-2 focus:ring-sky-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sky-950 mb-1">Assigned Instructor *</label>
                <select
                  required
                  value={formInstructorId}
                  onChange={(e) => setFormInstructorId(e.target.value)}
                  className="w-full px-3 py-2 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-950 focus:ring-2 focus:ring-sky-500 outline-hidden cursor-pointer"
                >
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.userId || inst.id}>
                      {inst.name} ({inst.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-sky-950 mb-1">Semester</label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full px-3 py-2 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-950 focus:ring-2 focus:ring-sky-500 outline-hidden cursor-pointer"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-sky-950 mb-1">Section</label>
                  <input
                    type="text"
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    className="w-full px-3 py-2 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-950 focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-sky-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-900 hover:bg-sky-950 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG BEFORE EDITING SHARED SUBJECT */}
      {showEditConfirmModal && (
        <div className="fixed inset-0 bg-sky-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-sky-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 bg-sky-100 text-sky-800 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-sky-950">Confirm Shared Subject Edit</h3>
              <p className="text-xs text-sky-800 font-medium">
                “Changes to this subject may affect other students using it. Continue?”
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEditConfirmModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEdit}
                className="flex-1 py-2.5 bg-sky-900 hover:bg-sky-950 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {subjectToDelete && (
        <div className="fixed inset-0 bg-sky-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-red-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-sky-950">Remove Subject from Catalog</h3>
              <p className="text-xs text-sky-800 font-medium">
                Are you sure you want to remove <strong className="font-bold text-sky-950">{subjectToDelete.subjectCode} - {subjectToDelete.subjectName}</strong> from the shared catalog?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubjectToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Remove Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REQUEST SIGNATURE MODAL */}
      {selectedItemForRequest && (
        <div className="fixed inset-0 bg-sky-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-sky-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-sky-900 to-sky-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <Send className="w-4 h-4 text-yellow-400" />
                  Request Instructor Signature
                </h3>
                <p className="text-xs text-sky-200 font-medium">
                  Submit clearance requirement for {selectedItemForRequest.subject.subjectCode}.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedItemForRequest(null)}
                className="text-sky-300 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSignatureRequest} className="p-6 space-y-4">
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 space-y-1 text-xs">
                <div>Instructor: <strong className="font-bold text-sky-950">{selectedItemForRequest.instructor?.name}</strong></div>
                <div>Subject: <strong className="font-bold text-sky-950">{selectedItemForRequest.subject.subjectCode} - {selectedItemForRequest.subject.subjectName}</strong></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-sky-950 mb-1">Student Remarks / Proof Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={requestRemarks}
                  onChange={(e) => setRequestRemarks(e.target.value)}
                  placeholder="e.g. Completed all lab experiments and submitted final capstone deliverables."
                  className="w-full px-3 py-2 bg-sky-50 border border-sky-200 rounded-xl text-xs font-medium text-sky-950 placeholder-sky-400 focus:ring-2 focus:ring-sky-500 outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemForRequest(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-xs font-black rounded-xl shadow-xs border border-yellow-500 cursor-pointer"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Clearance Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: VIEW SIGNATURE DETAILS MODAL */}
      {selectedItemForDetails && (
        <div className="fixed inset-0 bg-sky-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-sky-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  Digital Signature Verification
                </h3>
                <p className="text-xs text-emerald-200 font-medium">
                  Instructor signature, grade, and submission details for {selectedItemForDetails.subject.subjectCode}.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedItemForDetails(null)}
                className="text-emerald-300 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Submitted Grade</div>
                <div className="text-2xl font-black text-emerald-950">
                  {selectedItemForDetails.digitalSignature?.grade?.toFixed(2) || 'Not recorded'}
                </div>
              </div>
              {selectedItemForDetails.digitalSignature?.signatureSvg && (
                <div className="rounded-2xl border border-sky-200 bg-white p-3">
                  <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-sky-800">Instructor Signature</div>
                  <img
                    className="h-20 w-full object-contain"
                    src={`data:image/svg+xml,${encodeURIComponent(selectedItemForDetails.digitalSignature.signatureSvg)}`}
                    alt={`Signature from ${selectedItemForDetails.digitalSignature.instructorName}`}
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-sky-100">
                  <span className="text-sky-700 font-medium">Instructor:</span>
                  <span className="font-bold text-sky-950">{selectedItemForDetails.instructor?.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-sky-100">
                  <span className="text-sky-700 font-medium">Signed At:</span>
                  <span className="font-bold text-sky-950">
                    {selectedItemForDetails.digitalSignature?.signedAt
                      ? new Date(selectedItemForDetails.digitalSignature.signedAt).toLocaleString()
                      : 'Recently Verified'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-sky-100">
                  <span className="text-sky-700 font-medium">Status:</span>
                  <span className="font-bold text-emerald-700">Signed &amp; Submitted</span>
                </div>
                {selectedItemForDetails.digitalSignature?.remarks && (
                  <div className="py-1">
                    <span className="text-sky-700 font-medium">Instructor remarks:</span>
                    <p className="mt-1 font-semibold text-sky-950">{selectedItemForDetails.digitalSignature.remarks}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setSelectedItemForDetails(null)}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl cursor-pointer"
                >
                  Close Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
