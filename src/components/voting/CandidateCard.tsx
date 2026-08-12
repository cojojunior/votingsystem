// src/components/voting/CandidateCard.tsx
import React, { memo } from "react";
import { Candidate } from "../../types/voting.types";
import { Card } from "../common/Card";
import { CheckCircle, User, Award, BookOpen, Users } from "lucide-react";

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: () => void;
}

export const CandidateCard = memo(
  ({ candidate, isSelected, onSelect }: CandidateCardProps) => {
    return (
      <div
        className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
          isSelected
            ? "border-upsa-blue bg-upsa-blue/5 shadow-md ring-2 ring-upsa-blue/20"
            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
        }`}
        onClick={onSelect}>
        <div className="flex items-start gap-4">
          {/* Candidate Image */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
              {candidate.imageUrl ? (
                <img
                  src={candidate.imageUrl}
                  alt={candidate.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <User className="h-8 w-8 text-gray-400" />
              )}
            </div>
          </div>

          {/* Candidate Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">
                  {candidate.name}
                </h4>
                <p className="text-sm text-gray-500">{candidate.studentId}</p>
              </div>
              {isSelected && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-upsa-blue rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award className="h-3.5 w-3.5 text-upsa-gold" />
                <span>{candidate.position || "No position"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                <span>Level {candidate.level}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-3.5 w-3.5 text-green-500" />
                <span>{candidate.programme}</span>
              </div>
            </div>

            {/* Manifesto */}
            {candidate.manifesto && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {candidate.manifesto}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for performance
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.candidate.id === nextProps.candidate.id
    );
  },
);

CandidateCard.displayName = "CandidateCard";

export default CandidateCard;
