// src/components/voting/PositionSection.tsx
import React from "react";
import { Position } from "../../types/voting.types";
import { Card } from "../common/Card";
import { CandidateCard } from "./CandidateCard";
import { Award, AlertCircle } from "lucide-react";

interface PositionSectionProps {
  position: Position;
  selectedCandidate: string | undefined;
  onSelectCandidate: (candidateId: string) => void;
}

export const PositionSection: React.FC<PositionSectionProps> = ({
  position,
  selectedCandidate,
  onSelectCandidate,
}) => {
  const activeCandidates = position.candidates.filter(
    (c) => c.status === "active",
  );

  return (
    <Card>
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-upsa-gold" />
          <h3 className="text-xl font-semibold text-gray-900">
            {position.name}
          </h3>
          <span className="ml-2 text-sm text-gray-500">
            ({activeCandidates.length} candidates)
          </span>
        </div>
        {position.description && (
          <p className="text-sm text-gray-500 mt-1">{position.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Select <strong>ONE</strong> candidate
        </p>
      </div>

      {activeCandidates.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-500">
            No candidates available for this position
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidate === candidate.id}
              onSelect={() => onSelectCandidate(candidate.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default PositionSection;
