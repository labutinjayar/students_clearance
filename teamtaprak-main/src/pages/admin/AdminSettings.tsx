import React, { useState } from 'react';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Settings as SettingsIcon, 
  Calendar, 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight, 
  Check, 
  Save
} from 'lucide-react';

export function AdminSettings() {
  const { user } = useAuth();
  const { academicYear, semester } = useDb();

  const [currentAY, setCurrentAY] = useState(academicYear);
  const [currentSem, setCurrentSem] = useState(semester);
  const [isClearanceOpen, setIsClearanceOpen] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="max-w-[1000px] w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-sky-950 mb-1 tracking-tight">System Settings</h1>
          <p className="text-sky-900/80 text-[15px] font-medium">Configure institutional academic parameters and clearance periods.</p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-100 border-2 border-emerald-300 rounded-2xl text-emerald-950 text-xs font-black flex items-center gap-2 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-800" />
          Settings successfully saved and propagated to student & instructor portals.
        </div>
      )}

      {/* Academic Term Configuration */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border-2 border-sky-200/80 shadow-xs p-6">
        <h3 className="text-base font-black text-sky-950 mb-4 pb-3 border-b border-sky-200 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-yellow-800" />
          Academic Term & Clearance Period
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-sky-900 uppercase tracking-wider mb-1">
                Active Academic Year
              </label>
              <input
                type="text"
                value={currentAY}
                onChange={(e) => setCurrentAY(e.target.value)}
                className="w-full p-2.5 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-sky-950"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-sky-900 uppercase tracking-wider mb-1">
                Active Semester
              </label>
              <select
                value={currentSem}
                onChange={(e) => setCurrentSem(e.target.value)}
                className="w-full p-2.5 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-sky-950"
              >
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="Summer Term">Summer Term</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between p-4 bg-sky-50/70 rounded-2xl border border-sky-200/80">
            <div>
              <div className="text-sm font-black text-sky-950">Student Clearance Submission Window</div>
              <div className="text-xs text-sky-900/80 font-medium">Allow students to create and submit new signature requests to instructors</div>
            </div>
            <button
              type="button"
              onClick={() => setIsClearanceOpen(!isClearanceOpen)}
              className="text-yellow-700 focus:outline-none"
            >
              {isClearanceOpen ? (
                <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs">
                  <ToggleRight className="w-8 h-8 text-emerald-600" />
                  <span>Open</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
                  <ToggleLeft className="w-8 h-8" />
                  <span>Closed</span>
                </div>
              )}
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border border-yellow-500 text-xs font-black rounded-2xl shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* University Institutional Information */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border-2 border-sky-200/80 shadow-xs p-6">
        <h3 className="text-base font-black text-sky-950 mb-4 pb-3 border-b border-sky-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-yellow-800" />
          Institutional Clearance Authority
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-sky-800/80 font-black uppercase">Institution:</span>
            <div className="font-black text-sky-950 text-sm mt-0.5">Samar State University</div>
          </div>
          <div>
            <span className="text-sky-800/80 font-black uppercase">Authorized Division:</span>
            <div className="font-black text-sky-950 text-sm mt-0.5">Office of Academic Affairs & Registrar</div>
          </div>
          <div>
            <span className="text-sky-800/80 font-black uppercase">Digital Signature Standard:</span>
            <div className="font-black text-sky-950 text-sm mt-0.5">SSU-Cryptographic SHA-256 Audit Hash</div>
          </div>
          <div>
            <span className="text-sky-800/80 font-black uppercase">System Administrator:</span>
            <div className="font-black text-yellow-800 text-sm mt-0.5">{user?.name || 'Administrator'} ({user?.email})</div>
          </div>
        </div>
      </div>

    </div>
  );
}
