'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminProgressPage() {
  return (
    <div className="flex-1 bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Progress Analytics</h1>
          <p className="text-gray-600 mt-2">Track and monitor student performance metrics across courses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Active Students</CardTitle>
              <p className="text-3xl font-bold mt-2">1,248</p>
              <CardDescription>+5.2% this month</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
              <p className="text-3xl font-bold mt-2">78.4%</p>
              <CardDescription>+2.1% improvement</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Course Completion</CardTitle>
              <p className="text-3xl font-bold mt-2">65.7%</p>
              <CardDescription>Average completion rate</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Engagement Rate</CardTitle>
              <p className="text-3xl font-bold mt-2">82.3%</p>
              <CardDescription>Daily active users</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="p-8">
          <CardHeader>
            <CardTitle>Progress Timeline</CardTitle>
            <CardDescription>Student performance trends over the last 30 days</CardDescription>
          </CardHeader>
          <div className="mt-6 h-96 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart visualization will be displayed here</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
