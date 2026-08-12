// src/components/admin/Voters/VoterUpload.tsx
import React, { useState } from "react";
import { Button } from "../../common/Button";
import { Modal } from "../../common/Modal";
import { supabase } from "../../../api/client";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface VoterUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VoterUpload: React.FC<VoterUploadProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    added: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      setError(null);
    } else {
      setError("Please select a valid CSV file");
    }
  };

  const handleUpload = async () => {
    if (!csvFile) {
      setError("Please select a CSV file to upload");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          throw new Error("CSV file is empty or invalid");
        }

        const headerRow = lines[0].split(",").map((h) => h.trim());
        const headers = headerRow.reduce(
          (acc: any, h: string, index: number) => {
            acc[h] = index;
            return acc;
          },
          {},
        );

        const requiredHeaders = ["StudentID", "Email"];
        const missingHeaders = requiredHeaders.filter((h) => !(h in headers));
        if (missingHeaders.length > 0) {
          throw new Error(
            `Missing required headers: ${missingHeaders.join(", ")}`,
          );
        }

        const students = [];
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          if (values.every((v) => !v)) continue;

          const student = {
            student_id: values[headers["StudentID"]] || "",
            email: values[headers["Email"]] || "",
            gender:
              headers["Gender"] !== undefined
                ? values[headers["Gender"]]?.toLowerCase() || "male"
                : "male",
            level:
              headers["Level"] !== undefined
                ? values[headers["Level"]] || ""
                : "",
            programme:
              headers["Programme"] !== undefined
                ? values[headers["Programme"]] || ""
                : "",
            session_id:
              headers["SessionID"] !== undefined
                ? values[headers["SessionID"]] || null
                : null,
            is_eligible: true,
            has_voted: false,
          };

          // Validate
          if (!student.student_id) {
            errors.push(`Row ${i + 1}: Student ID is required`);
            continue;
          }
          if (!student.email || !student.email.includes("@")) {
            errors.push(`Row ${i + 1}: Invalid email format`);
            continue;
          }
          if (!["male", "female"].includes(student.gender)) {
            errors.push(`Row ${i + 1}: Gender must be 'male' or 'female'`);
            continue;
          }

          students.push(student);
          setUploadProgress((students.length / (lines.length - 1)) * 100);
        }

        if (students.length === 0) {
          throw new Error("No valid student records found");
        }

        // Use type assertion to fix the error
        const { error: insertError } = await (
          supabase.from("students") as any
        ).insert(students);

        if (insertError) {
          throw new Error(`Failed to insert students: ${insertError.message}`);
        }

        setSuccess({
          added: students.length,
          errors: errors,
        });

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      };

      reader.readAsText(csvFile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Voters from CSV"
      size="lg">
      <div className="space-y-4">
        {/* File Upload Area */}
        <div>
          <label className="label">CSV File</label>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              error
                ? "border-red-300 bg-red-50"
                : csvFile
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 hover:border-upsa-blue"
            }`}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csvFileInput"
              disabled={isUploading}
            />
            <label htmlFor="csvFileInput" className="cursor-pointer block">
              {csvFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{csvFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(csvFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCsvFile(null);
                    }}
                    className="text-red-500 hover:text-red-700">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                  <p className="text-gray-600">Click to select CSV file</p>
                  <p className="text-sm text-gray-400">
                    Format: StudentID, Email, Gender, Level, Programme,
                    SessionID
                  </p>
                  <p className="text-xs text-gray-400">
                    Required: StudentID, Email | Optional: Gender, Level,
                    Programme, SessionID
                  </p>
                </div>
              )}
            </label>
          </div>
          {error && (
            <div className="mt-2 flex items-start gap-2 text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Uploading...</span>
              <span className="font-medium">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-upsa-blue h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-700 font-medium">
                  Successfully imported {success.added} students
                </p>
                {success.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-yellow-600">
                      {success.errors.length} errors encountered:
                    </p>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1 max-h-32 overflow-y-auto">
                      {success.errors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Template Download */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Need a template?
              </p>
              <p className="text-xs text-gray-500">
                Download a sample CSV file
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const headers = [
                  "StudentID",
                  "Email",
                  "Gender",
                  "Level",
                  "Programme",
                  "SessionID",
                ];
                const sample = [
                  "S2024001",
                  "student1@upsamail.edu",
                  "male",
                  "100",
                  "BSc Computer Science",
                  "session-id-1",
                ];
                const csv = [headers.join(","), sample.join(",")].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "voter_template.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}>
              <FileText className="h-4 w-4 mr-1" />
              Download Template
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={isUploading}>
            Cancel
          </Button>
          <Button
            type="button"
            fullWidth
            onClick={handleUpload}
            disabled={!csvFile || isUploading}
            isLoading={isUploading}>
            {isUploading ? "Uploading..." : "Import Students"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default VoterUpload;
