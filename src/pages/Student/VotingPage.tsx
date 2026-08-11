// src/pages/Student/VotingPage.tsx
import React, { useState } from "react";
import { useVoting } from "../../hooks/useVoting";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Modal } from "../../components/common/Modal";
import { SessionTimer } from "../../components/voting/SessionTimer";
import { CandidateCard } from "../../components/voting/CandidateCard";
import { useSessionStore } from "../../store/sessionStore";

const VotingPage: React.FC = () => {
  const {
    positions,
    selectedCandidates,
    isLoading,
    error,
    hasVoted,
    voteSubmitted,
    selectCandidate,
    submitVote,
  } = useVoting();

  const { user } = useAuth();
  const { currentSession } = useSessionStore();
  const [showConfirmation, setShowConfirmation] = useState(false);

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
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
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

  const isVoteComplete = positions.every(
    (position) => selectedCandidates[position.id] !== undefined,
  );

  const handleSubmitVote = async () => {
    const success = await submitVote();
    if (success) {
      setShowConfirmation(false);
    }
  };

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
                // Handle session end
                window.location.href = "/";
              }}
            />
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Voting Instructions */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-blue-500 text-lg">ℹ️</div>
            <div>
              <h3 className="font-semibold text-blue-800">
                Voting Instructions
              </h3>
              <p className="text-sm text-blue-700">
                Select <strong>ONE</strong> candidate for each position. You can
                change your selection at any time before submitting your final
                vote.
              </p>
            </div>
          </div>
        </Card>

        {/* Ballot */}
        <div className="space-y-6">
          {positions.map((position) => (
            <Card key={position.id}>
              <div className="border-b border-gray-200 pb-3 mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {position.name}
                </h3>
                <p className="text-sm text-gray-500">{position.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {position.candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isSelected={
                      selectedCandidates[position.id] === candidate.id
                    }
                    onSelect={() => selectCandidate(position.id, candidate.id)}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Submit Section */}
        <div className="mt-8 flex flex-col items-center gap-4">
          {!isVoteComplete && (
            <p className="text-sm text-red-600">
              ⚠️ Please select a candidate for all positions before submitting
            </p>
          )}
          <Button
            size="lg"
            disabled={!isVoteComplete || isLoading}
            onClick={() => setShowConfirmation(true)}>
            {isLoading ? "Submitting..." : "Submit Your Vote"}
          </Button>
          <p className="text-xs text-gray-500">
            This action cannot be undone. Please review your selections
            carefully.
          </p>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          title="Confirm Your Vote"
          size="lg">
          <div className="space-y-4">
            <p className="text-gray-600">
              Please review your selections before submitting your final vote.
              This action cannot be undone.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              {positions.map((position) => {
                const candidateId = selectedCandidates[position.id];
                const candidate = position.candidates.find(
                  (c) => c.id === candidateId,
                );
                return (
                  <div
                    key={position.id}
                    className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <span className="font-medium">{position.name}</span>
                    <span className="text-gray-700">
                      {candidate?.name || "Not selected"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowConfirmation(false)}>
                Cancel
              </Button>
              <Button
                variant="success"
                fullWidth
                onClick={handleSubmitVote}
                isLoading={isLoading}>
                Confirm & Submit
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default VotingPage;