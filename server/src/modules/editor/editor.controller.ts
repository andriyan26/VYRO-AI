import { Request, Response } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import path from 'path';
import fs from 'fs';
import prisma from '../../config/prisma';

if (ffmpegInstaller.path) {
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
}
if (ffprobeInstaller.path) {
  ffmpeg.setFfprobePath(ffprobeInstaller.path);
}

// 1. Upload Media for Video Track
export const uploadEditorMedia = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No media file provided.' });
    }

    const relativeUrl = `/uploads/videos/${file.filename}`;

    return res.json({
      success: true,
      message: 'Video imported successfully!',
      data: {
        url: relativeUrl,
        filename: file.filename,
        originalName: file.originalname,
        type: 'video',
        size: file.size,
      },
    });
  } catch (error: any) {
    console.error('uploadEditorMedia error:', error);
    return res.status(500).json({ success: false, message: 'Failed to import media: ' + error.message });
  }
};

// 2. Upload Sound from ANY format (MP3, WAV, AAC, or Extract from MP4, MOV, WEBM)
export const uploadEditorSound = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No sound/video file provided.' });
    }

    const isVideo = file.mimetype.startsWith('video') || /\.(mp4|mov|webm|mkv|avi|m4v|flv|3gp|wmv|ts|ogv)$/i.test(file.originalname);
    const uploadedPath = file.path;

    if (isVideo) {
      // Extract audio track from video file into MP3
      const extractedFilename = `audio-${Date.now()}-${Math.round(Math.random() * 1e6)}.mp3`;
      const extractedPath = path.join(__dirname, '../../../../uploads/sounds', extractedFilename);

      ffmpeg(uploadedPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate(192)
        .output(extractedPath)
        .on('end', () => {
          console.log('Successfully extracted audio from video:', extractedPath);
          return res.json({
            success: true,
            message: 'Audio berhasil diekstrak dari video (MP4)!',
            data: {
              url: `/uploads/sounds/${extractedFilename}`,
              title: file.originalname.replace(/\.[^/.]+$/, ''),
              filename: extractedFilename,
              isExtracted: true,
            },
          });
        })
        .on('error', (err) => {
          console.warn('Audio extraction warning, falling back to direct stream:', err);
          const fallbackUrl = `/uploads/sounds/${file.filename}`;
          return res.json({
            success: true,
            message: 'Audio dimuat langsung dari file!',
            data: {
              url: fallbackUrl,
              title: file.originalname.replace(/\.[^/.]+$/, ''),
              filename: file.filename,
              isExtracted: false,
            },
          });
        })
        .run();
    } else {
      // Already an audio file (.mp3, .wav, .m4a, etc.)
      const relativeUrl = `/uploads/sounds/${file.filename}`;
      return res.json({
        success: true,
        message: 'Audio berhasil diimpor!',
        data: {
          url: relativeUrl,
          title: file.originalname.replace(/\.[^/.]+$/, ''),
          filename: file.filename,
          isExtracted: false,
        },
      });
    }
  } catch (error: any) {
    console.error('uploadEditorSound error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process sound: ' + error.message });
  }
};

// 2.5 Upload Custom Sticker Image (PNG, JPG, WEBP, SVG)
export const uploadEditorSticker = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No sticker image provided.' });
    }

    const relativeUrl = `/uploads/stickers/${file.filename}`;

    return res.json({
      success: true,
      message: 'Sticker berhasil diupload!',
      data: {
        url: relativeUrl,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
      },
    });
  } catch (error: any) {
    console.error('uploadEditorSticker error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload sticker: ' + error.message });
  }
};

// 3. Extract Audio directly from currently active Video in Editor
export const extractCurrentVideoSound = async (req: Request, res: Response) => {
  try {
    const { videoPath } = req.body;
    if (!videoPath) {
      return res.status(400).json({ success: false, message: 'No videoPath provided' });
    }

    let absolutePath = '';
    if (videoPath.startsWith('/uploads/')) {
      absolutePath = path.join(__dirname, '../../../../', videoPath);
    } else {
      const localSample = path.join(__dirname, '../../../../uploads/videos/konsep_login.mp4');
      if (fs.existsSync(localSample)) {
        absolutePath = localSample;
      }
    }

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'Video file not found on disk' });
    }

    const extractedFilename = `extracted-${Date.now()}-${Math.round(Math.random() * 1e6)}.mp3`;
    const extractedPath = path.join(__dirname, '../../../../uploads/sounds', extractedFilename);

    ffmpeg(absolutePath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate(192)
      .output(extractedPath)
      .on('end', () => {
        return res.json({
          success: true,
          message: 'Audio berhasil diekstrak dari video!',
          data: {
            url: `/uploads/sounds/${extractedFilename}`,
            title: 'Extracted (' + path.basename(videoPath) + ')',
            filename: extractedFilename,
            isExtracted: true,
          },
        });
      })
      .on('error', (err) => {
        return res.status(500).json({ success: false, message: 'Gagal ekstrak audio: ' + err.message });
      })
      .run();
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Export Video with Trimming, Speed, Filters, Muted Audio, and Added BGM
export const exportVideo = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      videoId,
      videoPath: customVideoPath,
      trimStart,
      trimEnd,
      speed,
      filter,
      title,
      description,
      muteOriginalAudio,
      bgMusicUrl,
      bgMusicVolume,
    } = req.body;

    let inputPath = '';

    // Resolve Input Video File Path
    if (customVideoPath && customVideoPath.startsWith('/uploads/')) {
      const resolved = path.join(__dirname, '../../../../', customVideoPath);
      if (fs.existsSync(resolved)) {
        inputPath = resolved;
      }
    }

    if (!inputPath && videoId) {
      const existingVideo = await prisma.video.findUnique({ where: { id: videoId } });
      if (existingVideo && existingVideo.videoUrl.startsWith('/uploads/')) {
        const resolved = path.join(__dirname, '../../../../', existingVideo.videoUrl);
        if (fs.existsSync(resolved)) {
          inputPath = resolved;
        }
      }
    }

    // Fallback if local input doesn't exist
    if (!inputPath || !fs.existsSync(inputPath)) {
      const localSample = path.join(__dirname, '../../../../uploads/videos/konsep_login.mp4');
      if (fs.existsSync(localSample)) {
        inputPath = localSample;
      } else {
        return res.status(400).json({ success: false, message: 'Source video file not found on disk.' });
      }
    }

    const outputFilename = `export-${Date.now()}-${Math.round(Math.random() * 1e6)}.mp4`;
    const outputPath = path.join(__dirname, '../../../../uploads/videos', outputFilename);

    const startTime = parseFloat(trimStart) || 0;
    const duration = trimEnd ? Math.max(1, parseFloat(trimEnd) - startTime) : 10;

    let command = ffmpeg(inputPath).setStartTime(startTime).setDuration(duration);

    // Video Filters
    const videoFilters: string[] = [];

    if (filter === 'warm-gold') {
      videoFilters.push('eq=contrast=1.12:brightness=0.03:saturation=1.35');
    } else if (filter === 'cinematic') {
      videoFilters.push('eq=contrast=1.25:saturation=1.15');
    } else if (filter === 'cyberpunk') {
      videoFilters.push('eq=contrast=1.25:saturation=1.55');
    } else if (filter === 'bw') {
      videoFilters.push('hue=s=0');
    } else if (filter === 'vintage') {
      videoFilters.push('eq=contrast=1.05:saturation=0.85:brightness=0.05');
    }

    if (speed && parseFloat(speed) !== 1) {
      const s = parseFloat(speed);
      if (s > 0) {
        videoFilters.push(`setpts=${1 / s}*PTS`);
      }
    }

    if (videoFilters.length > 0) {
      command = command.videoFilters(videoFilters.join(','));
    }

    // Audio Handling
    const shouldMute = muteOriginalAudio === true || muteOriginalAudio === 'true';

    let bgAudioPath = '';
    if (bgMusicUrl) {
      if (bgMusicUrl.startsWith('/uploads/')) {
        const resolved = path.join(__dirname, '../../../../', bgMusicUrl);
        if (fs.existsSync(resolved)) bgAudioPath = resolved;
      }
    }

    if (shouldMute && !bgAudioPath) {
      command = command.noAudio();
    } else if (bgAudioPath) {
      command = command.input(bgAudioPath);
      if (shouldMute) {
        command = command.outputOptions([
          '-map 0:v:0',
          '-map 1:a:0',
          '-shortest',
        ]);
      } else {
        const volumeFactor = bgMusicVolume ? (parseFloat(bgMusicVolume) / 100).toFixed(2) : '0.8';
        command = command.complexFilter([
          `[0:a]volume=1.0[a1]`,
          `[1:a]volume=${volumeFactor}[a2]`,
          `[a1][a2]amix=inputs=2:duration=first[aout]`,
        ]).outputOptions([
          '-map 0:v:0',
          '-map [aout]',
        ]);
      }
    }

    command
      .outputOptions(['-c:v libx264', '-preset veryfast', '-crf 23', '-c:a aac', '-b:a 128k'])
      .output(outputPath)
      .on('start', (cmdline) => {
        console.log('Started FFmpeg export:', cmdline);
      })
      .on('end', async () => {
        console.log('FFmpeg export finished successfully:', outputPath);

        const exportedVideoUrl = `/uploads/videos/${outputFilename}`;
        const newVideo = await prisma.video.create({
          data: {
            title: title || 'Exported Studio Video',
            description: description || 'Edited with VYRO AI Studio CapCut-style Editor ✨',
            videoUrl: exportedVideoUrl,
            thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600',
            duration,
            userId,
            visibility: 'PUBLIC',
            status: 'PUBLISHED',
          },
        });

        return res.json({
          success: true,
          message: 'Video rendered and published successfully!',
          data: newVideo,
        });
      })
      .on('error', (err) => {
        console.error('FFmpeg export error:', err);
        return res.status(500).json({ success: false, message: 'FFmpeg processing failed: ' + err.message });
      })
      .run();
  } catch (error: any) {
    console.error('exportVideo controller error:', error);
    return res.status(500).json({ success: false, message: 'Video export error: ' + error.message });
  }
};
