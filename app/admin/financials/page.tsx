'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminFinancialsPage() {
  return (
    <div className="flex-1 bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
          <p className="text-gray-600 mt-2">Revenue, subscriptions, and payment analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <p className="text-3xl font-bold mt-2">₹45,230</p>
              <CardDescription>+12.5% from last month</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Active Subscriptions</CardTitle>
              <p className="text-3xl font-bold mt-2">856</p>
              <CardDescription>Premium & Enterprise</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Recurring</CardTitle>
              <p className="text-3xl font-bold mt-2">₹8,420</p>
              <CardDescription>MRR growth</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Churn Rate</CardTitle>
              <p className="text-3xl font-bold mt-2">3.2%</p>
              <CardDescription>Monthly churn</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-8">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Last 12 months</CardDescription>
            </CardHeader>
            <div className="mt-6 h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart visualization will be displayed here</p>
            </div>
          </Card>

          <Card className="p-8">
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>Distribution by plan type</CardDescription>
            </CardHeader>
            <div className="mt-6 h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart visualization will be displayed here</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
