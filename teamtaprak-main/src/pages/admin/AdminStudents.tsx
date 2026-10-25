import React, { useEffect, useState } from 'react';
import { useDb } from '../../context/DbContext';
import { Student } from '../../types';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit2, 
  ToggleLeft, 
  ToggleRight, 
  X, 
  Check, 
  UserCheck, 
  UserX,
  Mail
} from 'lucide-react';

export function AdminStudents() {
  const { students, addStudent, updateStudent, toggleStudentStatus, changeStudentToInstructor, refreshData } = useDb();

  useEffect(() => {
    refreshData();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('BS Information Technology');
  const [yearLevel, setYearLevel] = useState('3rd Year');
  const [section, setSection] = useState('IT-3A');
  const [department, setDepartment] = useState('College of Industrial Technology');

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.course && s.course.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setStudentId(`2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setName('');
    setEmail('');
    setCourse('BS Information Technology');
    setYearLevel('3rd Year');
    setSection('IT-3A');
    setDepartment('College of Industrial Technology');
    setShowAddModal(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setStudentId(student.studentId);
    setName(student.name);
    setEmail(student.email);
    setCourse(student.course || 'BS Information Technology');
    setYearLevel(student.yearLevel || '3rd Year');
    setSection(student.section || 'IT-3A');
    setDepartment(student.department || 'College of Industrial Technology');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudent(editingStudent.id, {
        studentId,
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@ssu.edu.ph`,
        course,
        yearLevel,
        section,
        department
      });
    } else {
      addStudent({
        userId: `u_${Date.now()}`,
        studentId,
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@ssu.edu.ph`,
        course,
        yearLevel,
        section,
        department,
        isActive: true
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div>
          <h1 className="text-[28px] font-black text-sky-950 mb-1 tracking-tight">Student Management</h1>
          <p className="text-sky-900/80 text-[15px] font-medium">Register, update, and manage official university students eligible for clearance.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/95 backdrop-blur-xs p-4 rounded-3xl border-2 border-sky-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
            <input
              type="text"
              placeholder="Search students by name, ID number, or course..."
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
            <span className="hidden min-[380px]:inline">Add New Student</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white/95 backdrop-blur-xs border-2 border-sky-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-100 text-sky-900 uppercase text-[11px] font-black tracking-wider border-b border-sky-200">
              <tr>
                <th className="px-5 py-4">Student Name</th>
                <th className="px-5 py-4">Student ID</th>
                <th className="px-5 py-4">Course & Year</th>
                <th className="px-5 py-4">Section</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sky-800/60 font-medium">
                    <GraduationCap className="w-8 h-8 text-sky-300 mx-auto mb-2" />
                    No student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-sky-50/80 transition-colors">
                    <td className="px-5 py-4 font-black text-sky-950">
                      {st.name}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-sky-800">
                      {st.studentId}
                    </td>
                    <td className="px-5 py-4 text-sky-900 font-medium">
                      {st.course} ({st.yearLevel})
                    </td>
                    <td className="px-5 py-4 text-sky-800 font-medium">
                      {st.section || 'N/A'}
                    </td>
                    <td className="px-5 py-4 text-sky-700 font-medium">
                      {st.department}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-2xs ${
                        st.isActive !== false ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {st.isActive !== false ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {st.isActive !== false ? 'Active' : 'Pending approval'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 bg-sky-100 hover:bg-sky-200 text-sky-950 rounded-xl transition-colors border border-sky-200 shadow-2xs"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleStudentStatus(st.id)}
                          className={`p-1.5 rounded-xl transition-colors border shadow-2xs ${
                            st.isActive !== false ? 'bg-red-100 hover:bg-red-200 text-red-800 border-red-200' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-200'
                          }`}
                          title={st.isActive !== false ? 'Deactivate Student' : 'Approve Student'}
                        >
                          {st.isActive !== false ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Change ${st.name} to an instructor account?`)) {
                              await changeStudentToInstructor(st.id);
                            }
                          }}
                          className="p-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 rounded-xl transition-colors border border-yellow-300 shadow-2xs"
                          title="Change to Instructor"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-sky-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-yellow-400 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-yellow-400 text-yellow-950 border-b border-yellow-500 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-yellow-950" />
                <h3 className="font-black text-base">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-yellow-950 hover:bg-yellow-500/50 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-sky-900 mb-1">Student ID *</label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="2026-0001"
                    className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none font-mono text-sky-950 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-sky-900 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sky-950 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-sky-900 mb-1">Institutional Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@ssu.edu.ph"
                  className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sky-950 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-black text-sky-900 mb-1">Course</label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sky-950 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-sky-900 mb-1">Year Level</label>
                  <select
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value)}
                    className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sky-950 font-medium"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-sky-900 mb-1">Section</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="IT-3A"
                    className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sky-950 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-sky-900 mb-1">College / Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sky-950 font-medium"
                >
                  <option value="College of Industrial Technology">College of Industrial Technology</option>
                  <option value="College of Arts and Sciences">College of Arts and Sciences</option>
                  <option value="College of Education">College of Education</option>
                  <option value="College of Engineering">College of Engineering</option>
                </select>
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
                  {editingStudent ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
