// src/components/admin/Sessions/SessionManagement.tsx
import React, { useState, useEffect } from "react";
import { Card } from "../../common/Card";
import { Button } from "../../common/Button";
import { Modal } from "../../common/Modal";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { supabase } from "../../../api/client";
import { VotingSession } from "../../../types/session.types";
import {
  Clock,
  Calendar,
  Users,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
} from "lucide-react";

export const SessionManagement: React.FC = () => {
  const [sessions, setSessions] = useState<VotingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSession, setEditingSession] = useState<VotingSession | null>(
    null,
  );
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<VotingSession>>({
    name: "Session 1",
    startTime: new Date(),
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
    totalStudents: 2000,
    status: "pending",
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase.from("sessions") as any)
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;

      const transformedSessions = (data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        startTime: new Date(s.start_time),
        endTime: new Date(s.end_time),
        studentIds: s.student_ids || [],
        isActive: s.status === "active",
        status: s.status || "pending",
        totalStudents: s.student_ids?.length || 0,
        votesCast: s.votes_cast || 0,
        percentage: s.student_ids?.length
          ? ((s.votes_cast || 0) / s.student_ids.length) * 100
          : 0,
      }));
      setSessions(transformedSessions);
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
        name: formData.name || "Session 1",
        start_time:
          formData.startTime?.toISOString() || new Date().toISOString(),
        end_time:
          formData.endTime?.toISOString() ||
          new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        status: formData.status || "pending",
        student_ids: [],
        votes_cast: 0,
      };

      if (editingSession) {
        const { error } = await (supabase.from("sessions") as any)
          .update(payload)
          .eq("id", editingSession.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase.from("sessions") as any).insert(
          payload,
        );

        if (error) throw error;
      }

      await fetchSessions();
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSessionId) return;

    try {
      const { error } = await (supabase.from("sessions") as any)
        .delete()
        .eq("id", deletingSessionId);

      if (error) throw error;
      await fetchSessions();
      setShowDeleteModal(false);
      setDeletingSessionId(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await (supabase.from("sessions") as any)
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      await fetchSessions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "Session 1",
      startTime: new Date(),
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      totalStudents: 2000,
      status: "pending",
    });
    setEditingSession(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      active: "bg-green-100 text-green-700",
      completed: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-2 py-0.5 text-xs rounded-full ${variants[status] || variants.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Session Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage voting sessions and schedules
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Session
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <Card key={session.id} hover>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{session.name}</h3>
                {getStatusBadge(session.status)}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingSession(session);
                    setFormData({
                      name: session.name,
                      startTime: new Date(session.startTime),
                      endTime: new Date(session.endTime),
                      totalStudents: session.totalStudents,
                      status: session.status,
                    });
                    setShowModal(true);
                  }}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setDeletingSessionId(session.id);
                    setShowDeleteModal(true);
                  }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{new Date(session.startTime).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(session.startTime).toLocaleTimeString()} -{" "}
                  {new Date(session.endTime).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span>{session.totalStudents || 0} students</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {session.status === "pending" && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStatusChange(session.id, "active")}>
                  <Play className="h-3 w-3 mr-1" />
                  Start
                </Button>
              )}
              {session.status === "active" && (
                <Button
                  size="sm"
                  variant="warning"
                  className="flex-1"
                  onClick={() => handleStatusChange(session.id, "completed")}>
                  <Square className="h-3 w-3 mr-1" />
                  End
                </Button>
              )}
              {session.status === "active" && (
                <Button
                  size="sm"
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleStatusChange(session.id, "cancelled")}>
                  <Pause className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No sessions created yet</p>
          <p className="text-sm text-gray-400">
            Create a new voting session to get started
          </p>
        </div>
      )}

      {/* Create/Edit Modal - Using the Modal component */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingSession ? "Edit Session" : "Create Session"}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4">
          <div>
            <label className="label">Session Name</label>
            <select
              value={formData.name || "Session 1"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value as
                    | "Session 1"
                    | "Session 2"
                    | "Session 3",
                })
              }
              className="input-field"
              required>
              <option value="Session 1">Session 1</option>
              <option value="Session 2">Session 2</option>
              <option value="Session 3">Session 3</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date & Time</label>
              <input
                type="datetime-local"
                value={
                  formData.startTime
                    ? new Date(formData.startTime).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startTime: new Date(e.target.value),
                  })
                }
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">End Date & Time</label>
              <input
                type="datetime-local"
                value={
                  formData.endTime
                    ? new Date(formData.endTime).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endTime: new Date(e.target.value),
                  })
                }
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Total Students</label>
            <input
              type="number"
              value={formData.totalStudents || 2000}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  totalStudents: parseInt(e.target.value) || 0,
                })
              }
              className="input-field"
              min="1"
              max="6000"
              required
            />
          </div>

          {editingSession && (
            <div>
              <label className="label">Status</label>
              <select
                value={formData.status || "pending"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as
                      | "pending"
                      | "active"
                      | "completed"
                      | "cancelled",
                  })
                }
                className="input-field">
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              {editingSession
                ? "Editing this session will affect all assigned students."
                : "Students will be assigned to this session based on their eligibility."}
            </p>
          </div>

          <div className="flex gap-3">
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
              {editingSession ? "Update Session" : "Create Session"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal - Using the Modal component */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingSessionId(null);
        }}
        title="Delete Session">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Are you sure you want to delete this session?
                </p>
                <p className="text-sm text-red-700 mt-1">
                  This action cannot be undone. All data associated with this
                  session will be permanently removed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingSessionId(null);
              }}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              fullWidth
              onClick={handleDelete}>
              Delete Session
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SessionManagement;
