// src/components/admin/Candidates/CandidateManagement.tsx
import React, { useState, useEffect } from "react";
import { CandidateForm } from "./CandidateForm";
import { CandidateList } from "./CandidateList";
import { Button } from "../../common/Button";
import { Card } from "../../common/Card";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { supabase } from "../../../api/client";
import { Candidate, Position } from "../../../types/voting.types";
import { Plus, Users, Award, TrendingUp } from "lucide-react";

export const CandidateManagement: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch positions
      const { data: positionsData, error: positionsError } = await supabase
        .from("positions")
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
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("candidates")
        .select("*, positions(name)");

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

  const handleSubmit = async (data: Partial<Candidate>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name || "",
        student_id: data.studentId || "",
        email: data.email || "",
        position_id: data.positionId || "",
        level: data.level || "",
        programme: data.programme || "",
        gender: data.gender || "male",
        image_url: data.imageUrl || "",
        manifesto: data.manifesto || "",
        status: data.status || "active",
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
      setShowForm(false);
      setEditingCandidate(null);
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

  const stats = {
    total: candidates.length,
    active: candidates.filter((c) => c.status === "active").length,
    positions: positions.length,
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
            Candidate Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage election candidates and their information
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCandidate(null);
            setShowForm(true);
          }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Candidates</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Positions</p>
              <p className="text-2xl font-bold text-upsa-blue">
                {stats.positions}
              </p>
            </div>
            <div className="bg-upsa-blue/10 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-upsa-blue" />
            </div>
          </div>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Candidate List */}
      <CandidateList
        candidates={candidates}
        onEdit={(candidate) => {
          setEditingCandidate(candidate);
          setShowForm(true);
        }}
        onDelete={handleDelete}
      />

      {/* Candidate Form Modal */}
      <CandidateForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCandidate(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingCandidate}
        positions={positions}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default CandidateManagement;
