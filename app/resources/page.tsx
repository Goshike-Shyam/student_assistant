'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Paperclip, Send, Share2, Search, Copy } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PodcastPlayer } from '@/components/shared/PodcastPlayer';
import { cn } from '@/lib/utils';
import type { ResearchHistoryItem, ResearchSource } from '@/types/research';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ResourcesPage() {
  interface SearchResponseItem {
    id: number;
    queryId?: string;
    query: string;
    subject: string;
    response: string;
    sources: ResearchSource[];
    timestamp: string;
  }

  const [activeView, setActiveView] = useState<'research' | 'history'>('research');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [prefillQuery, setPrefillQuery] = useState('');
  const [prefillSubject, setPrefillSubject] = useState('');

  const [historyItems, setHistoryItems] = useState<ResearchHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const historyFetched = useRef(false);

  const [subjects, setSubjects] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [searchResponses, setSearchResponses] = useState<SearchResponseItem[]>([]);
  const [sourcesOpenById, setSourcesOpenById] = useState<Record<number, boolean>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [earlierSearches, setEarlierSearches] = useState<any[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const readUrlState = () => {
    if (typeof window === 'undefined') {
      return { view: 'research' as const, topic: '', subject: '' };
    }

    const params = new URLSearchParams(window.location.search);
    return {
      view: params.get('view') === 'history' ? 'history' as const : 'research' as const,
      topic: params.get('topic') || '',
      subject: params.get('subject') || '',
    };
  };

  const updateUrlView = (view: 'research' | 'history') => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (view === 'history') params.set('view', 'history');
    else params.delete('view');

    const query = params.toString();
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  };

  const switchView = (view: 'research' | 'history') => {
    setActiveView(view);
    updateUrlView(view);
  };

  useEffect(() => {
    const storedStudentId = localStorage.getItem('userId');
    if (storedStudentId) {
      setStudentId(storedStudentId);
    }
  }, []);

  useEffect(() => {
    if (!studentId) return;

    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/${studentId}/subjects`);
        if (!response.ok) throw new Error(`Failed to fetch subjects: ${response.status}`);

        const data = await response.json();
        const fetchedSubjects = Array.isArray(data?.subjects) ? data.subjects : [];
        setSubjects(fetchedSubjects);
        setSelectedSubject((prev) => prev || fetchedSubjects[0] || '');
      } catch (error) {
        console.error('[Research] subjects fetch failed:', error);
        setSubjects([]);
      }
    };

    fetchSubjects();
  }, [studentId]);

  useEffect(() => {
    historyFetched.current = false;
    setHistoryItems([]);
    setExpandedId(null);
  }, [studentId]);

  useEffect(() => {
    const initial = readUrlState();
    setActiveView(initial.view);
    if (initial.topic) setSearchQuery(initial.topic);
    if (initial.subject) setSelectedSubject(initial.subject);

    const onPopState = () => {
      const next = readUrlState();
      setActiveView(next.view);
      if (next.topic) setSearchQuery(next.topic);
      if (next.subject) setSelectedSubject(next.subject);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [searchResponses]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSearchQuery(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const handleMicClick = () => {
    setIsListening(!isListening);
  };

  const normalizeSources = (rawSources: unknown): ResearchSource[] => {
    if (!Array.isArray(rawSources)) return [];

    const mappedSources: Array<ResearchSource | null> = rawSources.map((entry: any) => {
      if (typeof entry === 'string') {
        return {
          title: entry,
          url: entry.startsWith('http') ? entry : '',
          publisher: 'Website',
          type: 'website',
        };
      }

      if (entry && typeof entry === 'object') {
        const sourceType =
          entry.type === 'article' || entry.type === 'textbook' || entry.type === 'video'
            ? entry.type
            : 'website';

        return {
          title: String(entry.title || entry.url || 'Source'),
          url: String(entry.url || ''),
          publisher: entry.publisher ? String(entry.publisher) : 'Website',
          type: sourceType,
        };
      }

      return null;
    });

    return mappedSources.filter((source): source is ResearchSource => Boolean(source && source.url));
  };

  const loadHistory = async () => {
    if (historyFetched.current || !studentId) return;

    setHistoryLoading(true);
    setHistoryError(null);
    try {
      let rows: any[] = [];

      const nextApiResponse = await fetch(
        `/api/student/research-history?userId=${encodeURIComponent(studentId)}&limit=30`
      );

      if (nextApiResponse.ok) {
        const data = await nextApiResponse.json();
        rows = Array.isArray(data?.queries) ? data.queries : [];
      } else if (nextApiResponse.status === 404) {
        // Fallback to the existing Express history endpoint when Next API routing is unavailable.
        const expressResponse = await fetch(
          `${API_URL}/api/search/history/${encodeURIComponent(studentId)}?limit=30`
        );
        if (!expressResponse.ok) throw new Error(`HTTP ${expressResponse.status}`);
        const data = await expressResponse.json();
        rows = Array.isArray(data) ? data : [];
      } else {
        throw new Error(`HTTP ${nextApiResponse.status}`);
      }

      const normalized: ResearchHistoryItem[] = rows.map((item: any) => ({
        id: String(item.id),
        subject: String(item.subject || 'General'),
        queryText: String(item.queryText || item.query || ''),
        response: String(item.response || ''),
        sources: normalizeSources(item.sources || []),
        createdAt: String(item.createdAt || new Date().toISOString()),
      }));

      setHistoryItems(normalized);
      historyFetched.current = true;
    } catch (error) {
      console.error('[ResearchHistory]', error);
      setHistoryError('Could not load history. Please try again.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'history' && !historyFetched.current && studentId) {
      loadHistory();
    }
  }, [activeView, studentId]);

  useEffect(() => {
    if (activeView === 'research' && prefillQuery) {
      setSearchQuery(prefillQuery);
      if (prefillSubject) {
        setSelectedSubject(prefillSubject);
      }
      setPrefillQuery('');
      setPrefillSubject('');
    }
  }, [activeView, prefillQuery, prefillSubject]);

  const toggleItem = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      const response = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          query: searchQuery,
          subject: selectedSubject,
          attachments: attachedFiles.map((f) => f.name),
          voiceInput: isListening,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      const normalizedSources = normalizeSources(data.sources ?? data.resourceLinks ?? []);
      const responseId = Date.now();

      setSearchResponses((prev) => [
        ...prev,
        {
          id: responseId,
          queryId: data.queryId ? String(data.queryId) : undefined,
          query: searchQuery,
          subject: selectedSubject,
          response: data.response,
          sources: normalizedSources,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setSourcesOpenById((prev) => ({ ...prev, [responseId]: false }));

      setEarlierSearches((prev) => [
        {
          id: Date.now(),
          query: searchQuery,
          subject: selectedSubject,
          timestamp: new Date(),
        },
        ...prev,
      ].slice(0, 10));

      setSearchQuery('');
      setAttachedFiles([]);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleShareToWhatsApp = (responseId: number) => {
    const response = searchResponses.find((r) => r.id === responseId);
    if (!response) return;

    const text = `Check out this research response: ${response.query}\n\n${response.response}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-white dark:bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Research Assistant</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Curriculum-aligned AI research helper</p>
        </div>
        {searchResponses.length > 0 && (
          <button className="rounded-lg bg-slate-200 dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-100 transition-colors hover:bg-slate-300 dark:hover:bg-slate-600">
            + New Chat
          </button>
        )}
      </div>

      <div className="px-4 pt-4">
        <div className="mx-auto mb-3 flex max-w-3xl items-center gap-2" role="tablist" aria-label="Research view">
          <button
            type="button"
            role="tab"
            id="research-tab"
            aria-selected={activeView === 'research'}
            aria-controls="research-panel"
            onClick={() => switchView('research')}
            className={cn(
              'flex min-h-[44px] items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              activeView === 'research' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700'
            )}
          >
            <span aria-hidden="true">🔍</span>
            New Research
          </button>

          <button
            type="button"
            role="tab"
            id="history-tab"
            aria-selected={activeView === 'history'}
            aria-controls="history-panel"
            onClick={() => {
              switchView('history');
              if (historyItems.length === 0 && !historyLoading) {
                loadHistory();
              }
            }}
            className={cn(
              'flex min-h-[44px] items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              activeView === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700'
            )}
          >
            <span aria-hidden="true">🕐</span>
            Research History
            {historyItems.length > 0 && (
              <span
                className={cn(
                  'ml-1 rounded-full px-1.5 py-0.5 text-xs',
                  activeView === 'history' ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-cyan-900/40 text-blue-700 dark:text-cyan-200'
                )}
              >
                {historyItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div id="research-panel" role="tabpanel" aria-labelledby="research-tab" hidden={activeView !== 'research'} className="contents">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300">
          {searchResponses.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100">
                <Search className="h-8 w-8 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Start your research</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-300">Ask a question below to get AI-powered, curriculum-aligned answers</p>
              </div>
              {earlierSearches.length > 0 && (
                <div className="mt-8 w-full max-w-md">
                  <p className="mb-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Recent searches</p>
                  <div className="space-y-2">
                    {earlierSearches.slice(0, 3).map((search) => (
                      <button
                        key={search.id}
                        onClick={() => setSearchQuery(search.query)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 p-3 text-left text-sm text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                      >
                        <p className="font-medium">{search.query}</p>
                        {search.subject && <p className="mt-1 text-xs text-slate-500">{search.subject}</p>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-4">
              {searchResponses.map((response) => (
                <div key={response.id} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="max-w-xs rounded-2xl rounded-tr-none bg-cyan-600 px-4 py-3 text-white lg:max-w-md">
                      <p className="break-words text-sm font-medium">{response.query}</p>
                      {response.subject && <p className="mt-2 text-xs text-cyan-100">📚 {response.subject}</p>}
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="w-full overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-slate-100">
                      <div className="prose prose-sm max-w-none break-words text-slate-800 dark:text-slate-200">
                        <p className="whitespace-pre-wrap break-words">{response.response}</p>
                      </div>

                      {response.sources.length > 0 && (
                        <div className="mt-3 border-t border-slate-300 pt-2">
                          <button
                            type="button"
                            onClick={() => setSourcesOpenById((prev) => ({ ...prev, [response.id]: !prev[response.id] }))}
                            aria-expanded={Boolean(sourcesOpenById[response.id])}
                            className="inline-flex items-center gap-2 rounded px-1 py-1 text-xs font-semibold text-cyan-700 hover:text-cyan-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                          >
                            <span aria-hidden="true">📚</span>
                            Sources ({response.sources.length})
                            <span aria-hidden="true">{sourcesOpenById[response.id] ? '▲' : '▼'}</span>
                          </button>

                          {sourcesOpenById[response.id] && (
                            <div className="mt-2 space-y-2" role="list" aria-label="Research sources">
                              {response.sources.map((source, idx) => (
                                <div key={idx} className="rounded-lg border border-blue-100 bg-blue-50 p-3" role="listitem">
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                                  >
                                    {source.title}
                                    <span className="sr-only"> (opens in new tab)</span>
                                  </a>
                                  <p className="mt-1 text-xs text-slate-500">{source.publisher}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-300 pt-2">
                        <button
                          onClick={() => handleShareToWhatsApp(response.id)}
                          className="flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-200"
                        >
                          <Share2 size={12} />
                          Share
                        </button>
                        <button className="flex items-center gap-1 rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-300">
                          <Copy size={12} />
                          Copy
                        </button>
                      </div>

                      <div className="mt-4 border-t border-slate-300 pt-3">
                        <PodcastPlayer
                          queryId={response.queryId}
                          userId={studentId ?? undefined}
                          topic={response.query}
                          subject={response.subject || 'General'}
                          response={response.response}
                          role="student"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div hidden={activeView !== 'research'} className="sticky bottom-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-4">
        <div className="mx-auto max-w-3xl space-y-3">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="subject" className="text-xs font-semibold text-slate-600">Subject</Label>
              <Select
                id="subject"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSearchResponses([]);
                  setSourcesOpenById({});
                }}
                aria-label="Select subject for research"
                disabled={subjects.length === 0}
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition-colors focus-visible:border-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              >
                <option value="">Select subject...</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </Select>
            </div>
          </div>

          {subjects.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800" role="alert">
              No subjects found. Please{' '}
              <a href="/profile" className="font-medium underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600">
                update your profile
              </a>{' '}
              to add subjects.
            </div>
          )}

          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-full border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1 text-xs text-slate-700 dark:text-slate-200">
                  <span>{file.name}</span>
                  <button
                    onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="font-bold text-blue-600 hover:text-blue-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="relative flex-1">
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
                className="w-full resize-none overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 transition-colors focus-visible:border-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleFileAttach}
                title="Attach file"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
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
                className={`inline-flex items-center justify-center rounded-lg p-3 transition-all ${
                  isListening
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Mic size={18} />
              </button>

              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                title="Send message"
                className="inline-flex items-center justify-center rounded-lg bg-cyan-600 p-3 text-white transition-all hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="history-panel" role="tabpanel" aria-labelledby="history-tab" hidden={activeView !== 'history'} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Your Research History</h2>
            <button
              type="button"
              onClick={() => {
                historyFetched.current = false;
                setHistoryItems([]);
                loadHistory();
              }}
              disabled={historyLoading}
              className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Refresh research history"
            >
              <span aria-hidden="true" className={historyLoading ? 'inline-block animate-spin' : ''}>↻</span>
              {historyLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {historyLoading && (
            <div className="space-y-3" aria-busy="true" aria-live="polite">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" aria-hidden="true" />
              ))}
              <span className="sr-only">Loading research history...</span>
            </div>
          )}

          {historyError && !historyLoading && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center" role="alert">
              <p className="mb-2 text-sm text-red-700">{historyError}</p>
              <button
                type="button"
                onClick={() => {
                  historyFetched.current = false;
                  loadHistory();
                }}
                className="rounded text-xs text-red-600 underline hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Try again
              </button>
            </div>
          )}

          {!historyLoading && !historyError && historyItems.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 p-10 text-center">
              <span className="mb-3 block text-4xl" aria-hidden="true">📭</span>
              <p className="mb-1 text-sm font-medium text-gray-600 dark:text-slate-300">No research history yet</p>
              <p className="mb-4 text-xs text-gray-400 dark:text-slate-500">Your past research queries will appear here</p>
              <button
                type="button"
                onClick={() => switchView('research')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Start your first research
              </button>
            </div>
          )}

          {!historyLoading && !historyError && historyItems.length > 0 && (
            <div className="space-y-2" role="list" aria-label="Research history items">
              {historyItems.map((item) => {
                const isOpen = expandedId === item.id;
                const date = new Date(item.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors hover:border-blue-200 dark:hover:border-cyan-500"
                    role="listitem"
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`item-${item.id}`}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                    >
                      <span className="shrink-0 whitespace-nowrap rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {item.subject}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 text-sm font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800">
                          {item.queryText}
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-400 dark:text-slate-500">{date}</span>
                      </span>

                      <span
                        className="shrink-0 text-xs text-gray-400 transition-transform duration-200"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        aria-hidden="true"
                      >
                        ▼
                      </span>
                    </button>

                    {isOpen && (
                      <div id={`item-${item.id}`} className="border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                        <div className="px-4 pt-4 pb-2">
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Your Question</p>
                          <p className="rounded-lg border border-gray-100 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-gray-800 dark:text-slate-200">{item.queryText}</p>
                        </div>

                        <div className="px-4 py-2">
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Response</p>
                          <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-blue-100 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-3 text-sm leading-relaxed text-gray-800 dark:text-slate-200">
                            {item.response || 'Response not available for this query.'}
                          </div>
                        </div>

                        {item.sources?.length > 0 && (
                          <div className="px-4 py-2">
                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Sources</p>
                            <div className="space-y-1">
                              {item.sources.map((src, i) => (
                                <a
                                  key={`${item.id}-src-${i}`}
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 rounded text-xs text-blue-600 hover:text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                  <span aria-hidden="true">📄</span>
                                  {src.title}
                                  <span className="sr-only">(opens in new tab)</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 border-t border-gray-100 px-4 py-3">
                          <button
                            type="button"
                            onClick={() => {
                              setPrefillQuery(item.queryText);
                              setPrefillSubject(item.subject);
                              switchView('research');
                              setExpandedId(null);
                            }}
                            className="rounded text-xs font-medium text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          >
                            Research this again →
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            className="ml-auto rounded text-xs text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                          >
                            Collapse ▲
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
