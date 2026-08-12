// src/components/admin/Dashboard/FaultyVotesChart.tsx
import React from "react";
import { Card } from "../../common/Card";
import { AlertCircle, XCircle, AlertTriangle, MinusCircle } from "lucide-react";

interface FaultyVotesChartProps {
  faultyVotes: {
    duplicateAttempts: number;
    multipleCandidateSelections: number;
    invalidCandidates: number;
    blankVotes: number;
  };
}

export const FaultyVotesChart: React.FC<FaultyVotesChartProps> = ({
  faultyVotes,
}) => {
  const data = [
    {
      label: "Duplicate Attempts",
      value: faultyVotes.duplicateAttempts,
      color: "bg-red-500",
      icon: AlertCircle,
      description: "Students attempting to vote multiple times",
    },
    {
      label: "Multiple Selections",
      value: faultyVotes.multipleCandidateSelections,
      color: "bg-orange-500",
      icon: XCircle,
      description: "Selecting more than one candidate per position",
    },
    {
      label: "Invalid Candidates",
      value: faultyVotes.invalidCandidates,
      color: "bg-yellow-500",
      icon: AlertTriangle,
      description: "Votes cast for invalid or disqualified candidates",
    },
    {
      label: "Blank Votes",
      value: faultyVotes.blankVotes,
      color: "bg-gray-500",
      icon: MinusCircle,
      description: "Submitting votes with no selection",
    },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Faulty Votes</p>
            <p className="text-2xl font-bold text-red-600">{total}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
        </div>
      </Card>

      {/* Chart Data */}
      {data.map((item, index) => {
        const Icon = item.icon;
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        return (
          <div key={index}>
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.value}</span>
                <span className="text-xs text-gray-400">
                  ({percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${item.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
          </div>
        );
      })}

      {total === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No faulty votes recorded</p>
          <p className="text-xs text-gray-400">
            All votes have been cast correctly
          </p>
        </div>
      )}

      {/* Additional Stats Card */}
      {total > 0 && (
        <Card className="mt-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Faulty Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {total > 0 ? ((total / (total + 100)) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Votes</p>
              <p className="text-lg font-semibold text-gray-900">
                {total + 100}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FaultyVotesChart;
