import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Eye, Heart, MessageCircle, TrendingUp, Film, FileText, Play } from 'lucide-react';
import api from '../../services/api';
import { VideoDetailModal } from '../../components/video/VideoDetailModal';

export const CreatorStudioPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

  useEffect(() => {
    const fetchStudio = async () => {
      try {
        const [anaRes, draftRes] = await Promise.all([
          api.get('/creator/analytics'),
          api.get('/creator/drafts'),
        ]);
        if (anaRes.data.success) setAnalytics(anaRes.data.data);
        if (draftRes.data.success) setDrafts(draftRes.data.data);
      } catch (err) {
        console.error('Failed to load studio analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudio();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-amber-400">
        <div className="w-8 h-8 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 select-none">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-amber-400" />
          Creator Studio & Analytics
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Monitor your video performance, reach, and audience growth across VYRO AI.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Views', value: analytics?.totalViews?.toLocaleString() || 0, icon: Eye, color: 'text-amber-400' },
          { label: 'Total Likes', value: analytics?.totalLikes?.toLocaleString() || 0, icon: Heart, color: 'text-rose-400' },
          { label: 'Comments', value: analytics?.totalComments?.toLocaleString() || 0, icon: MessageCircle, color: 'text-sky-400' },
          { label: 'Engagement Rate', value: analytics?.engagementRate || '0%', icon: TrendingUp, color: 'text-emerald-400' },
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

      {/* Video Content Table */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Film className="w-4 h-4 text-amber-400" />
          Published Video Performance
        </h2>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-stone-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Video</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4">Likes</th>
                <th className="py-3 px-4">Comments</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {analytics?.recentVideos?.map((video: any) => (
                <tr
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="hover:bg-amber-500/[0.06] transition-colors cursor-pointer group"
                  title="Klik untuk putar video"
                >
                  <td className="py-3 px-4 flex items-center gap-3">
                    <div className="relative w-9 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover:border-amber-400/60 transition-colors">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-amber-400 fill-current" />
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-1 max-w-xs block">
                        {video.title}
                      </span>
                      <span className="text-[10px] text-amber-400/80 font-medium">Klik untuk menonton</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">{video.viewsCount}</td>
                  <td className="py-3 px-4 font-mono">{video._count?.likes || video.likesCount}</td>
                  <td className="py-3 px-4 font-mono">{video._count?.comments || video.commentsCount}</td>
                  <td className="py-3 px-4 text-stone-400">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved Drafts */}
      {drafts.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            Editor Drafts ({drafts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {drafts.map((d) => (
              <div key={d.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-xs font-bold text-white block truncate">{d.title}</span>
                <span className="text-[11px] text-stone-400">
                  Last updated: {new Date(d.updatedAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Detail Modal with Mode Clean for Creators */}
      {selectedVideo && (
        <VideoDetailModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};
