import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Scissors,
  Sparkles,
  Sliders,
  Type,
  Music,
  Download,
  Film,
  Save,
  Check,
  Loader2,
  Upload,
  Volume2,
  VolumeX,
  Trash2,
  Plus,
  Minus,
  Smile,
  FileAudio,
  Wand2,
  RotateCcw,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  ArrowLeft,
  Maximize2,
  Layers,
} from 'lucide-react';
import api from '../../services/api';

type TabType = 'media' | 'audio' | 'filters' | 'text' | 'stickers' | 'speed' | 'timeline';

// Rich Font Presets for Viral Reels / TikTok / CapCut
export interface FontOption {
  id: string;
  name: string;
  fontFamily: string;
  category: string;
  previewClass?: string;
}

const FONT_OPTIONS: FontOption[] = [
  { id: 'bebas', name: 'Bebas Neue', fontFamily: "'Bebas Neue', sans-serif", category: 'Viral Reels' },
  { id: 'anton', name: 'Anton (Impact)', fontFamily: "'Anton', sans-serif", category: 'Bold Punch Meme' },
  { id: 'outfit', name: 'Outfit Pro', fontFamily: "'Outfit', sans-serif", category: 'Modern Geometric' },
  { id: 'montserrat', name: 'Montserrat', fontFamily: "'Montserrat', sans-serif", category: 'Clean Sans' },
  { id: 'syne', name: 'Syne Avant', fontFamily: "'Syne', sans-serif", category: 'Trendy Headline' },
  { id: 'playfair', name: 'Playfair Display', fontFamily: "'Playfair Display', serif", category: 'Luxury Editorial' },
  { id: 'cinzel', name: 'Cinzel Film', fontFamily: "'Cinzel', serif", category: 'Epic Movie' },
  { id: 'pacifico', name: 'Pacifico', fontFamily: "'Pacifico', cursive", category: 'Aesthetic Chill' },
  { id: 'caveat', name: 'Caveat Notes', fontFamily: "'Caveat', cursive", category: 'Handwritten' },
  { id: 'orbitron', name: 'Orbitron Tech', fontFamily: "'Orbitron', monospace", category: 'Cyber Sci-Fi' },
  { id: 'bungee', name: 'Bungee Pop', fontFamily: "'Bungee', cursive", category: 'Retro Gaming' },
  { id: 'jakarta', name: 'Jakarta Sans', fontFamily: "'Plus Jakarta Sans', sans-serif", category: 'Minimal Tech' },
];

// Text Background Styles
export interface TextStyleOption {
  id: string;
  name: string;
  badge: string;
  bgClass: string;
}

const TEXT_STYLES: TextStyleOption[] = [
  { id: 'glass', name: 'Glass Blur', badge: 'Glass', bgClass: 'bg-black/60 backdrop-blur-md border border-white/25 shadow-xl' },
  { id: 'neon', name: 'Neon Glow', badge: 'Glow', bgClass: 'bg-amber-950/80 border border-amber-400/80 shadow-[0_0_20px_#f59e0b]' },
  { id: 'solid-dark', name: 'Solid Black', badge: 'Solid', bgClass: 'bg-black/90 border border-white/10 shadow-lg' },
  { id: 'gradient-gold', name: 'Sunset Gold', badge: 'Gold', bgClass: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 border border-yellow-300 shadow-xl' },
  { id: 'outline', name: 'Stroke Only', badge: 'Stroke', bgClass: 'bg-transparent [text-shadow:_0_0_8px_rgba(0,0,0,1),_0_0_3px_rgba(0,0,0,1)]' },
  { id: 'none', name: 'Clean Transparent', badge: 'Clean', bgClass: 'bg-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]' },
];

const COLOR_SWATCHES = [
  '#FFFFFF',
  '#F59E0B',
  '#EF4444',
  '#10B981',
  '#38BDF8',
  '#EC4899',
  '#A855F7',
  '#FBBF24',
  '#000000',
];

export const VideoEditorPage: React.FC = () => {
  const navigate = useNavigate();

  // Current active inspector tab
  const [activeTab, setActiveTab] = useState<TabType>('text');

  // Video Media State
  const [videoSrc, setVideoSrc] = useState<string>('/uploads/videos/konsep_login.mp4');
  const [videoFilename, setVideoFilename] = useState<string>('konsep_login.mp4');
  const [videoTitle, setVideoTitle] = useState<string>('Pro CapCut Edit');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(5);

  // Audio & Sound Track State
  const [isOriginalMuted, setIsOriginalMuted] = useState<boolean>(false);
  const [originalVolume, setOriginalVolume] = useState<number>(100);
  const [bgMusic, setBgMusic] = useState<{ id?: string; title: string; url: string; isExtracted?: boolean } | null>(null);
  const [bgMusicVolume, setBgMusicVolume] = useState<number>(80);
  const [previewingAudio, setPreviewingAudio] = useState<string | null>(null);
  const [isExtractingSound, setIsExtractingSound] = useState<boolean>(false);

  // Editing parameters
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(5);
  const [speed, setSpeed] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<string>('warm-gold');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);

  // --- TEXT CUSTOMIZATION & POSITIONING STATE ---
  const [overlayText, setOverlayText] = useState<string>('VYRO AI ✨');
  const [selectedFont, setSelectedFont] = useState<string>('bebas');
  const [fontSize, setFontSize] = useState<number>(26);
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [textStyle, setTextStyle] = useState<string>('glass');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [textPosX, setTextPosX] = useState<number>(50); // percentage 0-100%
  const [textPosY, setTextPosY] = useState<number>(82); // percentage 0-100%
  const [isDraggingText, setIsDraggingText] = useState<boolean>(false);

  // Manual micro-adjustment helpers for Text
  const stepFontSize = (delta: number) => {
    setFontSize((prev) => Math.max(10, Math.min(80, prev + delta)));
  };

  const stepTextPosX = (delta: number) => {
    setTextPosX((prev) => Math.max(0, Math.min(100, prev + delta)));
  };

  const stepTextPosY = (delta: number) => {
    setTextPosY((prev) => Math.max(0, Math.min(100, prev + delta)));
  };

  const resetTextConfig = () => {
    setFontSize(26);
    setTextPosX(50);
    setTextPosY(82);
    setTextAlign('center');
    setTextColor('#FFFFFF');
    setTextStyle('glass');
  };

  // --- STICKER & CUSTOM IMAGE STATE WITH BACKGROUND REMOVAL ---
  const [activeSticker, setActiveSticker] = useState<string>('🔥 VIRAL');
  const [customStickerImage, setCustomStickerImage] = useState<string | null>(null);
  const [originalStickerImage, setOriginalStickerImage] = useState<string | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState<boolean>(false);
  const [bgRemoveTolerance, setBgRemoveTolerance] = useState<number>(28);
  const [stickerPosX, setStickerPosX] = useState<number>(50); // percentage 0-100%
  const [stickerPosY, setStickerPosY] = useState<number>(22); // percentage 0-100%
  const [stickerScale, setStickerScale] = useState<number>(110); // px width
  const [stickerRotation, setStickerRotation] = useState<number>(0); // deg
  const [stickerOpacity, setStickerOpacity] = useState<number>(100); // percentage
  const [isDraggingSticker, setIsDraggingSticker] = useState<boolean>(false);

  // Manual micro-adjustment helpers for Sticker
  const stepStickerPosX = (delta: number) => {
    setStickerPosX((prev) => Math.max(0, Math.min(100, prev + delta)));
  };

  const stepStickerPosY = (delta: number) => {
    setStickerPosY((prev) => Math.max(0, Math.min(100, prev + delta)));
  };

  const stepStickerScale = (delta: number) => {
    setStickerScale((prev) => Math.max(40, Math.min(300, prev + delta)));
  };

  // Mode Clean Fullscreen Preview State
  const [isCleanPreview, setIsCleanPreview] = useState<boolean>(false);

  // Export & Draft states
  const [isUploadingMedia, setIsUploadingMedia] = useState<boolean>(false);
  const [isUploadingSticker, setIsUploadingSticker] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<string>('');
  const [draftSaved, setDraftSaved] = useState<boolean>(false);

  // Sound Library List
  const [soundLibrary, setSoundLibrary] = useState<any[]>([
    {
      id: 'snd-1',
      title: 'Golden Sunset Chill (Lo-Fi)',
      artist: 'Lofi Boy x Vyro',
      url: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
      genre: 'Lo-Fi',
      duration: '0:38',
    },
    {
      id: 'snd-2',
      title: 'Cyber City Neon Horizon (Phonk/Synth)',
      artist: 'Synthwave AI',
      url: 'https://cdn.freesound.org/previews/568/568856_11861866-lq.mp3',
      genre: 'Synthwave',
      duration: '0:45',
    },
    {
      id: 'snd-3',
      title: 'Espresso Morning Vibes (Acoustic)',
      artist: 'Acoustic Soul',
      url: 'https://cdn.freesound.org/previews/456/456965_4486188-lq.mp3',
      genre: 'Acoustic',
      duration: '0:30',
    },
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLDivElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoSoundInputRef = useRef<HTMLInputElement>(null);
  const stickerInputRef = useRef<HTMLInputElement>(null);

  const filters = [
    { id: 'none', name: 'Normal', css: '' },
    { id: 'warm-gold', name: 'Warm Gold ✨', css: 'sepia(0.25) saturate(1.4) contrast(1.12)' },
    { id: 'cinematic', name: 'Cinematic', css: 'contrast(1.25) saturate(1.15) brightness(0.95)' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', css: 'hue-rotate(200deg) saturate(1.6) contrast(1.2)' },
    { id: 'bw', name: 'Noir B&W', css: 'grayscale(1) contrast(1.25)' },
    { id: 'vintage', name: 'Vintage 90s', css: 'sepia(0.4) contrast(1.05) brightness(1.05)' },
  ];

  // Load sound library from API
  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const res = await api.get('/social/sounds');
        if (res.data.success && res.data.data.length > 0) {
          const formatted = res.data.data.map((s: any) => ({
            id: s.id,
            title: s.title,
            artist: s.artist,
            url: s.audioUrl,
            genre: 'Popular',
            duration: `${s.duration}s`,
          }));
          setSoundLibrary(formatted);
        }
      } catch {
        // Fallback to initial library
      }
    };
    fetchSounds();
  }, []);

  // Sync background audio playback with video
  useEffect(() => {
    if (bgMusic && bgMusic.url) {
      if (!bgAudioRef.current) {
        bgAudioRef.current = new Audio(bgMusic.url);
      } else {
        bgAudioRef.current.src = bgMusic.url;
      }
      bgAudioRef.current.volume = (bgMusicVolume / 100);
    } else {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current = null;
      }
    }
  }, [bgMusic]);

  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = (bgMusicVolume / 100);
    }
  }, [bgMusicVolume]);

  // Keyboard shortcut: 'C' toggles Mode Clean Fullscreen Preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'c' || e.key === 'C') {
        setIsCleanPreview((prev) => !prev);
      } else if (e.key === 'Escape' && isCleanPreview) {
        setIsCleanPreview(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCleanPreview]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      bgAudioRef.current?.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      if (bgAudioRef.current) {
        bgAudioRef.current.currentTime = videoRef.current.currentTime;
        bgAudioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration || 5;
      setDuration(d);
      setTrimEnd(d);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);

      // Loop inside trimmed range
      if (cur >= trimEnd) {
        videoRef.current.currentTime = trimStart;
        if (bgAudioRef.current) {
          bgAudioRef.current.currentTime = trimStart;
        }
      }
    }
  };

  // Upload Custom Video from device
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('media', file);

      const response = await api.post('/editor/upload-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const media = response.data.data;
        setVideoSrc(media.url);
        setVideoFilename(media.filename);
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
        setIsPlaying(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload video');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // Upload Custom Audio OR Video (MP4, MOV, MKV, MP3, WAV, etc.) from device to use as sound
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video') || /\.(mp4|mov|webm|mkv|avi|m4v|flv|3gp|wmv|ts)$/i.test(file.name);
    setIsExtractingSound(true);

    try {
      const formData = new FormData();
      formData.append('sound', file);

      const response = await api.post('/editor/upload-sound', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const soundData = response.data.data;
        const newTrack = {
          title: soundData.title || file.name.replace(/\.[^/.]+$/, ''),
          url: soundData.url,
          isExtracted: isVideo || soundData.isExtracted,
        };
        setBgMusic(newTrack);
        setSoundLibrary((prev) => [
          {
            id: 'custom-' + Date.now(),
            title: newTrack.title,
            artist: isVideo ? '🎬 Audio Diekstrak dari Video (MP4)' : '🎵 File Musik Sendiri',
            url: newTrack.url,
            genre: isVideo ? 'MP4 Video Sound' : 'My Device',
            duration: 'Audio',
          },
          ...prev,
        ]);
        alert(
          isVideo
            ? `Berhasil! Audio dari video "${file.name}" berhasil diekstrak via FFmpeg dan dijadikan Backsound!`
            : `Berhasil! Lagu audio "${file.name}" berhasil ditambahkan ke timeline BGM!`
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengekstrak/mengunggah sound dari file ini.');
    } finally {
      setIsExtractingSound(false);
      e.target.value = '';
    }
  };

  // Extract sound directly from the active video in editor
  const handleExtractFromCurrentVideo = async () => {
    setIsExtractingSound(true);
    try {
      const response = await api.post('/editor/extract-current-sound', {
        videoPath: videoSrc,
      });

      if (response.data.success) {
        const soundData = response.data.data;
        const newTrack = {
          title: soundData.title,
          url: soundData.url,
          isExtracted: true,
        };
        setBgMusic(newTrack);
        setSoundLibrary((prev) => [
          {
            id: 'extracted-' + Date.now(),
            title: newTrack.title,
            artist: 'Ekstrak dari Video Aktif',
            url: newTrack.url,
            genre: 'Video Sound',
            duration: 'Audio',
          },
          ...prev,
        ]);
        alert('Audio dari video saat ini berhasil diekstrak ke track BGM!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal ekstrak audio dari video saat ini.');
    } finally {
      setIsExtractingSound(false);
    }
  };

  const handlePreviewAudio = (url: string) => {
    if (previewingAudio === url) {
      previewAudioRef.current?.pause();
      setPreviewingAudio(null);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      previewAudioRef.current = new Audio(url);
      previewAudioRef.current.play();
      setPreviewingAudio(url);
      previewAudioRef.current.onended = () => setPreviewingAudio(null);
    }
  };

  // --- UPLOAD CUSTOM STICKER IMAGE ---
  const handleStickerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSticker(true);
    try {
      // 1. Create a local preview data URL immediately for instant response
      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        setCustomStickerImage(dataUrl);
        setOriginalStickerImage(dataUrl);
        setActiveSticker(''); // Switch from preset badge to custom sticker image

        // 2. Also send to server
        try {
          const formData = new FormData();
          formData.append('sticker', file);
          const res = await api.post('/editor/upload-sticker', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (res.data.success && res.data.data?.url) {
            // Keep uploaded persistent URL
          }
        } catch {
          // Keep local dataUrl as fallback
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses gambar stiker');
    } finally {
      setIsUploadingSticker(false);
      e.target.value = '';
    }
  };

  // --- HAPUS BACKGROUND (REMOVE BG) CLIENT-SIDE ALGORITHM ---
  const handleRemoveBackground = async (toleranceParam?: number) => {
    const imageToProcess = originalStickerImage || customStickerImage;
    if (!imageToProcess) return;

    setIsRemovingBg(true);
    const tol = toleranceParam !== undefined ? toleranceParam : bgRemoveTolerance;

    try {
      const processedUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not supported'));
            return;
          }

          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          canvas.width = w;
          canvas.height = h;

          ctx.drawImage(img, 0, 0, w, h);
          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;

          // Sample background color along 4 outer edges & corners
          const samples: { r: number; g: number; b: number }[] = [];
          const stepX = Math.max(1, Math.floor(w / 16));
          const stepY = Math.max(1, Math.floor(h / 16));

          for (let x = 0; x < w; x += stepX) {
            const idxTop = (0 * w + x) * 4;
            const idxBottom = ((h - 1) * w + x) * 4;
            samples.push({ r: data[idxTop], g: data[idxTop + 1], b: data[idxTop + 2] });
            samples.push({ r: data[idxBottom], g: data[idxBottom + 1], b: data[idxBottom + 2] });
          }
          for (let y = 0; y < h; y += stepY) {
            const idxLeft = (y * w + 0) * 4;
            const idxRight = (y * w + (w - 1)) * 4;
            samples.push({ r: data[idxLeft], g: data[idxLeft + 1], b: data[idxLeft + 2] });
            samples.push({ r: data[idxRight], g: data[idxRight + 1], b: data[idxRight + 2] });
          }

          // Compute average border background color
          let avgR = 0, avgG = 0, avgB = 0;
          samples.forEach((s) => {
            avgR += s.r;
            avgG += s.g;
            avgB += s.b;
          });
          avgR = Math.round(avgR / samples.length);
          avgG = Math.round(avgG / samples.length);
          avgB = Math.round(avgB / samples.length);

          // Threshold in RGB distance (Euclidean max ~441.67)
          const maxDist = 441.67;
          const thresholdDistance = (tol / 100) * maxDist;

          // Edge-connected flood fill to remove boundary background while protecting interior elements
          const visited = new Uint8Array(w * h);
          const queue: number[] = [];

          // Enqueue all perimeter pixels
          for (let x = 0; x < w; x++) {
            queue.push(0 * w + x);
            queue.push((h - 1) * w + x);
          }
          for (let y = 0; y < h; y++) {
            queue.push(y * w + 0);
            queue.push(y * w + (w - 1));
          }

          let head = 0;
          while (head < queue.length) {
            const pIdx = queue[head++];
            if (visited[pIdx]) continue;
            visited[pIdx] = 1;

            const px = pIdx % w;
            const py = Math.floor(pIdx / w);
            const dIdx = pIdx * 4;

            const r = data[dIdx];
            const g = data[dIdx + 1];
            const b = data[dIdx + 2];

            const dist = Math.sqrt((r - avgR) ** 2 + (g - avgG) ** 2 + (b - avgB) ** 2);

            if (dist <= thresholdDistance) {
              // Smooth boundary feathering
              const feather = thresholdDistance * 0.25;
              if (dist > thresholdDistance - feather && feather > 0) {
                const alphaFactor = (dist - (thresholdDistance - feather)) / feather;
                data[dIdx + 3] = Math.round(data[dIdx + 3] * alphaFactor);
              } else {
                data[dIdx + 3] = 0; // Fully transparent
              }

              // Propagate to 4 neighbors
              if (px > 0 && !visited[pIdx - 1]) queue.push(pIdx - 1);
              if (px < w - 1 && !visited[pIdx + 1]) queue.push(pIdx + 1);
              if (py > 0 && !visited[pIdx - w]) queue.push(pIdx - w);
              if (py < h - 1 && !visited[pIdx + w]) queue.push(pIdx + w);
            }
          }

          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (e) => reject(e);
        img.src = imageToProcess;
      });

      setCustomStickerImage(processedUrl);
    } catch (err: any) {
      alert('Gagal menghapus background: ' + err.message);
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleResetOriginalSticker = () => {
    if (originalStickerImage) {
      setCustomStickerImage(originalStickerImage);
    }
  };

  // --- DRAGGING LOGIC ON VIDEO CANVAS (POINTER EVENTS) ---
  const handlePointerDownText = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDraggingText(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveText = (e: React.PointerEvent) => {
    if (!isDraggingText || !previewCanvasRef.current) return;
    e.stopPropagation();
    const rect = previewCanvasRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    setTextPosX(Math.round(Math.max(5, Math.min(95, rawX))));
    setTextPosY(Math.round(Math.max(5, Math.min(95, rawY))));
  };

  const handlePointerUpText = (e: React.PointerEvent) => {
    if (isDraggingText) {
      setIsDraggingText(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerDownSticker = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDraggingSticker(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveSticker = (e: React.PointerEvent) => {
    if (!isDraggingSticker || !previewCanvasRef.current) return;
    e.stopPropagation();
    const rect = previewCanvasRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    setStickerPosX(Math.round(Math.max(5, Math.min(95, rawX))));
    setStickerPosY(Math.round(Math.max(5, Math.min(95, rawY))));
  };

  const handlePointerUpSticker = (e: React.PointerEvent) => {
    if (isDraggingSticker) {
      setIsDraggingSticker(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Preset Position Setter
  const setTextPresetPosition = (pos: 'top-left' | 'top' | 'top-right' | 'center' | 'bottom-left' | 'bottom' | 'bottom-right') => {
    switch (pos) {
      case 'top-left': setTextPosX(25); setTextPosY(15); break;
      case 'top': setTextPosX(50); setTextPosY(15); break;
      case 'top-right': setTextPosX(75); setTextPosY(15); break;
      case 'center': setTextPosX(50); setTextPosY(50); break;
      case 'bottom-left': setTextPosX(25); setTextPosY(82); break;
      case 'bottom': setTextPosX(50); setTextPosY(82); break;
      case 'bottom-right': setTextPosX(75); setTextPosY(82); break;
    }
  };

  const setStickerPresetPosition = (pos: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right') => {
    switch (pos) {
      case 'top-left': setStickerPosX(20); setStickerPosY(18); break;
      case 'top-right': setStickerPosX(80); setStickerPosY(18); break;
      case 'center': setStickerPosX(50); setStickerPosY(50); break;
      case 'bottom-left': setStickerPosX(20); setStickerPosY(75); break;
      case 'bottom-right': setStickerPosX(80); setStickerPosY(75); break;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess('');

    try {
      const activeFontObj = FONT_OPTIONS.find((f) => f.id === selectedFont);
      const response = await api.post('/editor/export', {
        videoPath: videoSrc,
        trimStart,
        trimEnd,
        speed,
        filter: activeFilter,
        muteOriginalAudio: isOriginalMuted,
        bgMusicUrl: bgMusic?.url || null,
        bgMusicVolume,
        title: videoTitle || 'Exported Studio Video',
        description: `Edited with VYRO AI Studio (CapCut Mode) • Filter: ${activeFilter} • Font: ${activeFontObj?.name || 'Bebas Neue'} • BGM: ${bgMusic?.title || 'None'}`,
        textOverlay: overlayText ? {
          text: overlayText,
          font: activeFontObj?.fontFamily,
          size: fontSize,
          color: textColor,
          x: textPosX,
          y: textPosY,
        } : null,
        stickerOverlay: (customStickerImage || activeSticker) ? {
          sticker: customStickerImage || activeSticker,
          x: stickerPosX,
          y: stickerPosY,
          scale: stickerScale,
          rotation: stickerRotation,
        } : null,
      });

      if (response.data.success) {
        setExportSuccess('Video rendered & published successfully with FFmpeg! Check your feed.');
      }
    } catch (err: any) {
      console.error('Export error:', err);
      alert('Export failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await api.post('/creator/drafts', {
        title: videoTitle + ' - ' + new Date().toLocaleTimeString(),
        editorState: {
          videoSrc,
          trimStart,
          trimEnd,
          speed,
          activeFilter,
          isOriginalMuted,
          bgMusic,
          overlayText,
          selectedFont,
          textPosX,
          textPosY,
          customStickerImage,
          activeSticker,
          stickerPosX,
          stickerPosY,
        },
      });
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    } catch {
      // Ignore
    }
  };

  const computedFilterStyle = () => {
    const preset = filters.find((f) => f.id === activeFilter)?.css || '';
    const adj = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    return `${preset} ${adj}`.trim();
  };

  const currentFontFamily = FONT_OPTIONS.find((f) => f.id === selectedFont)?.fontFamily || "'Bebas Neue', sans-serif";
  const currentTextStyleClass = TEXT_STYLES.find((s) => s.id === textStyle)?.bgClass || '';

  return (
    <div className="h-full flex flex-col bg-[#080604] text-white overflow-hidden select-none">
      {/* Top CapCut-Style Navigation Bar */}
      <div className="h-14 border-b border-white/10 px-3 sm:px-6 flex items-center justify-between shrink-0 bg-[#0f0b08] gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-stone-950 shadow-md shrink-0">
            <Film className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="bg-transparent font-bold text-xs sm:text-sm tracking-wide text-white border-b border-transparent hover:border-white/20 focus:border-amber-400 focus:outline-none max-w-[110px] sm:max-w-[200px] truncate"
              />
              <span className="hidden sm:inline-block text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                CapCut Studio PRO
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-stone-400 block truncate max-w-[120px] sm:max-w-[180px]">{videoFilename}</span>
          </div>
        </div>

        {/* Top Actions: Clean Preview, Import Video, Save Draft, Export */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Fullscreen Preview Button */}
          <button
            onClick={() => setIsCleanPreview(true)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 text-[11px] sm:text-xs font-bold text-amber-300 border border-amber-500/40 shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Pratinjau video layar penuh tanpa toolbar (Tombol C)"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden md:inline">Layar Penuh</span>
          </button>

          {/* Import / Upload Video Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingMedia}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] sm:text-xs font-semibold text-amber-300 border border-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
            title="Upload / Import video baru"
          >
            {isUploadingMedia ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Import</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
          />

          <button
            onClick={handleSaveDraft}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] sm:text-xs font-semibold text-stone-300 transition-all cursor-pointer"
            title="Simpan Draft"
          >
            {draftSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span className="hidden md:inline ml-1">{draftSaved ? 'Saved' : 'Draft'}</span>
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isExporting ? 'Rendering...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-2.5 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* Main Studio Area: Responsive vertical on mobile, horizontal row on desktop */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT TOOLBAR TABS (Desktop Only) */}
        <div className="hidden lg:flex w-18 bg-[#0b0805] border-r border-white/10 flex-col items-center py-4 gap-3 shrink-0">
          {[
            { id: 'media', label: 'Media', icon: Film },
            { id: 'audio', label: 'Audio', icon: Music, badge: bgMusic ? 'ON' : null },
            { id: 'filters', label: 'Filters', icon: Sparkles },
            { id: 'text', label: 'Text', icon: Type, badge: overlayText ? 'Aa' : null },
            { id: 'stickers', label: 'Stickers', icon: Smile, badge: (customStickerImage || activeSticker) ? '✨' : null },
            { id: 'speed', label: 'Speed', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer w-14 ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{tab.label}</span>
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-bold px-1 rounded-full bg-amber-500 text-stone-950">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* CENTER: INTERACTIVE PREVIEW CANVAS WITH FREE DRAGGABLE OVERLAYS (BIG & PROMINENT) */}
        <div className="flex flex-col items-center justify-center p-2 sm:p-4 lg:p-6 bg-[#080604] relative shrink-0 lg:flex-1">
          <div
            ref={previewCanvasRef}
            className="relative aspect-[9/16] h-[38vh] sm:h-[46vh] lg:h-[520px] xl:h-[600px] max-h-[620px] rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 group select-none"
          >
            {/* Background Video Element */}
            <video
              ref={videoRef}
              src={videoSrc}
              muted={isOriginalMuted}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-cover pointer-events-none"
              style={{
                filter: computedFilterStyle(),
              }}
            />

            {/* Play/Pause Button on Canvas (Clicking empty background plays/pauses) */}
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/25 transition-all cursor-pointer z-0"
            >
              <div className="w-14 h-14 rounded-full bg-amber-500/90 text-stone-950 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-110 active:scale-95 transition-transform pointer-events-none">
                {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
              </div>
            </div>

            {/* --- DRAGGABLE & CUSTOMIZABLE STICKER / IMAGE OVERLAY --- */}
            {(customStickerImage || activeSticker) && (
              <div
                style={{
                  position: 'absolute',
                  left: `${stickerPosX}%`,
                  top: `${stickerPosY}%`,
                  transform: `translate(-50%, -50%) rotate(${stickerRotation}deg)`,
                  width: `${stickerScale}px`,
                  opacity: stickerOpacity / 100,
                  cursor: isDraggingSticker ? 'grabbing' : 'grab',
                  touchAction: 'none',
                }}
                onPointerDown={handlePointerDownSticker}
                onPointerMove={handlePointerMoveSticker}
                onPointerUp={handlePointerUpSticker}
                onPointerCancel={handlePointerUpSticker}
                className={`z-20 group/sticker transition-shadow ${
                  activeTab === 'stickers' || isDraggingSticker ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black/50 rounded-xl' : ''
                }`}
                title="Tarik / Drag stiker untuk ubah posisi di video"
              >
                {/* Drag Handle & Coordinates Indicator */}
                {(activeTab === 'stickers' || isDraggingSticker) && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 shadow-lg pointer-events-none whitespace-nowrap">
                    <Move className="w-2.5 h-2.5" />
                    <span>{stickerPosX}%, {stickerPosY}%</span>
                  </div>
                )}

                {/* Render Custom Uploaded Image Sticker */}
                {customStickerImage ? (
                  <img
                    src={customStickerImage}
                    alt="Sticker"
                    className="w-full h-auto object-contain pointer-events-none drop-shadow-xl select-none"
                    draggable={false}
                  />
                ) : (
                  /* Render Social Preset Badge */
                  <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs shadow-lg uppercase tracking-wider text-center pointer-events-none select-none">
                    {activeSticker}
                  </div>
                )}
              </div>
            )}

            {/* --- DRAGGABLE & CUSTOMIZABLE TEXT OVERLAY --- */}
            {overlayText && (
              <div
                style={{
                  position: 'absolute',
                  left: `${textPosX}%`,
                  top: `${textPosY}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: isDraggingText ? 'grabbing' : 'grab',
                  touchAction: 'none',
                  maxWidth: '90%',
                }}
                onPointerDown={handlePointerDownText}
                onPointerMove={handlePointerMoveText}
                onPointerUp={handlePointerUpText}
                onPointerCancel={handlePointerUpText}
                className={`z-20 group/text transition-shadow ${
                  activeTab === 'text' || isDraggingText ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black/50 rounded-2xl' : ''
                }`}
                title="Tarik / Drag teks untuk ubah posisi di mana saja"
              >
                {/* Drag Handle & Coordinates Badge */}
                {(activeTab === 'text' || isDraggingText) && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 shadow-lg pointer-events-none whitespace-nowrap">
                    <Move className="w-2.5 h-2.5" />
                    <span>X: {textPosX}% | Y: {textPosY}%</span>
                  </div>
                )}

                <div
                  style={{
                    fontFamily: currentFontFamily,
                    color: textColor,
                    fontSize: `${fontSize}px`,
                    textAlign: textAlign,
                  }}
                  className={`px-3.5 py-1.5 rounded-2xl inline-block leading-tight select-none ${currentTextStyleClass}`}
                >
                  {overlayText}
                </div>
              </div>
            )}

            {/* Canvas Quick Audio Status Overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOriginalMuted(!isOriginalMuted);
                }}
                className={`p-2 rounded-full backdrop-blur-md border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isOriginalMuted
                    ? 'bg-rose-500/30 text-rose-300 border-rose-500/50'
                    : 'bg-black/60 text-amber-300 border-white/20 hover:bg-black/80'
                }`}
                title={isOriginalMuted ? 'Suara Asli Dimatikan' : 'Matikan Suara Asli Video'}
              >
                {isOriginalMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{isOriginalMuted ? 'Muted' : 'Sound ON'}</span>
              </button>
            </div>
          </div>

          {/* Time Code Info */}
          <div className="mt-2 text-xs text-stone-400 font-mono flex items-center justify-center gap-3">
            <span>{currentTime.toFixed(2)}s / {duration.toFixed(2)}s</span>
            {bgMusic && (
              <span className="text-[11px] text-amber-400 flex items-center gap-1">
                <Music className="w-3 h-3" /> BGM: {bgMusic.title}
              </span>
            )}
          </div>
        </div>

        {/* MOBILE HORIZONTAL TOOLBAR TABS (Only visible on < lg screens) */}
        <div className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-[#0c0906] border-y border-white/10 overflow-x-auto shrink-0 custom-scrollbar">
          {[
            { id: 'text', label: 'Teks & Font', icon: Type, badge: overlayText ? 'Aa' : null },
            { id: 'audio', label: 'Audio & Sound', icon: Music, badge: bgMusic ? 'ON' : null },
            { id: 'stickers', label: 'Stiker & Foto', icon: Smile, badge: (customStickerImage || activeSticker) ? '✨' : null },
            { id: 'media', label: 'Media & Video', icon: Film },
            { id: 'filters', label: 'Filter & Warna', icon: Sparkles },
            { id: 'speed', label: 'Kecepatan', icon: Sliders },
            { id: 'timeline', label: 'Timeline Trim', icon: Scissors },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap text-xs font-bold ${
                  isActive
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-stone-400 hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[8px] font-black px-1 rounded-full bg-amber-500 text-stone-950">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT CAPCUT INSPECTOR DRAWER / PANEL:
            On desktop: w-96 border-l shrink-0
            On mobile: flex-1 overflow-y-auto p-4 bg-[#0f0b08]
        */}
        <div className="flex-1 lg:flex-initial lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 p-3.5 sm:p-5 bg-[#0f0b08] overflow-y-auto space-y-5 custom-scrollbar">
          {/* TAB 1: MEDIA UPLOAD & LIBRARY */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Film className="w-4 h-4" />
                Media & Video Files
              </h3>

              {/* Upload Video Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-2xl border-2 border-dashed border-white/20 hover:border-amber-400/80 bg-white/[0.02] flex flex-col items-center text-center cursor-pointer transition-all group"
              >
                <Upload className="w-8 h-8 text-stone-400 group-hover:text-amber-400 mb-2 transition-colors" />
                <span className="font-bold text-xs text-white">Upload New Video</span>
                <span className="text-[10px] text-stone-400 mt-1">MP4, MOV, WEBM (From PC/Laptop)</span>
              </div>

              {/* Quick Sample Clips */}
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                  Sample Clip Library
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { title: 'Konsep Login 💡', url: '/uploads/videos/konsep_login.mp4' },
                    { title: 'Tokyo Neon 🌧️', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
                    { title: 'Wagyu Sizzle 🥩', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
                    { title: 'Cyber Setup 🖥️', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
                  ].map((clip, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setVideoSrc(clip.url);
                        setVideoTitle(clip.title);
                        setVideoFilename(clip.title);
                        setIsPlaying(false);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                        videoSrc === clip.url
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                      }`}
                    >
                      {clip.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIO & SOUND LIBRARY (BGM + MUTE SUARA ASLI) */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Music className="w-4 h-4" />
                Audio & Sound Controls
              </h3>

              {/* 1. Mute Original Video Audio Toggle */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-white block">Suara Asli Video</span>
                    <span className="text-[10px] text-stone-400">
                      {isOriginalMuted ? 'Suara asli dinonaktifkan (Muted)' : 'Suara asli aktif'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOriginalMuted(!isOriginalMuted)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isOriginalMuted
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-white/10 text-stone-300 hover:bg-white/20'
                    }`}
                  >
                    {isOriginalMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isOriginalMuted ? 'Nonaktif' : 'Aktif'}</span>
                  </button>
                </div>

                {!isOriginalMuted && (
                  <div>
                    <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                      <span>Volume Suara Asli</span>
                      <span>{originalVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      value={originalVolume}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setOriginalVolume(val);
                        if (videoRef.current) videoRef.current.volume = Math.min(1, val / 100);
                      }}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* 2. Upload / Extract Sound from ANY media (MP4, MP3, WAV, MOV, etc.) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-2 border-amber-500/40 space-y-3.5 shadow-lg">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-black text-xs text-amber-200 uppercase tracking-wide">
                      Upload Sound Bebas (Bisa MP4 & MP3)
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-300 block leading-relaxed">
                    Bukan hanya MP3! Kamu bisa upload file <strong className="text-amber-300">Video MP4, MOV, WEBM</strong> atau <strong className="text-amber-300">Lagu MP3, WAV</strong> apa saja — audio langsung diekstrak otomatis via FFmpeg!
                  </span>
                </div>

                {/* Format Badges */}
                <div className="flex flex-wrap gap-1">
                  {['🎬 MP4 Video', '🎬 MOV Video', '🎬 WEBM', '🎵 MP3 Lagu', '🎵 WAV', '🎵 M4A', '⚡ Semua Format'].map((fmt, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  {/* Button 1: Dedicated Video (MP4) Sound Extraction */}
                  <button
                    onClick={() => videoSoundInputRef.current?.click()}
                    disabled={isExtractingSound}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.35)] cursor-pointer disabled:opacity-50"
                  >
                    {isExtractingSound ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                        <span>Mengekstrak Suara Video via FFmpeg...</span>
                      </>
                    ) : (
                      <>
                        <Film className="w-4 h-4 text-stone-950 fill-current" />
                        <span>🎬 + Upload Video (MP4 / MOV) untuk Sound</span>
                      </>
                    )}
                  </button>

                  {/* Button 2: Audio File Upload */}
                  <button
                    onClick={() => audioInputRef.current?.click()}
                    disabled={isExtractingSound}
                    className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 border border-white/15 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Music className="w-3.5 h-3.5 text-amber-400" />
                    <span>🎵 + Upload Lagu Musik (MP3 / WAV / M4A)</span>
                  </button>

                  {/* Button 3: Extract from current video */}
                  <button
                    type="button"
                    onClick={handleExtractFromCurrentVideo}
                    disabled={isExtractingSound}
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <FileAudio className="w-3.5 h-3.5 text-amber-400" />
                    <span>⚡ Ekstrak Suara Video yang Sedang Diputar Saat Ini</span>
                  </button>

                  {/* Input for Video Sound Extraction */}
                  <input
                    ref={videoSoundInputRef}
                    type="file"
                    accept="video/*, .mp4, .mov, .webm, .mkv, .avi, .m4v, .flv, .3gp, .ts, .wmv, */*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />

                  {/* Input for Audio Sound */}
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*, .mp3, .wav, .m4a, .aac, .ogg, .flac, .wma, video/*, .mp4, */*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* 3. Selected Background Music Control */}
              {bgMusic && (
                <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                        Active BGM Track
                      </span>
                      <span className="font-bold text-xs text-white block truncate max-w-[180px]">
                        {bgMusic.title}
                      </span>
                    </div>
                    <button
                      onClick={() => setBgMusic(null)}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors cursor-pointer"
                      title="Hapus background music"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-amber-200 mb-1">
                      <span>BGM Volume</span>
                      <span>{bgMusicVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      value={bgMusicVolume}
                      onChange={(e) => setBgMusicVolume(parseInt(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* 4. Sound Library List */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Sound Library (Pilih Musik)
                </span>
                <div className="space-y-2">
                  {soundLibrary.map((snd) => (
                    <div
                      key={snd.id}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="truncate max-w-[150px]">
                        <span className="font-bold text-xs text-white block truncate">{snd.title}</span>
                        <span className="text-[10px] text-stone-400 block">{snd.artist} • {snd.duration}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePreviewAudio(snd.url)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                          title="Preview musik"
                        >
                          {previewingAudio === snd.url ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>

                        <button
                          onClick={() => setBgMusic(snd)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            bgMusic?.url === snd.url
                              ? 'bg-emerald-500 text-stone-950'
                              : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                          }`}
                        >
                          {bgMusic?.url === snd.url ? 'Used' : 'Add'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COLOR FILTERS & ADJUSTMENTS */}
          {activeTab === 'filters' && (
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Color Grading & LUT Filters
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      activeFilter === f.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm'
                        : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              {/* Fine Tuning Sliders */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Fine Tuning
                </span>

                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                    <span>Brightness</span>
                    <span>{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                    <span>Contrast</span>
                    <span>{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                    <span>Saturation</span>
                    <span>{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RICH TEXT OVERLAY & 100% MANUAL POSITIONING / SIZING */}
          {activeTab === 'text' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Type className="w-4 h-4" />
                  Kustomisasi Teks & Font Lengkap
                </h3>
                <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Manual Bebas 100%
                </span>
              </div>

              {/* Text Input */}
              <div>
                <label className="text-[11px] font-semibold text-stone-300 mb-1 block">Teks Judul / Subtitle</label>
                <input
                  type="text"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  placeholder="Ketik teks di sini..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 1. KONTROL UKURAN FONT (KECIL - GEDE / FONT SIZE) */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-amber-400" />
                    Ukuran Font (Kecil - Gede)
                  </span>
                  <span className="text-amber-300 font-black text-sm bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                    {fontSize}px
                  </span>
                </div>

                {/* Slider with [-] and [+] Micro-adjustment Buttons */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => stepFontSize(-2)}
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-stone-200 flex items-center justify-center transition-all cursor-pointer border border-white/10 shrink-0"
                    title="Perkecil Font (-2px)"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="flex-1 accent-amber-400 cursor-pointer h-2 bg-white/10 rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={() => stepFontSize(2)}
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-stone-200 flex items-center justify-center transition-all cursor-pointer border border-white/10 shrink-0"
                    title="Perbesar Font (+2px)"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Size Chips */}
                <div>
                  <span className="text-[10px] font-semibold text-stone-400 block mb-1.5">Pilihan Cepat Ukuran:</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { size: 16, label: '16px' },
                      { size: 22, label: '22px' },
                      { size: 28, label: '28px' },
                      { size: 38, label: '38px' },
                      { size: 52, label: '52px' },
                    ].map((sz) => (
                      <button
                        key={sz.size}
                        type="button"
                        onClick={() => setFontSize(sz.size)}
                        className={`py-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
                          fontSize === sz.size
                            ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                            : 'bg-white/5 hover:bg-white/10 text-stone-300 border border-white/5'
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. KONTROL POSISI HORIZONTAL (KIRI - TENGAH - KANAN / X) */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-amber-400" />
                    Posisi Kiri - Kanan (Horizontal X)
                  </span>
                  <span className="text-amber-300 font-mono font-bold text-xs bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    X: {textPosX}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={textPosX}
                  onChange={(e) => setTextPosX(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-white/10 rounded-lg"
                />

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepTextPosX(-5)}
                    className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-[11px] font-semibold text-stone-300 border border-white/10 text-center transition-all cursor-pointer"
                  >
                    ← Geser Kiri (-5%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextPosX(50)}
                    className="py-1.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[11px] font-bold text-amber-300 border border-amber-500/30 text-center transition-all cursor-pointer"
                  >
                    Tengah (50%)
                  </button>
                  <button
                    type="button"
                    onClick={() => stepTextPosX(5)}
                    className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-[11px] font-semibold text-stone-300 border border-white/10 text-center transition-all cursor-pointer"
                  >
                    Geser Kanan (+5%) →
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                  <button type="button" onClick={() => setTextPosX(15)} className="hover:text-amber-300 underline cursor-pointer">Rata Kiri (15%)</button>
                  <button type="button" onClick={() => setTextPosX(50)} className="hover:text-amber-300 underline cursor-pointer">Presisi Tengah (50%)</button>
                  <button type="button" onClick={() => setTextPosX(85)} className="hover:text-amber-300 underline cursor-pointer">Rata Kanan (85%)</button>
                </div>
              </div>

              {/* 3. KONTROL POSISI VERTIKAL (ATAS - TENGAH - BAWAH / Y) */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-amber-400" />
                    Posisi Atas - Bawah (Vertikal Y)
                  </span>
                  <span className="text-amber-300 font-mono font-bold text-xs bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    Y: {textPosY}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={textPosY}
                  onChange={(e) => setTextPosY(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-white/10 rounded-lg"
                />

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepTextPosY(-5)}
                    className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-[11px] font-semibold text-stone-300 border border-white/10 text-center transition-all cursor-pointer"
                  >
                    ↑ Geser Atas (-5%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextPosY(50)}
                    className="py-1.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[11px] font-bold text-amber-300 border border-amber-500/30 text-center transition-all cursor-pointer"
                  >
                    Tengah (50%)
                  </button>
                  <button
                    type="button"
                    onClick={() => stepTextPosY(5)}
                    className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-[11px] font-semibold text-stone-300 border border-white/10 text-center transition-all cursor-pointer"
                  >
                    Geser Bawah (+5%) ↓
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                  <button type="button" onClick={() => setTextPosY(15)} className="hover:text-amber-300 underline cursor-pointer">Atas (15%)</button>
                  <button type="button" onClick={() => setTextPosY(32)} className="hover:text-amber-300 underline cursor-pointer">Tengah-Atas (32%)</button>
                  <button type="button" onClick={() => setTextPosY(50)} className="hover:text-amber-300 underline cursor-pointer">Tengah (50%)</button>
                  <button type="button" onClick={() => setTextPosY(82)} className="hover:text-amber-300 underline cursor-pointer">Bawah Standar (82%)</button>
                </div>
              </div>

              {/* 4. PERATAAN TEKS (ALIGNMENT) */}
              <div>
                <label className="text-[11px] font-semibold text-stone-300 mb-1.5 block">Perataan Teks (Alignment)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'left', icon: AlignLeft, label: 'Kiri' },
                    { id: 'center', icon: AlignCenter, label: 'Tengah' },
                    { id: 'right', icon: AlignRight, label: 'Kanan' },
                  ].map((al) => {
                    const Icon = al.icon;
                    return (
                      <button
                        key={al.id}
                        type="button"
                        onClick={() => setTextAlign(al.id as any)}
                        className={`py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          textAlign === al.id
                            ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/40'
                            : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{al.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. FONT FAMILY SELECTOR (12 Koleksi Viral) */}
              <div>
                <label className="text-[11px] font-semibold text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>Pilih Font (12 Koleksi Viral & Aesthetic)</span>
                  <span className="text-[10px] text-amber-400 font-bold">{FONT_OPTIONS.find((f) => f.id === selectedFont)?.name}</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setSelectedFont(font.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedFont === font.id
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/50'
                          : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">
                          {font.category}
                        </span>
                        {selectedFont === font.id && <Check className="w-3 h-3 text-amber-400" />}
                      </div>
                      <span
                        style={{ fontFamily: font.fontFamily }}
                        className="text-sm font-bold block truncate"
                      >
                        {font.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. WARNA TEKS & PALET */}
              <div>
                <label className="text-[11px] font-semibold text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>Warna Teks</span>
                  <span className="font-mono text-[10px] text-amber-400 font-bold">{textColor}</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setTextColor(hex)}
                      style={{ backgroundColor: hex }}
                      className={`w-7 h-7 rounded-full border transition-transform cursor-pointer ${
                        textColor === hex
                          ? 'border-amber-400 scale-110 shadow-md ring-2 ring-white/40'
                          : 'border-white/20 hover:scale-105'
                      }`}
                      title={hex}
                    />
                  ))}
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0"
                    title="Pilih Warna Kustom"
                  />
                </div>
              </div>

              {/* 7. GAYA EFEK / LATAR TEKS */}
              <div>
                <label className="text-[11px] font-semibold text-stone-300 mb-1.5 block">Gaya Efek / Latar Teks</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEXT_STYLES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setTextStyle(st.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        textStyle === st.id
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-sm ring-1 ring-amber-400/40'
                          : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="block">{st.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 8. TOMBOL RESET */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetTextConfig}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Posisi & Ukuran Teks Default</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: STICKERS, CUSTOM IMAGE UPLOAD & BACKGROUND REMOVAL */}
          {activeTab === 'stickers' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Smile className="w-4 h-4" />
                  Stiker & Upload Gambar (Hapus BG)
                </h3>
                <span className="text-[10px] text-amber-400/80 font-mono">Bisa Di-Drag Bebas</span>
              </div>

              {/* 1. UPLOAD CUSTOM IMAGE / STICKER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    Upload Gambar Sendiri
                  </span>
                  <span className="text-[10px] text-stone-400">PNG, JPG, WEBP</span>
                </div>

                <button
                  onClick={() => stickerInputRef.current?.click()}
                  disabled={isUploadingSticker}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isUploadingSticker ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Memuat Gambar...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>+ Upload Gambar dari HP / Laptop</span>
                    </>
                  )}
                </button>

                <input
                  ref={stickerInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                  onChange={handleStickerUpload}
                  className="hidden"
                />

                {/* If custom image uploaded: Show Background Removal Tools */}
                {customStickerImage && (
                  <div className="p-3 rounded-xl bg-stone-900/90 border border-white/10 space-y-3 mt-3">
                    <div className="flex items-center gap-3">
                      {/* Image Preview Box with checkerboard background for transparency visibility */}
                      <div className="w-16 h-16 rounded-xl border border-white/20 overflow-hidden flex items-center justify-center bg-[conic-gradient(#333_90deg,#222_90deg_180deg,#333_180deg_270deg,#222_270deg)] bg-[size:10px_10px] shrink-0">
                        <img
                          src={customStickerImage}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 truncate">
                        <span className="font-bold text-xs text-white block">Gambar Stiker Kustom</span>
                        <span className="text-[10px] text-amber-300 block">Aktif di Video Preview</span>

                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            onClick={handleResetOriginalSticker}
                            className="text-[10px] text-stone-400 hover:text-white flex items-center gap-1 underline cursor-pointer"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Reset Asli</span>
                          </button>

                          <button
                            onClick={() => {
                              setCustomStickerImage(null);
                              setOriginalStickerImage(null);
                            }}
                            className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ACTION: HAPUS BACKGROUND (REMOVE BG) BUTTON */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => handleRemoveBackground()}
                        disabled={isRemovingBg}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isRemovingBg ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                            <span>Menghapus Background Otomatis...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            <span>✨ Hapus Background (Remove BG)</span>
                          </>
                        )}
                      </button>

                      {/* Tolerance / Sensitivity Slider */}
                      <div>
                        <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                          <span>Sensitivitas Hapus Background</span>
                          <span className="text-amber-300 font-bold">{bgRemoveTolerance}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="70"
                          value={bgRemoveTolerance}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setBgRemoveTolerance(val);
                            handleRemoveBackground(val);
                          }}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. FREE POSITIONING & TRANSFORM CONTROLS FOR STICKER */}
              {(customStickerImage || activeSticker) && (
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-amber-400" />
                      Atur Posisi & Ukuran Stiker
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      X: {stickerPosX}% | Y: {stickerPosY}%
                    </span>
                  </div>

                  <div className="text-[10px] text-stone-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    💡 <strong className="text-amber-300">Tips:</strong> Kamu bisa langsung klik & tarik (drag) stiker di layar video atau gunakan slider di bawah ini!
                  </div>

                  {/* Position X Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                      <span>Posisi Horizontal (X)</span>
                      <span>{stickerPosX}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={stickerPosX}
                      onChange={(e) => setStickerPosX(parseInt(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* Position Y Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                      <span>Posisi Vertikal (Y)</span>
                      <span>{stickerPosY}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={stickerPosY}
                      onChange={(e) => setStickerPosY(parseInt(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* Quick Position Presets */}
                  <div>
                    <span className="text-[10px] font-semibold text-stone-400 block mb-1.5">Preset Sudut:</span>
                    <div className="grid grid-cols-5 gap-1">
                      {[
                        { id: 'top-left', label: 'Top L' },
                        { id: 'top-right', label: 'Top R' },
                        { id: 'center', label: 'Mid' },
                        { id: 'bottom-left', label: 'Btm L' },
                        { id: 'bottom-right', label: 'Btm R' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setStickerPresetPosition(p.id as any)}
                          className="py-1 px-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-stone-300 text-center transition-colors cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scale / Size Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                      <span>Ukuran Stiker (Scale)</span>
                      <span className="text-amber-300 font-bold">{stickerScale}px</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="240"
                      value={stickerScale}
                      onChange={(e) => setStickerScale(parseInt(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* Rotation Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                      <span>Rotasi (Derajat)</span>
                      <span className="text-amber-300 font-bold">{stickerRotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={stickerRotation}
                      onChange={(e) => setStickerRotation(parseInt(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* Opacity Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                      <span>Transparansi (Opacity)</span>
                      <span className="text-amber-300 font-bold">{stickerOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={stickerOpacity}
                      onChange={(e) => setStickerOpacity(parseInt(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* 3. PRESET SOCIAL BADGES GALLERY */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Galeri Stiker & Badge Populer
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '🔥 VIRAL',
                    '✨ AESTHETIC',
                    '💡 VYRO AI',
                    '⚡ NEW',
                    '🍳 RECIPE',
                    '🗼 TRAVEL',
                    '❤️ LOVE',
                    '💯 100%',
                    '🚀 TRENDING',
                    '🎧 MUSIC VIBE',
                    '',
                  ].map((st, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveSticker(st);
                        setCustomStickerImage(null); // Clear custom image if preset selected
                      }}
                      className={`p-3 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                        activeSticker === st && !customStickerImage
                          ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm ring-1 ring-amber-400/50'
                          : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                      }`}
                    >
                      {st || 'Nonaktifkan Stiker'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SPEED CONTROL */}
          {activeTab === 'speed' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                Speed Multiplier
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSpeed(s);
                      if (videoRef.current) videoRef.current.playbackRate = s;
                    }}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      speed === s
                        ? 'bg-amber-500 text-stone-950 border-amber-400'
                        : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: TIMELINE FOR MOBILE / COMPACT VIEW */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Scissors className="w-4 h-4" />
                  Potong Video & Timeline Multi-Track
                </h3>
                <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {(trimEnd - trimStart).toFixed(1)}s
                </span>
              </div>

              {/* Video Trim Controls */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white flex items-center gap-1">
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    Trim / Potong Durasi Video
                  </span>
                  <span className="font-mono text-[11px] text-amber-300">
                    {trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                      <span>Titik Mulai (Start)</span>
                      <span>{trimStart.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(1, duration - 1)}
                      step="0.1"
                      value={trimStart}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val < trimEnd) setTrimStart(val);
                      }}
                      className="w-full accent-amber-400 cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                      <span>Titik Selesai (End)</span>
                      <span>{trimEnd.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min={trimStart + 0.5}
                      max={Math.max(1, duration)}
                      step="0.1"
                      value={trimEnd}
                      onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Audio & BGM Status */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                    Suara Asli Video
                  </span>
                  <button
                    onClick={() => setIsOriginalMuted(!isOriginalMuted)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isOriginalMuted
                        ? 'bg-rose-500 text-white shadow'
                        : 'bg-white/10 text-stone-200 hover:bg-white/20'
                    }`}
                  >
                    {isOriginalMuted ? 'Muted' : 'Sound ON'}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-amber-400" />
                    BGM Track
                  </span>
                  {bgMusic ? (
                    <span className="text-[11px] text-amber-300 font-bold truncate max-w-[140px]">{bgMusic.title}</span>
                  ) : (
                    <button
                      onClick={() => setActiveTab('audio')}
                      className="text-[11px] text-amber-400 underline font-semibold cursor-pointer"
                    >
                      + Tambah Musik (MP4/MP3)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM CAPCUT MULTI-TRACK TIMELINE (Visible on desktop lg:flex) */}
      <div className="hidden lg:flex h-52 border-t border-white/10 bg-[#0c0906] p-4 flex-col shrink-0 select-none">
        {/* Timeline Header Info */}
        <div className="flex items-center justify-between text-xs text-stone-400 pb-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              CapCut Multi-Track Studio
            </span>
            <span className="text-[11px] text-amber-300/80">
              Trim: {trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s (Total: {(trimEnd - trimStart).toFixed(1)}s)
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Speed: {speed}x</span>
            <span>Filter: {activeFilter}</span>
            <span className="text-amber-400 font-mono">Font: {FONT_OPTIONS.find((f) => f.id === selectedFont)?.name}</span>
          </div>
        </div>

        {/* The Multi-Track Container */}
        <div className="flex-1 overflow-y-auto space-y-2 pt-2 custom-scrollbar">
          {/* TRACK 1: VIDEO TRACK WITH TRIM HANDLES */}
          <div className="relative h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center px-3 gap-3">
            <span className="text-[10px] font-black text-amber-400 uppercase w-16 shrink-0 flex items-center gap-1">
              <Film className="w-3 h-3" /> Video
            </span>

            <div className="flex-1 flex gap-3 items-center">
              <input
                type="range"
                min="0"
                max={Math.max(1, duration - 1)}
                step="0.1"
                value={trimStart}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val < trimEnd) setTrimStart(val);
                }}
                className="w-1/2 accent-amber-400 cursor-pointer"
              />
              <input
                type="range"
                min={trimStart + 0.5}
                max={Math.max(1, duration)}
                step="0.1"
                value={trimEnd}
                onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                className="w-1/2 accent-amber-400 cursor-pointer"
              />
            </div>
            <span className="text-[10px] text-stone-400 font-mono shrink-0">
              {trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s
            </span>
          </div>

          {/* TRACK 2: ORIGINAL VIDEO AUDIO (BISA DI-MUTE) */}
          <div className="h-8 rounded-xl bg-white/[0.02] border border-white/10 flex items-center px-3 justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-stone-400 uppercase w-16 shrink-0 flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-stone-400" /> Orig Aud
              </span>
              <span className={`text-[11px] font-semibold ${isOriginalMuted ? 'line-through text-stone-500' : 'text-stone-300'}`}>
                Original Video Audio Track
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOriginalMuted(!isOriginalMuted)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isOriginalMuted
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-white/10 text-stone-300 hover:bg-white/20'
                }`}
              >
                {isOriginalMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                <span>{isOriginalMuted ? 'Muted' : 'Active'}</span>
              </button>
            </div>
          </div>

          {/* TRACK 3: BACKGROUND MUSIC / NEW SOUND */}
          <div
            className={`h-8 rounded-xl border flex items-center px-3 justify-between transition-all ${
              bgMusic
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-white/[0.02] border-dashed border-white/10'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-[10px] font-black text-amber-400 uppercase w-16 shrink-0 flex items-center gap-1">
                <Music className="w-3 h-3" /> BGM
              </span>
              {bgMusic ? (
                <span className="text-[11px] font-bold text-amber-200 truncate">
                  {bgMusic.title}
                </span>
              ) : (
                <span className="text-[11px] text-stone-500 italic">
                  Belum ada musik tambahan (Klik tab Audio untuk tambah sound)
                </span>
              )}
            </div>

            {bgMusic ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-300 font-mono">{bgMusicVolume}%</span>
                <button
                  onClick={() => setBgMusic(null)}
                  className="p-1 rounded text-red-400 hover:bg-red-500/10 cursor-pointer"
                  title="Hapus BGM"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => videoSoundInputRef.current?.click()}
                  className="text-[10px] px-2.5 py-0.5 rounded bg-amber-500/25 hover:bg-amber-500/35 text-amber-300 font-bold border border-amber-500/35 flex items-center gap-1 cursor-pointer"
                  title="Upload video MP4 untuk diambil suaranya"
                >
                  <Film className="w-3 h-3 text-amber-400" />
                  <span>+ Video MP4 Sound</span>
                </button>
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-stone-300 font-bold border border-white/10 flex items-center gap-1 cursor-pointer"
                  title="Upload file musik MP3"
                >
                  <Music className="w-3 h-3 text-stone-300" />
                  <span>+ Musik MP3</span>
                </button>
                <button
                  onClick={() => setActiveTab('audio')}
                  className="text-[10px] px-1.5 py-0.5 text-stone-400 hover:text-white underline cursor-pointer"
                >
                  Tab Audio
                </button>
              </div>
            )}
          </div>

          {/* TRACK 4: TEXT TITLE OVERLAY TRACK */}
          {overlayText && (
            <div className="h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center px-3 justify-between text-purple-200 text-[11px]">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[10px] font-black text-purple-400 uppercase w-16 shrink-0 flex items-center gap-1">
                  <Type className="w-3 h-3" /> Text
                </span>
                <span className="font-semibold truncate">
                  "{overlayText}" ({FONT_OPTIONS.find((f) => f.id === selectedFont)?.name}) • X: {textPosX}% Y: {textPosY}%
                </span>
              </div>
              <button
                onClick={() => setActiveTab('text')}
                className="text-[10px] text-purple-400/80 hover:text-purple-300 underline cursor-pointer"
              >
                Edit
              </button>
            </div>
          )}

          {/* TRACK 5: STICKER / IMAGE OVERLAY TRACK */}
          {(customStickerImage || activeSticker) && (
            <div className="h-8 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center px-3 justify-between text-rose-200 text-[11px]">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[10px] font-black text-rose-400 uppercase w-16 shrink-0 flex items-center gap-1">
                  <Smile className="w-3 h-3" /> Sticker
                </span>
                <span className="font-semibold truncate">
                  {customStickerImage ? 'Gambar Kustom (Hapus BG Aktif)' : activeSticker} • X: {stickerPosX}% Y: {stickerPosY}% ({stickerScale}px)
                </span>
              </div>
              <button
                onClick={() => setActiveTab('stickers')}
                className="text-[10px] text-rose-400/80 hover:text-rose-300 underline cursor-pointer"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FULLSCREEN CLEAN PREVIEW MODAL FOR CREATOR / EDITOR */}
      {isCleanPreview && (
        <div
          onClick={() => setIsCleanPreview(false)}
          className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center cursor-pointer select-none animate-in fade-in duration-200"
        >
          {/* Top Floating Notification Pill */}
          <div className="absolute top-5 z-50 pointer-events-auto">
            <button
              onClick={() => setIsCleanPreview(false)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black text-xs flex items-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.7)] animate-pulse hover:scale-105 active:scale-95 transition-transform"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Pratinjau Layar Penuh (Klik layar untuk kembali)</span>
            </button>
          </div>

          {/* Fullscreen Video Frame */}
          <div className="relative aspect-[9/16] h-[92vh] max-h-[820px] rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/15">
            <video
              src={videoSrc}
              autoPlay
              loop
              playsInline
              muted={isOriginalMuted}
              className="w-full h-full object-cover"
              style={{ filter: computedFilterStyle() }}
            />

            {/* Draggable elements rendered at exact edited coordinates */}
            {(customStickerImage || activeSticker) && (
              <div
                style={{
                  position: 'absolute',
                  left: `${stickerPosX}%`,
                  top: `${stickerPosY}%`,
                  transform: `translate(-50%, -50%) rotate(${stickerRotation}deg)`,
                  width: `${stickerScale}px`,
                  opacity: stickerOpacity / 100,
                  pointerEvents: 'none',
                }}
                className="z-20"
              >
                {customStickerImage ? (
                  <img src={customStickerImage} alt="Sticker" className="w-full h-auto object-contain drop-shadow-xl" />
                ) : (
                  <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs shadow-lg uppercase tracking-wider text-center">
                    {activeSticker}
                  </div>
                )}
              </div>
            )}

            {overlayText && (
              <div
                style={{
                  position: 'absolute',
                  left: `${textPosX}%`,
                  top: `${textPosY}%`,
                  transform: 'translate(-50%, -50%)',
                  maxWidth: '90%',
                  pointerEvents: 'none',
                }}
                className="z-20"
              >
                <div
                  style={{
                    fontFamily: currentFontFamily,
                    color: textColor,
                    fontSize: `${fontSize * 1.2}px`,
                    textAlign: textAlign,
                  }}
                  className={`px-4 py-2 rounded-2xl ${currentTextStyleClass}`}
                >
                  {overlayText}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
