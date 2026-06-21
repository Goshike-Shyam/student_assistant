'use client';

import { useState, useRef } from 'react';
import { Mic, Paperclip, Send, Share2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [searchResponses, setSearchResponses] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [earlierSearches, setEarlierSearches] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'History',
    'Geography',
    'Computer Science',
    'Biology',
    'Chemistry',
    'Physics',
    'Economics'
  ];

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const handleMicClick = () => {
    // Placeholder for voice input - would integrate Web Speech API
    setIsListening(!isListening);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    try {
      // Call backend AI search API
      const response = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          subject: selectedSubject,
          attachments: attachedFiles.map(f => f.name),
          voiceInput: isListening
        })
      }).catch(() => ({
        ok: true,
        json: async () => ({
          response: `<h3>Response about ${selectedSubject || 'your topic'}</h3><p>This is a placeholder response. Configure your AI backend (Claude, OpenAI, etc.) to get real answers.</p>`,
          resourceLinks: [
            { title: 'Internal Curriculum Resource', url: '#' },
            { title: 'Khan Academy', url: '#' }
          ]
        })
      }));

      if (response.ok) {
        const data = await response.json();
        setSearchResponses(prev => [
          {
            id: Date.now(),
            query: searchQuery,
            subject: selectedSubject,
            response: data.response,
            resourceLinks: data.resourceLinks,
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ]);

        // Add to earlier searches for smart search
        setEarlierSearches(prev => [
          {
            id: Date.now(),
            query: searchQuery,
            subject: selectedSubject,
            timestamp: new Date()
          },
          ...prev
        ].slice(0, 10)); // Keep last 10

        setSearchQuery('');
        setAttachedFiles([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleShareToWhatsApp = (responseId: number) => {
    // Placeholder for WhatsApp sharing
    const response = searchResponses.find(r => r.id === responseId);
    const text = `Check out this research response: ${response.query}\n\n${response.response}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px] space-y-8">
        {/* Header */}
        <section className="text-center mb-12">
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-600">Research & Learning</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">Find curriculum-aligned resources</h1>
          <p className="mt-2 text-lg text-slate-600">Ask questions, upload materials, and learn with AI-powered research</p>
        </section>

        {/* Main Search Section */}
        <Card className="border-2 border-cyan-200 bg-white/95 p-8 shadow-2xl shadow-cyan-100/50">
          <CardHeader>
            <CardTitle className="text-2xl">Research Assistant</CardTitle>
            <CardDescription>Type your question, attach files, or speak naturally to get research-backed answers</CardDescription>
          </CardHeader>

          <div className="space-y-5">
            {/* Subject Selection */}
            <div>
              <Label htmlFor="subject" className="font-semibold text-slate-700">Subject (Optional)</Label>
              <Select 
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="mt-2 w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-cyan-500 focus:outline-none transition-colors"
              >
                <option value="">Select a subject...</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </Select>
            </div>

            {/* Textarea with Controls */}
            <div>
              <Label htmlFor="search-textarea" className="font-semibold text-slate-700">Your Question</Label>
              <div className="mt-2 relative">
                <Textarea 
                  id="search-textarea"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask your question here... e.g., 'Explain photosynthesis and its importance to the ecosystem'"
                  className="w-full h-32 rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Attached Files Display */}
            {attachedFiles.length > 0 && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">Attached Files ({attachedFiles.length})</p>
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white rounded-full px-3 py-1 border border-blue-200 text-xs text-slate-700">
                      <span>{file.name}</span>
                      <button 
                        onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={handleFileAttach}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all"
              >
                <Paperclip size={18} />
                Attach File
              </button>
              <input 
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp3,.wav,.xlsx,.xls"
              />

              <button
                onClick={handleMicClick}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white border-2 border-red-600 hover:bg-red-600' 
                    : 'border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Mic size={18} />
                {isListening ? 'Stop Listening' : 'Voice Input'}
              </button>

              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                className="ml-auto inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
              >
                <Send size={18} />
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </Card>

        {/* Search Responses Section */}
        {searchResponses.length > 0 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Research Results</h2>
              <p className="text-slate-600">Responses from your research queries</p>
            </div>

            {searchResponses.map((response, idx) => (
              <Card key={response.id} className="border-l-4 border-l-cyan-500 bg-white p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{response.query}</h3>
                      {response.subject && (
                        <p className="text-sm text-cyan-600 font-medium mt-1">Subject: {response.subject}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">{response.timestamp}</p>
                    </div>
                  </div>
                  
                  {/* Response Content */}
                  <div className="prose prose-sm max-w-none text-slate-700 mb-4">
                    <div dangerouslySetInnerHTML={{ __html: response.response }} />
                  </div>

                  {/* Resource Links */}
                  {response.resourceLinks && response.resourceLinks.length > 0 && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-2">📚 Resource Links</p>
                      <ul className="space-y-2">
                        {response.resourceLinks.map((link: any, idx: number) => (
                          <li key={idx}>
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                            >
                              {link.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                  <button
                    onClick={() => handleShareToWhatsApp(response.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition-colors text-sm"
                  >
                    <Share2 size={16} />
                    Share to WhatsApp
                  </button>
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors text-sm">
                    🎙️ Generate Podcast
                  </button>
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors text-sm">
                    🎬 Generate Video
                  </button>
                </div>
              </Card>
            ))}
          </section>
        )}

        {/* Earlier Searches Smart Search Section */}
        {earlierSearches.length > 0 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Earlier Searches</h2>
              <div className="space-y-3">
                {earlierSearches.map(search => (
                  <button
                    key={search.id}
                    onClick={() => setSearchQuery(search.query)}
                    className="w-full text-left p-4 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{search.query}</p>
                        {search.subject && (
                          <p className="text-sm text-slate-600">{search.subject}</p>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 ml-4 flex-shrink-0">{new Date(search.timestamp).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
