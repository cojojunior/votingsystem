// src/components/voting/CandidateCard.tsx
import React, { memo } from "react";

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: () => void;
}

export const CandidateCard = memo(
  ({ candidate, isSelected, onSelect }: CandidateCardProps) => {
    return (
      <div
        className={`border rounded-lg p-4 cursor-pointer transition-all ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={onSelect}>
        <div className="flex items-center space-x-4">
          <img
            src={candidate.imageUrl}
            alt={candidate.name}
            className="w-16 h-16 rounded-full object-cover"
            loading="lazy"
          />
          <div>
            <h3 className="font-semibold">{candidate.name}</h3>
            <p className="text-sm text-gray-600">Level: {candidate.level}</p>
            <p className="text-sm text-gray-600">{candidate.programme}</p>
          </div>
          {isSelected && (
            <div className="ml-auto">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
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
