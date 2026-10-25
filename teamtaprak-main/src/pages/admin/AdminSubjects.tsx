import React, { useState } from 'react';
import { useDb } from '../../context/DbContext';
import { Subject } from '../../types';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Layers,
  Power,
  XCircle
} from 'lucide-react';

export function AdminSubjects() {
  const { subjects, addSubject, updateSubject, deleteSubject, subjectAssignments, reviewSubjectOffering, toggleSubjectOffering, instructors } = useDb();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ department: '', academicYear: '', semester: '', yearLevel: '', section: '', instructor: '', status: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [course, setCourse] = useState('BS Information Technology');
  const [department, setDepartment] = useState('CIT');
  const [units, setUnits] = useState(3);
  const [description, setDescription] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [semester, setSemester] = useState('1st Semester');
  const [yearLevel, setYearLevel] = useState('1st Year');
  const [section, setSection] = useState('');
  const [days, setDays] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');
  const [instructorId, setInstructorId] = useState('');

  const filteredSubjects = subjects.filter(s => 
    (s.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) || s.subjectName.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filters.department || s.department === filters.department) &&
    (!filters.academicYear || s.academicYear === filters.academicYear) &&
    (!filters.semester || s.semester === filters.semester) &&
    (!filters.yearLevel || s.yearLevel === filters.yearLevel) &&
    (!filters.section || s.section === filters.section) &&
    (!filters.instructor || s.instructorId === filters.instructor) &&
    (!filters.status || (s.status || 'Pending') === filters.status)
  );

  const filterOptions = (key: 'department' | 'academicYear' | 'semester' | 'yearLevel' | 'section' | 'instructor' | 'status') => Array.from(new Set(subjects.map(subject => key === 'instructor' ? subject.instructorId : key === 'status' ? (subject.status || 'Pending') : subject[key]).filter(Boolean))) as string[];

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setSubjectCode('');
    setSubjectName('');
    setUnits(3);
    setDescription(''); setAcademicYear('2026-2027'); setSemester('1st Semester'); setYearLevel('1st Year'); setSection(''); setCourse('BS Information Technology'); setDepartment('CIT'); setDays(''); setStartTime(''); setEndTime(''); setRoom(''); setInstructorId(instructors[0]?.userId || instructors[0]?.id || '');
    setShowAddModal(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectCode(subject.subjectCode);
    setSubjectName(subject.subjectName);
    setCourse(subject.course || 'BS Information Technology');
    setDepartment(subject.department || 'CIT');
    setUnits(subject.units || 3);
    setDescription(subject.description || ''); setAcademicYear(subject.academicYear || '2026-2027'); setSemester(subject.semester || '1st Semester'); setYearLevel(subject.yearLevel || '1st Year'); setSection(subject.section || ''); setDays(subject.days || ''); setStartTime(subject.startTime || ''); setEndTime(subject.endTime || ''); setRoom(subject.room || ''); setInstructorId(subject.instructorId || '');
    setShowAddModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete subject "${name}"? This will also remove associated student clearance assignments.`)) {
      deleteSubject(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateSubject(editingSubject.id, {
        subjectCode,
        subjectName,
        units
        ,description, academicYear, semester, yearLevel, section, course, department, days, startTime, endTime, room, instructorId
      });
    } else {
      const result = await addSubject({
        subjectCode,
        subjectName,
        units,
        description, academicYear, semester, yearLevel, section, course, department, days, startTime, endTime, room, instructorId
      });
      if (!result.success) {
        alert(`Subject could not be saved to Supabase.\n\n${result.message}`);
        return;
      }
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div>
          <h1 className="text-[28px] font-black text-sky-950 mb-1 tracking-tight">Curricular Subjects</h1>
          <p className="text-sky-900/80 text-[15px] font-medium">Define and manage academic subjects required for student clearance verification.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/95 backdrop-blur-xs p-4 rounded-3xl border-2 border-sky-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
            <input
              type="text"
              placeholder="Search subjects by code or descriptive title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white text-sky-950 font-medium"
            />
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex shrink-0 items-center gap-2 px-3 sm:px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border border-yellow-500 text-xs font-black rounded-2xl shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden min-[380px]:inline">Add New Subject</span>
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
          {(['department', 'academicYear', 'semester', 'yearLevel', 'section', 'instructor', 'status'] as const).map(key => (
            <select key={key} aria-label={`Filter by ${key}`} value={filters[key]} onChange={e => setFilters(prev => ({ ...prev, [key]: e.target.value }))} className="p-2 text-[11px] bg-sky-50 border border-sky-200 rounded-xl font-bold text-sky-950">
              <option value="">All {key === 'academicYear' ? 'Academic Years' : key.charAt(0).toUpperCase() + key.slice(1)}</option>
              {filterOptions(key).map(option => <option key={option} value={option}>{key === 'instructor' ? instructors.find(i => (i.userId || i.id) === option)?.name || option : option}</option>)}
            </select>
          ))}
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white/95 backdrop-blur-xs border-2 border-sky-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-100 text-sky-900 uppercase text-[11px] font-black tracking-wider border-b border-sky-200">
              <tr>
                <th className="px-5 py-4">Subject Code</th>
                <th className="px-5 py-4">Subject Descriptive Name</th>
                <th className="px-5 py-4">Instructor / Department</th>
                <th className="px-5 py-4">Academic Units</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Schedule</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sky-800/60 font-medium">
                    <BookOpen className="w-8 h-8 text-sky-300 mx-auto mb-2" />
                    No subjects found.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((sub) => {
                  const assignedCount = subjectAssignments.filter(sa => sa.subjectId === sub.id).length;

                  return (
                    <tr key={sub.id} className="hover:bg-sky-50/80 transition-colors">
                      <td className="px-5 py-4 font-black text-yellow-700 font-mono text-sm">
                        {sub.subjectCode}
                      </td>
                      <td className="px-5 py-4 text-sky-950 font-bold text-sm">
                        {sub.subjectName}
                      </td>
                      <td className="px-5 py-4 text-sky-900 font-medium">
                        <div>{instructors.find(i => (i.userId || i.id) === sub.instructorId)?.name || sub.instructorName || 'Unassigned'}</div>
                        <div className="text-[10px] text-sky-700/70">{sub.department || 'No department'}</div>
                      </td>
                      <td className="px-5 py-4 font-bold text-sky-900">
                        {sub.units || 3} Units
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${sub.status === 'Active' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : sub.status === 'Rejected' ? 'bg-red-100 text-red-900 border-red-300' : sub.status === 'Approved' ? 'bg-sky-100 text-sky-900 border-sky-300' : sub.status === 'Inactive' ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>{sub.status || 'Pending'}</span>
                      </td>
                      <td className="px-5 py-4 text-sky-900 font-medium">{sub.days || 'TBA'} {sub.startTime ? `${sub.startTime}-${sub.endTime}` : ''}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-950 border border-yellow-300 font-black rounded-xl text-[10px] shadow-2xs">
                          {assignedCount} Students Enrolled
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => reviewSubjectOffering(sub.id, 'Approved')}
                            disabled={sub.status === 'Approved' || sub.status === 'Active'}
                            className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl transition-colors border border-emerald-200 disabled:opacity-40"
                            title="Approve offering"
                          ><Check className="w-3.5 h-3.5" /></button>
                          <button
                            onClick={() => reviewSubjectOffering(sub.id, 'Rejected')}
                            disabled={sub.status === 'Rejected' || sub.status === 'Active'}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl transition-colors border border-red-200 disabled:opacity-40"
                            title="Reject offering"
                          ><XCircle className="w-3.5 h-3.5" /></button>
                          <button
                            onClick={() => toggleSubjectOffering(sub.id)}
                            disabled={!['Approved', 'Active', 'Inactive'].includes(sub.status || '')}
                            className="p-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-xl transition-colors border border-yellow-200 disabled:opacity-40"
                            title="Activate or deactivate offering"
                          ><Power className="w-3.5 h-3.5" /></button>
                          <button
                            onClick={() => handleOpenEdit(sub)}
                            className="p-1.5 bg-sky-100 hover:bg-sky-200 text-sky-950 rounded-xl transition-colors border border-sky-200 shadow-2xs"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id, sub.subjectCode)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl transition-colors border border-red-200 shadow-2xs"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-sky-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-yellow-400 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-yellow-400 text-yellow-950 border-b border-yellow-500 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-yellow-950" />
                <h3 className="font-black text-base">{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-yellow-950 hover:bg-yellow-500/50 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-sky-900 mb-1">Subject Code *</label>
                <input type="text" required value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} placeholder="IT 101" className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none uppercase font-mono font-black text-sky-950" />
              </div>

              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Subject description" className="w-full min-h-20 p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-400 text-sky-950" />
              <div className="grid grid-cols-2 gap-3">
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl">{['CIT', 'CAS', 'COED', 'COE'].map(code => <option key={code} value={code}>{code}</option>)}</select>
                <select value={course} onChange={(e) => setCourse(e.target.value)} className="p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl"><option>BS Information Technology</option><option>BS Computer Science</option><option>BS Information Systems</option><option>BS Civil Engineering</option><option>BS Electrical Engineering</option><option>BS Education</option></select>
                <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)} className="p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl"><option value="">Assign instructor</option>{instructors.map(i => <option key={i.id} value={i.userId || i.id}>{i.name}</option>)}</select>
                <input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="Academic year" className="p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl" />
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className="p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl"><option>1st Semester</option><option>2nd Semester</option></select>
                <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} className="p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl"><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select>
                <input value={section} onChange={(e) => setSection(e.target.value)} placeholder="Section" className="p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl" />
                <input value={days} onChange={(e) => setDays(e.target.value)} placeholder="Days (M/W)" className="p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl" />
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl" />
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl" />
                <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Room" className="p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl" />
              </div>

              <div>
                <label className="block text-xs font-black text-sky-900 mb-1">Descriptive Title *</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Introduction to Information Technology"
                  className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sky-950 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-sky-900 mb-1">Credit Units</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sky-950 font-bold"
                />
              </div>

              <div className="pt-4 border-t border-sky-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-sky-100 text-sky-950 text-xs font-bold rounded-xl hover:bg-sky-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-xs font-black rounded-xl border border-yellow-500 shadow-2xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingSubject ? 'Save Changes' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
