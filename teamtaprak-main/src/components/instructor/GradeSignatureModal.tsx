import React, { useRef, useState } from 'react';
import { FileSignature, X } from 'lucide-react';
import { SignatureRequest, Student, Subject, User } from '../../types';

interface GradeSignatureModalProps {
  request: SignatureRequest;
  instructor: User;
  student: Student | undefined;
  subject: Subject | undefined;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (grade: number, signatureSvg: string, remarks: string) => Promise<{ success: boolean; message: string }>;
}

const SVG_WIDTH = 600;
const SVG_HEIGHT = 160;

export function GradeSignatureModal({
  request,
  instructor,
  student,
  subject,
  submitting,
  onCancel,
  onSubmit
}: GradeSignatureModalProps) {
  const padRef = useRef<SVGSVGElement>(null);
  const [gradeText, setGradeText] = useState('');
  const [remarks, setRemarks] = useState('');
  const [paths, setPaths] = useState<string[]>([]);
  const [activePath, setActivePath] = useState('');
  const [savedSignature, setSavedSignature] = useState('');
  const [error, setError] = useState('');

  const getPoint = (event: React.PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(SVG_WIDTH, ((event.clientX - bounds.left) / bounds.width) * SVG_WIDTH)),
      y: Math.max(0, Math.min(SVG_HEIGHT, ((event.clientY - bounds.top) / bounds.height) * SVG_HEIGHT))
    };
  };

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = getPoint(event);
    setSavedSignature('');
    setActivePath(`M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId) || !activePath) return;
    const point = getPoint(event);
    setActivePath(previous => `${previous} L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`);
  };

  const finishStroke = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (activePath) {
      const finalPath = `${activePath} L ${(Number(activePath.split(' ').at(-2)) + 0.1).toFixed(1)} ${activePath.split(' ').at(-1)}`;
      setPaths(previous => [...previous, finalPath]);
      setActivePath('');
    }
  };

  const clearSignature = () => {
    setPaths([]);
    setActivePath('');
    setSavedSignature('');
    setError('');
  };

  const saveSignature = () => {
    const allPaths = activePath ? [...paths, activePath] : paths;
    if (allPaths.length === 0) {
      setError('Draw your signature before saving it.');
      return;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}">${allPaths.map(path => `<path d="${path}" fill="none" stroke="#0c4a6e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;
    setSavedSignature(svg);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const grade = Number(gradeText);
    if (!Number.isFinite(grade) || grade < 1 || grade > 5 || Math.abs(grade * 4 - Math.round(grade * 4)) > 1e-8) {
      setError('Enter a grade from 1.00 to 5.00 in 0.25 increments.');
      return;
    }
    if (!savedSignature) {
      setError('Draw and save your signature before submitting.');
      return;
    }
    const result = await onSubmit(grade, savedSignature, remarks.trim());
    if (!result.success) setError(result.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/50 p-3 backdrop-blur-sm sm:p-5">
      <form onSubmit={handleSubmit} className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-yellow-400 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-yellow-500 bg-yellow-400 p-4 text-yellow-950 sm:p-5">
          <div className="flex items-center gap-3">
            <FileSignature className="h-6 w-6" />
            <div>
              <h2 className="font-black">Sign &amp; Submit Grade</h2>
              <p className="text-xs font-semibold text-yellow-950/80">Review the student and subject before signing.</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} disabled={submitting} className="rounded-lg p-1 hover:bg-yellow-500/50" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          <section>
            <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-sky-800">Student Information</h3>
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm sm:grid-cols-2">
              <Info label="Student name" value={student?.name || 'Student profile unavailable'} />
              <Info label="Student ID" value={student?.studentId || 'Not provided'} />
              <Info label="Department" value={student?.department || 'Not provided'} />
              <Info label="Course" value={student?.course || 'Not provided'} />
              <Info label="Year level" value={student?.yearLevel || 'Not provided'} />
              <Info label="Section" value={student?.section || 'Not provided'} />
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-sky-800">Subject Information</h3>
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm sm:grid-cols-2">
              <Info label="Subject code" value={subject?.subjectCode || request.subjectId} />
              <Info label="Subject name" value={subject?.subjectName || 'Subject record unavailable'} />
              <Info label="Semester" value={subject?.semester || 'Not specified'} />
              <Info label="Academic year" value={subject?.academicYear || 'Not specified'} />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-black text-sky-900">Grade *</span>
              <input
                required
                type="number"
                min="1"
                max="5"
                step="0.25"
                value={gradeText}
                onChange={event => setGradeText(event.target.value)}
                placeholder="e.g. 1.25"
                className="w-full rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm font-bold text-sky-950 outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <span className="mt-1 block text-[11px] text-sky-700">Valid values: 1.00–5.00 in 0.25 steps.</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-black text-sky-900">Remarks (Optional)</span>
              <textarea
                rows={3}
                value={remarks}
                onChange={event => setRemarks(event.target.value)}
                maxLength={1000}
                placeholder="Add a note for the student..."
                className="w-full resize-y rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-950 outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </label>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-sky-800">Instructor Digital Signature</h3>
            <p className="mb-2 text-sm font-bold text-sky-950">{instructor.name} · {subject?.subjectCode || 'Assigned subject'}</p>
            <svg
              ref={padRef}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              role="img"
              aria-label="Draw your signature in this area"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishStroke}
              onPointerCancel={finishStroke}
              className="h-36 w-full touch-none rounded-xl border-2 border-dashed border-sky-300 bg-white"
            >
              <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="white" />
              {[...paths, ...(activePath ? [activePath] : [])].map((path, index) => (
                <path key={index} d={path} fill="none" stroke="#0c4a6e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              ))}
            </svg>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={clearSignature} disabled={submitting} className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-900 hover:bg-sky-100">
                Clear Signature
              </button>
              <button type="button" onClick={saveSignature} disabled={submitting} className="rounded-xl border border-sky-300 bg-sky-100 px-3 py-2 text-xs font-bold text-sky-950 hover:bg-sky-200">
                Save Signature
              </button>
            </div>
            {savedSignature && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-emerald-800">Signature preview</p>
                <div className="h-20 w-full bg-white" dangerouslySetInnerHTML={{ __html: savedSignature }} />
              </div>
            )}
          </section>

          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
            Submitting records your drawn signature and grade for this clearance request. This electronic signature record does not by itself establish legal validity in every context.
          </p>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-sky-100 bg-sky-50 p-4">
          <button type="button" onClick={onCancel} disabled={submitting} className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-sky-950 ring-1 ring-sky-200 disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting || !savedSignature} className="inline-flex items-center gap-2 rounded-xl border border-yellow-500 bg-yellow-400 px-4 py-2.5 text-xs font-black text-yellow-950 hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50">
            <FileSignature className="h-4 w-4" />
            {submitting ? 'Submitting...' : 'Sign & Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wide text-sky-700">{label}</div>
      <div className="font-bold text-sky-950">{value}</div>
    </div>
  );
}
