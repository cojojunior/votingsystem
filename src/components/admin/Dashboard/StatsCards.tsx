// src/components/admin/Dashboard/StatsCards.tsx
import React from "react";
import { Card } from "../../common/Card";
import { VotingStats } from "../../../types/admin.types";
import {
  Users,
  Vote,
  TrendingUp,
  AlertCircle,
  UsersRound,
  Award,
} from "lucide-react";

interface StatsCardsProps {
  stats: VotingStats;
  loading?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Voters",
      value: stats.totalVoters,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      subtitle: "Eligible voters",
    },
    {
      title: "Votes Cast",
      value: stats.totalVotesCast,
      icon: Vote,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      subtitle: `${((stats.totalVotesCast / stats.totalVoters) * 100).toFixed(1)}% turnout`,
    },
    {
      title: "Voter Turnout",
      value: `${stats.voterTurnout.toFixed(1)}%`,
      icon: TrendingUp,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      subtitle: `${stats.totalVotesCast} of ${stats.totalVoters} voters`,
    },
    {
      title: "Faulty Votes",
      value: stats.faultyVotes.total,
      icon: AlertCircle,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
      subtitle: "Invalid voting attempts",
    },
  ];

  // Additional stats using UsersRound and Award
  const additionalStats = [
    {
      title: "Gender Split",
      value: `${((stats.maleVotes / stats.totalVotesCast) * 100).toFixed(1)}% Male`,
      icon: UsersRound,
      color: "bg-indigo-500",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      subtitle: `${stats.maleVotes} Male / ${stats.femaleVotes} Female`,
    },
    {
      title: "Positions",
      value: stats.results?.length || 0,
      icon: Award,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
      subtitle: "Available positions",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${card.textColor}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {additionalStats.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${card.textColor}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StatsCards;
