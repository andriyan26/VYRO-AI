import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Sparkles, Lock, Globe, Users, Loader2 } from 'lucide-react';
import api from '../../services/api';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [soundId, setSoundId] = useState<string>('');
  const [hashtags, setHashtags] = useState<string>('VyroAI, Trending');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE'>('PUBLIC');

  const [categories, setCategories] = useState<any[]>([]);
  const [sounds, setSounds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, sndRes] = await Promise.all([
          api.get('/social/categories'),
          api.get('/social/sounds'),
        ]);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (sndRes.data.success) setSounds(sndRes.data.data);
      } catch (err) {
        console.error('Failed to load upload metadata:', err);
      }
    };
    fetchData();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleAiAssistant = async () => {
    setIsAiGenerating(true);
    try {
      const response = await api.post('/ai/assistant/suggestions', {
        title,
        category: categories.find((c) => c.id === categoryId)?.name || 'Creative',
      });

      if (response.data.success) {
        const { captions, hashtags: aiTags } = response.data.data;
        setDescription(captions[0] || '');
        setHashtags(aiTags.join(', ').replace(/#/g, ''));
      }
    } catch {
      // Ignore
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      setErrorMsg('Please select a video file to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please give your video a title.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('visibility', visibility);
      if (categoryId) formData.append('categoryId', categoryId);
      if (soundId) formData.append('soundId', soundId);
      formData.append('hashtags', hashtags);

      const response = await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        navigate('/');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 select-none">
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Upload Video
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              Creator Studio
            </span>
          </h1>
          <p className="text-xs text-[#A3998F] mt-1">
            Post vertical 9:16 video to the VYRO AI community with instant AI enhancement.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Video Dropzone & Preview */}
        <div className="md:col-span-5 flex flex-col items-center">
          <label className="w-full aspect-[9/16] max-h-[520px] rounded-3xl border-2 border-dashed border-white/20 hover:border-amber-400/80 bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group">
            {videoPreview ? (
              <video
                src={videoPreview}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-center p-6 text-stone-400 group-hover:text-amber-300">
                <UploadCloud className="w-12 h-12 mb-3 stroke-[1.5]" />
                <span className="font-bold text-sm text-white">Select video to upload</span>
                <span className="text-xs text-stone-500 mt-1">Or drag and drop a file</span>
                <span className="text-[11px] text-stone-500 mt-4">MP4, MOV or WEBM • 720p or 1080p</span>
              </div>
            )}
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Right Column: Video Details & AI Assistant */}
        <div className="md:col-span-7 space-y-5">
          {/* AI Creator Assistant Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                AI Creator Assistant
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Automatically generate viral captions, tags, and suggestions.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAiAssistant}
              disabled={isAiGenerating}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isAiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Auto Generate</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">Title</label>
            <input
              type="text"
              placeholder="Give your video a catchy title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">Description & Caption</label>
            <textarea
              rows={4}
              placeholder="What is your video about? Mention @creators or context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#16120e] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="">Select category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">Sound / Music</label>
              <select
                value={soundId}
                onChange={(e) => setSoundId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#16120e] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="">Original Audio</option>
                {sounds.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">Hashtags</label>
            <input
              type="text"
              placeholder="Comma-separated: e.g. VyroAI, Cinematic, Viral"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Visibility Options */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-2">Who can view this video?</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'PUBLIC', label: 'Public', icon: Globe },
                { id: 'FOLLOWERS_ONLY', label: 'Followers Only', icon: Users },
                { id: 'PRIVATE', label: 'Private', icon: Lock },
              ].map((vis) => {
                const Icon = vis.icon;
                return (
                  <button
                    key={vis.id}
                    type="button"
                    onClick={() => setVisibility(vis.id as any)}
                    className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      visibility === vis.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{vis.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3.5 px-6 rounded-xl font-bold text-sm text-[#18120c] bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing & Processing Video...</span>
              </>
            ) : (
              <span>Publish Video Now</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
