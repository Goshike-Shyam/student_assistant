'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Paperclip, Send, Share2, Search, Copy, Download } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [searchResponses]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSearchQuery(e.target.value);
    
    // Auto-grow textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

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
    <main className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Research Assistant</h1>
          <p className="text-sm text-slate-600">Curriculum-aligned AI research helper</p>
        </div>
        {searchResponses.length > 0 && (
          <button className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-colors text-sm">
            + New Chat
          </button>
        )}
      </div>

      {/* Messages Container - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        {searchResponses.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Start your research</h2>
              <p className="text-slate-600 mt-2">Ask a question below to get AI-powered, curriculum-aligned answers</p>
            </div>
            {earlierSearches.length > 0 && (
              <div className="mt-8 w-full max-w-md">
                <p className="text-sm font-semibold text-slate-700 mb-3 text-left">Recent searches</p>
                <div className="space-y-2">
                  {earlierSearches.slice(0, 3).map(search => (
                    <button
                      key={search.id}
                      onClick={() => setSearchQuery(search.query)}
                      className="w-full text-left p-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 text-sm text-slate-700 hover:text-slate-900"
                    >
                      <p className="font-medium">{search.query}</p>
                      {search.subject && (
                        <p className="text-xs text-slate-500 mt-1">{search.subject}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Messages
          <div className="max-w-3xl mx-auto w-full space-y-4">
            {searchResponses.map((response) => (
              <div key={response.id} className="space-y-3">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md bg-cyan-600 text-white rounded-2xl rounded-tr-none px-4 py-3">
                    <p className="text-sm font-medium break-words">{response.query}</p>
                    {response.subject && (
                      <p className="text-xs mt-2 text-cyan-100">📚 {response.subject}</p>
                    )}
                  </div>
                </div>

                {/* AI Response Message */}
                <div className="flex justify-start">
                  <div className="w-full bg-slate-100 text-slate-900 rounded-lg border border-slate-300 px-4 py-3 space-y-3 overflow-hidden">
                    <div className="prose prose-sm max-w-none text-slate-800 break-words overflow-wrap-break-word">
                      <div className="break-words overflow-wrap-break-word" dangerouslySetInnerHTML={{ __html: response.response }} />
                    </div>

                    {/* Resource Links */}
                    {response.resourceLinks && response.resourceLinks.length > 0 && (
                      <div className="border-t border-slate-300 pt-2 mt-3">
                        <p className="text-xs font-semibold text-slate-700 mb-2">📚 Resources</p>
                        <div className="space-y-1">
                          {response.resourceLinks.map((link: any, idx: number) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-cyan-600 hover:text-cyan-700 hover:underline block"
                            >
                              {link.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 border-t border-slate-300 pt-2 mt-3">
                      <button
                        onClick={() => handleShareToWhatsApp(response.id)}
                        className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors font-medium flex items-center gap-1"
                      >
                        <Share2 size={12} />
                        Share
                      </button>
                      <button className="text-xs px-2 py-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors font-medium flex items-center gap-1">
                        <Copy size={12} />
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="border-t border-slate-200 bg-white px-4 py-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Subject Selection */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="subject" className="text-xs font-semibold text-slate-600">Subject</Label>
              <Select 
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none transition-colors"
              >
                <option value="">Select subject...</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
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
          )}

          {/* Input Box with Controls */}
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea 
                ref={textareaRef}
                id="search-textarea"
                value={searchQuery}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Type your question... (Shift+Enter for new line)"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none overflow-hidden"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleFileAttach}
                title="Attach file"
                className="inline-flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all"
              >
                <Paperclip size={18} />
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
                title="Voice input"
                className={`inline-flex items-center justify-center p-3 rounded-lg transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Mic size={18} />
              </button>

              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                title="Send message"
                className="inline-flex items-center justify-center p-3 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
