CREATE OR REPLACE PROCEDURE public.delete_account_by_email(
  IN p_email text,
  IN p_role  text
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_email      text   := lower(trim(p_email));
  v_role       text   := upper(trim(p_role));
  v_user_id    text;
  v_teacher_id bigint;
BEGIN
  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  IF v_role IS NULL OR v_role = '' THEN
    RAISE EXCEPTION 'Role is required';
  END IF;

  /*
    ROUTE 1: Roles stored in public."User"
    (STUDENT, PARENT, INSTRUCTOR, ADMIN)
  */
  IF v_role IN ('STUDENT', 'PARENT', 'INSTRUCTOR', 'ADMIN') THEN
    SELECT u.id
      INTO v_user_id
      FROM public."User" u
     WHERE lower(u.email) = v_email
       AND upper(u.role::text) = v_role
     LIMIT 1;

    IF v_user_id IS NULL THEN
      RAISE EXCEPTION 'No % found in public."User" for email %', v_role, p_email;
    END IF;

    -- Non-FK / denormalized cleanup
    DELETE FROM public.notifications
     WHERE user_id = v_user_id
       AND upper(user_role::text) = v_role;

    DELETE FROM public.user_feature_access
     WHERE user_id = v_user_id
       AND upper(user_role) = v_role;

    DELETE FROM public.ai_credit_logs
     WHERE user_id = v_user_id
       AND upper(user_role) = v_role;

    DELETE FROM public.ai_credit_daily_summary
     WHERE user_id = v_user_id
       AND upper(user_role) = v_role;

    -- Role-specific non-FK cleanup
    IF v_role = 'STUDENT' THEN
      DELETE FROM public.student_sessions
       WHERE child_id = v_user_id;

      DELETE FROM public.student_preferences
       WHERE child_id = v_user_id;

      DELETE FROM public.student_badges
       WHERE child_id = v_user_id;

      DELETE FROM public.student_xp_log
       WHERE child_id = v_user_id;

      DELETE FROM public.parent_communication_logs
       WHERE child_id = v_user_id;

      DELETE FROM public.assignment_reminders
       WHERE child_id = v_user_id;
    ELSIF v_role = 'PARENT' THEN
      -- Optional email-based log cleanup
      DELETE FROM public.parent_communication_logs
       WHERE lower(parent_email) = v_email;

      DELETE FROM public.assignment_reminders
       WHERE lower(parent_email) = v_email;
    END IF;

    -- Main delete (FK cascades remove related rows where defined)
    DELETE FROM public."User"
     WHERE id = v_user_id;

    RAISE NOTICE 'Deleted % account from "User": email=%, id=%', v_role, p_email, v_user_id;
    RETURN;
  END IF;

  /*
    ROUTE 2: TEACHER stored in public.teachers
  */
  IF v_role = 'TEACHER' THEN
    SELECT t.id
      INTO v_teacher_id
      FROM public.teachers t
     WHERE lower(t.email) = v_email
     LIMIT 1;

    IF v_teacher_id IS NULL THEN
      RAISE EXCEPTION 'No TEACHER found in public.teachers for email %', p_email;
    END IF;

    -- Non-FK / denormalized cleanup
    DELETE FROM public.teacher_verification_tokens
     WHERE teacher_id = v_teacher_id;

    DELETE FROM public.teacher_question_bank
     WHERE teacher_id = v_teacher_id;

    DELETE FROM public.parent_communication_logs
     WHERE teacher_id = v_teacher_id;

    DELETE FROM public.notifications
     WHERE user_id = v_teacher_id::text
       AND upper(user_role::text) = 'TEACHER';

    DELETE FROM public.user_feature_access
     WHERE user_id = v_teacher_id::text
       AND upper(user_role) IN ('TEACHER', 'INSTRUCTOR');

    DELETE FROM public.ai_credit_logs
     WHERE user_id = v_teacher_id::text
       AND upper(user_role) IN ('TEACHER', 'INSTRUCTOR');

    DELETE FROM public.ai_credit_daily_summary
     WHERE user_id = v_teacher_id::text
       AND upper(user_role) IN ('TEACHER', 'INSTRUCTOR');

    -- Main delete (FK cascades remove classes/assignments/submissions/etc.)
    DELETE FROM public.teachers
     WHERE id = v_teacher_id;

    RAISE NOTICE 'Deleted TEACHER account: email=%, id=%', p_email, v_teacher_id;
    RETURN;
  END IF;

  RAISE EXCEPTION 'Unsupported role: %. Allowed: STUDENT, PARENT, TEACHER, INSTRUCTOR, ADMIN', p_role;
END;
$$;