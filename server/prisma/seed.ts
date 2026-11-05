import { PrismaClient, Role, Visibility, VideoStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Vyro AI Database Seeder...');

  // 1. Password Hashes
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const userPasswordHash = await bcrypt.hash('Password123!', 10);

  // 2. Clear existing data safely
  await prisma.auditLog.deleteMany();
  await prisma.aIInteraction.deleteMany();
  await prisma.aIAnalysis.deleteMany();
  await prisma.aICharacter.deleteMany();
  await prisma.aISetting.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.videoHashtag.deleteMany();
  await prisma.hashtag.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.videoLike.deleteMany();
  await prisma.videoView.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.video.deleteMany();
  await prisma.sound.deleteMany();
  await prisma.category.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@vyro.ai',
      username: 'admin',
      fullName: 'Vyro Superadmin',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      bio: 'Platform Creator & System Administrator at VYRO AI.',
      isVerified: true,
    },
  });

  const creatorSarah = await prisma.user.create({
    data: {
      email: 'sarah@vyro.ai',
      username: 'sarah.lens',
      fullName: 'Sarah Jenkins',
      passwordHash: userPasswordHash,
      role: Role.CREATOR,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      bio: 'Visual storyteller & hyper-lapse cinematographer 🎬✨ | Jakarta',
      isVerified: true,
    },
  });

  const creatorMarcus = await prisma.user.create({
    data: {
      email: 'marcus@vyro.ai',
      username: 'chef.marcus',
      fullName: 'Marcus V.',
      passwordHash: userPasswordHash,
      role: Role.CREATOR,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      bio: 'Culinary alchemy • 30-sec secret recipes 🥘🔥',
      isVerified: true,
    },
  });

  const creatorAlex = await prisma.user.create({
    data: {
      email: 'alex@vyro.ai',
      username: 'alex.tech',
      fullName: 'Alex Rivera',
      passwordHash: userPasswordHash,
      role: Role.CREATOR,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      bio: 'Futuristic AI, robotic gear & setup aesthetics ⚡🤖',
      isVerified: true,
    },
  });

  const userMaya = await prisma.user.create({
    data: {
      email: 'maya@vyro.ai',
      username: 'maya.wander',
      fullName: 'Maya Lin',
      passwordHash: userPasswordHash,
      role: Role.USER,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
      bio: 'Exploring coffee shops and acoustic melodies ☕🎧',
      isVerified: false,
    },
  });

  console.log('✅ Users & Roles created');

  // 4. Create AI Characters
  const aiCharacters = await Promise.all([
    prisma.aICharacter.create({
      data: {
        name: 'Sparky',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
        personality: 'Humorous',
        badgeColor: '#F59E0B',
        systemPrompt: 'Kamu adalah Sparky, karakter AI yang suka bercanda, cerdas, santai, dan selalu membuat punchline yang lucu tapi sopan sesuai konteks video.',
      },
    }),
    prisma.aICharacter.create({
      data: {
        name: 'Amara',
        avatar: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=150',
        personality: 'Friendly',
        badgeColor: '#10B981',
        systemPrompt: 'Kamu adalah Amara, karakter AI yang sangat hangat, ramah, selalu menyapa pembuat video dengan tulus dan memberikan pujian yang menyentuh hati.',
      },
    }),
    prisma.aICharacter.create({
      data: {
        name: 'Zephyr',
        avatar: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150',
        personality: 'Enthusiastic',
        badgeColor: '#EC4899',
        systemPrompt: 'Kamu adalah Zephyr, karakter AI yang super hype, penuh energi, bersemangat tinggi, dan gemar menggunakan emoji api dan roket!',
      },
    }),
    prisma.aICharacter.create({
      data: {
        name: 'Kaelen',
        avatar: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150',
        personality: 'Curious',
        badgeColor: '#3B82F6',
        systemPrompt: 'Kamu adalah Kaelen, karakter AI yang penasaran secara intelektual, suka menanyakan detail teknis, resep, rahasia di balik layar, atau lokasi video.',
      },
    }),
    prisma.aICharacter.create({
      data: {
        name: 'Sophia',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
        personality: 'Informative',
        badgeColor: '#8B5CF6',
        systemPrompt: 'Kamu adalah Sophia, karakter AI berwawasan luas yang senang berbagi trivia singkat atau fakta ilmiah menarik terkait isi video.',
      },
    }),
    prisma.aICharacter.create({
      data: {
        name: 'Nova',
        avatar: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150',
        personality: 'Supportive',
        badgeColor: '#06B6D4',
        systemPrompt: 'Kamu adalah Nova, karakter AI yang suportif dan menjadi pendengar setia, memberi dorongan semangat kepada kreator untuk terus berkarya.',
      },
    }),
    prisma.aICharacter.create({
      data: {
        name: 'Vance',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
        personality: 'Critical Reviewer',
        badgeColor: '#F97316',
        systemPrompt: 'Kamu adalah Vance, reviewer estetik yang kritis namun konstruktif. Menilai komposisi warna, pencahayaan, transisi, atau pemilihan audio.',
      },
    }),
  ]);

  console.log(`✅ ${aiCharacters.length} AI Characters created`);

  // 5. Create Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Creative & Art', slug: 'creative-art', icon: 'Palette', description: 'Visual art, animation, and digital storytelling' } }),
    prisma.category.create({ data: { name: 'Food & Cooking', slug: 'food-cooking', icon: 'Utensils', description: 'Delicious recipes, street food, and culinary adventures' } }),
    prisma.category.create({ data: { name: 'Tech & Gadgets', slug: 'tech-gadgets', icon: 'Cpu', description: 'Hardware reviews, coding, robotics and AI innovations' } }),
    prisma.category.create({ data: { name: 'Travel & Lifestyle', slug: 'travel-lifestyle', icon: 'Compass', description: 'Hidden gems, luxury trips, and everyday aesthetics' } }),
    prisma.category.create({ data: { name: 'Music & Vibes', slug: 'music-vibes', icon: 'Music', description: 'Original tracks, dance trends, and acoustic covers' } }),
    prisma.category.create({ data: { name: 'Gaming', slug: 'gaming', icon: 'Gamepad2', description: 'Epic clutches, speedruns, and game setups' } }),
  ]);

  console.log(`✅ ${categories.length} Categories created`);

  // 6. Create Sounds
  const sounds = await Promise.all([
    prisma.sound.create({
      data: {
        title: 'Golden Sunset Chill (Vyro Edit)',
        artist: 'Lofi Boy x Vyro',
        audioUrl: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=150',
        duration: 38,
      },
    }),
    prisma.sound.create({
      data: {
        title: 'Cyber City Neon Horizon',
        artist: 'Synthwave AI',
        audioUrl: 'https://cdn.freesound.org/previews/568/568856_11861866-lq.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=150',
        duration: 45,
      },
    }),
    prisma.sound.create({
      data: {
        title: 'Espresso Morning Acoustic',
        artist: 'Acoustic Soul',
        audioUrl: 'https://cdn.freesound.org/previews/456/456965_4486188-lq.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=150',
        duration: 30,
      },
    }),
  ]);

  console.log(`✅ ${sounds.length} Sounds created`);

  // 7. Copy KONSEP LOGIN.mp4 to uploads/videos if it exists
  const sourceVideo = path.join('c:', 'laragon', 'www', 'VRYO AI', 'KONSEP LOGIN.mp4');
  const targetVideo = path.join('c:', 'laragon', 'www', 'VRYO AI', 'uploads', 'videos', 'konsep_login.mp4');
  if (fs.existsSync(sourceVideo)) {
    fs.copyFileSync(sourceVideo, targetVideo);
    console.log('✅ Copied KONSEP LOGIN.mp4 to uploads directory');
  }

  // 8. Create Sample Videos
  const sampleVideos = [
    {
      title: 'Lumen Lamp Interactive Concept: The light turns on when you pull! 💡',
      description: 'Konsep autentikasi interaktif VYRO AI! Tarik talinya, hidupkan lampunya, dan rasakan magisnya animasi pencahayaan ambient warm gold ✨ #VyroAI #InteractionDesign #CreativeUI',
      videoUrl: '/uploads/videos/konsep_login.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
      duration: 5,
      width: 1080,
      height: 1920,
      userId: admin.id,
      categoryId: categories[0].id, // Creative & Art
      soundId: sounds[1].id,
      viewsCount: 3420,
      likesCount: 894,
      commentsCount: 142,
      bookmarksCount: 210,
    },
    {
      title: 'Neon Tokyo Alleyway at 2:00 AM — Shot on iPhone 16 Pro Max 🗼🌧️',
      description: 'Suasana hujan gerimis di Shibuya dengan pantulan lampu neon cyberpunk yang super estetik. Jangan lupa save buat ide b-roll kalian! #Tokyo #Cinematic #NeonVibes #VyroCreator',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600',
      duration: 15,
      width: 1080,
      height: 1920,
      userId: creatorSarah.id,
      categoryId: categories[3].id, // Travel & Lifestyle
      soundId: sounds[0].id,
      viewsCount: 12540,
      likesCount: 2310,
      commentsCount: 318,
      bookmarksCount: 650,
    },
    {
      title: 'Wagyu A5 Steak Sizzle: Rahasia Brown Butter & Fresh Rosemary 🥩🔥',
      description: 'Tips searing wagyu A5 biar crust-nya crispy dan dagingnya super melt-in-your-mouth! Berapa tingkat kematangan favorit kalian? #Wagyu #CookingHacks #SteakLover #FoodPorn',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
      duration: 15,
      width: 1080,
      height: 1920,
      userId: creatorMarcus.id,
      categoryId: categories[1].id, // Food & Cooking
      soundId: sounds[2].id,
      viewsCount: 8430,
      likesCount: 1840,
      commentsCount: 215,
      bookmarksCount: 420,
    },
    {
      title: 'Cyberpunk Desk Setup 2026: Ambient Light + Smart Matrix Display 🖥️⚡',
      description: 'Setup workspace minimalis dengan dual monitor ultrawide dan pencahayaan cerdas yang tersinkronisasi musik. Rate 1-10 di kolom komentar! #DeskSetup #TechLife #Aesthetic #Workspace',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600',
      duration: 12,
      width: 1080,
      height: 1920,
      userId: creatorAlex.id,
      categoryId: categories[2].id, // Tech & Gadgets
      soundId: sounds[1].id,
      viewsCount: 6200,
      likesCount: 1290,
      commentsCount: 95,
      bookmarksCount: 310,
    },
  ];

  for (const videoData of sampleVideos) {
    const video = await prisma.video.create({
      data: videoData,
    });

    // Add hashtags
    const tag1 = await prisma.hashtag.upsert({ where: { name: 'VyroAI' }, update: {}, create: { name: 'VyroAI' } });
    const tag2 = await prisma.hashtag.upsert({ where: { name: 'Viral' }, update: {}, create: { name: 'Viral' } });
    await prisma.videoHashtag.createMany({
      data: [
        { videoId: video.id, hashtagId: tag1.id },
        { videoId: video.id, hashtagId: tag2.id },
      ],
      skipDuplicates: true,
    });

    // Add Contextual AI Comments
    await prisma.comment.createMany({
      data: [
        {
          videoId: video.id,
          isAi: true,
          aiCharacterId: aiCharacters[0].id, // Sparky
          content: 'Ini kalau dilihat terus-menerus bisa bikin lupa deadline tugas kantor! Keren parah animasinya 🚀',
          likesCount: 24,
        },
        {
          videoId: video.id,
          isAi: true,
          aiCharacterId: aiCharacters[1].id, // Amara
          content: 'Sentuhan detailnya hangat banget! Suka sekali dengan transisi dan warna yang digunakan 😍✨',
          likesCount: 38,
        },
        {
          videoId: video.id,
          isAi: true,
          aiCharacterId: aiCharacters[2].id, // Zephyr
          content: 'LETSSS GOOO! Hype-nya dapet banget, transisi super smooth! 🔥🔥🔥',
          likesCount: 52,
        },
        {
          videoId: video.id,
          userId: userMaya.id,
          isAi: false,
          content: 'Suka banget sama sound track-nya, pas banget dengan visual videonya! Boleh minta judul audionya?',
          likesCount: 15,
        },
      ],
    });

    // Add AI Analysis record
    await prisma.aIAnalysis.create({
      data: {
        videoId: video.id,
        detectedContext: 'Short video highlighting vibrant aesthetic visual storytelling, crisp illumination, and dynamic rhythm.',
        detectedMood: 'Inspiring & Energetic',
        suggestedTags: JSON.stringify(['#cinematic', '#vyrocreators', '#aesthetic', '#trending']),
        generatedCaption: 'Catch the golden vibe and immerse yourself in this visual journey ✨',
        qualityScore: 9.2,
      },
    });
  }

  // 9. Follow relationships
  await prisma.follow.createMany({
    data: [
      { followerId: userMaya.id, followingId: creatorSarah.id },
      { followerId: userMaya.id, followingId: creatorMarcus.id },
      { followerId: creatorAlex.id, followingId: creatorSarah.id },
      { followerId: admin.id, followingId: creatorMarcus.id },
    ],
  });

  // 10. AI System Settings
  await prisma.aISetting.createMany({
    data: [
      { key: 'ai_comments_enabled', value: 'true', description: 'Enable or disable AI commenting across the platform' },
      { key: 'ai_comment_delay_seconds', value: '3', description: 'Simulated real-time delay before AI submits comment' },
      { key: 'ai_max_comments_per_video', value: '4', description: 'Maximum AI comments per published video' },
      { key: 'ai_provider', value: 'gemini_vision_pro', description: 'Active AI vision and conversational provider' },
    ],
  });

  console.log('✅ Database seeded successfully with full realistic data!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

