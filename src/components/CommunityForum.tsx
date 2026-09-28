import React, { useState } from 'react';
import { ForumPost, ForumReply, Language, Role } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { MessageSquare, Calendar, User, Search, Filter, Plus, Send, ChevronLeft, ShieldAlert } from 'lucide-react';

interface CommunityForumProps {
  posts: ForumPost[];
  lang: Language;
  studentId: string;
  studentName: string;
  studentIndexNo: string;
  userRole: Role;
  onSavePost: (post: ForumPost) => void;
  onSaveReply: (postId: string, reply: ForumReply) => void;
}

const TOPICS = [
  'General', 'Mechanics', 'Waves & Vibrations', 'Thermal Physics', 'Fields', 'Electricity & Magnetism', 'Electronics', 'Modern Physics'
];

export default function CommunityForum({
  posts, lang, studentId, studentName, studentIndexNo, userRole, onSavePost, onSaveReply
}: CommunityForumProps) {
  const t = TRANSLATIONS[lang];
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
  // Create Post fields
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState<'Mechanics' | 'Waves & Vibrations' | 'Thermal Physics' | 'Fields' | 'Electricity & Magnetism' | 'Electronics' | 'Modern Physics' | 'General'>('General');
  const [newContent, setNewContent] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Create Reply field
  const [newReplyText, setNewReplyText] = useState('');

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert("Please fill in both the Question Title and Description fields.");
      return;
    }

    const newPost: ForumPost = {
      id: `forum-${Date.now()}`,
      studentId,
      studentName,
      indexNo: studentIndexNo,
      topic: newTopic,
      title: newTitle,
      content: newContent,
      imageUrl: newImageUrl.trim() ? newImageUrl.trim() : undefined,
      createdAt: new Date().toISOString(),
      replies: []
    };

    onSavePost(newPost);
    setIsCreatingPost(false);
    setNewTitle('');
    setNewContent('');
    setNewImageUrl('');
    // Open the newly created post
    setSelectedPost(newPost);
  };

  const handleCreateReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyText.trim() || !selectedPost) return;

    const newReply: ForumReply = {
      id: `reply-${Date.now()}`,
      authorName: studentName,
      authorRole: userRole,
      content: newReplyText,
      createdAt: new Date().toISOString()
    };

    onSaveReply(selectedPost.id, newReply);
    
    // Update local state copy of selectedPost
    setSelectedPost(prev => prev ? {
      ...prev,
      replies: [...prev.replies, newReply]
    } : null);
    
    setNewReplyText('');
  };

  // Filter posts based on search and topic category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.indexNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === 'All' || post.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div id="community-forum-module" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Filters & Controls */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4 h-fit">
        <button
          onClick={() => { setIsCreatingPost(true); setSelectedPost(null); }}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/15"
        >
          <Plus className="h-4 w-4" />
          {t.postQuestion}
        </button>

        <div className="border-t border-slate-800 pt-4">
          <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold block mb-2 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Filter Topics
          </span>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedTopic('All')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedTopic === 'All'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              All Topics ({posts.length})
            </button>
            {TOPICS.map((topic) => {
              const count = posts.filter(p => p.topic === topic).length;
              return (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex justify-between items-center ${
                    selectedTopic === topic
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span>{topic}</span>
                  <span className="font-mono text-[10px] bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded-md">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Forum Content */}
      <div className="lg:col-span-3 space-y-4">
        {selectedPost ? (
          /* SINGLE THREAD DETAIL VIEW */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <button
              onClick={() => setSelectedPost(null)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Threads List
            </button>

            <div className="border-b border-slate-800 pb-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                  {selectedPost.topic}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Published: {new Date(selectedPost.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-display font-bold text-white text-lg">
                {selectedPost.title}
              </h3>

              <div className="flex gap-2 items-center text-xs text-slate-400 mt-2 font-mono">
                <User className="h-3.5 w-3.5" />
                <span>{selectedPost.studentName}</span>
                <span>•</span>
                <span>Index: {selectedPost.indexNo}</span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800/60 whitespace-pre-wrap">
                {selectedPost.content}
              </p>

              {selectedPost.imageUrl && (
                <div className="mt-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-w-lg">
                  <img
                    src={selectedPost.imageUrl}
                    alt="Problem attachment"
                    className="object-contain w-full max-h-80"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            {/* Replies List */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-amber-400" />
                {t.peerAnswers} ({selectedPost.replies.length})
              </h4>

              <div className="space-y-3">
                {selectedPost.replies.length === 0 ? (
                  <p className="text-slate-500 text-xs italic p-4 text-center">
                    No answers or teacher resolutions submitted yet. Type below to help this student!
                  </p>
                ) : (
                  selectedPost.replies.map((reply) => (
                    <div key={reply.id} className={`p-4 rounded-xl border leading-relaxed ${
                      reply.authorRole === 'admin' || reply.authorRole === 'editor'
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : 'bg-slate-950 border-slate-800/80'
                    }`}>
                      <div className="flex justify-between items-baseline mb-2 text-xs">
                        <span className={`font-semibold font-display ${
                          reply.authorRole === 'admin' || reply.authorRole === 'editor' ? 'text-amber-400' : 'text-slate-300'
                        }`}>
                          {reply.authorName}
                          {(reply.authorRole === 'admin' || reply.authorRole === 'editor') && (
                            <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500/10 text-[9px] border border-amber-500/30 text-amber-400 rounded font-extrabold uppercase">
                              {t.tutorBadge}
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add reply form */}
              <form onSubmit={handleCreateReply} className="pt-4 border-t border-slate-800 flex gap-2">
                <textarea
                  id="reply-textarea"
                  value={newReplyText}
                  onChange={(e) => setNewReplyText(e.target.value)}
                  placeholder="Provide your solution or help clarify this physics problem..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 min-h-[60px]"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl px-4 flex items-center justify-center transition-colors font-bold text-xs uppercase shrink-0"
                >
                  <Send className="h-4 w-4 mr-1" />
                  {t.addReply}
                </button>
              </form>
            </div>
          </div>
        ) : isCreatingPost ? (
          /* CREATE NEW THREAD FORM */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-white text-base">
                {t.postQuestion}
              </h3>
              <button
                onClick={() => setIsCreatingPost(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                  {t.selectTopic}
                </label>
                <select
                  id="new-post-topic-select"
                  value={newTopic}
                  onChange={(e: any) => setNewTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-sans focus:outline-none focus:border-amber-500/50"
                >
                  {TOPICS.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                  {t.forumTitle}
                </label>
                <input
                  id="new-post-title-input"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Help understanding vectors addition in 3D coordinates"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                  {t.forumContent}
                </label>
                <textarea
                  id="new-post-content-textarea"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Type out your specific homework doubt or theoretical question..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 min-h-[140px]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                  {t.forumImage}
                </label>
                <input
                  id="new-post-image-url"
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Paste a link to your problem diagram/photo (Unsplash, Imgur, etc.)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl tracking-wider uppercase transition-colors"
                >
                  {t.postBtn}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* FORUM THREADS DIRECTORY LIST */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            {/* Search filter row */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                id="forum-search-bar"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search forum topics, keywords or index numbers..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Questions lists */}
            <div className="space-y-3">
              {filteredPosts.length === 0 ? (
                <p className="text-slate-400 text-xs py-12 text-center">
                  No matching forum discussions found. Start a new topic!
                </p>
              ) : (
                filteredPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="w-full text-left bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:justify-between md:items-center gap-3"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="bg-amber-500/10 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
                          {post.topic}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Index: {post.indexNo}
                        </span>
                      </div>
                      <h4 className="font-sans font-bold text-white text-sm">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-sans">
                        {post.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-xs text-slate-400 border border-slate-800 font-mono">
                        <MessageSquare className="h-3 w-3 text-slate-500" />
                        {post.replies.length}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
