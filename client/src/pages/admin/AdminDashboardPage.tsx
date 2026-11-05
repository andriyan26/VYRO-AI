import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Film, Bot, Settings, Trash2, CheckCircle, Play, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { VideoDetailModal } from '../../components/video/VideoDetailModal';

export const AdminDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [aiSettings, setAiSettings] = useState<any>({});
  const [aiCharacters, setAiCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'users' | 'videos' | 'ai'>('users');
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

  const fetchAdminData = async () => {
    try {
      const [ovRes, uRes, vRes, setRes, charRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/users'),
        api.get('/admin/videos'),
        api.get('/ai/settings'),
        api.get('/ai/characters'),
      ]);

      if (ovRes.data.success) setOverview(ovRes.data.data);
      if (uRes.data.success) setUsers(uRes.data.data);
      if (vRes.data.success) setVideos(vRes.data.data);
      if (setRes.data.success) setAiSettings(setRes.data.data);
      if (charRes.data.success) setAiCharacters(charRes.data.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}`, { role: newRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch {
      // Ignore
    }
  };

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await api.put(`/admin/users/${userId}`, { isVerified: !currentStatus });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isVerified: !currentStatus } : u))
        );
      }
    } catch {
      // Ignore
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to remove this video for moderation?')) return;
    try {
      const res = await api.delete(`/admin/videos/${videoId}`);
      if (res.data.success) {
        setVideos((prev) => prev.filter((v) => v.id !== videoId));
      }
    } catch {
      // Ignore
    }
  };

  const handleUpdateAISetting = async (key: string, value: string) => {
    try {
      await api.put('/ai/settings', { key, value });
      setAiSettings((prev: any) => ({ ...prev, [key]: value }));
    } catch {
      // Ignore
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-amber-400">
        <div className="w-8 h-8 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 select-none">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            System Administration Panel
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Global management for users, content moderation, and AI engine policies.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Registered Users', value: overview?.totalUsers || 0, icon: Users, color: 'text-amber-400' },
          { label: 'Published Videos', value: overview?.totalVideos || 0, icon: Film, color: 'text-sky-400' },
          { label: 'AI Comments', value: overview?.aiCommentsCount || 0, icon: Bot, color: 'text-emerald-400' },
          { label: 'Human Comments', value: overview?.humanCommentsCount || 0, icon: CheckCircle, color: 'text-rose-400' },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-white/5 ${m.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-400 block">{m.label}</span>
                <span className="text-xl font-bold text-white">{m.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 -mb-3 transition-colors ${
            activeTab === 'users' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-stone-400 hover:text-white'
          }`}
        >
          User & Role Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 -mb-3 transition-colors ${
            activeTab === 'videos' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-stone-400 hover:text-white'
          }`}
        >
          Content Moderation ({videos.length})
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 -mb-3 transition-colors ${
            activeTab === 'ai' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-stone-400 hover:text-white'
          }`}
        >
          AI Interaction Policies
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-stone-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Verified</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                      alt={u.username}
                      className="w-8 h-8 rounded-full object-cover border border-amber-400/40"
                    />
                    <div>
                      <div className="font-bold text-white">{u.fullName}</div>
                      <div className="text-[11px] text-stone-400">@{u.username}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-[#18120c] border border-white/10 text-xs font-semibold text-amber-300 focus:outline-none"
                    >
                      <option value="USER">USER</option>
                      <option value="CREATOR">CREATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleVerification(u.id, u.isVerified)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        u.isVerified
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {u.isVerified ? '✓ Verified' : 'Standard'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-stone-500">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: CONTENT MODERATION */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-400/40 flex gap-4 transition-all group shadow-md"
            >
              <div
                onClick={() => setSelectedVideo(vid)}
                className="relative w-20 h-28 rounded-xl overflow-hidden shrink-0 border border-white/10 cursor-pointer group-hover:scale-105 transition-transform"
                title="Tonton video"
              >
                <img
                  src={vid.thumbnailUrl}
                  alt={vid.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-6 h-6 text-amber-400 fill-current" />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div onClick={() => setSelectedVideo(vid)} className="cursor-pointer">
                  <h3 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {vid.title}
                  </h3>
                  <p className="text-[11px] text-stone-400 line-clamp-2 mt-1">{vid.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-amber-400 font-semibold">@{vid.user?.username}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                      HD Player 🎬
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setSelectedVideo(vid)}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Review Video</span>
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(vid.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/30 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Video</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: AI INTERACTION CONFIG */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-400" />
              Platform Owner AI Interaction Controls
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">AI Auto-Commenting</span>
                  <span className="text-[11px] text-stone-400">Allow AI personas to generate contextual reactions</span>
                </div>
                <button
                  onClick={() =>
                    handleUpdateAISetting(
                      'ai_comments_enabled',
                      aiSettings.ai_comments_enabled === 'true' ? 'false' : 'true'
                    )
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    aiSettings.ai_comments_enabled === 'true'
                      ? 'bg-emerald-500 text-stone-950'
                      : 'bg-stone-700 text-stone-300'
                  }`}
                >
                  {aiSettings.ai_comments_enabled === 'true' ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Max Comments Per Video</span>
                  <span className="text-[11px] text-stone-400">Limit AI activity density</span>
                </div>
                <span className="px-3 py-1 rounded-lg bg-[#18120c] border border-white/10 text-amber-300 font-mono text-xs">
                  {aiSettings.ai_max_comments_per_video || 5}
                </span>
              </div>
            </div>
          </div>

          {/* AI Personas Roster */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-400" />
              Active AI Characters ({aiCharacters.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {aiCharacters.map((char) => (
                <div key={char.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-3">
                  <img
                    src={char.avatar}
                    alt={char.name}
                    className="w-10 h-10 rounded-full object-cover border border-amber-400"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white">{char.name}</span>
                      <span
                        className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md"
                        style={{
                          backgroundColor: `${char.badgeColor}25`,
                          color: char.badgeColor,
                        }}
                      >
                        {char.personality}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-1">{char.systemPrompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* IMMERSIVE VIDEO DETAIL PLAYER MODAL WITH MODE CLEAN */}
      {selectedVideo && (
        <VideoDetailModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

