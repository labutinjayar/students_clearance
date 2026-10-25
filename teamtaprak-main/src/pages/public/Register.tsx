import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { Input } from '../../components/ui/Input';
import { Eye, EyeOff } from 'lucide-react';

const ssuConventionCenterBg = '/ssu_convention_center.jpg';

export function Register() {
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    course: 'BS Information Technology',
    yearLevel: '3rd Year',
    department: 'CIT',
    instructorCode: '',
    password: '',
    confirmPassword: '',
    academicYear: '2026-2027',
    semester: '1st Semester',
    section: '',
  });
  const [error, setError] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register, isLoading } = useAuth();
  const { departments } = useDb();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.studentId.trim() || !formData.password) {
      setError('Please complete all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const registeredUser = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        studentId: formData.studentId.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        course: formData.course,
        yearLevel: formData.yearLevel,
        department: formData.department,
        section: formData.section,
        academicYear: formData.academicYear,
        semester: formData.semester,
        instructorCode: role === 'instructor' ? formData.instructorCode : undefined,
        role
      });
      setPendingApproval(true);
      // Redirect to appropriate dashboard based on role
      if (registeredUser.isActive !== false && registeredUser.role === 'student') {
        navigate('/student/dashboard');
      } else if (registeredUser.isActive !== false && registeredUser.role === 'instructor') {
        navigate('/instructor/dashboard');
      } else if (registeredUser.isActive !== false) {
        navigate('/student/dashboard'); // default fallback
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message.toLowerCase().includes('rate limit')
        ? 'Too many sign-up attempts were made. Please wait a few minutes before trying again.'
        : message);
    }
  };

  return (
    <div className="flex-1 h-[calc(100vh-64px)] flex flex-col justify-between relative overflow-hidden">
      {/* Background Image of Samar State University Convention Center */}
      <div className="login-page-background absolute inset-0 z-0">
        <img
          src={ssuConventionCenterBg}
          alt="Samar State University Convention Center"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sky-950/85 via-sky-900/75 to-sky-900/65 backdrop-blur-[1px]"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-12 md:py-16 w-full max-w-[1600px] mx-auto flex-1 flex items-center relative z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column */}
          <div className="login-page-copy flex flex-col lg:col-span-7">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-950 border border-yellow-500 text-xs font-black px-3 py-1 rounded-full uppercase mb-4 shadow-md self-start">
              Samar State University • Main Campus
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-white tracking-tight mb-4 leading-[1.15] max-w-xl drop-shadow-md">
              Create your official <span className="text-yellow-400 underline decoration-yellow-400 decoration-4 underline-offset-4">clearance account</span>
            </h2>
            <p className="text-base sm:text-lg text-sky-100 font-medium leading-relaxed max-w-xl mb-8 drop-shadow-xs">
              Register with your institutional details to request online subject clearances, monitor signed requirements, and generate tamper-proof certificates.
            </p>
          </div>

          {/* Right Column */}
          <div className="flex justify-center lg:justify-end lg:col-span-5">
            <div className="login-card-enter bg-white/95 backdrop-blur-md p-8 lg:p-10 rounded-3xl border-2 border-yellow-400/80 shadow-[0_16px_40px_-8px_rgba(202,138,4,0.15)] w-full max-w-[460px]">
              <div className="text-center mb-6">
                <div className="inline-block bg-yellow-100 border border-yellow-300 px-3 py-1 rounded-full mb-2">
                  <span className="text-xs font-extrabold text-yellow-800 uppercase tracking-wider">New Student / Faculty</span>
                </div>
                <h3 className="text-[28px] font-black text-sky-950 mb-1">Create Account</h3>
                <p className="text-[14px] text-sky-800/80 font-medium">Register for secure portal access</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              {pendingApproval && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm font-semibold text-center">
                  Registration submitted. An administrator must approve your account before you can log in.
                  <div className="mt-2 font-medium">
                    <Link to="/login" className="text-yellow-700 font-extrabold hover:underline">Go to login</Link>
                  </div>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="flex bg-sky-100/90 p-1.5 rounded-2xl mb-4 border border-sky-200">
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-extrabold rounded-xl transition-all ${role === 'student' ? 'bg-yellow-400 text-yellow-950 shadow-xs' : 'text-sky-900 hover:text-sky-950 hover:bg-sky-200/60'}`}
                    onClick={() => setRole('student')}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-extrabold rounded-xl transition-all ${role === 'instructor' ? 'bg-yellow-400 text-yellow-950 shadow-xs' : 'text-sky-900 hover:text-sky-950 hover:bg-sky-200/60'}`}
                    onClick={() => setRole('instructor')}
                  >
                    Instructor
                  </button>
                </div>

                <Input
                  label="Full Name"
                  required
                  placeholder="e.g. Juan Dela Cruz"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-11 border-sky-200 focus:ring-yellow-400"
                />

                <Input
                  label={role === 'student' ? 'Student ID Number' : 'Employee ID Number'}
                  required
                  placeholder={role === 'student' ? 'e.g. 2026-0001' : 'e.g. EMP-1045'}
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="h-11 border-sky-200 focus:ring-yellow-400"
                />
                
                <Input
                  label="Institutional Email Address"
                  type="email"
                  required
                  placeholder="name@ssu.edu.ph"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 border-sky-200 focus:ring-yellow-400"
                />

                {role === 'instructor' && (
                  <Input
                    label="Instructor Registration Code"
                    required
                    placeholder="Enter the code provided by an administrator"
                    value={formData.instructorCode}
                    onChange={(e) => setFormData({ ...formData, instructorCode: e.target.value })}
                    className="h-11 border-sky-200 focus:ring-yellow-400"
                  />
                )}

                {role === 'student' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-sky-950 mb-1">
                        Course / Program
                      </label>
                      <select
                        className="flex h-11 w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium text-slate-800"
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      >
                        <option value="BS Information Technology">BS Information Technology</option>
                        <option value="BS Computer Science">BS Computer Science</option>
                        <option value="BS Information Systems">BS Information Systems</option>
                        <option value="BS Civil Engineering">BS Civil Engineering</option>
                        <option value="BS Electrical Engineering">BS Electrical Engineering</option>
                        <option value="BS Education">BS Education</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-sky-950 mb-1">
                        Year Level
                      </label>
                      <select
                        className="flex h-11 w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium text-slate-800"
                        value={formData.yearLevel}
                        onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                  </div>
                )}

                {role === 'student' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input label="Section" required placeholder="BSIT 1-D" value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} className="h-11 border-sky-200 focus:ring-yellow-400" />
                    <select aria-label="Academic Year" value={formData.academicYear} onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} className="h-11 rounded-md border border-sky-200 bg-white px-3 text-xs font-medium"><option>2026-2027</option><option>2027-2028</option></select>
                    <select aria-label="Semester" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className="h-11 rounded-md border border-sky-200 bg-white px-3 text-xs font-medium"><option>1st Semester</option><option>2nd Semester</option></select>
                  </div>
                )}
                
                <div className="w-full">
                  <label className="block text-xs font-bold text-sky-950 mb-1">
                    Department / College
                  </label>
                  <select
                    className="flex h-11 w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium text-slate-800"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.code}>{dept.code} - {dept.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-sky-950 mb-1">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="h-11 border-sky-200 focus:ring-yellow-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-600 hover:text-sky-800"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-sky-950 mb-1">Confirm Password</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="h-11 border-sky-200 focus:ring-yellow-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-600 hover:text-sky-800"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-yellow-950 font-black text-base mt-2 rounded-xl shadow-md shadow-yellow-400/20 transition-all cursor-pointer disabled:opacity-50" 
                >
                  {isLoading ? 'Creating Account...' : 'Register Account'}
                </button>

                <p className="text-center text-sm text-sky-900/80 font-medium mt-4">
                  Already have an account? <Link to="/login" className="text-yellow-700 font-extrabold hover:text-yellow-800 hover:underline">Log in</Link>
                </p>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sky-950/85 backdrop-blur-md border-t border-sky-800/80 pt-10 pb-8 px-6 md:px-12 lg:px-24 mt-auto relative z-10">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-8">
            <div className="max-w-md">
              <h4 className="font-black text-white mb-1 flex items-center gap-2">
                <span>Samar State University</span>
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              </h4>
              <p className="text-sky-200 text-sm leading-relaxed font-medium">
                Online Student Clearance System. Simplifying academic clearance workflows with instructor signatures, grade records, and submission timestamps.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 text-sm">
              <span className="font-bold text-yellow-400 hover:text-yellow-300 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="font-bold text-yellow-400 hover:text-yellow-300 cursor-pointer transition-colors">Terms of Use</span>
              <span className="font-bold text-yellow-400 hover:text-yellow-300 cursor-pointer transition-colors">Academic Affairs</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-sky-800/80 text-xs text-sky-300/80 font-medium">
            <p>© 2026 Samar State University - Office of Student Affairs &amp; Services. All rights reserved.</p>
            <p className="mt-3 md:mt-0">Philippine Government State Universities and Colleges (SUC) Web Standard</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
