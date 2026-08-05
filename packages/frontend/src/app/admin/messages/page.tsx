'use client';

import React, { useState, useEffect } from 'react';
import { MailOpen, Mail, Trash, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMessage, setActiveMessage] = useState<Message | null>(null);

  const fetchMessages = async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/messages`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setMessages(json.data);
      }
    } catch (err) {
      toast.error('Failed to load inquiry messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMessageClick = async (msg: Message) => {
    setActiveMessage(msg);

    // If message is unread, mark it as read via API PATCH request
    if (!msg.isRead) {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/messages/${msg._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
          credentials: 'include'
        });

        if (res.ok) {
          // Update local listing read status
          setMessages((prev) =>
            prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m))
          );
        }
      } catch (err) {
        console.error('Failed to update read status:', err);
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening active panel

    if (!window.confirm('Delete this inquiry message permanently?')) return;

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/messages/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Delete operation failed');
      }

      toast.success('Inquiry message removed');
      if (activeMessage?._id === id) {
        setActiveMessage(null);
      }
      fetchMessages();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  // Format date helper
  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="text-left">
        <h1 className="font-display text-2xl font-bold text-foreground">Contact Inbox</h1>
        <p className="font-sans text-xs text-muted-foreground mt-0.5">Read and delete user inquiry messages.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Messages List Panel */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-card/30 backdrop-blur-md overflow-hidden flex flex-col max-h-[60vh] lg:max-h-[70vh]">
          <div className="bg-muted/40 px-4 py-3 border-b border-border/50 font-bold uppercase text-[10px] text-muted-foreground text-left">
            Inquiries List
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-border/60" data-lenis-prevent>
            {loading ? (
              <div className="p-8 flex justify-center items-center gap-2 text-muted-foreground text-xs">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading inbox...
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs font-medium">
                Your inbox is empty. No messages captured.
              </div>
            ) : (
              messages.map((msg) => {
                const isActive = activeMessage?._id === msg._id;
                return (
                  <div
                    key={msg._id}
                    onClick={() => handleMessageClick(msg)}
                    className={`p-4 cursor-pointer text-left transition-colors relative hover-glow-trigger ${
                      isActive ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-muted/20'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`font-display text-sm tracking-tight truncate ${!msg.isRead ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                        {msg.name}
                      </h3>
                      <button
                        onClick={(e) => handleDelete(msg._id, e)}
                        className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                        title="Delete Message"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${!msg.isRead ? 'font-semibold text-foreground/90' : 'text-muted-foreground/80'}`}>
                      {msg.subject}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-2 font-mono">
                      <span className="flex items-center gap-1">
                        {msg.isRead ? <MailOpen className="w-3 h-3 text-muted-foreground/50" /> : <Mail className="w-3 h-3 text-primary animate-pulse" />}
                        {msg.email}
                      </span>
                      <span>{formatDateTime(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Message Detailed View Panel */}
        <div className="lg:col-span-7 rounded-xl border border-border bg-card/25 p-6 flex flex-col justify-start text-left max-h-[60vh] lg:max-h-[70vh] overflow-y-auto" data-lenis-prevent>
          {activeMessage ? (
            <div className="space-y-6">
              {/* Header metadata */}
              <div className="border-b border-border/40 pb-4">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2.5">
                  <h2 className="font-display text-xl font-bold text-foreground">{activeMessage.subject}</h2>
                  <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {formatDateTime(activeMessage.createdAt)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5 font-semibold">
                  <p>From: <span className="text-foreground">{activeMessage.name}</span></p>
                  <p>Email: <a href={`mailto:${activeMessage.email}`} className="text-primary hover:underline">{activeMessage.email}</a></p>
                </div>
              </div>

              {/* Message Content Body */}
              <div className="text-sm text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap bg-muted/20 p-4 rounded-lg border border-border/40">
                {activeMessage.message}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-16">
              <Mail className="w-10 h-10 text-muted-foreground/35 mb-3" />
              <p className="text-xs font-semibold">Select an inquiry from the inbox on the left to read its contents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
