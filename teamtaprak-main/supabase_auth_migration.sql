ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '2026-2027';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS semester TEXT DEFAULT '1st Semester';

CREATE OR REPLACE FUNCTION public.can_update_profile(
  target_id TEXT,
  target_role TEXT,
  target_is_admin BOOLEAN,
  target_is_instructor BOOLEAN,
  target_is_active BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles actor
    WHERE actor.id = auth.uid()::text
      AND (actor.role = 'admin' OR actor.is_admin = true)
  )
  OR EXISTS (
    SELECT 1
    FROM public.profiles current_profile
    WHERE current_profile.id = auth.uid()::text
      AND current_profile.id = target_id
      AND current_profile.role = target_role
      AND COALESCE(current_profile.is_admin, false) = COALESCE(target_is_admin, false)
      AND COALESCE(current_profile.is_instructor, false) = COALESCE(target_is_instructor, false)
      AND COALESCE(current_profile.is_active, false) = COALESCE(target_is_active, false)
  );
$$;

CREATE OR REPLACE FUNCTION public.can_insert_profile(
  target_id TEXT,
  target_role TEXT,
  target_is_admin BOOLEAN,
  target_is_instructor BOOLEAN,
  target_is_active BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles actor
    WHERE actor.id = auth.uid()::text
      AND (actor.role = 'admin' OR actor.is_admin = true)
  )
  OR EXISTS (
    SELECT 1
    FROM public.profiles current_profile
    WHERE current_profile.id = auth.uid()::text
      AND current_profile.id = target_id
      AND current_profile.role = target_role
      AND COALESCE(current_profile.is_admin, false) = COALESCE(target_is_admin, false)
      AND COALESCE(current_profile.is_instructor, false) = COALESCE(target_is_instructor, false)
      AND COALESCE(current_profile.is_active, false) = COALESCE(target_is_active, false)
  )
  OR (
    auth.uid()::text = target_id
    AND target_role = 'student'
    AND COALESCE(target_is_admin, false) = false
    AND COALESCE(target_is_instructor, false) = false
    AND COALESCE(target_is_active, false) = false
  );
$$;

REVOKE ALL ON FUNCTION public.can_update_profile(TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_insert_profile(TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_update_profile(TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_insert_profile(TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, name, email, student_id, department, role, course, year_level,
    section, academic_year, semester, title,
    is_active, is_admin, is_instructor
  )
  VALUES (
    NEW.id::text,
    COALESCE(NEW.raw_user_meta_data->>'fullName', NEW.email),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'studentId', ''),
    COALESCE(NEW.raw_user_meta_data->>'department', 'CIT'),
    CASE WHEN NEW.raw_user_meta_data->>'role' = 'instructor' THEN 'instructor' ELSE 'student' END,
    NEW.raw_user_meta_data->>'course',
    NEW.raw_user_meta_data->>'yearLevel',
    NULLIF(NEW.raw_user_meta_data->>'section', ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'academicYear', ''), '2026-2027'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'semester', ''), '1st Semester'),
    NULLIF(NEW.raw_user_meta_data->>'title', ''),
    false,
    false,
    NEW.raw_user_meta_data->>'role' = 'instructor'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Insert profile access" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.can_update_profile(id, role, is_admin, is_instructor, is_active))
  WITH CHECK (public.can_update_profile(id, role, is_admin, is_instructor, is_active));
CREATE POLICY "Insert profile access" ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.can_insert_profile(id, role, is_admin, is_instructor, is_active));

ALTER TABLE public.class_offerings ADD COLUMN IF NOT EXISTS course TEXT DEFAULT 'BS Information Technology';
UPDATE public.class_offerings offering
SET course = subject.course
FROM public.subjects subject
WHERE offering.subject_id = subject.id
  AND (offering.course IS NULL OR offering.course = 'BS Information Technology')
  AND subject.course IS NOT NULL;

CREATE OR REPLACE FUNCTION public.department_values_match(student_department TEXT, offering_department TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT regexp_replace(lower(COALESCE(student_department, '')), '[^a-z0-9]', '', 'g') =
         regexp_replace(lower(COALESCE(offering_department, '')), '[^a-z0-9]', '', 'g')
    OR EXISTS (
      SELECT 1
      FROM public.departments department
      WHERE regexp_replace(lower(COALESCE(student_department, '')), '[^a-z0-9]', '', 'g') IN (
          regexp_replace(lower(department.code), '[^a-z0-9]', '', 'g'),
          regexp_replace(lower(department.name), '[^a-z0-9]', '', 'g')
        )
        AND regexp_replace(lower(COALESCE(offering_department, '')), '[^a-z0-9]', '', 'g') IN (
          regexp_replace(lower(department.code), '[^a-z0-9]', '', 'g'),
          regexp_replace(lower(department.name), '[^a-z0-9]', '', 'g')
        )
    );
$$;
REVOKE ALL ON FUNCTION public.department_values_match(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.department_values_match(TEXT, TEXT) TO authenticated;

DROP POLICY IF EXISTS "Students view active eligible offerings" ON public.class_offerings;
DROP POLICY IF EXISTS "Students view subject offerings" ON public.class_offerings;
CREATE POLICY "Students view active eligible offerings" ON public.class_offerings FOR SELECT TO authenticated USING (
  (
    status = 'Active' AND EXISTS (
      SELECT 1 FROM public.profiles student
      WHERE student.id = auth.uid()::text
        AND student.role = 'student'
        AND student.is_active = true
        AND public.department_values_match(student.department, class_offerings.department)
        AND regexp_replace(lower(COALESCE(student.course, '')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(class_offerings.course, '')), '[^a-z0-9]', '', 'g')
        AND regexp_replace(lower(COALESCE(student.year_level, '')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(class_offerings.year_level, '')), '[^a-z0-9]', '', 'g')
        AND regexp_replace(lower(COALESCE(student.section, '')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(class_offerings.section, '')), '[^a-z0-9]', '', 'g')
        AND regexp_replace(lower(COALESCE(student.academic_year, '2026-2027')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(class_offerings.academic_year, '2026-2027')), '[^a-z0-9]', '', 'g')
        AND regexp_replace(lower(COALESCE(student.semester, '1st Semester')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(class_offerings.semester, '1st Semester')), '[^a-z0-9]', '', 'g')
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles actor
    WHERE actor.id = auth.uid()::text AND (actor.role IN ('admin', 'instructor') OR actor.is_admin = true)
  )
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students view own enrollments" ON public.enrollments;
CREATE POLICY "Students view own enrollments" ON public.enrollments FOR SELECT TO authenticated USING (
  student_id = auth.uid()::text OR EXISTS (
    SELECT 1 FROM public.profiles actor
    WHERE actor.id = auth.uid()::text AND (actor.role IN ('admin', 'instructor') OR actor.is_admin = true)
  )
);
DROP POLICY IF EXISTS "Students add own enrollments" ON public.enrollments;
CREATE POLICY "Students add own enrollments" ON public.enrollments FOR INSERT TO authenticated WITH CHECK (
  (
    student_id = auth.uid()::text AND EXISTS (
      SELECT 1
      FROM public.profiles student
      JOIN public.class_offerings offering ON offering.id = enrollments.class_offering_id
      WHERE student.id = auth.uid()::text
        AND student.role = 'student'
        AND student.is_active = true
        AND offering.status = 'Active'
        AND public.department_values_match(student.department, offering.department)
        AND regexp_replace(lower(COALESCE(student.course, '')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.course, '')), '[^a-z0-9]', '', 'g')
        AND regexp_replace(lower(COALESCE(student.year_level, '')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.year_level, '')), '[^a-z0-9]', '', 'g')
        AND regexp_replace(lower(COALESCE(student.section, '')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.section, '')), '[^a-z0-9]', '', 'g')
        AND regexp_replace(lower(COALESCE(student.academic_year, '2026-2027')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.academic_year, '2026-2027')), '[^a-z0-9]', '', 'g')
        AND regexp_replace(lower(COALESCE(student.semester, '1st Semester')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.semester, '1st Semester')), '[^a-z0-9]', '', 'g')
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles actor
    WHERE actor.id = auth.uid()::text AND (actor.role = 'admin' OR actor.is_admin = true)
  )
);

DROP POLICY IF EXISTS "Shared subjects viewable by all" ON public.subjects;
DROP POLICY IF EXISTS "Shared subjects viewable by authorized users" ON public.subjects;
DROP POLICY IF EXISTS "Authenticated users can create subjects" ON public.subjects;
DROP POLICY IF EXISTS "Creators or instructors or admins can update subjects" ON public.subjects;
DROP POLICY IF EXISTS "Admins or creators can delete subjects" ON public.subjects;
DROP POLICY IF EXISTS "Admins create subjects" ON public.subjects;
DROP POLICY IF EXISTS "Admins update subjects" ON public.subjects;
DROP POLICY IF EXISTS "Admins delete subjects" ON public.subjects;
CREATE POLICY "Shared subjects viewable by authorized users" ON public.subjects FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles actor WHERE actor.id = auth.uid()::text AND (actor.role IN ('admin', 'instructor') OR actor.is_admin = true))
  OR EXISTS (
    SELECT 1 FROM public.class_offerings offering
    JOIN public.profiles student ON student.id = auth.uid()::text
    WHERE offering.subject_id = subjects.id AND offering.status = 'Active'
      AND student.role = 'student' AND student.is_active = true
      AND public.department_values_match(student.department, offering.department)
      AND regexp_replace(lower(COALESCE(student.course, '')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.course, '')), '[^a-z0-9]', '', 'g')
      AND regexp_replace(lower(COALESCE(student.year_level, '')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.year_level, '')), '[^a-z0-9]', '', 'g')
      AND regexp_replace(lower(COALESCE(student.section, '')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.section, '')), '[^a-z0-9]', '', 'g')
      AND regexp_replace(lower(COALESCE(student.academic_year, '2026-2027')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.academic_year, '2026-2027')), '[^a-z0-9]', '', 'g')
      AND regexp_replace(lower(COALESCE(student.semester, '1st Semester')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.semester, '1st Semester')), '[^a-z0-9]', '', 'g')
  )
);
CREATE POLICY "Admins create subjects" ON public.subjects FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles actor WHERE actor.id = auth.uid()::text AND (actor.role IN ('admin', 'instructor') OR actor.is_admin = true))
);
CREATE POLICY "Admins update subjects" ON public.subjects FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles actor WHERE actor.id = auth.uid()::text AND (actor.role = 'admin' OR actor.is_admin = true))
    OR (created_by = auth.uid()::text AND EXISTS (SELECT 1 FROM public.profiles actor WHERE actor.id = auth.uid()::text AND actor.role = 'instructor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles actor WHERE actor.id = auth.uid()::text AND (actor.role = 'admin' OR actor.is_admin = true))
    OR (created_by = auth.uid()::text AND EXISTS (SELECT 1 FROM public.profiles actor WHERE actor.id = auth.uid()::text AND actor.role = 'instructor'))
  );
CREATE POLICY "Admins delete subjects" ON public.subjects FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles actor WHERE actor.id = auth.uid()::text AND (actor.role = 'admin' OR actor.is_admin = true))
);

DROP POLICY IF EXISTS "Students view own selected subjects" ON public.student_subjects;
DROP POLICY IF EXISTS "Students insert own selected subjects" ON public.student_subjects;
DROP POLICY IF EXISTS "Students update own or instructors update assigned subject status" ON public.student_subjects;
DROP POLICY IF EXISTS "Students delete own selection" ON public.student_subjects;
DROP POLICY IF EXISTS "Students insert eligible subjects" ON public.student_subjects;
DROP POLICY IF EXISTS "Students update own selected subjects" ON public.student_subjects;
CREATE POLICY "Students view own selected subjects" ON public.student_subjects FOR SELECT TO authenticated USING (
  student_id = auth.uid()::text OR EXISTS (SELECT 1 FROM public.profiles actor WHERE actor.id = auth.uid()::text AND (actor.role IN ('admin', 'instructor') OR actor.is_admin = true))
);
CREATE POLICY "Students insert eligible subjects" ON public.student_subjects FOR INSERT TO authenticated WITH CHECK (
  (student_id = auth.uid()::text AND EXISTS (
    SELECT 1 FROM public.profiles student
    JOIN public.class_offerings offering ON offering.subject_id = student_subjects.subject_id
    WHERE student.id = auth.uid()::text AND student.role = 'student' AND student.is_active = true
      AND offering.status = 'Active'
      AND public.department_values_match(student.department, offering.department)
      AND regexp_replace(lower(COALESCE(student.course, '')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.course, '')), '[^a-z0-9]', '', 'g')
      AND regexp_replace(lower(COALESCE(student.year_level, '')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.year_level, '')), '[^a-z0-9]', '', 'g')
      AND regexp_replace(lower(COALESCE(student.section, '')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.section, '')), '[^a-z0-9]', '', 'g')
      AND regexp_replace(lower(COALESCE(student.academic_year, '2026-2027')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.academic_year, '2026-2027')), '[^a-z0-9]', '', 'g')
      AND regexp_replace(lower(COALESCE(student.semester, '1st Semester')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.semester, '1st Semester')), '[^a-z0-9]', '', 'g')
  )) OR EXISTS (SELECT 1 FROM public.profiles actor WHERE actor.id = auth.uid()::text AND (actor.role = 'admin' OR actor.is_admin = true))
);
CREATE POLICY "Students update own selected subjects" ON public.student_subjects FOR UPDATE TO authenticated
  USING (student_id = auth.uid()::text OR EXISTS (SELECT 1 FROM public.profiles actor WHERE actor.id = auth.uid()::text AND (actor.role = 'admin' OR actor.is_admin = true)))
  WITH CHECK (student_id = auth.uid()::text OR EXISTS (SELECT 1 FROM public.profiles actor WHERE actor.id = auth.uid()::text AND (actor.role = 'admin' OR actor.is_admin = true)));
CREATE POLICY "Students delete own selection" ON public.student_subjects FOR DELETE TO authenticated USING (
  student_id = auth.uid()::text OR EXISTS (SELECT 1 FROM public.profiles actor WHERE actor.id = auth.uid()::text AND (actor.role = 'admin' OR actor.is_admin = true))
);

CREATE OR REPLACE FUNCTION public.select_student_subject(input_subject_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_profile public.profiles%ROWTYPE;
  matching_offering public.class_offerings%ROWTYPE;
BEGIN
  SELECT * INTO student_profile
  FROM public.profiles
  WHERE id = auth.uid()::text AND role = 'student' AND is_active = true;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  SELECT offering.* INTO matching_offering
  FROM public.class_offerings offering
  WHERE offering.subject_id = input_subject_id AND offering.status = 'Active'
    AND public.department_values_match(student_profile.department, offering.department)
    AND regexp_replace(lower(COALESCE(student_profile.course, '')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.course, '')), '[^a-z0-9]', '', 'g')
    AND regexp_replace(lower(COALESCE(student_profile.year_level, '')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.year_level, '')), '[^a-z0-9]', '', 'g')
    AND regexp_replace(lower(COALESCE(student_profile.section, '')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.section, '')), '[^a-z0-9]', '', 'g')
    AND regexp_replace(lower(COALESCE(student_profile.academic_year, '2026-2027')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.academic_year, '2026-2027')), '[^a-z0-9]', '', 'g')
    AND regexp_replace(lower(COALESCE(student_profile.semester, '1st Semester')), '[^a-z0-9]', '', 'g') = regexp_replace(lower(COALESCE(offering.semester, '1st Semester')), '[^a-z0-9]', '', 'g')
  LIMIT 1;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO public.student_subjects (student_id, subject_id, instructor_id, academic_year, semester)
  VALUES (student_profile.id, input_subject_id, matching_offering.instructor_id, matching_offering.academic_year, matching_offering.semester)
  ON CONFLICT (student_id, subject_id) DO NOTHING;

  INSERT INTO public.enrollments (student_id, class_offering_id)
  VALUES (student_profile.id, matching_offering.id)
  ON CONFLICT (student_id, class_offering_id) DO NOTHING;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.select_student_subject(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.select_student_subject(TEXT) TO authenticated;

ALTER TABLE public.digital_signatures ADD COLUMN IF NOT EXISTS instructor_name TEXT NOT NULL DEFAULT 'Instructor';
ALTER TABLE public.digital_signatures ADD COLUMN IF NOT EXISTS signature_svg TEXT;
ALTER TABLE public.digital_signatures ADD COLUMN IF NOT EXISTS grade NUMERIC(3,2) CHECK (
  grade IS NULL OR (grade >= 1.00 AND grade <= 5.00 AND grade * 4 = TRUNC(grade * 4))
);
ALTER TABLE public.digital_signatures ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE public.digital_signatures ADD COLUMN IF NOT EXISTS academic_year TEXT;
ALTER TABLE public.digital_signatures ADD COLUMN IF NOT EXISTS semester TEXT;

ALTER TABLE public.signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Signature requests select policy" ON public.signature_requests;
DROP POLICY IF EXISTS "Students insert signature requests" ON public.signature_requests;
DROP POLICY IF EXISTS "Instructors update signature requests" ON public.signature_requests;
DROP POLICY IF EXISTS "Students resubmit own rejected requests" ON public.signature_requests;
CREATE POLICY "Signature requests select policy" ON public.signature_requests FOR SELECT TO authenticated USING (
  student_id = auth.uid()::text
  OR instructor_id = auth.uid()::text
  OR EXISTS (SELECT 1 FROM public.profiles actor WHERE actor.id = auth.uid()::text AND (actor.role = 'admin' OR actor.is_admin = true))
);
CREATE POLICY "Students insert signature requests" ON public.signature_requests FOR INSERT TO authenticated WITH CHECK (
  student_id = auth.uid()::text
  AND status = 'Pending'
  AND EXISTS (
    SELECT 1 FROM public.profiles student
    JOIN public.student_subjects selection ON selection.student_id = student.id
    WHERE student.id = auth.uid()::text
      AND student.role = 'student'
      AND selection.subject_id = signature_requests.subject_id
      AND selection.instructor_id = signature_requests.instructor_id
  )
);
CREATE POLICY "Students resubmit own rejected requests" ON public.signature_requests FOR UPDATE TO authenticated
  USING (student_id = auth.uid()::text AND status IN ('Rejected', 'Pending'))
  WITH CHECK (
    student_id = auth.uid()::text AND status = 'Pending'
    AND EXISTS (
      SELECT 1 FROM public.student_subjects selection
      WHERE selection.student_id = auth.uid()::text
        AND selection.subject_id = signature_requests.subject_id
        AND selection.instructor_id = signature_requests.instructor_id
    )
  );

DROP POLICY IF EXISTS "Digital signatures select policy" ON public.digital_signatures;
DROP POLICY IF EXISTS "Instructors insert digital signatures" ON public.digital_signatures;
CREATE POLICY "Digital signatures select policy" ON public.digital_signatures FOR SELECT TO authenticated USING (
  student_id = auth.uid()::text
  OR instructor_id = auth.uid()::text
  OR EXISTS (SELECT 1 FROM public.profiles actor WHERE actor.id = auth.uid()::text AND (actor.role = 'admin' OR actor.is_admin = true))
);

CREATE OR REPLACE FUNCTION public.submit_instructor_grade_signature(
  input_request_id TEXT,
  input_grade NUMERIC,
  input_signature_svg TEXT,
  input_remarks TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_request public.signature_requests%ROWTYPE;
  target_selection public.student_subjects%ROWTYPE;
  instructor_profile public.profiles%ROWTYPE;
  signed_timestamp TIMESTAMPTZ := NOW();
BEGIN
  IF auth.uid() IS NULL
     OR input_grade IS NULL
     OR input_grade < 1.00 OR input_grade > 5.00
     OR input_grade * 4 <> TRUNC(input_grade * 4)
     OR input_signature_svg IS NULL
     OR length(input_signature_svg) > 20000
     OR length(COALESCE(input_remarks, '')) > 1000
     OR input_signature_svg !~ '^<svg xmlns="http://www\.w3\.org/2000/svg" viewBox="0 0 600 160">(<path d="[ML0-9 .-]+" fill="none" stroke="#0c4a6e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>)+</svg>$'
  THEN
    RETURN FALSE;
  END IF;

  SELECT * INTO instructor_profile
  FROM public.profiles
  WHERE id = auth.uid()::text
    AND is_active = true
    AND (role = 'instructor' OR is_instructor = true);
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  SELECT * INTO target_request
  FROM public.signature_requests
  WHERE id = input_request_id
    AND instructor_id = auth.uid()::text
    AND status = 'Pending'
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = target_request.student_id AND role = 'student' AND is_active = true
  ) THEN
    RETURN FALSE;
  END IF;

  SELECT * INTO target_selection
  FROM public.student_subjects
  WHERE student_id = target_request.student_id
    AND subject_id = target_request.subject_id
    AND instructor_id = auth.uid()::text
  FOR UPDATE;
  IF NOT FOUND OR EXISTS (SELECT 1 FROM public.digital_signatures WHERE request_id = target_request.id) THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.digital_signatures (
    id, request_id, instructor_id, instructor_name, student_id, subject_id,
    signature_hash, signature_svg, grade, remarks, academic_year, semester, signed_at
  ) VALUES (
    gen_random_uuid()::text, target_request.id, auth.uid()::text, instructor_profile.name,
    target_request.student_id, target_request.subject_id,
    'SIG-SSU-' || gen_random_uuid()::text, input_signature_svg, input_grade,
    NULLIF(BTRIM(input_remarks), ''), target_selection.academic_year, target_selection.semester,
    signed_timestamp
  );

  UPDATE public.signature_requests
  SET status = 'Approved',
      processed_at = signed_timestamp,
      reviewed_at = signed_timestamp,
      reviewed_by = instructor_profile.name,
      instructor_remarks = NULLIF(BTRIM(input_remarks), '')
  WHERE id = target_request.id;

  UPDATE public.student_subjects
  SET clearance_status = 'Approved',
      instructor_signature_status = 'Signed',
      signed_at = signed_timestamp
  WHERE student_id = target_request.student_id
    AND subject_id = target_request.subject_id;

  INSERT INTO public.notifications (id, user_id, title, message, type, read, created_at)
  VALUES (
    gen_random_uuid()::text,
    target_request.student_id,
    'Grade and clearance submitted',
    instructor_profile.name || ' submitted your grade and signed the clearance for ' || target_request.subject_id || '.',
    'success',
    false,
    signed_timestamp
  );
  RETURN TRUE;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_instructor_grade_signature(TEXT, NUMERIC, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_instructor_grade_signature(TEXT, NUMERIC, TEXT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.reject_instructor_signature_request(
  input_request_id TEXT,
  input_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_request public.signature_requests%ROWTYPE;
  target_selection public.student_subjects%ROWTYPE;
  instructor_profile public.profiles%ROWTYPE;
  reviewed_timestamp TIMESTAMPTZ := NOW();
BEGIN
  IF auth.uid() IS NULL OR NULLIF(BTRIM(input_reason), '') IS NULL OR length(input_reason) > 1000 THEN
    RETURN FALSE;
  END IF;

  SELECT * INTO instructor_profile
  FROM public.profiles
  WHERE id = auth.uid()::text
    AND is_active = true
    AND (role = 'instructor' OR is_instructor = true);
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  SELECT * INTO target_request
  FROM public.signature_requests
  WHERE id = input_request_id
    AND instructor_id = auth.uid()::text
    AND status = 'Pending'
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  SELECT * INTO target_selection
  FROM public.student_subjects
  WHERE student_id = target_request.student_id
    AND subject_id = target_request.subject_id
    AND instructor_id = auth.uid()::text
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE public.signature_requests
  SET status = 'Rejected',
      processed_at = reviewed_timestamp,
      reviewed_at = reviewed_timestamp,
      reviewed_by = instructor_profile.name,
      instructor_remarks = BTRIM(input_reason)
  WHERE id = target_request.id;

  UPDATE public.student_subjects
  SET clearance_status = 'Rejected',
      instructor_signature_status = 'Rejected'
  WHERE student_id = target_request.student_id
    AND subject_id = target_request.subject_id;

  INSERT INTO public.notifications (id, user_id, title, message, type, read, created_at)
  VALUES (
    gen_random_uuid()::text,
    target_request.student_id,
    'Clearance Action Required',
    'Your clearance request was rejected: ' || BTRIM(input_reason),
    'error',
    false,
    reviewed_timestamp
  );
  RETURN TRUE;
END;
$$;
REVOKE ALL ON FUNCTION public.reject_instructor_signature_request(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_instructor_signature_request(TEXT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_active_offering_hierarchy()
RETURNS TABLE (
  department TEXT,
  course TEXT,
  year_level TEXT,
  section TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT
    BTRIM(offering.department),
    BTRIM(offering.course),
    BTRIM(offering.year_level),
    BTRIM(offering.section)
  FROM public.class_offerings offering
  WHERE offering.status = 'Active'
    AND NULLIF(BTRIM(offering.department), '') IS NOT NULL
    AND NULLIF(BTRIM(offering.course), '') IS NOT NULL
    AND NULLIF(BTRIM(offering.year_level), '') IS NOT NULL
    AND NULLIF(BTRIM(offering.section), '') IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.profiles student
      WHERE student.id = auth.uid()::text
        AND student.role = 'student'
        AND student.is_active = true
    )
  ORDER BY 1, 2, 3, 4;
$$;
REVOKE ALL ON FUNCTION public.get_active_offering_hierarchy() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_active_offering_hierarchy() TO authenticated;
