'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminContentPage() {
  return (
    <div className="flex-1 bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
            <p className="text-gray-600 mt-2">Manage courses, assignments, and educational materials</p>
          </div>
          <Button className="bg-[#006e2f] text-white hover:bg-[#005828]">
            + Add Content
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
              <p className="text-3xl font-bold mt-2">24</p>
              <CardDescription>Published courses</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Assignments</CardTitle>
              <p className="text-3xl font-bold mt-2">156</p>
              <CardDescription>Active assignments</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Quiz Questions</CardTitle>
              <p className="text-3xl font-bold mt-2">847</p>
              <CardDescription>Total questions</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Resources</CardTitle>
              <p className="text-3xl font-bold mt-2">532</p>
              <CardDescription>Learning materials</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="p-8">
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>View and manage all educational content</CardDescription>
          </CardHeader>
          <div className="mt-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">Mathematics Fundamentals</td>
                  <td className="py-3 px-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Course</span></td>
                  <td className="py-3 px-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Published</span></td>
                  <td className="py-3 px-4 text-right"><Button variant="ghost" size="sm">Edit</Button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
