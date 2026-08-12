// src/components/voting/BallotPage.tsx
import React, { useState, useEffect } from "react";
import { useVoting } from "../../hooks/useVoting";
import { useAuth } from "../../hooks/useAuth";
import { useSessionStore } from "../../store/sessionStore";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { PositionSection } from "./PositionSection";
import { VoteConfirmation } from "./VoteConfirmation";
import { SessionTimer } from "./SessionTimer";
import { VotingStatus } from "./VotingStatus";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export const BallotPage: React.FC = () => {
  const {
    positions,
    selectedCandidates,
    isLoading,
    error,
    hasVoted,
    voteSubmitted,
    selectCandidate,
    submitVote,
    loadPositions,
  } = useVoting();

  const { user } = useAuth();
  const { currentSession, electionStatus } = useSessionStore();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !hasVoted && !voteSubmitted) {
      loadPositions();
    }
  }, [user, hasVoted, voteSubmitted, loadPositions]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (hasVoted || voteSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Thank You for Voting!
          </h2>
          <p className="text-gray-600">
            Your vote has been recorded successfully. You can now close this
            window.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Vote ID: {user?.studentId}
          </p>
        </Card>
      </div>
    );
  }

  // Check if all positions have been filled
  const isVoteComplete = positions.every(
    (position) => selectedCandidates[position.id] !== undefined,
  );

  const handleVoteSubmit = async () => {
    if (!isVoteComplete) return;
    setShowConfirmation(true);
  };

  const handleConfirmVote = async () => {
    setIsSubmitting(true);
    try {
      const success = await submitVote();
      if (success) {
        setShowConfirmation(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPositions = positions.length;
  const filledPositions = Object.keys(selectedCandidates).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              UPSA Student Elections
            </h1>
            <p className="text-gray-600">Welcome, {user?.email}</p>
          </div>
          {currentSession && (
            <SessionTimer
              startTime={new Date(currentSession.startTime)}
              endTime={new Date(currentSession.endTime)}
              onSessionEnd={() => {
                window.location.href = "/dashboard";
              }}
            />
          )}
        </div>

        {/* Voting Status */}
        <VotingStatus
          totalPositions={totalPositions}
          filledPositions={filledPositions}
          isComplete={isVoteComplete}
          electionStatus={electionStatus}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Voting Instructions */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800">
                Voting Instructions
              </h3>
              <ul className="text-sm text-blue-700 space-y-1 mt-1 list-disc list-inside">
                <li>
                  Select <strong>ONE</strong> candidate for each position
                </li>
                <li>
                  You can change your selection at any time before submitting
                </li>
                <li>Once submitted, your vote cannot be changed</li>
                <li>You will receive a confirmation after voting</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Ballot */}
        <div className="space-y-6">
          {positions.map((position) => (
            <PositionSection
              key={position.id}
              position={position}
              selectedCandidate={selectedCandidates[position.id]}
              onSelectCandidate={(candidateId) =>
                selectCandidate(position.id, candidateId)
              }
            />
          ))}
        </div>

        {/* Submit Section */}
        <div className="mt-8 flex flex-col items-center gap-4">
          {!isVoteComplete && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Please select a candidate for all positions before submitting
            </p>
          )}
          <Button
            size="lg"
            disabled={!isVoteComplete || isLoading || isSubmitting}
            onClick={handleVoteSubmit}
            className="px-12">
            {isSubmitting ? "Submitting..." : "Submit Your Vote"}
          </Button>
          <p className="text-xs text-gray-500">
            This action cannot be undone. Please review your selections
            carefully.
          </p>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <VoteConfirmation
            positions={positions}
            selectedCandidates={selectedCandidates}
            onConfirm={handleConfirmVote}
            onCancel={() => setShowConfirmation(false)}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default BallotPage;
