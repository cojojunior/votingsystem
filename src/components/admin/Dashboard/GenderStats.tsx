// src/components/admin/Dashboard/GenderStats.tsx
import React from "react";
import { Card } from "../../common/Card";
import { Users, User, UserRound } from "lucide-react";

interface GenderStatsProps {
  maleVotes: number;
  femaleVotes: number;
  totalVotes: number;
}

export const GenderStats: React.FC<GenderStatsProps> = ({
  maleVotes,
  femaleVotes,
  totalVotes,
}) => {
  const malePercentage = totalVotes > 0 ? (maleVotes / totalVotes) * 100 : 0;
  const femalePercentage =
    totalVotes > 0 ? (femaleVotes / totalVotes) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-upsa-blue" />
            <div>
              <p className="text-sm text-gray-500">Total Voters</p>
              <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-blue-600 font-semibold">{maleVotes}</p>
              <p className="text-xs text-gray-500">Male</p>
            </div>
            <div className="text-center">
              <p className="text-pink-600 font-semibold">{femaleVotes}</p>
              <p className="text-xs text-gray-500">Female</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Male Stats */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Male</p>
              <p className="text-2xl font-bold text-blue-600">{maleVotes}</p>
            </div>
          </div>
          <span className="text-sm text-gray-500">
            {malePercentage.toFixed(1)}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${malePercentage}%` }}
          />
        </div>
      </Card>

      {/* Female Stats */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-pink-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Female</p>
              <p className="text-2xl font-bold text-pink-600">{femaleVotes}</p>
            </div>
          </div>
          <span className="text-sm text-gray-500">
            {femalePercentage.toFixed(1)}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className="bg-pink-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${femalePercentage}%` }}
          />
        </div>
      </Card>

      {/* Additional Stats Card */}
      <Card className="bg-gray-50">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Male/Female Ratio</p>
            <p className="text-lg font-semibold text-gray-900">
              {totalVotes > 0 ? (maleVotes / femaleVotes || 0).toFixed(2) : 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Female/Male Ratio</p>
            <p className="text-lg font-semibold text-gray-900">
              {totalVotes > 0 ? (femaleVotes / maleVotes || 0).toFixed(2) : 0}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GenderStats;
