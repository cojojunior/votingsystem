// src/api/auth.ts
import { supabase, rateLimiter } from './client';
import { LoginCredentials, OTPResponse } from '../types/auth.types';
import { validateUPSAEmail, buildStudentEmail } from '../utils/validators/emailValidator';

export const authAPI = {
  requestOTP: async (email: string): Promise<OTPResponse> => {
    if (!rateLimiter.check(5)) {
      throw new Error('Rate limit exceeded. Please wait before trying again.');
    }

    if (!validateUPSAEmail(email)) {
      throw new Error('Invalid email. Please use your @upsamail.edu.gh address.');
    }

    try {
      const studentId = email.split('@')[0];
      console.log('[DEBUG] Looking up student:', { email, studentId });

      // Try multiple methods to find the student
      let student = null;
      let studentError = null;

      // Method 1: Lookup by email with maybeSingle
      console.log('[DEBUG] Method 1: Looking up by email...');
      const { data: byEmail, error: err1 } = await supabase
        .from('students')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (byEmail) {
        student = byEmail;
        console.log('[DEBUG] Found by email:', student);
      } else {
        console.log('[DEBUG] Method 1 failed. Error:', err1);
        
        // Method 2: Lookup by student_id
        console.log('[DEBUG] Method 2: Looking up by student_id...');
        const { data: byId, error: err2 } = await supabase
          .from('students')
          .select('*')
          .eq('student_id', studentId)
          .maybeSingle();

        if (byId) {
          student = byId;
          console.log('[DEBUG] Found by student_id:', student);
        } else {
          console.log('[DEBUG] Method 2 failed. Error:', err2);
          
          // Method 3: Try with ilike (case insensitive)
          console.log('[DEBUG] Method 3: Looking up by ilike...');
          const { data: byIlike, error: err3 } = await supabase
            .from('students')
            .select('*')
            .ilike('email', `%${studentId}%`)
            .maybeSingle();

          if (byIlike) {
            student = byIlike;
            console.log('[DEBUG] Found by ilike:', student);
          } else {
            console.log('[DEBUG] Method 3 failed. Error:', err3);
            
            // Method 4: Get all students and filter (debugging)
            console.log('[DEBUG] Method 4: Getting all students...');
            const { data: allStudents, error: err4 } = await supabase
              .from('students')
              .select('*')
              .limit(50);

            console.log('[DEBUG] First 10 students:', allStudents?.slice(0, 10));
            console.log('[DEBUG] Total students found:', allStudents?.length);
            console.log('[DEBUG] Errors:', { err1, err2, err3, err4 });

            // Check if student exists in the list
            const found = allStudents?.find(function(s) {
              return s.student_id === studentId || 
                s.email === email ||
                (s.email && s.email.includes(studentId));
            });

            if (found) {
              student = found;
              console.log('[DEBUG] Found in list:', student);
            } else {
              throw new Error('Student with ID ' + studentId + ' not found. Please check your Student ID.');
            }
          }
        }
      }

      if (!student) {
        throw new Error('Student with ID ' + studentId + ' not found. Please check your Student ID.');
      }

      console.log('[DEBUG] Final student found:', {
        id: student.id,
        student_id: student.student_id,
        email: student.email,
        is_eligible: student.is_eligible,
        has_voted: student.has_voted
      });

      if (student.has_voted) {
        throw new Error('You have already voted.');
      }

      if (!student.is_eligible) {
        throw new Error('You are not eligible to vote in this election.');
      }

      // Generate and store OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      console.log('[DEBUG] Saving OTP for student:', student.id);
      const { error: insertError } = await supabase
        .from('otp_requests')
        .insert({
          email: student.email,
          otp: otp,
          expires_at: expiresAt.toISOString(),
          student_id: student.id,
        });

      if (insertError) {
        console.error('[DEBUG] OTP insert error:', insertError);
        throw new Error('Failed to save OTP: ' + insertError.message);
      }

      console.log('[DEBUG] OTP for ' + email + ': ' + otp);

      return {
        success: true,
        message: 'OTP sent successfully',
        expiresIn: 600,
      };
    } catch (error: any) {
      console.error('[DEBUG] OTP request error:', error);
      throw error;
    }
  },

  verifyOTP: async (email: string, otp: string) => {
    if (!rateLimiter.check(10)) {
      throw new Error('Too many attempts. Please wait.');
    }

    try {
      console.log('[DEBUG] Verifying OTP:', { email, otp });

      const { data, error } = await supabase
        .from('otp_requests')
        .select('*')
        .eq('email', email)
        .eq('otp', otp)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('[DEBUG] OTP verification result:', { data, error });

      if (error) {
        throw new Error('OTP verification failed: ' + error.message);
      }

      if (!data) {
        throw new Error('Invalid or expired OTP.');
      }

      // Mark OTP as used
      const { error: updateError } = await supabase
        .from('otp_requests')
        .update({ used: true })
        .eq('id', data.id);

      if (updateError) {
        console.error('Failed to mark OTP as used:', updateError);
      }

      // Get student session
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .contains('student_ids', [data.student_id])
        .eq('status', 'active')
        .maybeSingle();

      if (sessionError && sessionError.code !== 'PGRST116') {
        throw new Error('Session lookup failed: ' + sessionError.message);
      }

      if (!session) {
        throw new Error('No active voting session found for your account.');
      }

      return {
        success: true,
        session: session,
        student: {
          id: data.student_id,
          email: data.email,
        },
      };
    } catch (error: any) {
      console.error('[DEBUG] OTP verification error:', error);
      throw error;
    }
  },

  login: async (credentials: LoginCredentials): Promise<{ success: boolean; message: string }> => {
    try {
      // Build email from student ID if provided
      let email = credentials.email;
      if (credentials.studentId) {
        email = buildStudentEmail(credentials.studentId);
      }

      if (!email) {
        throw new Error('Student ID or email is required');
      }

      // Validate email
      if (!validateUPSAEmail(email)) {
        throw new Error('Invalid email. Please use your @upsamail.edu.gh address.');
      }

      // Check if student exists and is eligible
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, email, is_eligible, has_voted')
        .eq('email', email)
        .maybeSingle();

      if (studentError) {
        throw new Error('Error verifying student: ' + studentError.message);
      }

      if (!student) {
        throw new Error('Student not found. Please check your Student ID.');
      }

      if (student.has_voted) {
        throw new Error('You have already voted.');
      }

      if (!student.is_eligible) {
        throw new Error('You are not eligible to vote in this election.');
      }

      // If OTP is provided, verify it
      if (credentials.otp) {
        const verification = await authAPI.verifyOTP(email, credentials.otp);
        if (verification.success) {
          return {
            success: true,
            message: 'Login successful',
          };
        }
      }

      // If no OTP provided, request one
      await authAPI.requestOTP(email);
      
      return {
        success: false,
        message: 'OTP sent. Please verify to complete login.',
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
};