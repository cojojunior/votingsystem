// src/pages/Admin/SessionManagement.tsx
import React, { useState, useEffect } from "react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { supabase } from "../../api/client";
import { VotingSession } from "../../types/session.types";
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
} from "lucide-react";

export const SessionManagement: React.FC = () => {
  const [sessions, setSessions] = useState<VotingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<VotingSession | null>(
    null,
  );
  const [formData, setFormData] = useState<Partial<VotingSession>>({
    name: "Session 1",
    startTime: new Date(),
    endTime: new Date(),
    totalStudents: 2000,
    status: "pending",
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingSession) {
        const { error } = await supabase
          .from("sessions")
          .update({
            name: formData.name,
            start_time: formData.startTime,
            end_time: formData.endTime,
            status: formData.status,
          })
          .eq("id", editingSession.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("sessions").insert({
          name: formData.name,
          start_time: formData.startTime,
          end_time: formData.endTime,
          student_ids: [],
          status: "pending",
          votes_cast: 0,
        });

        if (error) throw error;
      }

      await fetchSessions();
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      const { error } = await supabase.from("sessions").delete().eq("id", id);

      if (error) throw error;
      await fetchSessions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("sessions")
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
      endTime: new Date(),
      totalStudents: 2000,
      status: "pending",
    });
    setEditingSession(null);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-700",
      active: "bg-green-100 text-green-700",
      completed: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-2 py-0.5 text-xs rounded-full ${variants[status as keyof typeof variants] || variants.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading && sessions.length === 0) {
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
                  onClick={() => handleDelete(session.id)}>
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingSession ? "Edit Session" : "Create Session"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Session Name</label>
            <select
              value={formData.name || "Session 1"}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
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
                  totalStudents: parseInt(e.target.value),
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
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="input-field">
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

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
            <Button type="submit" fullWidth isLoading={isLoading}>
              {editingSession ? "Update Session" : "Create Session"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
