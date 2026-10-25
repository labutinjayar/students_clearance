import React, { useState } from 'react';
import { useDb } from '../../context/DbContext';
import { SubjectAssignment } from '../../types';
import { 
  Layers, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  X, 
  Check, 
  ShieldCheck, 
  UserCheck,
  BookOpen
} from 'lucide-react';

export function AdminSubjectAssignments() {
  const { 
    subjectAssignments, 
    subjects, 
    students, 
    instructors, 
    createSubjectAssignment, 
    updateSubjectAssignment, 
    deleteSubjectAssignment,
    academicYear,
    semester 
  } = useDb();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<SubjectAssignment | null>(null);

  // Form states
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [formSemester, setFormSemester] = useState(semester);
  const [formAcademicYear, setFormAcademicYear] = useState(academicYear);

  const filteredAssignments = subjectAssignments.filter(sa => {
    const student = students.find(s => s.userId === sa.studentId);
    const subject = subjects.find(s => s.id === sa.subjectId);
    const instructor = instructors.find(i => i.userId === sa.instructorId || i.id === sa.instructorId);

    const matchesSearch = 
      (student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (student?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (subject?.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '');

    const matchesSubject = selectedSubjectFilter === 'All' ? true : sa.subjectId === selectedSubjectFilter;

    return matchesSearch && matchesSubject;
  });

  const handleOpenAdd = () => {
    setEditingAssignment(null);
    setStudentId(students[0]?.userId || '');
    setSubjectId(subjects[0]?.id || '');
    setInstructorId(instructors[0]?.userId || '');
    setFormSemester(semester);
    setFormAcademicYear(academicYear);
    setShowAddModal(true);
  };

  const handleOpenEdit = (assignment: SubjectAssignment) => {
    setEditingAssignment(assignment);
    setStudentId(assignment.studentId);
    setSubjectId(assignment.subjectId);
    setInstructorId(assignment.instructorId);
    setFormSemester(assignment.semester);
    setFormAcademicYear(assignment.academicYear);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this official subject assignment?')) {
      deleteSubjectAssignment(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !subjectId || !instructorId) return;

    if (editingAssignment) {
      updateSubjectAssignment(editingAssignment.id, {
        studentId,
        subjectId,
        instructorId,
        semester: formSemester,
        academicYear: formAcademicYear
      });
    } else {
      createSubjectAssignment({
        studentId,
        subjectId,
        instructorId,
        semester: formSemester,
        academicYear: formAcademicYear
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-sky-950 mb-1 tracking-tight">Subject Assignments</h1>
          <p className="text-sky-900/80 text-[15px] font-medium">
            Map students and subjects to designated faculty instructors. This dictates strict clearance signing authorization.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border border-yellow-500 text-xs font-black rounded-2xl shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Assign Student & Subject
        </button>
      </div>

      {/* Security Engine Banner */}
      <div className="bg-white/95 backdrop-blur-xs border-2 border-yellow-400 rounded-3xl p-4 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-yellow-950 shrink-0 mt-0.5" />
        <div className="text-xs text-sky-950 leading-relaxed font-medium">
          <strong className="font-black text-yellow-800">Core SSU Authorization Rule:</strong> When a student requests clearance for a subject, the system locks the request exclusively to the assigned instructor mapped below. Other instructors cannot approve or sign it.
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/95 backdrop-blur-xs p-4 rounded-3xl border-2 border-sky-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
          <input
            type="text"
            placeholder="Search by student, ID, subject, or assigned instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white text-sky-950 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-sky-900 uppercase">Subject:</span>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3 py-2 text-xs font-black bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sky-950"
          >
            <option value="All">All Subjects ({subjects.length})</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.subjectCode} - {sub.subjectName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white/95 backdrop-blur-xs border-2 border-sky-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-100 text-sky-900 uppercase text-[11px] font-black tracking-wider border-b border-sky-200">
              <tr>
                <th className="px-5 py-4">Student Name</th>
                <th className="px-5 py-4">Student ID</th>
                <th className="px-5 py-4">Subject Code</th>
                <th className="px-5 py-4">Subject Name</th>
                <th className="px-5 py-4">Designated Instructor</th>
                <th className="px-5 py-4">Academic Term</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sky-800/60 font-medium">
                    <Layers className="w-8 h-8 text-sky-300 mx-auto mb-2" />
                    No subject assignments found.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((sa) => {
                  const student = students.find(s => s.userId === sa.studentId);
                  const subject = subjects.find(s => s.id === sa.subjectId);
                  const instructor = instructors.find(i => i.userId === sa.instructorId || i.id === sa.instructorId);

                  return (
                    <tr key={sa.id} className="hover:bg-sky-50/80 transition-colors">
                      <td className="px-5 py-4 font-black text-sky-950">
                        {student?.name || 'Student'}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-sky-800">
                        {student?.studentId || '2026-0001'}
                      </td>
                      <td className="px-5 py-4 font-black text-yellow-700">
                        {subject?.subjectCode || 'SUBJ'}
                      </td>
                      <td className="px-5 py-4 text-sky-950 font-bold">
                        {subject?.subjectName}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 font-black text-yellow-950 bg-yellow-100 px-2.5 py-1 rounded-xl border border-yellow-300 shadow-2xs">
                          <UserCheck className="w-3.5 h-3.5 text-yellow-950" />
                          {instructor?.name || 'Instructor'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sky-900 font-medium">
                        {sa.academicYear} • {sa.semester}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(sa)}
                            className="p-1.5 bg-sky-100 hover:bg-sky-200 text-sky-950 rounded-xl transition-colors border border-sky-200 shadow-2xs"
                            title="Edit Assignment"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sa.id)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl transition-colors border border-red-200 shadow-2xs"
                            title="Delete Assignment"
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

      {/* ASSIGNMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-sky-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-yellow-400 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-yellow-400 text-yellow-950 border-b border-yellow-500 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-yellow-950" />
                <h3 className="font-black text-base">{editingAssignment ? 'Edit Subject Assignment' : 'Assign Subject to Student & Instructor'}</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-yellow-950 hover:bg-yellow-500/50 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-sky-900 mb-1">Select Student *</label>
                <select
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sky-950 font-medium"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.userId}>
                      {s.name} ({s.studentId}) - {s.course}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-sky-900 mb-1">Select Subject *</label>
                <select
                  required
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sky-950 font-medium"
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.subjectCode} - {sub.subjectName} ({sub.units || 3} units)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-sky-900 mb-1">Designate Assigned Faculty Instructor *</label>
                <select
                  required
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                  className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none font-black text-sky-950"
                >
                  {instructors.map(i => (
                    <option key={i.id} value={i.userId}>
                      {i.name} ({i.department})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-sky-800/80 font-medium mt-1">
                  Only this designated instructor will possess digital signature authority for this subject.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-black text-sky-900 mb-1">Semester</label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sky-950 font-medium"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="Summer Term">Summer Term</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-sky-900 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={formAcademicYear}
                    onChange={(e) => setFormAcademicYear(e.target.value)}
                    className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sky-950 font-medium"
                  />
                </div>
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
                  {editingAssignment ? 'Save Assignment' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
