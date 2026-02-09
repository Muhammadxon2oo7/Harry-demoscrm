"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

export default function StudentRatingPage() {
  const myRank = 1;
  const myScore = 95;
  const myAttendance = 98;

  const students = [
    { id: "1", name: "Abdullayev Vali (Siz)", score: 95, attendance: 98, rank: 1 },
    { id: "2", name: "Karimov Ali", score: 88, attendance: 92, rank: 2 },
    { id: "3", name: "Toshmatov Sardor", score: 82, attendance: 89, rank: 3 },
    { id: "4", name: "Usmanova Nigora", score: 78, attendance: 85, rank: 4 },
    { id: "5", name: "Rahimov Akmal", score: 74, attendance: 80, rank: 5 },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-sm font-semibold">
            {rank}
          </span>
        );
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Mening reytingim</h1>
        <p className="text-muted-foreground mt-2">
          Beginner A1 guruhidagi o'rningiz
        </p>
      </div>

      {/* My Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-2 border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Mening o'rnim</p>
              <h3 className="text-3xl font-bold mt-2 text-primary">#{myRank}</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Mening ballim</p>
              <h3 className="text-3xl font-bold mt-2 text-green-600">{myScore}%</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Davomatim</p>
              <h3 className="text-3xl font-bold mt-2 text-blue-600">{myAttendance}%</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Full Rating */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Guruh reytingi</h2>
        <div className="space-y-4">
          {students.map((student) => (
            <div
              key={student.id}
              className={`flex items-center justify-between border-b pb-4 last:border-0 ${
                student.rank === myRank ? "bg-primary/5 -mx-6 px-6 py-4 rounded-lg" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  {getRankIcon(student.rank)}
                </div>
                <div>
                  <h4 className={`font-semibold ${student.rank === myRank ? "text-primary" : ""}`}>
                    {student.name}
                  </h4>
                </div>
              </div>
              <div className="flex gap-8 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Ball</p>
                  <p className={`text-lg font-semibold ${student.rank === myRank ? "text-primary" : "text-foreground"}`}>
                    {student.score}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Davomat</p>
                  <p className="text-lg font-semibold text-green-600">
                    {student.attendance}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
