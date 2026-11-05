import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music,
  Plus,
  Check,
  Sparkles,
  Send,
  X,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Play,
  Pause,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import api from '../../services/api';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  sharesCount: number;
  creator: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
    isVerified: boolean;
    isFollowing: boolean;
  };
  sound?: {
    id: string;
    title: string;
    artist: string;
  };
  hashtags: string[];
  isLiked: boolean;
  isBookmarked: boolean;
}

export const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const { playHeartPop } = useSound();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'foryou' | 'following' | 'trending'>('foryou');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Real-time Live Clock State (Updated every second)
  const [liveTime, setLiveTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Comment Drawer State
  const [isCommentOpen, setIsCommentOpen] = useState<boolean>(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  // Share Toast
  const [shareToast, setShareToast] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Keyboard shortcut: Press 'M' to mute/unmute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch videos for current tab
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/videos/feed?type=${activeTab}&limit=10`);
        if (response.data.success) {
          setVideos(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [activeTab]);

  // Video playback control on scroll - Sound ON by default
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (vid) {
        if (idx === currentIndex) {
          vid.currentTime = 0;
          vid.muted = isMuted;
          vid.volume = 1.0;
          const playPromise = vid.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              // If browser restricts unmuted autoplay before user gesture,
              // play muted temporarily, but KEEP isMuted = false in UI and unmute on first gesture!
              console.warn('Autoplay sound blocked by browser policy:', err);
              vid.muted = true;
              vid.play().catch(() => {});
            });
          }
          setIsPlaying(true);
        } else {
          vid.pause();
        }
      }
    });
  }, [currentIndex, videos, isMuted]);

  // Global user gesture listener: Unmute immediately on first click or touch
  useEffect(() => {
    const unlockAudio = () => {
      const currentVid = videoRefs.current[currentIndex];
      if (currentVid && !isMuted) {
        currentVid.muted = false;
        currentVid.volume = 1.0;
      }
    };

    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [currentIndex, isMuted]);

  const toggleCurrentVideoPlayback = (idx: number) => {
    const vid = videoRefs.current[idx];
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const handleLike = async (videoId: string, index: number) => {
    playHeartPop();
    try {
      const response = await api.post(`/videos/${videoId}/like`);
      if (response.data.success) {
        setVideos((prev) =>
          prev.map((v, i) =>
            i === index
              ? {
                  ...v,
                  isLiked: response.data.isLiked,
                  likesCount: response.data.likesCount,
                }
              : v
          )
        );
      }
    } catch {
      // Ignore
    }
  };

  const handleBookmark = async (videoId: string, index: number) => {
    try {
      const response = await api.post(`/videos/${videoId}/bookmark`);
      if (response.data.success) {
        setVideos((prev) =>
          prev.map((v, i) =>
            i === index
              ? {
                  ...v,
                  isBookmarked: response.data.isBookmarked,
                  bookmarksCount: response.data.bookmarksCount,
                }
              : v
          )
        );
      }
    } catch {
      // Ignore
    }
  };

  const handleFollow = async (creatorId: string, index: number) => {
    try {
      const response = await api.post(`/users/${creatorId}/follow`);
      if (response.data.success) {
        setVideos((prev) =>
          prev.map((v, i) =>
            i === index
              ? {
                  ...v,
                  creator: { ...v.creator, isFollowing: response.data.isFollowing },
                }
              : v
          )
        );
      }
    } catch {
      // Ignore
    }
  };

  const openComments = async (videoId: string) => {
    setIsCommentOpen(true);
    setCommentLoading(true);
    try {
      const response = await api.get(`/comments/${videoId}`);
      if (response.data.success) {
        setComments(response.data.data);
      }
    } catch {
      // Ignore
    } finally {
      setCommentLoading(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const currentVideo = videos[currentIndex];
    if (!currentVideo) return;

    try {
      const response = await api.post(`/comments/${currentVideo.id}`, {
        content: newCommentText,
      });

      if (response.data.success) {
        setComments((prev) => [response.data.data, ...prev]);
        setNewCommentText('');
        setVideos((prev) =>
          prev.map((v, i) =>
            i === currentIndex ? { ...v, commentsCount: v.commentsCount + 1 } : v
          )
        );
      }
    } catch {
      // Ignore
    }
  };

  // Trigger contextual AI response in real-time
  const triggerAIComment = async () => {
    const currentVideo = videos[currentIndex];
    if (!currentVideo) return;

    setIsAiTyping(true);
    try {
      const response = await api.post('/ai/comment', {
        videoId: currentVideo.id,
      });

      if (response.data.success) {
        setTimeout(() => {
          setComments((prev) => [response.data.data, ...prev]);
          setIsAiTyping(false);
          setVideos((prev) =>
            prev.map((v, i) =>
              i === currentIndex ? { ...v, commentsCount: v.commentsCount + 1 } : v
            )
          );
        }, 1200);
      }
    } catch {
      setIsAiTyping(false);
    }
  };

  const handleShare = (video: VideoItem) => {
    navigator.clipboard.writeText(window.location.origin + `/video/${video.id}`);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center bg-[#07080c] overflow-hidden">
      {/* TOP FEED HEADER & CONTROLS */}
      <div className="absolute top-2 sm:top-3 left-0 right-0 z-30 flex items-center justify-between px-2 sm:px-4 select-none">
        {/* Left: Real-Time Live Clock Badge */}
        <div
          className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-amber-500/35 text-amber-300 text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg select-none shrink-0"
          title="Waktu Real-Time Sekarang"
        >
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
          <span className="tracking-wide sm:tracking-wider">{liveTime}</span>
          <span className="text-[9px] sm:text-[10px] text-amber-400/80 font-sans font-semibold hidden xs:inline">WIB</span>
        </div>

        {/* Center: Feed Tabs Navigation */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-extrabold drop-shadow-md select-none">
          <button
            onClick={() => setActiveTab('following')}
            className={`transition-all cursor-pointer px-1 py-0.5 ${
              activeTab === 'following'
                ? 'text-white border-b-2 border-amber-400 pb-0.5 text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] font-black'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Following
          </button>
          <button
            onClick={() => setActiveTab('foryou')}
            className={`transition-all cursor-pointer px-1 py-0.5 ${
              activeTab === 'foryou'
                ? 'text-white border-b-2 border-amber-400 pb-0.5 text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] font-black'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`transition-all cursor-pointer px-1 py-0.5 ${
              activeTab === 'trending'
                ? 'text-white border-b-2 border-amber-400 pb-0.5 text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] font-black'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Trending <span className="text-amber-400">🔥</span>
          </button>
        </div>

        {/* Right: Sound Mute/Unmute Quick Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            const currentVid = videoRefs.current[currentIndex];
            if (currentVid) {
              currentVid.muted = newMuted;
              currentVid.volume = 1.0;
            }
          }}
          className={`p-1.5 sm:px-3 sm:py-1.5 rounded-full backdrop-blur-md border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95 shrink-0 ${
            isMuted
              ? 'bg-rose-500/30 text-rose-300 border-rose-500/50'
              : 'bg-black/60 text-amber-300 border-amber-400/40 hover:bg-black/80'
          }`}
          title={isMuted ? 'Nyalakan Suara (Tombol M)' : 'Matikan Suara (Tombol M)'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          <span className="text-[10px] hidden sm:inline">{isMuted ? 'Muted' : 'Sound ON'}</span>
        </button>
      </div>

      {/* Share Toast Notification */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 z-50 px-4 py-2 rounded-full bg-amber-500 text-stone-950 font-bold text-xs shadow-lg flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN SNAP SCROLLING VIDEO FEED CONTAINER */}
      <div
        ref={containerRef}
        onScroll={(e) => {
          const target = e.currentTarget;
          const index = Math.round(target.scrollTop / target.clientHeight);
          if (index !== currentIndex && index >= 0 && index < videos.length) {
            setCurrentIndex(index);
          }
        }}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative transition-all duration-300 md:max-w-[430px]"
      >
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-amber-400 gap-3">
            <div className="w-10 h-10 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
            <span className="text-xs tracking-wider text-stone-400 font-semibold">Memuat Vyro AI Feed...</span>
          </div>
        ) : videos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <p className="text-stone-400 text-sm">Belum ada video di feed ini.</p>
          </div>
        ) : (
          videos.map((video, idx) => (
            <div
              key={video.id}
              className="h-full w-full snap-start snap-always relative flex items-center justify-center bg-black overflow-hidden rounded-none md:rounded-3xl md:border md:border-white/10 md:shadow-2xl"
            >
              {/* Video Element */}
              <video
                ref={(el) => (videoRefs.current[idx] = el)}
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                loop
                playsInline
                autoPlay
                muted={isMuted}
                className="h-full w-full object-cover cursor-pointer"
                onClick={() => toggleCurrentVideoPlayback(idx)}
              />

              {/* Pause / Play Indicator when user pauses */}
              {!isPlaying && idx === currentIndex && (
                <div
                  onClick={() => toggleCurrentVideoPlayback(idx)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer pointer-events-auto"
                >
                  <div className="w-14 h-14 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.7)] transform scale-110">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </div>
              )}

              {/* RIGHT FLOATING ACTION BAR (TIKTOK COMPACT STYLING - ZERO OVERFLOW) */}
              <div className="absolute right-2 sm:right-3 bottom-3 sm:bottom-5 z-20 flex flex-col items-center gap-2 sm:gap-2.5 select-none">
                {/* Creator Avatar with Follow Button */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${video.creator.username}`);
                  }}
                  className="relative mb-1 cursor-pointer group/avatar"
                  title={`@${video.creator.username}`}
                >
                  <img
                    src={
                      (user && (user.id === video.creator.id || user.username === video.creator.username) ? user.avatarUrl : video.creator.avatarUrl) ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${video.creator.username}`
                    }
                    alt={video.creator.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-xl group-hover/avatar:scale-105 transition-transform"
                  />
                  {!video.creator.isFollowing && video.creator.id !== user?.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow(video.creator.id, idx);
                      }}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                      title="Follow kreator"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                    </button>
                  )}
                </div>

                {/* Like Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(video.id, idx);
                  }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div
                    className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-125 shadow-lg ${
                      video.isLiked
                        ? 'bg-rose-500/25 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)] border border-rose-500/40'
                        : 'bg-black/40 text-white hover:bg-black/60 border border-white/10'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${video.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </div>
                  <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5">
                    {video.likesCount}
                  </span>
                </button>

                {/* Comments Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openComments(video.id);
                  }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/10 transition-all active:scale-110 shadow-lg">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5">
                    {video.commentsCount}
                  </span>
                </button>

                {/* Bookmark Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmark(video.id, idx);
                  }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div
                    className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-125 shadow-lg ${
                      video.isBookmarked
                        ? 'bg-amber-500/25 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-500/40'
                        : 'bg-black/40 text-white hover:bg-black/60 border border-white/10'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${video.isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </div>
                  <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5">
                    {video.bookmarksCount}
                  </span>
                </button>

                {/* Share Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(video);
                  }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/10 transition-all active:scale-110 shadow-lg">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5">
                    Share
                  </span>
                </button>

                {/* Rotating Sound Vinyl Disk */}
                <div className="mt-0.5 w-8 h-8 rounded-full bg-[#140f0a] border-2 border-amber-400/80 flex items-center justify-center animate-spin-slow shadow-lg">
                  <Music className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </div>

              {/* BOTTOM VIDEO DETAILS OVERLAY (SMOOTH GRADIENT SCRIM - NO OBSCURING) */}
              <div
                className="absolute left-0 bottom-0 right-14 z-20 pt-16 pb-3 sm:pb-5 px-3.5 sm:px-4 bg-gradient-to-t from-black/95 via-black/50 to-transparent text-white select-none pointer-events-auto"
              >
                {/* Creator name & username */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${video.creator.username}`);
                  }}
                  className="flex items-center gap-2 mb-1 cursor-pointer group/user w-fit"
                >
                  <span className="font-extrabold text-sm text-white tracking-wide group-hover/user:text-amber-300 drop-shadow-md">
                    {user && (user.id === video.creator.id || user.username === video.creator.username)
                      ? (user.fullName || user.username)
                      : (video.creator.fullName || video.creator.username)}
                  </span>
                  <span className="text-xs text-amber-300/80 font-mono">
                    @{video.creator.username}
                  </span>
                  {video.creator.isVerified && (
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-[9px] font-black shadow">
                      ✓
                    </span>
                  )}
                </div>

                {/* Caption (Clean 2 lines max with subtle drop-shadow) */}
                <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] font-medium mb-1.5">
                  {video.description}
                </p>

                {/* Sound Bar Ticker */}
                {video.sound && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-medium bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full w-fit max-w-[220px] truncate border border-white/10 shadow">
                    <Music className="w-3 h-3 shrink-0 text-amber-400 animate-pulse" />
                    <span className="truncate">
                      {video.sound.title} • {video.sound.artist}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* COMMENTS DRAWER MODAL */}
      <AnimatePresence>
        {isCommentOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
            onClick={() => setIsCommentOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md h-full bg-[#120D09] border-l border-white/10 flex flex-col p-5 shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">Comments</h3>
                  <span className="text-xs text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10">
                    {comments.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* AI Instant Trigger Button */}
                  <button
                    onClick={triggerAIComment}
                    disabled={isAiTyping}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:from-amber-500/30 hover:to-yellow-500/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Ask AI Persona</span>
                  </button>
                  <button
                    onClick={() => setIsCommentOpen(false)}
                    className="p-1 rounded-lg text-stone-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {commentLoading ? (
                  <div className="text-center py-10 text-stone-400 text-xs">Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-10 text-stone-500 text-xs">
                    No comments yet. Be the first to start the conversation!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 text-xs">
                      {/* Avatar */}
                      <img
                        src={
                          comment.isAi
                            ? comment.aiCharacter?.avatar
                            : comment.user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.user?.username}`
                        }
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-amber-400/40"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            {comment.isAi ? comment.aiCharacter?.name : comment.user?.username}
                          </span>
                          {comment.isAi && (
                            <span
                              className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase tracking-wider"
                              style={{
                                backgroundColor: `${comment.aiCharacter?.badgeColor}25`,
                                color: comment.aiCharacter?.badgeColor,
                                border: `1px solid ${comment.aiCharacter?.badgeColor}60`,
                              }}
                            >
                              AI • {comment.aiCharacter?.personality}
                            </span>
                          )}
                        </div>
                        <p className="text-stone-300 mt-1 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}

                {/* AI Typing Indicator */}
                {isAiTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span>AI Character is crafting a contextual reaction...</span>
                  </motion.div>
                )}
              </div>

              {/* Quick Reactions Bar */}
              <div className="flex items-center gap-2 py-2 border-t border-white/5">
                {['🔥', '🤤', '❤️', '👏', '😮', '✨'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewCommentText((prev) => prev + emoji)}
                    className="text-base hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Comment Input Box */}
              <form onSubmit={submitComment} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="p-2.5 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


