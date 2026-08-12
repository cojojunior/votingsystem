// src/components/admin/Candidates/CandidateList.tsx
import React, { useState } from "react";
import { Card } from "../../common/Card";
import { Button } from "../../common/Button";
import { Candidate } from "../../../types/voting.types";
import {
  Search,
  Edit,
  Trash2,
  User,
  Award,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface CandidateListProps {
  candidates: Candidate[];
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Active
          </span>
        );
      case "inactive":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Inactive
          </span>
        );
      case "disqualified":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Disqualified
          </span>
        );
      default:
        return null;
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || candidate.status === filterStatus;
    const matchesPosition =
      filterPosition === "all" || candidate.positionId === filterPosition;
    return matchesSearch && matchesStatus && matchesPosition;
  });

  // Get unique positions for filter
  const positions = Array.from(new Set(candidates.map((c) => c.positionId)));

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterPosition("all");
    setShowFilters(false);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <div className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
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
        </div>

        {/* Filter Toggle Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1">
          <Filter className="h-4 w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
          {(filterStatus !== "all" || filterPosition !== "all") && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-upsa-blue text-white rounded-full">
              {[
                filterStatus !== "all" ? 1 : 0,
                filterPosition !== "all" ? 1 : 0,
              ].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </Button>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 w-full mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-40">
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field text-sm">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="disqualified">Disqualified</option>
              </select>
            </div>
            <div className="w-48">
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Position
              </label>
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="input-field text-sm">
                <option value="all">All Positions</option>
                {positions.map((posId) => {
                  const candidate = candidates.find(
                    (c) => c.positionId === posId,
                  );
                  return (
                    <option key={posId} value={posId}>
                      {candidate?.position || posId}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearFilters}
                className="text-sm">
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {filteredCandidates.length} of {candidates.length} candidates
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCandidates.map((candidate) => (
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
                    {candidate.position || "No position"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-gray-500">Level {candidate.level}</span>
              {getStatusBadge(candidate.status)}
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(candidate)}>
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(candidate.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No candidates found</p>
          <p className="text-sm text-gray-400">Try adjusting your filters</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearFilters}
            className="mt-2">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default CandidateList;
