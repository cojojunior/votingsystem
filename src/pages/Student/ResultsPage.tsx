// src/pages/Student/ResultsPage.tsx
import React, { useState, useEffect } from "react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { votingAPI } from "../../api/voting";
import { VoteResult } from "../../types/voting.types";
import { Trophy, Award, BarChart, Users, CheckCircle } from "lucide-react";

export const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<VoteResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await votingAPI.getResults();
        // Transform data to VoteResult format
        const formattedResults: VoteResult[] = Object.values(data).map(
          (position: any) => ({
            positionId: position.positionId,
            positionName: position.positionName,
            candidates: Object.values(position.candidates).map(
              (candidate: any) => ({
                candidateId: candidate.candidateId,
                candidateName: candidate.candidateName,
                votes: candidate.votes,
                percentage: 0, // Will calculate
              }),
            ),
            totalVotes: Object.values(position.candidates).reduce(
              (sum: number, c: any) => sum + c.votes,
              0,
            ),
            blankVotes: 0,
            invalidVotes: 0,
          }),
        );

        // Calculate percentages
        formattedResults.forEach((position) => {
          const total = position.totalVotes || 1;
          position.candidates.forEach((c) => {
            c.percentage = (c.votes / total) * 100;
          });
        });

        setResults(formattedResults);
        if (formattedResults.length > 0) {
          setSelectedPosition(formattedResults[0].positionId);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Results
          </h3>
          <p className="text-gray-600">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const selectedPositionData = results.find(
    (r) => r.positionId === selectedPosition,
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Election Results
            </h1>
            <p className="text-gray-600">
              Official results of the UPSA Student Elections
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-upsa-gold" />
            <span className="text-sm font-medium text-gray-700">
              {results.reduce((sum, r) => sum + r.totalVotes, 0)} Total Votes
            </span>
          </div>
        </div>

        {/* Position Selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {results.map((result) => (
            <button
              key={result.positionId}
              onClick={() => setSelectedPosition(result.positionId)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPosition === result.positionId
                  ? "bg-upsa-blue text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}>
              {result.positionName}
            </button>
          ))}
        </div>

        {/* Results Display */}
        {selectedPositionData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Results */}
            <div className="lg:col-span-2">
              <Card>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  {selectedPositionData.positionName}
                </h3>
                <div className="space-y-4">
                  {selectedPositionData.candidates
                    .sort((a, b) => b.votes - a.votes)
                    .map((candidate, index) => (
                      <div
                        key={candidate.candidateId}
                        className="flex items-center gap-4">
                        <div className="w-8 text-center">
                          {index === 0 && (
                            <Trophy className="h-5 w-5 text-upsa-gold inline" />
                          )}
                          {index === 1 && (
                            <Award className="h-5 w-5 text-gray-400 inline" />
                          )}
                          {index === 2 && (
                            <Award className="h-5 w-5 text-amber-700 inline" />
                          )}
                          {index > 2 && (
                            <span className="text-gray-400 text-sm">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">
                              {candidate.candidateName}
                            </span>
                            <span>
                              {candidate.votes} votes (
                              {candidate.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-1000 ${
                                index === 0
                                  ? "bg-upsa-gold"
                                  : index === 1
                                    ? "bg-gray-400"
                                    : index === 2
                                      ? "bg-amber-700"
                                      : "bg-upsa-blue"
                              }`}
                              style={{
                                width: `${Math.min(candidate.percentage, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </div>

            {/* Stats Summary */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <h4 className="font-semibold text-gray-900 mb-4">Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Votes</span>
                    <span className="font-medium">
                      {selectedPositionData.totalVotes}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Blank Votes</span>
                    <span className="font-medium">
                      {selectedPositionData.blankVotes || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Invalid Votes</span>
                    <span className="font-medium">
                      {selectedPositionData.invalidVotes || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Candidates</span>
                    <span className="font-medium">
                      {selectedPositionData.candidates.length}
                    </span>
                  </div>
                  {/* Using BarChart icon */}
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-3 mt-3">
                    <span className="text-gray-500 flex items-center gap-1">
                      <BarChart className="h-4 w-4" />
                      Turnout
                    </span>
                    <span className="font-medium">
                      {((selectedPositionData.totalVotes / 6000) * 100).toFixed(
                        1,
                      )}
                      %
                    </span>
                  </div>
                </div>
              </Card>

              <Card>
                <h4 className="font-semibold text-gray-900 mb-4">Winner</h4>
                {selectedPositionData.candidates.length > 0 && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-upsa-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Trophy className="h-8 w-8 text-upsa-gold" />
                    </div>
                    <p className="font-semibold text-gray-900">
                      {selectedPositionData.candidates[0].candidateName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedPositionData.candidates[0].votes} votes (
                      {selectedPositionData.candidates[0].percentage.toFixed(1)}
                      %)
                    </p>
                  </div>
                )}
              </Card>

              <Card>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Voter Turnout
                </h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-upsa-blue">
                    {((selectedPositionData.totalVotes / 6000) * 100).toFixed(
                      1,
                    )}
                    %
                  </div>
                  <p className="text-sm text-gray-500">of eligible voters</p>
                  <div className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-400">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>{selectedPositionData.totalVotes} votes cast</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* All Positions Summary */}
        <div className="mt-8">
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              All Positions Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((result) => {
                const winner = result.candidates.sort(
                  (a, b) => b.votes - a.votes,
                )[0];
                return (
                  <div
                    key={result.positionId}
                    className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">
                      {result.positionName}
                    </p>
                    {winner && (
                      <p className="font-semibold text-gray-900 mt-1">
                        {winner.candidateName}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {result.totalVotes} votes
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
