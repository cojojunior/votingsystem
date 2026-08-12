// src/components/admin/Candidates/CandidateForm.tsx
import React, { useState, useEffect } from "react";
import { Button } from "../../common/Button";
import { Modal } from "../../common/Modal";
import { Candidate, Position } from "../../../types/voting.types";
import { Upload, X, User, Mail, Award, BookOpen, Users } from "lucide-react";

interface CandidateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Candidate>) => Promise<void>;
  initialData?: Candidate | null;
  positions: Position[];
  isLoading?: boolean;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  positions,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Candidate>>({
    name: "",
    studentId: "",
    email: "",
    positionId: "",
    level: "",
    programme: "",
    gender: "male",
    imageUrl: "",
    manifesto: "",
    status: "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      studentId: "",
      email: "",
      positionId: "",
      level: "",
      programme: "",
      gender: "male",
      imageUrl: "",
      manifesto: "",
      status: "active",
    });
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.studentId?.trim()) {
      newErrors.studentId = "Student ID is required";
    }
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.positionId) {
      newErrors.positionId = "Position is required";
    }
    if (formData.imageUrl && !formData.imageUrl.match(/^https?:\/\/.+/)) {
      newErrors.imageUrl = "Invalid image URL";
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, imageUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Candidate" : "Add New Candidate"}
      size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`input-field pl-9 ${errors.name ? "border-red-500" : ""}`}
                placeholder="Enter full name"
                required
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="label">Student ID *</label>
            <input
              type="text"
              value={formData.studentId || ""}
              onChange={(e) =>
                setFormData({ ...formData, studentId: e.target.value })
              }
              className={`input-field ${errors.studentId ? "border-red-500" : ""}`}
              placeholder="e.g., S2024001"
              required
            />
            {errors.studentId && (
              <p className="text-xs text-red-500 mt-1">{errors.studentId}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`input-field pl-9 ${errors.email ? "border-red-500" : ""}`}
                placeholder="student@upsamail.edu"
                required
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="label">Position *</label>
            <div className="relative">
              <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={formData.positionId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, positionId: e.target.value })
                }
                className={`input-field pl-9 ${errors.positionId ? "border-red-500" : ""}`}
                required>
                <option value="">Select Position</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.positionId && (
              <p className="text-xs text-red-500 mt-1">{errors.positionId}</p>
            )}
          </div>
        </div>

        {/* Academic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Level</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.level || ""}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
                className="input-field pl-9"
                placeholder="e.g., 100, 200, 300"
              />
            </div>
          </div>

          <div>
            <label className="label">Programme</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.programme || ""}
                onChange={(e) =>
                  setFormData({ ...formData, programme: e.target.value })
                }
                className="input-field pl-9"
                placeholder="e.g., BSc Computer Science"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Gender</label>
            <select
              value={formData.gender || "male"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gender: e.target.value as "male" | "female",
                })
              }
              className="input-field">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="label">Status</label>
            <select
              value={formData.status || "active"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as
                    | "active"
                    | "inactive"
                    | "disqualified",
                })
              }
              className="input-field">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="disqualified">Disqualified</option>
            </select>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="label">Image</label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-upsa-blue transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                />
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload image</p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </label>
              </div>
            </div>
            {formData.imageUrl && (
              <div className="relative w-20 h-20 flex-shrink-0">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: "" })}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          {errors.imageUrl && (
            <p className="text-xs text-red-500 mt-1">{errors.imageUrl}</p>
          )}
        </div>

        {/* Manifesto */}
        <div>
          <label className="label">Manifesto</label>
          <textarea
            value={formData.manifesto || ""}
            onChange={(e) =>
              setFormData({ ...formData, manifesto: e.target.value })
            }
            className="input-field"
            rows={4}
            placeholder="Enter candidate manifesto..."
          />
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
            {initialData ? "Update Candidate" : "Add Candidate"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
