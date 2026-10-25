import React, { useEffect, useState } from 'react';
import { useDb } from '../../context/DbContext';
import { Instructor } from '../../types';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  ToggleLeft, 
  ToggleRight, 
  X, 
  Check, 
  UserCheck, 
  UserX,
  BookOpen,
} from 'lucide-react';

export function AdminInstructors() {
  const { instructors, addInstructor, updateInstructor, toggleInstructorStatus, subjectAssignments, subjects, refreshData } = useDb();

  useEffect(() => {
    refreshData();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('College of Industrial Technology');

  const filteredInstructors = instructors.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingInstructor(null);
    setName('');
    setEmail('');
    setDepartment('College of Industrial Technology');
    setShowAddModal(true);
  };

  const handleOpenEdit = (inst: Instructor) => {
    setEditingInstructor(inst);
    setName(inst.name);
    setEmail(inst.email);
    setDepartment(inst.department);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInstructor) {
      updateInstructor(editingInstructor.id, {
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@ssu.edu.ph`,
        department,
        title: undefined
      });
    } else {
      const generatedUserId = `u_${Date.now()}`;
      addInstructor({
        userId: generatedUserId,
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@ssu.edu.ph`,
        department,
        title: undefined,
        isActive: true
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-sky-950 mb-1 tracking-tight">Faculty & Instructors</h1>
          <p className="text-sky-900/80 text-[15px] font-medium">Manage faculty instructors and review account approvals.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border border-yellow-500 text-xs font-black rounded-2xl shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Faculty Instructor
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white/95 backdrop-blur-xs p-4 rounded-3xl border-2 border-sky-200/80 shadow-xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
          <input
            type="text"
            placeholder="Search instructors by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white text-sky-950 font-medium"
          />
        </div>
      </div>

      {/* Instructors Table */}
      <div className="bg-white/95 backdrop-blur-xs border-2 border-sky-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-100 text-sky-900 uppercase text-[11px] font-black tracking-wider border-b border-sky-200">
              <tr>
                <th className="px-5 py-4">Faculty Name</th>
                <th className="px-5 py-4">Institutional Email</th>
                <th className="px-5 py-4">Department / College</th>
                <th className="px-5 py-4">Admin Role</th>
                <th className="px-5 py-4">Assigned Subjects</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {filteredInstructors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sky-800/60 font-medium">
                    <Users className="w-8 h-8 text-sky-300 mx-auto mb-2" />
                    No instructors found.
                  </td>
                </tr>
              ) : (
                filteredInstructors.map((inst) => {
                  const instAssignments = subjectAssignments.filter(sa => sa.instructorId === inst.userId || sa.instructorId === inst.id);
                  const assignedSubIds = Array.from(new Set(instAssignments.map(sa => sa.subjectId)));
                  const assignedSubs = subjects.filter(s => assignedSubIds.includes(s.id));

                  return (
                    <tr key={inst.id} className="hover:bg-sky-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-black text-sky-950">{inst.name}</div>
                      </td>
                      <td className="px-5 py-4 text-sky-800 font-bold">
                        {inst.email}
                      </td>
                      <td className="px-5 py-4 text-sky-900 font-medium">
                        {inst.department}
                      </td>
                      <td className="px-5 py-4 text-sky-700 font-medium">Instructor account</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {assignedSubs.length === 0 ? (
                            <span className="text-sky-700/60 italic font-medium">None assigned</span>
                          ) : (
                            assignedSubs.map(s => (
                              <span key={s.id} className="px-2 py-0.5 bg-yellow-100 text-yellow-950 font-black rounded-lg text-[10px] border border-yellow-300">
                                {s.subjectCode}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-2xs ${
                          inst.isActive !== false ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {inst.isActive !== false ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {inst.isActive !== false ? 'Active' : 'Pending approval'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(inst)}
                            className="p-1.5 bg-sky-100 hover:bg-sky-200 text-sky-950 rounded-xl transition-colors border border-sky-200 shadow-2xs"
                            title="Edit Instructor"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleInstructorStatus(inst.id)}
                            className={`p-1.5 rounded-xl transition-colors border shadow-2xs ${
                              inst.isActive !== false ? 'bg-red-100 hover:bg-red-200 text-red-800 border-red-200' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-200'
                            }`}
                            title={inst.isActive !== false ? 'Deactivate' : 'Approve Instructor'}
                          >
                            {inst.isActive !== false ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
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
                <Users className="w-5 h-5 text-yellow-950" />
                <h3 className="font-black text-base">{editingInstructor ? 'Edit Faculty Instructor' : 'Add New Faculty'}</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-yellow-950 hover:bg-yellow-500/50 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-sky-900 mb-1">Faculty Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Prof. Santos"
                  className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sky-950 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-sky-900 mb-1">Institutional Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="santos@ssu.edu.ph"
                  className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sky-950 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-sky-900 mb-1">Department / College</label>
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
                  {editingInstructor ? 'Save Changes' : 'Register Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
