import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sliders,
  Send,
  Sparkles,
  Check,
  Eye,
  Plus,
  Maximize2,
  Minimize2,
  EyeOff,
  Clock,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';

interface VideoDetailModalProps {
  video: any;
  onClose: () => void;
  onLikeUpdate?: (videoId: string, isLiked: boolean, count: number) => void;
}

export const VideoDetailModal: React.FC<VideoDetailModalProps> = ({
  video,
  onClose,
  onLikeUpdate,
}) => {
  const { user } = useAuth();
  const { playHeartPop } = useSound();
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(video.likesCount || 0);
  const [isLiked, setIsLiked] = useState<boolean>(video.isLiked || false);
  const [bookmarksCount, setBookmarksCount] = useState<number>(video.bookmarksCount || 0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(video.isBookmarked || false);
  const [isFollowing, setIsFollowing] = useState<boolean>(video.user?.isFollowing || false);

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

  // Comments Sheet State
  const [showComments, setShowComments] = useState<boolean>(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Playback Progress
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lock background scroll completely when modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Ensure video plays smoothly with Sound ON by default
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = isMuted;
      videoRef.current.volume = 1.0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Autoplay sound policy fallback:', err);
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => {
                  setIsPlaying(false);
                });
            }
          });
      }
    }
  }, [video?.id, video?.videoUrl]);

  // Sync mute state without restarting video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Global user gesture listener: Unmute immediately on first interaction
  useEffect(() => {
    const unlockAudio = () => {
      if (videoRef.current && !isMuted) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;
      }
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, [isMuted]);

  // Close on Escape key & 'M' for Mute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Load comments when opened
  useEffect(() => {
    if (showComments && video?.id) {
      const fetchComments = async () => {
        setIsLoadingComments(true);
        try {
          const res = await api.get(`/comments/video/${video.id}`);
          if (res.data.success) {
            setComments(res.data.data);
          }
        } catch {
          // Ignore
        } finally {
          setIsLoadingComments(false);
        }
      };
      fetchComments();
    }
  }, [showComments, video?.id]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 1;
      setCurrentTime(cur);
      setDuration(dur);
      setProgress((cur / dur) * 100);
    }
  };

  const handleLike = async () => {
    playHeartPop();
    const newLiked = !isLiked;
    const newCount = newLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(newLiked);
    setLikesCount(newCount);

    if (onLikeUpdate) {
      onLikeUpdate(video.id, newLiked, newCount);
    }

    try {
      await api.post(`/videos/${video.id}/like`);
    } catch {
      setIsLiked(!newLiked);
      setLikesCount(likesCount);
    }
  };

  const handleBookmark = async () => {
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);
    setBookmarksCount(newBookmarked ? bookmarksCount + 1 : Math.max(0, bookmarksCount - 1));

    try {
      await api.post(`/videos/${video.id}/bookmark`);
    } catch {
      setIsBookmarked(!newBookmarked);
      setBookmarksCount(bookmarksCount);
    }
  };

  const handleFollowToggle = async () => {
    if (!video.user?.id) return;
    try {
      const res = await api.post(`/users/${video.user.id}/follow`);
      if (res.data.success) {
        setIsFollowing(res.data.isFollowing);
      }
    } catch {
      // Ignore
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await api.post('/comments', {
        videoId: video.id,
        content: newComment,
      });

      if (res.data.success) {
        setComments((prev) => [res.data.data, ...prev]);
        setNewComment('');
      }
    } catch {
      // Ignore
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/video/${video.id}`);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleOpenInEditor = () => {
    onClose();
    navigate('/editor');
  };

  const creator = video.user || video.creator || {};

  const modalContent = (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] w-screen h-screen bg-black flex items-center justify-center overflow-hidden select-none animate-in fade-in duration-150"
    >
      {/* Main TikTok / Reels Full-Height Phone Frame Container */}
      <div
        className={`relative w-full h-full ${
          isFullscreen ? 'max-w-none' : 'md:max-w-[440px]'
        } bg-black overflow-hidden flex flex-col justify-between group shadow-2xl`}
      >
        {/* 1. THE VIDEO PLAYER (ALWAYS VISIBLE, AUTOPLAY & LOOPING) */}
        <div
          onClick={togglePlay}
          className="absolute inset-0 bg-black flex items-center justify-center cursor-pointer overflow-hidden"
        >
          <video
            ref={videoRef}
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            loop
            autoPlay
            playsInline
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-cover"
          />

          {/* Pause / Play Center Indicator */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/35 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.8)] transform scale-110">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* 2. TOP UNIFIED BAR: REAL-TIME CLOCK, FULLSCREEN, MUTE & CLOSE */}
        <div className="relative z-30 pt-3 sm:pt-4 px-3 sm:px-4 flex items-center justify-between pointer-events-auto">
          {/* Real-Time Live Clock Badge */}
          <div
            className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-amber-500/35 text-amber-300 text-xs font-mono font-bold flex items-center gap-2 shadow-lg select-none"
            title="Waktu Real-Time Sekarang"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="tracking-wider">{liveTime}</span>
            <span className="text-[10px] text-amber-400/80 font-sans font-semibold">WIB</span>
          </div>

          {/* Right Controls: Fullscreen, Audio Mute & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white transition-all cursor-pointer shadow-lg active:scale-90"
              title={isFullscreen ? 'Layar Standar' : 'Layar Penuh (Fullscreen)'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-amber-400" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white transition-all cursor-pointer shadow-lg active:scale-90"
              title={isMuted ? 'Nyalakan Suara (M)' : 'Matikan Suara (M)'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white transition-all cursor-pointer shadow-lg active:scale-90"
              title="Tutup (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. RIGHT FLOATING ACTION BAR (TIKTOK / REELS COMPACT STYLING - ZERO OVERFLOW) */}
        <div
          className="absolute right-2 sm:right-3 bottom-4 sm:bottom-6 z-20 flex flex-col items-center gap-2 sm:gap-2.5 select-none opacity-100"
        >
          {/* Creator Avatar with Follow (+) Button */}
          <div className="relative mb-1">
            <div
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                navigate(`/profile/${creator.username}`);
              }}
              className="cursor-pointer group/avatar"
              title={`Lihat profil @${creator.username}`}
            >
              <img
                src={
                  (user && (user.id === creator.id || user.username === creator.username) ? user.avatarUrl : creator.avatarUrl) ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${creator.username || 'user'}`
                }
                alt={creator.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-xl group-hover/avatar:scale-105 transition-transform"
              />
            </div>
            {!isFollowing && creator.id !== user?.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollowToggle();
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
              handleLike();
            }}
            className="flex flex-col items-center group/btn cursor-pointer"
          >
            <div
              className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-125 shadow-lg ${
                isLiked
                  ? 'bg-rose-500/25 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)] border border-rose-500/40'
                  : 'bg-black/40 text-white hover:bg-black/60 border border-white/10'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </div>
            <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5">
              {likesCount}
            </span>
          </button>

          {/* Comments Button (Opens Slide-up Sheet) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowComments(!showComments);
            }}
            className="flex flex-col items-center group/btn cursor-pointer"
          >
            <div className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/10 transition-all active:scale-110 shadow-lg">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5">
              {comments.length || video.commentsCount || 0}
            </span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBookmark();
            }}
            className="flex flex-col items-center group/btn cursor-pointer"
          >
            <div
              className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-125 shadow-lg ${
                isBookmarked
                  ? 'bg-amber-500/25 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-500/40'
                  : 'bg-black/40 text-white hover:bg-black/60 border border-white/10'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            </div>
            <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5">
              {bookmarksCount}
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="flex flex-col items-center gap-0.5 group/btn cursor-pointer"
          >
            <div className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/10 transition-all active:scale-110 shadow-lg">
              {copiedShare ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {copiedShare ? 'Tersalin' : 'Share'}
            </span>
          </button>

          {/* Edit in CapCut Studio Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenInEditor();
            }}
            className="p-2 rounded-full bg-amber-500 text-stone-950 font-black shadow-lg hover:bg-amber-400 active:scale-95 transition-all cursor-pointer"
            title="Buka video ini di CapCut Studio Editor"
          >
            <Sliders className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Rotating Vinyl Audio Disk */}
          <div className="mt-0.5 w-8 h-8 rounded-full bg-stone-950 border-2 border-amber-400/80 flex items-center justify-center animate-spin-slow shadow-lg">
            <Music className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>

        {/* 4. BOTTOM FLOATING VIDEO CAPTION & CREATOR INFO (SMOOTH GRADIENT SCRIM) */}
        <div
          className="absolute left-0 bottom-0 right-14 z-20 pt-16 pb-3 px-3.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white select-none pointer-events-auto opacity-100"
        >
          {/* Creator name & username */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              navigate(`/profile/${creator.username}`);
            }}
            className="flex items-center gap-2 mb-1 cursor-pointer w-fit group"
          >
            <span className="font-extrabold text-sm text-white tracking-wide group-hover:text-amber-300 drop-shadow-md">
              {user && (user.id === creator.id || user.username === creator.username)
                ? (user.fullName || user.username)
                : (creator.fullName || creator.username)}
            </span>
            <span className="text-xs text-amber-300/80 font-mono">
              @{creator.username}
            </span>
            {creator.isVerified && (
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-[9px] font-black shadow">
                ✓
              </span>
            )}
          </div>

          {/* Title & Caption */}
          <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] font-medium mb-1.5">
            {video.title} {video.description ? `— ${video.description}` : ''}
          </p>

          {/* Audio Ticker Pill */}
          {video.sound && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-medium bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full w-fit max-w-[220px] truncate border border-white/10 shadow">
              <Music className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
              <span className="truncate">{video.sound.title} • {video.sound.artist}</span>
            </div>
          )}

          {/* Seekbar Progress Line */}
          <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-amber-400 rounded-full transition-all duration-150"
            />
          </div>
        </div>

        {/* 5. SLIDE-UP COMMENTS DRAWER (TIKTOK / REELS BOTTOM SHEET) */}
        {showComments && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 top-[35%] z-30 bg-[#0e111a]/95 backdrop-blur-2xl border-t border-white/15 rounded-t-3xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
          >
            {/* Sheet Header */}
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#121624]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Komentar ({comments.length || video.commentsCount || 0})
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Active
                </span>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-[#090b12]">
              {isLoadingComments ? (
                <div className="py-8 text-center text-xs text-stone-400">Memuat komentar...</div>
              ) : comments.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500">
                  Belum ada komentar. Jadilah yang pertama berkomentar!
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5 items-start text-xs">
                    <img
                      src={c.user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.user?.username || 'cmt'}`}
                      alt={c.user?.username}
                      className="w-8 h-8 rounded-full object-cover border border-white/15 shrink-0 mt-0.5"
                    />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white text-[11px]">
                          {c.user?.fullName || c.user?.username}
                        </span>
                        {c.isAiGenerated && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            AI {c.aiPersona || 'Reaction'}
                          </span>
                        )}
                      </div>
                      <p className="text-stone-300 text-[11px] leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="p-3 border-t border-white/10 bg-[#121624] flex gap-2 shrink-0">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis komentar atau tanya AI..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-stone-950 font-bold transition-all disabled:opacity-40 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
