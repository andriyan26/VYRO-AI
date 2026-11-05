import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, Users, Play, Eye, Heart, Sparkles, Flame, Film } from 'lucide-react';
import api from '../../services/api';
import { VideoDetailModal } from '../../components/video/VideoDetailModal';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [popularCreators, setPopularCreators] = useState<any[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

  useEffect(() => {
    const fetchExplore = async () => {
      try {
        const response = await api.get('/social/explore');
        if (response.data.success) {
          const { categories, popularCreators, trendingVideos } = response.data.data;
          setCategories(categories || []);
          setPopularCreators(popularCreators || []);
          setTrendingVideos(trendingVideos || []);
        }
      } catch (err) {
        console.error('Failed to load explore data:', err);
      }
    };
    fetchExplore();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      const response = await api.get(`/social/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.data.success) {
        setSearchResults(response.data.data);
      }
    } catch {
      // Ignore
    }
  };

  const filteredVideos = activeCategory
    ? trendingVideos.filter(
        (v) =>
          v.category?.name === activeCategory ||
          v.title?.toLowerCase().includes(activeCategory.toLowerCase()) ||
          v.description?.toLowerCase().includes(activeCategory.toLowerCase())
      )
    : trendingVideos;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8 space-y-8 select-none text-white">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5 tracking-tight">
              <Compass className="w-7 h-7 text-amber-400 stroke-[2.5]" />
              Discover & Explore
            </h1>
            <p className="text-xs text-stone-400 mt-1 font-medium">
              Tonton video viral, temukan kreator berbakat, dan eksplorasi konten bertenaga AI.
            </p>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            AI Recommendations Active
          </span>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-2xl">
          <input
            type="text"
            placeholder="Cari video viral, nama kreator, atau #hashtag..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!e.target.value) setSearchResults(null);
            }}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-400/40 text-white placeholder-stone-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-lg backdrop-blur-md transition-all"
          />
          <Search className="w-5 h-5 text-amber-400/80 absolute left-4 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* SEARCH RESULTS VIEW */}
      {searchResults ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-amber-300">
              Hasil Pencarian untuk "{searchQuery}"
            </h2>
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults(null);
              }}
              className="text-xs text-stone-400 hover:text-white underline cursor-pointer"
            >
              Hapus Pencarian
            </button>
          </div>

          {/* Creators Result */}
          {searchResults.users?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
                Kreator Ditemukan
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {searchResults.users.map((u: any) => (
                  <div
                    key={u.id}
                    onClick={() => navigate(`/profile/${u.username}`)}
                    className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-amber-400/40 flex items-center gap-3 transition-all cursor-pointer group shadow-md"
                  >
                    <img
                      src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                      alt={u.username}
                      className="w-11 h-11 rounded-full object-cover border-2 border-amber-400/60 group-hover:scale-105 transition-transform"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate transition-colors">
                        {u.fullName}
                      </div>
                      <div className="text-[11px] text-stone-400 truncate">@{u.username}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Result */}
          {searchResults.videos?.length > 0 ? (
            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
                Video Ditemukan (Klik untuk Tonton)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {searchResults.videos.map((v: any) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVideo(v)}
                    className="rounded-2xl overflow-hidden bg-black/60 border border-white/10 hover:border-amber-400/60 aspect-[9/16] relative group cursor-pointer shadow-xl transition-all hover:scale-[1.02]"
                  >
                    <img
                      src={v.thumbnailUrl}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Hover Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                      <div className="w-12 h-12 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3 pointer-events-none">
                      <span className="text-xs font-bold text-white line-clamp-1">{v.title}</span>
                      <span className="text-[11px] text-amber-300">@{v.user?.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-stone-500">Tidak ada video yang cocok dengan kata kunci tersebut.</p>
          )}
        </div>
      ) : (
        /* STANDARD EXPLORE FEED */
        <>
          {/* Categories Horizontal Pills */}
          <div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === null
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10'
                }`}
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Semua Trending</span>
              </button>

              {categories.map((cat) => {
                const isSelected = activeCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(isSelected ? null : cat.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/50'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-stone-300 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular Creators */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                Kreator Populer & AI Personalities
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {popularCreators.map((creator) => (
                <div
                  key={creator.id}
                  onClick={() => navigate(`/profile/${creator.username}`)}
                  className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 flex flex-col items-center text-center transition-all cursor-pointer group shadow-lg"
                >
                  <div className="relative mb-2">
                    <img
                      src={creator.avatarUrl}
                      alt={creator.username}
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#080604]" />
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-amber-300 truncate max-w-[120px] transition-colors">
                    {creator.fullName}
                  </span>
                  <span className="text-[10px] text-stone-400">@{creator.username}</span>
                  <span className="mt-2 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/20">
                    {creator._count?.followers || 0} followers
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Videos Grid (100% Clickable & Playable!) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Trending on VYRO AI</span>
                {activeCategory && <span className="text-amber-400 font-normal">({activeCategory})</span>}
              </h2>
              <span className="text-[11px] text-amber-400/80">Klik video mana saja untuk menonton</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black/60 border border-white/10 hover:border-amber-400/60 shadow-xl group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                      <Film className="w-3 h-3 text-amber-400" />
                      <span>{video.duration ? `${Math.round(video.duration)}s` : 'Video'}</span>
                    </span>
                  </div>

                  {/* Center Play Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/35 backdrop-blur-[2px]">
                    <div className="w-13 h-13 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.7)] group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Gradient Info Overlay at Bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3.5 text-white pointer-events-none">
                    <span className="font-bold text-xs line-clamp-1 leading-snug drop-shadow-md">
                      {video.title}
                    </span>
                    <span className="text-[11px] text-amber-300 font-semibold drop-shadow">
                      @{video.user?.username || 'creator'}
                    </span>

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-stone-300 font-medium">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-amber-400" />
                        {video.viewsCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                        {video.likesCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* IMMERSIVE VIDEO DETAIL PLAYER MODAL */}
      {selectedVideo && (
        <VideoDetailModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onLikeUpdate={(vidId, isLiked, newCount) => {
            setTrendingVideos((prev) =>
              prev.map((v) => (v.id === vidId ? { ...v, isLiked, likesCount: newCount } : v))
            );
          }}
        />
      )}
    </div>
  );
};
