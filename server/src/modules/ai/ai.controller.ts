import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const getAICharacters = async (_req: Request, res: Response) => {
  try {
    const characters = await prisma.aICharacter.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json({ success: true, data: characters });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch AI characters' });
  }
};

export const getAISettings = async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.aISetting.findMany();
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    return res.json({ success: true, data: settingsMap });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch AI settings' });
  }
};

export const updateAISetting = async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ success: false, message: 'Key and value are required' });
    }

    const updated = await prisma.aISetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update AI setting' });
  }
};

export const analyzeVideo = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.body;
    if (!videoId) {
      return res.status(400).json({ success: false, message: 'Video ID is required' });
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { category: true },
    });

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // AI Contextual Analysis Engine
    const categoryName = video.category?.name || 'General Creative';
    const moods = ['Energetic & Inspiring', 'Warm & Nostalgic', 'Fun & Playful', 'Cinematic & Futuristic', 'Educational & Insightful'];
    const selectedMood = moods[Math.floor(Math.random() * moods.length)];

    const detectedContext = `High fidelity video featuring ${categoryName}. Rich color dynamics, balanced contrast, and engaging visual tempo.`;
    const suggestedTags = [`#${categoryName.toLowerCase().replace(/[^a-z0-9]/g, '')}`, '#vyrocreator', '#visualstory', '#aienhanced'];
    const generatedCaption = `${video.title} — crafted with passion and cinematic rhythm ✨`;

    const analysis = await prisma.aIAnalysis.upsert({
      where: { videoId },
      update: {
        detectedContext,
        detectedMood: selectedMood,
        suggestedTags: JSON.stringify(suggestedTags),
        generatedCaption,
        qualityScore: 9.3,
      },
      create: {
        videoId,
        detectedContext,
        detectedMood: selectedMood,
        suggestedTags: JSON.stringify(suggestedTags),
        generatedCaption,
        qualityScore: 9.3,
      },
    });

    return res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('analyzeVideo error:', error);
    return res.status(500).json({ success: false, message: 'Failed to analyze video' });
  }
};

export const generateAIComment = async (req: Request, res: Response) => {
  try {
    const { videoId, characterId } = req.body;
    if (!videoId) {
      return res.status(400).json({ success: false, message: 'Video ID is required' });
    }

    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Pick specified or random active character
    let character;
    if (characterId) {
      character = await prisma.aICharacter.findUnique({ where: { id: characterId } });
    } else {
      const activeChars = await prisma.aICharacter.findMany({ where: { isActive: true } });
      character = activeChars[Math.floor(Math.random() * activeChars.length)];
    }

    if (!character) {
      return res.status(400).json({ success: false, message: 'No AI character available' });
    }

    // Generate response according to character personality
    const responses: Record<string, string[]> = {
      Humorous: [
        `Gara-gara nonton ini, kopi gue sampe tumpah karena kaget liat transisinya yang kelewat mulus! 😂🙌`,
        `Tolong ya kreatornya, jangan terlalu jago, kita yang nonton jadi insecure sekaligus kagum! 🤣👏`,
        `Ini tutorial cara bikin penonton terpaku 15 detik tanpa kedip ya? Berhasil 100%! 🔥`,
      ],
      Friendly: [
        `Halo kak! Videonya adem dan enak banget dinikmati. Sukses terus ya buat karya-karyanya 💖`,
        `Keren banget, detail kecilnya diperhatiin banget. Terus berkarya yaa, kami selalu support! ✨`,
        `Visualnya manis banget dan vibes-nya positif. Semangat terus kakak kreator! 🥰`,
      ],
      Enthusiastic: [
        `GOKILLL BANGET INI SIHH!! Sound sama cuts-nya match 1000%! HYPE BANGET! 🔥⚡🚀`,
        `AUTO LIKE & SHARE! Energy videonya nular banget ke yang nonton! AURA BINTANG! 🌟💥`,
        `LEVEL UP! Satu dari video terbaik yang lewat di feed gue hari ini! GASPOL! 🔥🔥`,
      ],
      Curious: [
        `Teknik pengambilan gambar pas detik ke-3 itu pake gimbal atau handheld slow pan kak? Rapi banget! 🧐`,
        `Color grading-nya pake LUT apa ya kalau boleh tau? Warm tone-nya pas banget di mata! 🎨`,
        `Berapa take buat dapetin shot sesempurna ini kak? Hasilnya bener-bener presisi! 🎬`,
      ],
      Informative: [
        `Fun fact: Komposisi visual seperti ini menerapkan 'Golden Ratio' yang terbukti secara psikologis membuat mata lebih rileks saat menonton! 💡`,
        `Pencahayaan warm gold di video ini efektif menaikkan retensi penonton hingga 40% menurut riset media sosial modern. Brilliant work! 📊`,
      ],
      Supportive: [
        `Setiap proses pasti ada hasilnya, dan karya ini bukti nyata konsistensi kamu berkembang. Proud of you! 🙌✨`,
        `Jangan pernah berhenti berkreasi ya kak, karya kamu punya identitas yang unik dan menginspirasi banyak orang! 💫`,
      ],
      'Critical Reviewer': [
        `Komposisi dan lighting-nya sangat solid (8.9/10). Kalau dynamic range di bagian bayangan sedikit di-lift, estetikanya bakal sempurna! 👏`,
        `Pacing audionya presisi. Transisi cut di beat kedua sangat mulus. Eksplorasi sudut low-angle berikutnya pasti makin dramatis! 🎥`,
      ],
    };

    const characterPool = responses[character.personality] || responses['Friendly'];
    const selectedContent = characterPool[Math.floor(Math.random() * characterPool.length)];

    const newComment = await prisma.comment.create({
      data: {
        videoId,
        isAi: true,
        aiCharacterId: character.id,
        content: selectedContent,
        likesCount: Math.floor(Math.random() * 15) + 3,
      },
      include: {
        aiCharacter: {
          select: { id: true, name: true, avatar: true, personality: true, badgeColor: true },
        },
      },
    });

    await prisma.video.update({
      where: { id: videoId },
      data: { commentsCount: { increment: 1 } },
    });

    return res.status(201).json({
      success: true,
      data: newComment,
    });
  } catch (error) {
    console.error('generateAIComment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate AI comment' });
  }
};

export const generateCreatorAssistantSuggestions = async (req: Request, res: Response) => {
  try {
    const { title, category, keywords } = req.body;

    const baseTitle = title || 'Vibrant Story';
    const suggestions = {
      captions: [
        `✨ Catch the golden moments with ${baseTitle}. Watch till the end for the best part! 🔥`,
        `💡 Turning vision into motion. Apa bagian favorit kalian dari video ini? Drop comment di bawah! 👇`,
        `🚀 Created with passion, amplified with VYRO AI. Share this to inspire your creative circle!`,
      ],
      hashtags: [
        '#VyroCreator',
        '#CreativeAesthetics',
        '#VisualStorytelling',
        '#ForYou',
        '#TrendingNow',
        `#${(category || 'Viral').replace(/\s+/g, '')}`,
      ],
      ideas: [
        'Coba buat versi behind-the-scenes (BTS) 10 detik untuk video berikutnya.',
        'Gunakan hook pertanyaan di 2 detik pertama untuk meningkatkan watch-time.',
        'Kombinasikan dengan musik beat-drop yang sedang trending di Sound Library.',
      ],
    };

    return res.json({ success: true, data: suggestions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate creator suggestions' });
  }
};

