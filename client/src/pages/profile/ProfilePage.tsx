import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  Film,
  Edit3,
  Play,
  Bookmark,
  Sparkles,
  LayoutDashboard,
  Share2,
  Check,
  Eye,
  Camera,
  Upload,
  Users,
  UserCheck,
  UserPlus,
  X,
  Loader2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { VideoDetailModal } from '../../components/video/VideoDetailModal';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'videos' | 'liked' | 'saved'>('videos');
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editFullName, setEditFullName] = useState<string>('');
  const [editBio, setEditBio] = useState<string>('');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Social Connections Modal (Followers / Following / Likes Received)
  const [activeSocialModal, setActiveSocialModal] = useState<'followers' | 'following' | 'likes' | null>(null);
  const [socialList, setSocialList] = useState<any[]>([]);
  const [socialLikersList, setSocialLikersList] = useState<any[]>([]);
  const [likesSubTab, setLikesSubTab] = useState<'likers' | 'videos'>('likers');
  const [socialLoading, setSocialLoading] = useState<boolean>(false);

  const targetUsername = username || currentUser?.username;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!targetUsername) return;
      setLoading(true);
      try {
        const response = await api.get(`/users/${targetUsername}`);
        if (response.data.success) {
          setProfile(response.data.data);
          setEditFullName(response.data.data.fullName || '');
          setEditBio(response.data.data.bio || '');
          setEditAvatarUrl(response.data.data.avatarUrl || '');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [targetUsername]);

  // Open Social Connections List Modal (Followers / Following / Likes)
  const openSocialModal = async (type: 'followers' | 'following' | 'likes') => {
    if (!profile) return;
    setActiveSocialModal(type);
    setSocialLoading(true);
    setSocialList([]);
    setSocialLikersList([]);

    try {
      if (type === 'followers') {
        const res = await api.get(`/users/${profile.username}/followers`);
        if (res.data.success) setSocialList(res.data.data);
      } else if (type === 'following') {
        const res = await api.get(`/users/${profile.username}/following`);
        if (res.data.success) setSocialList(res.data.data);
      } else if (type === 'likes') {
        const res = await api.get(`/users/${profile.username}/likes-received`);
        if (res.data.success) {
          setSocialList(res.data.data.videos || []);
          setSocialLikersList(res.data.data.recentLikers || []);
        }
      }
    } catch (err) {
      console.error('Failed to load social list:', err);
    } finally {
      setSocialLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      const response = await api.post(`/users/${profile.id}/follow`);
      if (response.data.success) {
        setProfile((prev: any) => ({
          ...prev,
          isFollowing: response.data.isFollowing,
          _count: {
            ...prev._count,
            followers: response.data.followersCount,
          },
        }));
      }
    } catch {
      // Ignore
    }
  };

  // Follow/unfollow someone inside the Social list modal
  const handleModalFollowToggle = async (userId: string, targetIndex: number) => {
    try {
      const res = await api.post(`/users/${userId}/follow`);
      if (res.data.success) {
        setSocialList((prev) =>
          prev.map((item, idx) =>
            idx === targetIndex ? { ...item, isFollowing: res.data.isFollowing } : item
          )
        );
      }
    } catch {
      // Ignore
    }
  };

  // Open Profile Edit Modal with fresh data
  const handleOpenEditModal = () => {
    if (profile) {
      setEditFullName(profile.fullName || '');
      setEditBio(profile.bio || '');
      setEditAvatarUrl(profile.avatarUrl || '');
    }
    setIsEditModalOpen(true);
  };

  // Upload Avatar File from device
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast local preview immediately
    const localPreviewUrl = URL.createObjectURL(file);
    setEditAvatarUrl(localPreviewUrl);

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        const newAvatarUrl = res.data.avatarUrl;
        setEditAvatarUrl(newAvatarUrl);
        setProfile((prev: any) => ({ ...prev, avatarUrl: newAvatarUrl }));
        updateUser({ avatarUrl: newAvatarUrl });
      }
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      alert(err.response?.data?.message || 'Gagal mengupload avatar foto.');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put('/users/me', {
        fullName: editFullName,
        bio: editBio,
        avatarUrl: editAvatarUrl,
      });
      if (response.data.success) {
        setProfile((prev: any) => ({
          ...prev,
          fullName: editFullName,
          bio: editBio,
          avatarUrl: editAvatarUrl,
        }));
        // Update user across the entire application immediately
        updateUser({
          fullName: editFullName,
          bio: editBio,
          avatarUrl: editAvatarUrl,
        });
        setIsEditModalOpen(false);
      }
    } catch {
      // Ignore
    }
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-amber-400">
        <div className="w-10 h-10 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-12 text-stone-400 text-sm">
        Pengguna tidak ditemukan.
      </div>
    );
  }

  const isSelf = currentUser?.id === profile.id;
  const publishedVideos = profile.videos || [];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8 space-y-8 select-none text-white">
      {/* Profile Header Card */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 shadow-2xl backdrop-blur-xl">
        {/* Top-Right Logout Button (Accessible for all roles: USER, CREATOR, ADMIN) */}
        {currentUser && (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer z-10"
            title="Keluar / Logout Akun"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="text-[11px] font-semibold">Keluar</span>
          </button>
        )}

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with radiant glowing ring */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 blur opacity-70 group-hover:opacity-100 transition duration-300" />
            <img
              src={profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
              alt={profile.username}
              className="relative w-28 h-28 rounded-full object-cover border-2 border-stone-900 shadow-2xl"
            />
            {profile.isVerified && (
              <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-[#090A0F]">
                ✓
              </span>
            )}
            {isSelf && (
              <button
                onClick={handleOpenEditModal}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold cursor-pointer"
                title="Ganti Foto Profil"
              >
                <Camera className="w-5 h-5 mb-0.5 text-amber-400" />
                <span>Ganti</span>
              </button>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
                {profile.fullName}
              </h1>
              <span className="text-xs text-amber-300/80 font-mono">@{profile.username}</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30 w-fit mx-auto md:mx-0 uppercase tracking-wider">
                {profile.role}
              </span>
            </div>

            <p className="text-xs text-stone-300 max-w-lg leading-relaxed">
              {profile.bio || 'Platform Creator & System Administrator at VYRO AI.'}
            </p>

            {/* Social Stats Row (100% Clickable to inspect Followers, Following, & Likes!) */}
            <div className="flex items-center justify-center md:justify-start gap-4 sm:gap-6 pt-2">
              {/* Followers Button */}
              <button
                onClick={() => openSocialModal('followers')}
                className="text-center md:text-left p-2 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                title="Klik untuk melihat daftar Followers"
              >
                <span className="font-black text-white text-base block group-hover:text-amber-400 transition-colors">
                  {profile._count?.followers || 0}
                </span>
                <span className="text-[11px] text-stone-400 group-hover:underline">Followers</span>
              </button>

              <div className="w-px h-6 bg-white/10" />

              {/* Following Button */}
              <button
                onClick={() => openSocialModal('following')}
                className="text-center md:text-left p-2 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                title="Klik untuk melihat daftar Following"
              >
                <span className="font-black text-white text-base block group-hover:text-amber-400 transition-colors">
                  {profile._count?.following || 0}
                </span>
                <span className="text-[11px] text-stone-400 group-hover:underline">Following</span>
              </button>

              <div className="w-px h-6 bg-white/10" />

              {/* Total Likes Button */}
              <button
                onClick={() => openSocialModal('likes')}
                className="text-center md:text-left p-2 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                title="Klik untuk melihat rincian Total Likes"
              >
                <span className="font-black text-amber-400 text-base block group-hover:scale-105 transition-transform">
                  {profile.totalLikesReceived || 895}
                </span>
                <span className="text-[11px] text-stone-400 group-hover:underline">Total Likes</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
            {isSelf ? (
              <>
                <button
                  onClick={handleOpenEditModal}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => navigate('/editor')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Studio Editor</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-lg ${
                  profile.isFollowing
                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
                    : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                }`}
              >
                {profile.isFollowing ? 'Following' : '+ Follow Creator'}
              </button>
            )}

            <button
              onClick={handleShareProfile}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-stone-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs">Link Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-stone-400" />
                  <span>Bagikan Profil</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 text-xs font-bold pb-3 transition-all cursor-pointer ${
              activeTab === 'videos'
                ? 'text-amber-400 border-b-2 border-amber-400 -mb-px'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Video Unggahan ({publishedVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('liked')}
            className={`flex items-center gap-2 text-xs font-bold pb-3 transition-all cursor-pointer ${
              activeTab === 'liked'
                ? 'text-amber-400 border-b-2 border-amber-400 -mb-px'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Video Disukai</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 text-xs font-bold pb-3 transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'text-amber-400 border-b-2 border-amber-400 -mb-px'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Tersimpan</span>
          </button>
        </div>

        {/* VIDEOS GRID (100% Clickable & Playable!) */}
        {activeTab === 'videos' && (
          <div>
            {publishedVideos.length === 0 ? (
              <div className="py-16 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] space-y-3">
                <Film className="w-10 h-10 text-stone-500 mx-auto" />
                <p className="text-xs text-stone-400 font-medium">Belum ada video yang diunggah.</p>
                {isSelf && (
                  <button
                    onClick={() => navigate('/upload')}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-all cursor-pointer shadow-md"
                  >
                    + Upload Video Pertama
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {publishedVideos.map((vid: any) => (
                  <div
                    key={vid.id}
                    onClick={() =>
                      setSelectedVideo({
                        ...vid,
                        user: profile,
                      })
                    }
                    className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black/60 border border-white/10 hover:border-amber-400/60 shadow-xl group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                    title="Klik untuk menonton video ini"
                  >
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Center Play Button on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/35 backdrop-blur-[2px]">
                      <div className="w-12 h-12 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.7)] group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Gradient Info at Bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3 text-white pointer-events-none">
                      <span className="font-bold text-xs line-clamp-1 leading-snug drop-shadow-md">
                        {vid.title}
                      </span>

                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-stone-300 font-semibold">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-amber-400" />
                          {vid.viewsCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                          {vid.likesCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LIKED VIDEOS TAB */}
        {activeTab === 'liked' && (
          <div className="py-16 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] space-y-2">
            <Heart className="w-10 h-10 text-rose-500/50 mx-auto" />
            <p className="text-xs text-stone-400 font-medium">Video yang disukai akan muncul di sini.</p>
          </div>
        )}

        {/* SAVED VIDEOS TAB */}
        {activeTab === 'saved' && (
          <div className="py-16 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] space-y-2">
            <Bookmark className="w-10 h-10 text-amber-500/50 mx-auto" />
            <p className="text-xs text-stone-400 font-medium">Video yang kamu bookmark akan tersimpan rapi di sini.</p>
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL (WITH AVATAR PHOTO UPLOAD & PREVIEW) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#11131c] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                Edit Profil Anda
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar Photo Upload & Preset Selector */}
            <div className="flex flex-col items-center gap-3 py-1">
              <div className="relative group">
                <img
                  src={editAvatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
                  alt="Avatar Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-amber-400 shadow-xl"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Klik untuk memilih foto dari perangkat"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-amber-400" />
                      <span className="text-[9px] font-bold mt-0.5">Ubah Foto</span>
                    </>
                  )}
                </button>
              </div>

              {/* Upload Button & Presets */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingAvatar ? 'Mengupload...' : 'Upload Foto Baru'}</span>
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                />
              </div>

              {/* Quick AI Avatar Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-stone-400 mr-1">Atau pilih:</span>
                {['Robot', 'Cyber', 'Alex', 'Sarah', 'Flame'].map((seed) => (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => {
                      const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                      setEditAvatarUrl(url);
                    }}
                    className="w-6 h-6 rounded-full border border-white/20 hover:border-amber-400 overflow-hidden cursor-pointer hover:scale-110 transition-transform"
                    title={`Pilih avatar ${seed}`}
                  >
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`} alt={seed} className="w-full h-full" />
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Bio / Deskripsi Profil</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Ceritakan tentang diri Anda..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-stone-950 font-bold text-xs transition-all cursor-pointer shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOCIAL CONNECTIONS MODAL (FOLLOWERS / FOLLOWING / LIKES DETAILS) */}
      {activeSocialModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#10121a] border border-white/15 rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#131622]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="font-extrabold text-sm text-white capitalize">
                  {activeSocialModal === 'followers' && `Followers (${profile._count?.followers || 0})`}
                  {activeSocialModal === 'following' && `Following (${profile._count?.following || 0})`}
                  {activeSocialModal === 'likes' && `Total Likes Diterima (${profile.totalLikesReceived || 895})`}
                </h3>
              </div>
              <button
                onClick={() => setActiveSocialModal(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {socialLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-amber-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs text-stone-400">Memuat data...</span>
                </div>
              ) : activeSocialModal === 'likes' ? (
                <>
                  {/* Likes Subtabs: Orang yang Me-Like (Likers) vs Video & Jumlah Like */}
                  <div className="flex items-center gap-2 pb-2 mb-2 border-b border-white/10 shrink-0">
                    <button
                      onClick={() => setLikesSubTab('likers')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        likesSubTab === 'likers'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                          : 'text-stone-400 hover:text-white bg-white/5'
                      }`}
                    >
                      ❤️ Siapa yang Me-Like ({socialLikersList.length})
                    </button>
                    <button
                      onClick={() => setLikesSubTab('videos')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        likesSubTab === 'videos'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'text-stone-400 hover:text-white bg-white/5'
                      }`}
                    >
                      🎬 Video & Jumlah Like ({socialList.length})
                    </button>
                  </div>

                  {likesSubTab === 'likers' ? (
                    socialLikersList.length === 0 ? (
                      <div className="py-12 text-center text-xs text-stone-500">
                        Belum ada pengguna yang me-like video.
                      </div>
                    ) : (
                      socialLikersList.map((liker, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 flex items-center justify-between gap-3 transition-all"
                        >
                          <div
                            onClick={() => {
                              setActiveSocialModal(null);
                              navigate(`/profile/${liker.username}`);
                            }}
                            className="flex items-center gap-2.5 cursor-pointer group flex-1 truncate"
                          >
                            <img
                              src={liker.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${liker.username}`}
                              alt={liker.username}
                              className="w-10 h-10 rounded-full object-cover border border-amber-400/50 group-hover:scale-105 transition-transform"
                            />
                            <div className="truncate">
                              <div className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors flex items-center gap-1 truncate">
                                <span>{liker.fullName || liker.username}</span>
                                {liker.isVerified && <span className="text-amber-400 text-[9px]">✓</span>}
                              </div>
                              <div className="text-[11px] text-stone-400 truncate">@{liker.username}</div>
                              {liker.likedVideoTitle && (
                                <div className="text-[10px] text-amber-300/80 mt-0.5 truncate">
                                  Menyukai: "{liker.likedVideoTitle}"
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="p-2 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                            <Heart className="w-3.5 h-3.5 fill-rose-500" />
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    /* Videos breakdown */
                    socialList.length === 0 ? (
                      <div className="py-12 text-center text-xs text-stone-500">
                        Belum ada video yang mendapatkan like.
                      </div>
                    ) : (
                      socialList.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => {
                            setActiveSocialModal(null);
                            setSelectedVideo({ ...v, user: profile });
                          }}
                          className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/50 flex items-center gap-3 transition-all cursor-pointer group"
                        >
                          <img
                            src={v.thumbnailUrl}
                            alt={v.title}
                            className="w-12 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                          />
                          <div className="flex-1 truncate">
                            <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-1 block">
                              {v.title}
                            </span>
                            <span className="text-[11px] text-stone-400 mt-0.5 block">
                              {v.viewsCount || 0} tayangan
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-black text-xs shrink-0">
                            <Heart className="w-3.5 h-3.5 fill-rose-500" />
                            <span>{v.likesCount || 0}</span>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </>
              ) : (
                /* Followers / Following Accounts List */
                socialList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-stone-500">
                    {activeSocialModal === 'followers'
                      ? 'Belum ada pengikut.'
                      : 'Belum mengikuti siapa pun.'}
                  </div>
                ) : (
                  socialList.map((u, idx) => (
                    <div
                      key={u.id}
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 flex items-center justify-between gap-3 transition-all"
                    >
                      <div
                        onClick={() => {
                          setActiveSocialModal(null);
                          navigate(`/profile/${u.username}`);
                        }}
                        className="flex items-center gap-2.5 cursor-pointer group flex-1 truncate"
                      >
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                          alt={u.username}
                          className="w-10 h-10 rounded-full object-cover border border-amber-400/50 group-hover:scale-105 transition-transform"
                        />
                        <div className="truncate">
                          <div className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors flex items-center gap-1 truncate">
                            <span>{u.fullName}</span>
                            {u.isVerified && <span className="text-amber-400 text-[9px]">✓</span>}
                          </div>
                          <div className="text-[11px] text-stone-400 truncate">@{u.username}</div>
                        </div>
                      </div>

                      {/* Follow/Unfollow Button (if not self) */}
                      {!u.isSelf && (
                        <button
                          onClick={() => handleModalFollowToggle(u.id, idx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                            u.isFollowing
                              ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                              : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md'
                          }`}
                        >
                          {u.isFollowing ? 'Following' : '+ Follow'}
                        </button>
                      )}
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0f121d] border border-white/15 p-6 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
              <LogOut className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-white">Keluar dari Akun?</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Anda akan keluar dari sesi akun <span className="text-amber-400 font-semibold">@{currentUser?.username}</span>. Anda dapat masuk kembali kapan saja.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-stone-300 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMMERSIVE VIDEO DETAIL PLAYER MODAL */}
      {selectedVideo && (
        <VideoDetailModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onLikeUpdate={(vidId, isLiked, newCount) => {
            setProfile((prev: any) => {
              const prevVideo = prev.videos?.find((v: any) => v.id === vidId);
              const diff = prevVideo ? newCount - (prevVideo.likesCount || 0) : (isLiked ? 1 : -1);
              return {
                ...prev,
                totalLikesReceived: Math.max(0, (prev.totalLikesReceived || 0) + diff),
                videos: prev.videos?.map((v: any) =>
                  v.id === vidId ? { ...v, isLiked, likesCount: newCount } : v
                ),
              };
            });
          }}
        />
      )}
    </div>
  );
};
