// src/pages/Admin/CandidateManagement.tsx
import React, { useState, useEffect } from "react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { supabase } from "../../api/client";
import { Candidate, Position } from "../../types/voting.types";
import { Search, Plus, Edit, Trash2, User, Award, Upload } from "lucide-react";

const CandidateManagement: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch positions
      const { data: positionsData, error: positionsError } = await (
        supabase.from("positions") as any
      )
        .select("*")
        .eq("is_active", true)
        .order("order");

      if (positionsError) throw positionsError;

      setPositions(
        (positionsData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || "",
          order: p.order || 0,
          maxSelections: p.max_selections || 1,
          isActive: p.is_active ?? true,
          candidates: [],
        })),
      );

      // Fetch candidates with position names
      const { data: candidatesData, error: candidatesError } = await (
        supabase.from("candidates") as any
      ).select("*, positions(name)");

      if (candidatesError) throw candidatesError;

      const transformedCandidates = (candidatesData || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        studentId: c.student_id,
        email: c.email,
        positionId: c.position_id,
        position: c.positions?.name || "Unknown",
        level: c.level || "",
        programme: c.programme || "",
        gender: c.gender || "male",
        imageUrl: c.image_url || "",
        manifesto: c.manifesto || "",
        status: c.status || "active",
        votes: c.votes || 0,
      }));
      setCandidates(transformedCandidates);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name || "",
        student_id: formData.studentId || "",
        email: formData.email || "",
        position_id: formData.positionId || "",
        level: formData.level || "",
        programme: formData.programme || "",
        gender: formData.gender || "male",
        image_url: formData.imageUrl || "",
        manifesto: formData.manifesto || "",
        status: formData.status || "active",
      };

      if (editingCandidate) {
        const { error } = await (supabase.from("candidates") as any)
          .update(payload)
          .eq("id", editingCandidate.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase.from("candidates") as any).insert(
          payload,
        );

        if (error) throw error;
      }

      await fetchData();
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
      const { error } = await (supabase.from("candidates") as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

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
    });
    setEditingCandidate(null);
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setFormData(candidate);
    setShowModal(true);
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = {
    total: candidates.length,
    active: candidates.filter((c) => c.status === "active").length,
    positions: positions.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Candidate Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage election candidates and their information
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-upsa-blue">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Candidates</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-gray-600">Active Candidates</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {stats.positions}
            </p>
            <p className="text-sm text-gray-600">Total Positions</p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCandidates.map((candidate) => {
          const position = positions.find((p) => p.id === candidate.positionId);
          return (
            <Card key={candidate.id} hover>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {candidate.imageUrl ? (
                    <img
                      src={candidate.imageUrl}
                      alt={candidate.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {candidate.name}
                  </h3>
                  <p className="text-sm text-gray-500">{candidate.studentId}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Award className="h-3 w-3 text-upsa-gold" />
                    <span className="text-xs text-gray-600">
                      {position?.name || "No position"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-500">Level {candidate.level}</span>
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    candidate.status === "active"
                      ? "bg-green-100 text-green-700"
                      : candidate.status === "inactive"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}>
                  {candidate.status}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(candidate)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(candidate.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No candidates found</p>
          <p className="text-sm text-gray-400">
            Try adjusting your search or add a new candidate
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingCandidate ? "Edit Candidate" : "Add New Candidate"}
        size="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Student ID *</label>
              <input
                type="text"
                value={formData.studentId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, studentId: e.target.value })
                }
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Position *</label>
              <select
                value={formData.positionId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, positionId: e.target.value })
                }
                className="input-field"
                required>
                <option value="">Select Position</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Level</label>
              <input
                type="text"
                value={formData.level || ""}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
                className="input-field"
                placeholder="e.g., 100, 200, 300"
              />
            </div>
            <div>
              <label className="label">Programme</label>
              <input
                type="text"
                value={formData.programme || ""}
                onChange={(e) =>
                  setFormData({ ...formData, programme: e.target.value })
                }
                className="input-field"
                placeholder="e.g., BSc Computer Science"
              />
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

          <div>
            <label className="label">Image URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.imageUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="input-field flex-1"
                placeholder="https://example.com/image.jpg"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex items-center">
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
            </div>
          </div>

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

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}>
              Cancel
            </Button>
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              {editingCandidate ? "Update Candidate" : "Add Candidate"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CandidateManagement;
