// src/components/admin/Dashboard/TurnoverChart.tsx
import React from "react";
import { Card } from "../../common/Card";
import { TrendingUp, TrendingDown, Users, Clock } from "lucide-react";

interface TurnoverChartProps {
  totalVoters: number;
  votesCast: number;
  percentage: number;
  maleVotes: number;
  femaleVotes: number;
}

export const TurnoverChart: React.FC<TurnoverChartProps> = ({
  totalVoters,
  votesCast,
  percentage,
  maleVotes,
  femaleVotes,
}) => {
  const remaining = totalVoters - votesCast;
  const isIncreasing = percentage > 50;
  const malePercentage = votesCast > 0 ? (maleVotes / votesCast) * 100 : 0;
  const femalePercentage = votesCast > 0 ? (femaleVotes / votesCast) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Voter Turnover</p>
            <p className="text-3xl font-bold text-upsa-blue">
              {percentage.toFixed(1)}%
            </p>
          </div>
          <div className="flex items-center gap-1">
            {isIncreasing ? (
              <TrendingUp className="h-8 w-8 text-green-500" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${isIncreasing ? "text-green-500" : "text-red-500"}`}>
              {isIncreasing ? "Increasing" : "Decreasing"}
            </span>
          </div>
        </div>
      </Card>

      {/* Main Stats */}
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{votesCast}</p>
            <p className="text-sm text-gray-500">Total Votes</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{remaining}</p>
            <p className="text-sm text-gray-500">Remaining</p>
          </div>
        </div>
      </Card>

      {/* Progress Bar */}
      <Card>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Voter Turnout</span>
          <span className="font-medium text-gray-900">
            {percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${
              percentage > 75
                ? "bg-green-500"
                : percentage > 50
                  ? "bg-blue-500"
                  : percentage > 25
                    ? "bg-yellow-500"
                    : "bg-red-500"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span>
          <span>{votesCast} voted</span>
          <span>{remaining} remaining</span>
          <span>100%</span>
        </div>
      </Card>

      {/* Gender Breakdown */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            Gender Distribution
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Male</span>
              <span className="font-medium text-blue-600">{maleVotes}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${malePercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {malePercentage.toFixed(1)}%
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Female</span>
              <span className="font-medium text-pink-600">{femaleVotes}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div
                className="bg-pink-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${femalePercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {femalePercentage.toFixed(1)}%
            </p>
          </div>
        </div>
      </Card>

      {/* Additional Info */}
      <Card className="bg-gray-50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-gray-400" />
            <span className="text-gray-500">
              {totalVoters - votesCast} remaining
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TurnoverChart;
