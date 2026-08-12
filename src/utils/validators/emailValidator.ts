// src/utils/validators/emailValidator.ts
export const validateUPSAEmail = (email: string): boolean => {
  // Updated regex to require @upsamail.edu.gh
  const regex = /^[a-zA-Z0-9._%+-]+@upsamail\.edu\.gh$/;
  return regex.test(email) && !email.includes(" ");
};

export const validateStudentId = (studentId: string): boolean => {
  // UPSA Student ID contains only numbers
  // Example: 10309003
  const regex = /^\d+$/;
  return regex.test(studentId) && studentId.length >= 4;
};

export const extractStudentId = (email: string): string => {
  return email.split("@")[0];
};

export const getEmailDomain = (email: string): string => {
  return email.split("@")[1] || "";
};

export const isUPSAEmail = (email: string): boolean => {
  return validateUPSAEmail(email);
};

export const buildStudentEmail = (studentId: string): string => {
  // Remove any whitespace and convert to lowercase
  const cleanId = studentId.trim().toLowerCase();
  return `${cleanId}@upsamail.edu.gh`;
};

export const formatStudentId = (studentId: string): string => {
  // Remove any non-numeric characters and trim
  return studentId.replace(/\D/g, "").trim();
};
