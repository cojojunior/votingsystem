// src/components/admin/Dashboard/LiveUpdates.tsx
import React, { useState, useEffect } from "react";
import { Card } from "../../common/Card";
import {
  Activity,
  Clock,
  Users,
  Zap,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

interface LiveUpdatesProps {
  liveVotes?: {
    lastHour: number;
    currentSession: number;
    totalToday: number;
    ratePerMinute: number;
  };
}

export const LiveUpdates: React.FC<LiveUpdatesProps> = ({ liveVotes }) => {
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLive(true);
      setLastUpdate(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!liveVotes) {
    return (
      <Card>
        <div className="text-center py-8">
          <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-2 animate-spin" />
          <p className="text-gray-500">Loading live data...</p>
        </div>
      </Card>
    );
  }

  const stats = [
    {
      label: "Current Session",
      value: liveVotes.currentSession,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Last Hour",
      value: liveVotes.lastHour,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Rate / Minute",
      value: liveVotes.ratePerMinute.toFixed(1),
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Total Today",
      value: liveVotes.totalToday,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
          />
          <span className="text-sm font-medium">
            {isLive ? "Live" : "Disconnected"}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          Updated {lastUpdate.toLocaleTimeString()}
        </span>
      </div>

      {/* Stats grid - Using Card for each stat */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={`${stat.bgColor} border-0`}>
              <div className="text-center">
                <Icon className={`h-5 w-5 ${stat.color} mx-auto mb-1`} />
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Total today progress */}
      <Card>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Votes Today</span>
          <span className="text-2xl font-bold text-upsa-blue">
            {liveVotes.totalToday}
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-upsa-blue h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((liveVotes.totalToday / 6000) * 100, 100)}%`,
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {((liveVotes.totalToday / 6000) * 100).toFixed(1)}% of eligible voters
        </p>
      </Card>

      {/* Live activity feed */}
      <Card className="border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Activity className="h-3 w-3" />
          <span>Live activity feed</span>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-400 animate-pulse">
            • Vote recorded: Student S2024001 voted for President
          </p>
          <p className="text-xs text-gray-400 animate-pulse delay-100">
            • Vote recorded: Student S2024023 voted for Vice President
          </p>
          <p className="text-xs text-gray-400 animate-pulse delay-200">
            • Vote recorded: Student S2024015 voted for Secretary
          </p>
          <p className="text-xs text-gray-400 animate-pulse delay-300">
            • Vote recorded: Student S2024032 voted for Treasurer
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LiveUpdates;

