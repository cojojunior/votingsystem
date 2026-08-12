// src/components/admin/Sessions/SessionForm.tsx
import React, { useState, useEffect } from "react";
import { Button } from "../../common/Button";
import { Modal } from "../../common/Modal";
import { VotingSession } from "../../../types/session.types";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<VotingSession>) => Promise<void>;
  initialData?: VotingSession | null;
  isLoading?: boolean;
}

export const SessionForm: React.FC<SessionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<VotingSession>>({
    name: "Session 1",
    startTime: new Date(),
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours later
    totalStudents: 2000,
    status: "pending",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        startTime: new Date(initialData.startTime),
        endTime: new Date(initialData.endTime),
        totalStudents: initialData.totalStudents,
        status: initialData.status,
      });
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData({
      name: "Session 1",
      startTime: new Date(),
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      totalStudents: 2000,
      status: "pending",
    });
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = "Session name is required";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (start >= end) {
        newErrors.endTime = "End time must be after start time";
      }
      if (end < new Date()) {
        newErrors.endTime = "End time cannot be in the past";
      }
    }
    if (!formData.totalStudents || formData.totalStudents <= 0) {
      newErrors.totalStudents = "Total students must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
    resetForm();
  };

  const handleChange = (field: keyof VotingSession, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Session" : "Create New Session"}
      size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Session Name */}
        <div>
          <label className="label">Session Name *</label>
          <select
            value={formData.name || "Session 1"}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`input-field ${errors.name ? "border-red-500" : ""}`}>
            <option value="Session 1">Session 1</option>
            <option value="Session 2">Session 2</option>
            <option value="Session 3">Session 3</option>
          </select>
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date & Time *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="datetime-local"
                value={
                  formData.startTime
                    ? new Date(formData.startTime).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  handleChange("startTime", new Date(e.target.value))
                }
                className={`input-field pl-9 ${errors.startTime ? "border-red-500" : ""}`}
                required
              />
            </div>
            {errors.startTime && (
              <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>
            )}
          </div>

          <div>
            <label className="label">End Date & Time *</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="datetime-local"
                value={
                  formData.endTime
                    ? new Date(formData.endTime).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  handleChange("endTime", new Date(e.target.value))
                }
                className={`input-field pl-9 ${errors.endTime ? "border-red-500" : ""}`}
                required
              />
            </div>
            {errors.endTime && (
              <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Total Students */}
        <div>
          <label className="label">Total Students *</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="number"
              value={formData.totalStudents || 2000}
              onChange={(e) =>
                handleChange("totalStudents", parseInt(e.target.value) || 0)
              }
              className={`input-field pl-9 ${errors.totalStudents ? "border-red-500" : ""}`}
              min="1"
              max="6000"
              required
            />
          </div>
          {errors.totalStudents && (
            <p className="text-xs text-red-500 mt-1">{errors.totalStudents}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Maximum 6,000 students per session
          </p>
        </div>

        {/* Status (for editing) */}
        {initialData && (
          <div>
            <label className="label">Status</label>
            <select
              value={formData.status || "pending"}
              onChange={(e) => handleChange("status", e.target.value)}
              className="input-field">
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-700">
              {initialData
                ? "Editing this session will affect all assigned students."
                : "Students will be assigned to this session based on their eligibility."}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => {
              onClose();
              resetForm();
            }}>
            Cancel
          </Button>
          <Button type="submit" fullWidth isLoading={isLoading}>
            {initialData ? "Update Session" : "Create Session"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SessionForm;
