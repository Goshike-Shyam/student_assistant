'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminSettingsPage() {
  return (
    <div className="flex-1 bg-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure platform-wide settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card className="p-8">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Platform name and basic information</CardDescription>
            </CardHeader>
            <div className="space-y-4 mt-6">
              <div>
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" placeholder="EduSpark" defaultValue="EduSpark" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" placeholder="Modern Learning Experience" defaultValue="Modern Learning Experience" className="mt-2" />
              </div>
              <div className="pt-4">
                <Button className="bg-[#006e2f] text-white hover:bg-[#005828]">Save Changes</Button>
              </div>
            </div>
          </Card>

          {/* Email Settings */}
          <Card className="p-8">
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>SMTP and email notification settings</CardDescription>
            </CardHeader>
            <div className="space-y-4 mt-6">
              <div>
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" placeholder="smtp.gmail.com" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" placeholder="587" className="mt-2" />
              </div>
              <div className="pt-4">
                <Button className="bg-[#006e2f] text-white hover:bg-[#005828]">Save Configuration</Button>
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card className="p-8">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage authentication and security policies</CardDescription>
            </CardHeader>
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                </div>
                <input type="checkbox" className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="font-medium">Session Timeout</p>
                  <p className="text-sm text-gray-600">Auto-logout inactive admins</p>
                </div>
                <input type="checkbox" className="w-4 h-4" defaultChecked />
              </div>
              <div className="pt-4">
                <Button className="bg-[#006e2f] text-white hover:bg-[#005828]">Update Security</Button>
              </div>
            </div>
          </Card>

          {/* API Keys */}
          <Card className="p-8">
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Third-party API keys and integrations</CardDescription>
            </CardHeader>
            <div className="space-y-4 mt-6">
              <div>
                <Label htmlFor="gemini-key">Gemini API Key</Label>
                <Input id="gemini-key" type="password" placeholder="••••••••" className="mt-2" />
              </div>
              <div className="pt-4">
                <Button className="bg-[#006e2f] text-white hover:bg-[#005828]">Save API Keys</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
