import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, User, Language, Role } from '../types';
import { Send, MessageSquare, User as UserIcon, Clock, Search, Shield, ChevronRight, Sparkles } from 'lucide-react';

interface SupportChatProps {
  chats: ChatMessage[];
  currentUser: User;
  users: User[];
  onSendMessage: (studentId: string, text: string) => void;
  lang: Language;
}

export default function SupportChat({
  chats,
  currentUser,
  users,
  onSendMessage,
  lang,
}: SupportChatProps) {
  const isStaff = currentUser.role === 'admin' || currentUser.role === 'super-admin' || currentUser.role === 'instructor';
  
  // For staff: which student conversation is currently selected
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [replyText, setReplyText] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select the first student conversation for staff if none selected
  const studentChatsMap = chats.reduce((acc, msg) => {
    if (!acc[msg.studentId]) {
      acc[msg.studentId] = [];
    }
    acc[msg.studentId].push(msg);
    return acc;
  }, {} as Record<string, ChatMessage[]>);

  // Sort messages within each thread
  Object.keys(studentChatsMap).forEach((studentId) => {
    studentChatsMap[studentId].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  });

  // Get active conversations sorted by the last message timestamp
  const activeConversations = Object.keys(studentChatsMap)
    .map((studentId) => {
      const thread = studentChatsMap[studentId];
      const lastMsg = thread[thread.length - 1];
      const studentObj = users.find((u) => u.id === studentId);
      return {
        studentId,
        studentName: studentObj?.name || lastMsg?.studentName || 'Unknown Student',
        studentIndexNo: studentObj?.indexNo || 'AP-PENDING',
        batch: studentObj?.batch || '2027',
        lastMessage: lastMsg,
        unreadCount: 0, // Placeholder
      };
    })
    .sort((a, b) => {
      const tA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const tB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return tB - tA;
    });

  // Filter conversations based on search term
  const filteredConversations = activeConversations.filter((conv) => {
    return (
      conv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.studentIndexNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, selectedStudentId]);

  // Set default selected student for staff
  useEffect(() => {
    if (isStaff && !selectedStudentId && filteredConversations.length > 0) {
      setSelectedStudentId(filteredConversations[0].studentId);
    }
  }, [isStaff, selectedStudentId, filteredConversations]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const targetStudentId = isStaff ? selectedStudentId : currentUser.id;
    if (!targetStudentId) return;

    onSendMessage(targetStudentId, replyText.trim());
    setReplyText('');
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'si-LK', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  // Messages for the active chat thread
  const activeThreadMessages = isStaff
    ? studentChatsMap[selectedStudentId] || []
    : studentChatsMap[currentUser.id] || [];

  const activeStudentInfo = users.find(
    (u) => u.id === (isStaff ? selectedStudentId : currentUser.id)
  );

  return (
    <div id="support-chat-root" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-[650px] flex flex-col md:flex-row">
      
      {/* LEFT COLUMN: STAFF INBOX */}
      {isStaff && (
        <div className="w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-950 shrink-0">
          <div className="p-4 border-b border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-amber-500" />
                Student Support Inbox
              </h3>
              <span className="bg-slate-900 text-slate-400 font-mono text-[9px] px-2 py-0.5 rounded border border-slate-800 uppercase font-bold">
                {currentUser.role === 'super-admin' ? 'Super Admin' : currentUser.role === 'admin' ? 'Admin Staff' : 'Instructor'}
              </span>
            </div>
            
            {/* Search Input bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                id="staff-chat-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8.5 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Conversations list container */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 italic text-xs">
                No active conversations found.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.studentId === selectedStudentId;
                return (
                  <button
                    key={conv.studentId}
                    onClick={() => setSelectedStudentId(conv.studentId)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-amber-950/10 border-r-2 border-amber-500'
                        : 'hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold uppercase text-xs shrink-0">
                      {conv.studentName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-200 text-xs truncate">
                          {conv.studentName}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono shrink-0">
                          {conv.lastMessage ? getRelativeTime(conv.lastMessage.createdAt) : ''}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-amber-500 font-mono font-bold text-[9px]">{conv.studentIndexNo}</span>
                        <span>•</span>
                        <span>Batch {conv.batch}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-1">
                        {conv.lastMessage?.text || ''}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* RIGHT COLUMN: ACTIVE CONVERSATION CONSOLE */}
      <div className="flex-1 flex flex-col bg-slate-900">
        
        {/* Header bar */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center text-slate-300 font-semibold uppercase text-xs">
              {activeStudentInfo ? activeStudentInfo.name.charAt(0) : <UserIcon className="h-4 w-4" />}
            </div>
            <div>
              <h4 className="font-display font-bold text-white text-sm">
                {isStaff
                  ? activeStudentInfo?.name || 'Loading Student...'
                  : lang === 'en'
                    ? 'Academic Support & Doubt Clearance Desk'
                    : 'පන්ති සහය සහ ගැටළු නිරාකරණ අංශය'}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5 font-sans">
                {isStaff ? (
                  <>
                    <span className="text-amber-400 font-mono font-bold">{activeStudentInfo?.indexNo}</span>
                    <span>•</span>
                    <span>Batch {activeStudentInfo?.batch} Theory</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      {lang === 'en'
                        ? 'Dr. Aritha Perera & Teaching Instructors'
                        : 'ආචාර්ය අරිත පෙරේරා ඇතුළු ගුරු මණ්ඩලය'}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {!isStaff && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pedagogical Desk Live</span>
            </div>
          )}
        </div>

        {/* Message bubble space */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeThreadMessages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-3">
              <MessageSquare className="h-10 w-10 text-slate-750" />
              <div className="max-w-xs space-y-1">
                <p className="text-slate-300 font-bold text-xs">
                  {lang === 'en' ? 'Start a Conversation' : 'ගුරු මණ්ඩලය සමඟ සම්බන්ධ වන්න'}
                </p>
                <p className="text-slate-500 text-[10px] leading-relaxed">
                  {lang === 'en'
                    ? 'Send a question or deposit clearance query directly to Dr. Aritha Perera or the instructors.'
                    : 'පන්ති ගාස්තු හෝ විෂය කරුණු සම්බන්ධ ඕනෑම ප්‍රශ්නයක් සෘජුවම ආචාර්ය අරිත පෙරේරා හෝ ගුරු මණ්ඩලය වෙත යොමු කරන්න.'}
                </p>
              </div>
            </div>
          ) : (
            activeThreadMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const isMsgStaff = msg.senderRole === 'admin' || msg.senderRole === 'instructor';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 space-y-1 shadow-md ${
                    isMe
                      ? 'bg-amber-500 text-slate-950 rounded-tr-none'
                      : isMsgStaff
                        ? 'bg-slate-950 border border-amber-500/20 text-slate-200 rounded-tl-none'
                        : 'bg-slate-950 border border-slate-850 text-slate-200 rounded-tl-none'
                  }`}>
                    {/* Show sender title if staff and not sent by me */}
                    {!isMe && isMsgStaff && (
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-400 uppercase tracking-wide font-mono">
                        <Shield className="h-2.5 w-2.5" />
                        {msg.senderRole === 'admin' ? 'Super Admin' : 'Instructor'} • {msg.senderName}
                      </div>
                    )}
                    {/* Show sender title if student in staff dashboard */}
                    {isStaff && !isMe && msg.senderRole === 'student' && (
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide font-mono">
                        Student • {msg.senderName}
                      </div>
                    )}
                    <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                      {msg.text}
                    </p>
                    <div className={`text-[8px] font-mono text-right block ${isMe ? 'text-slate-900/60' : 'text-slate-500'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString(lang === 'en' ? 'en-US' : 'si-LK', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area form */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950/80 border-t border-slate-850/80 flex gap-2">
          <input
            id="chat-reply-input"
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={
              isStaff
                ? `Type reply as ${currentUser.role === 'super-admin' ? 'Super Admin' : currentUser.role === 'admin' ? 'Admin' : 'Instructor'}...`
                : lang === 'en'
                  ? 'Ask a question or enter message...'
                  : 'ඔබගේ පණිවිඩය මෙහි ලියන්න...'
            }
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 font-sans"
          />
          <button
            type="submit"
            disabled={!replyText.trim()}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 px-4 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
