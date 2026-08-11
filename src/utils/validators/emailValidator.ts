// src/utils/validators/emailValidator.ts
export const validateUPSAEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._%+-]+@upsamail\.edu$/;
  return regex.test(email) && !email.includes(" ");
};

export const extractStudentId = (email: string): string => {
  return email.split("@")[0];
};

export const validateStudentId = (studentId: string): boolean => {
  // Assuming format: S[0-9]{7} or similar
  const regex = /^S\d{7}$/;
  return regex.test(studentId);
};
