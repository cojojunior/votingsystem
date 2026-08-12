// src/components/voting/VoteConfirmation.tsx
import React from "react";
import { Position } from "../../types/voting.types";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { AlertTriangle, CheckCircle, User, Award } from "lucide-react";

interface VoteConfirmationProps {
  positions: Position[];
  selectedCandidates: Record<string, string>;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const VoteConfirmation: React.FC<VoteConfirmationProps> = ({
  positions,
  selectedCandidates,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  // Get selected candidate details
  const getSelectedCandidate = (positionId: string) => {
    const candidateId = selectedCandidates[positionId];
    const position = positions.find((p) => p.id === positionId);
    return position?.candidates.find((c) => c.id === candidateId);
  };

  const totalSelected = Object.keys(selectedCandidates).length;
  const totalPositions = positions.length;

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Confirm Your Vote"
      size="lg"
      closeOnOverlayClick={false}>
      <div className="space-y-6">
        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Please review your selections carefully
            </p>
            <p className="text-sm text-yellow-700">
              This action cannot be undone. Once confirmed, your vote is final.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
          <p className="text-sm font-medium text-gray-700 mb-3">
            You have selected {totalSelected} of {totalPositions} positions
          </p>
          <div className="space-y-2">
            {positions.map((position) => {
              const candidate = getSelectedCandidate(position.id);
              const isSelected = selectedCandidates[position.id] !== undefined;
              return (
                <div
                  key={position.id}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                    isSelected
                      ? "bg-white border border-gray-200"
                      : "bg-gray-100"
                  }`}>
                  <div className="flex items-center gap-2">
                    <Award
                      className={`h-4 w-4 ${isSelected ? "text-upsa-gold" : "text-gray-400"}`}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {position.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected && candidate ? (
                      <>
                        <span className="text-sm text-gray-900">
                          {candidate.name}
                        </span>
                        {candidate.imageUrl && (
                          <img
                            src={candidate.imageUrl}
                            alt={candidate.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </>
                    ) : (
                      <span className="text-sm text-red-500">Not selected</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            fullWidth
            onClick={onCancel}
            disabled={isLoading}>
            Go Back
          </Button>
          <Button
            variant="success"
            fullWidth
            onClick={onConfirm}
            isLoading={isLoading}>
            {isLoading ? "Submitting..." : "Confirm & Submit"}
          </Button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          By confirming, you agree that this vote is final and cannot be
          changed.
        </p>
      </div>
    </Modal>
  );
};

export default VoteConfirmation;
