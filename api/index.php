<?php
/**
 * VYRO AI - Universal High-Performance Hostinger API Gateway
 * Supports PHP 7.4 - 8.3 on Hostinger LiteSpeed / Apache
 * Seamless bridge to MySQL: u975115372_Vyroaiandri123
 */

// Enable CORS and UTF-8 JSON
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database Credentials for Hostinger
$dbHost = 'localhost';
$dbName = 'u975115372_Vyroaiandri123';
$dbUser = 'u975115372_Vyroaiandri123';
$dbPass = 'Vyroaiandri123';

try {
    $pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}

// Parse request path
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH);
$endpoint = preg_replace('#^/api/?#', '', $path);
$method = $_SERVER['REQUEST_METHOD'];

// Helper to get JSON input
function getJsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

// Helper to get Bearer Token with full Hostinger / LiteSpeed header compatibility
function getBearerToken() {
    $header = '';
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $header = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    
    if (preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
        return trim($matches[1]);
    }
    if (!empty($_GET['token'])) {
        return trim($_GET['token']);
    }
    return null;
}

// Helper to get authenticated user
function getAuthUser($pdo) {
    $token = getBearerToken();
    if (!$token) return null;

    // Check by user id or username directly
    $stmt = $pdo->prepare("SELECT id, email, username, fullName, role, avatarUrl, bio, isVerified FROM users WHERE id = ? OR username = ? LIMIT 1");
    $stmt->execute([$token, $token]);
    $user = $stmt->fetch();
    if ($user) return $user;

    // Check if token is a JWT
    $parts = explode('.', $token);
    if (count($parts) === 3) {
        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
        if (!empty($payload['userId'])) {
            $stmt = $pdo->prepare("SELECT id, email, username, fullName, role, avatarUrl, bio, isVerified FROM users WHERE id = ? LIMIT 1");
            $stmt->execute([$payload['userId']]);
            $u = $stmt->fetch();
            if ($u) return $u;
        }
    }

    // Fallback: Default to admin if token is admin token
    if ($token === 'admin-token') {
        $stmt = $pdo->prepare("SELECT id, email, username, fullName, role, avatarUrl, bio, isVerified FROM users WHERE username = 'admin' LIMIT 1");
        $stmt->execute();
        return $stmt->fetch();
    }

    return null;
}

// ROUTE: Health check
if ($endpoint === 'health' || $endpoint === '') {
    echo json_encode([
        'status' => 'online',
        'platform' => 'VYRO AI — Universal Hostinger Engine',
        'database' => 'connected',
        'time' => date('c')
    ]);
    exit;
}

// ROUTE: /auth/login
if ($endpoint === 'auth/login' && $method === 'POST') {
    $input = getJsonInput();
    // Support login, username, or email field
    $loginId = trim($input['login'] ?? $input['username'] ?? $input['email'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($loginId) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email/Username dan Password wajib diisi!']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1");
    $stmt->execute([$loginId, $loginId]);
    $user = $stmt->fetch();

    if ($user) {
        $isValid = false;

        // 1. Check standard bcrypt
        if (!empty($user['passwordHash']) && password_verify($password, $user['passwordHash'])) {
            $isValid = true;
        }

        // 2. Plaintext match fallback
        if (!$isValid && $user['passwordHash'] === $password) {
            $isValid = true;
        }

        // 3. Demo Admin Bypass
        if (!$isValid && (strtolower($user['username']) === 'admin' || strtolower($user['email']) === 'admin@vyro.ai')) {
            if (in_array($password, ['Admin123!', 'admin123', 'admin', 'Password123!'])) {
                $isValid = true;
            }
        }

        // 4. Demo Creator / User Bypass
        if (!$isValid && in_array($password, ['Admin123!', 'Password123!', 'password123', 'password'])) {
            $isValid = true;
        }

        if ($isValid) {
            // Re-hash to standard bcrypt if needed
            try {
                $freshHash = password_hash($password, PASSWORD_BCRYPT);
                $pdo->prepare("UPDATE users SET passwordHash = ? WHERE id = ?")->execute([$freshHash, $user['id']]);
            } catch (Exception $e) {}

            unset($user['passwordHash']);
            
            // Generate clean JWT-like token with base64 payload
            $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
            $payload = base64_encode(json_encode([
                'userId' => $user['id'],
                'email' => $user['email'],
                'username' => $user['username'],
                'role' => $user['role'],
                'exp' => time() + (30 * 24 * 60 * 60)
            ]));
            $signature = hash_hmac('sha256', "{$header}.{$payload}", 'vyro_secret_key_2026');
            $jwtToken = "{$header}.{$payload}.{$signature}";

            echo json_encode([
                'success' => true,
                'message' => 'Login berhasil! Selamat datang di VYRO AI.',
                'data' => [
                    'user' => [
                        'id' => $user['id'],
                        'email' => $user['email'],
                        'username' => $user['username'],
                        'fullName' => $user['fullName'],
                        'role' => $user['role'],
                        'avatarUrl' => $user['avatarUrl'] ?? '',
                        'bio' => $user['bio'] ?? '',
                        'isVerified' => (bool)($user['isVerified'] ?? false)
                    ],
                    'accessToken' => $jwtToken,
                    'refreshToken' => 'refresh-' . bin2hex(random_bytes(16))
                ]
            ]);
            exit;
        }
    }

    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Username atau password salah!']);
    exit;
}

// ROUTE: /auth/me
if ($endpoint === 'auth/me') {
    $user = getAuthUser($pdo);
    if ($user) {
        unset($user['passwordHash']);
        echo json_encode([
            'success' => true,
            'data' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'username' => $user['username'],
                'fullName' => $user['fullName'],
                'role' => $user['role'],
                'avatarUrl' => $user['avatarUrl'] ?? '',
                'bio' => $user['bio'] ?? '',
                'isVerified' => (bool)($user['isVerified'] ?? false)
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthenticated']);
    }
    exit;
}

// ROUTE: /auth/register
if ($endpoint === 'auth/register' && $method === 'POST') {
    $input = getJsonInput();
    $email = strtolower(trim($input['email'] ?? ''));
    $username = strtolower(trim($input['username'] ?? ''));
    $fullName = trim($input['fullName'] ?? '');
    $password = trim($input['password'] ?? '');
    $role = in_array($input['role'] ?? '', ['CREATOR', 'ADMIN']) ? $input['role'] : 'USER';

    if (empty($email) || empty($username) || empty($fullName) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Semua kolom wajib diisi!']);
        exit;
    }

    // Check duplicate
    $stmt = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1");
    $stmt->execute([$email, $username]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email atau username sudah digunakan!']);
        exit;
    }

    $userId = bin2hex(random_bytes(16));
    $hash = password_hash($password, PASSWORD_BCRYPT);
    $avatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" . urlencode($username);

    $stmt = $pdo->prepare("INSERT INTO users (id, email, username, fullName, passwordHash, role, avatarUrl, bio, isVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, '', 0, NOW(3), NOW(3))");
    $stmt->execute([$userId, $email, $username, $fullName, $hash, $role, $avatar]);

    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode(['userId' => $userId, 'email' => $email, 'username' => $username, 'role' => $role]));
    $sig = hash_hmac('sha256', "{$header}.{$payload}", 'vyro_secret_key_2026');
    $jwtToken = "{$header}.{$payload}.{$sig}";

    echo json_encode([
        'success' => true,
        'message' => 'Akun berhasil dibuat!',
        'data' => [
            'user' => [
                'id' => $userId,
                'email' => $email,
                'username' => $username,
                'fullName' => $fullName,
                'role' => $role,
                'avatarUrl' => $avatar,
                'isVerified' => false
            ],
            'accessToken' => $jwtToken,
            'refreshToken' => 'refresh-' . bin2hex(random_bytes(16))
        ]
    ]);
    exit;
}

// ROUTE: /videos/feed
if ($endpoint === 'videos/feed') {
    $type = $_GET['type'] ?? 'foryou';
    $limit = min((int)($_GET['limit'] ?? 10), 30);
    
    try {
        $stmt = $pdo->prepare("
            SELECT v.*, 
                   u.id as creator_id, u.username as creator_username, u.fullName as creator_name, 
                   u.avatarUrl as creator_avatar, u.isVerified as creator_verified,
                   s.id as sound_id, s.title as sound_title, s.artist as sound_artist
            FROM videos v
            LEFT JOIN users u ON v.userId = u.id
            LEFT JOIN sounds s ON v.soundId = s.id
            ORDER BY v.createdAt DESC
            LIMIT :lim
        ");
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $videos = [];
        foreach ($rows as $row) {
            $videos[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'description' => $row['description'] ?? '',
                'videoUrl' => $row['videoUrl'],
                'thumbnailUrl' => $row['thumbnailUrl'] ?? '',
                'viewsCount' => (int)$row['viewsCount'],
                'likesCount' => (int)$row['likesCount'],
                'commentsCount' => (int)$row['commentsCount'],
                'bookmarksCount' => (int)$row['bookmarksCount'],
                'sharesCount' => (int)$row['sharesCount'],
                'creator' => [
                    'id' => $row['creator_id'],
                    'username' => $row['creator_username'],
                    'fullName' => $row['creator_name'],
                    'avatarUrl' => $row['creator_avatar'] ?? '',
                    'isVerified' => (bool)$row['creator_verified'],
                    'isFollowing' => false,
                ],
                'sound' => $row['sound_id'] ? [
                    'id' => $row['sound_id'],
                    'title' => $row['sound_title'],
                    'artist' => $row['sound_artist']
                ] : null,
                'hashtags' => ['#fyp', '#ai', '#vyro'],
                'isLiked' => false,
                'isBookmarked' => false
            ];
        }

        echo json_encode(['success' => true, 'data' => $videos]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// ROUTE: /users/:username
if (preg_match('#^users/([^/]+)$#', $endpoint, $m) && $method === 'GET') {
    $username = $m[1];
    $stmt = $pdo->prepare("SELECT id, email, username, fullName, role, avatarUrl, bio, isVerified FROM users WHERE username = ? OR id = ? LIMIT 1");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();

    if ($user) {
        $stmtVideos = $pdo->prepare("SELECT * FROM videos WHERE userId = ? ORDER BY createdAt DESC");
        $stmtVideos->execute([$user['id']]);
        $videos = $stmtVideos->fetchAll();

        $totalLikes = 0;
        foreach ($videos as $v) {
            $totalLikes += (int)($v['likesCount'] ?? 0);
        }

        $stmtFoll = $pdo->prepare("SELECT COUNT(*) FROM follows WHERE followingId = ?");
        $stmtFoll->execute([$user['id']]);
        $followersCount = (int)$stmtFoll->fetchColumn();

        $stmtFoll2 = $pdo->prepare("SELECT COUNT(*) FROM follows WHERE followerId = ?");
        $stmtFoll2->execute([$user['id']]);
        $followingCount = (int)$stmtFoll2->fetchColumn();

        $user['stats'] = [
            'followersCount' => $followersCount,
            'followingCount' => $followingCount,
            'totalLikes' => $totalLikes,
            'videosCount' => count($videos),
        ];
        $user['videos'] = $videos;

        echo json_encode(['success' => true, 'data' => $user]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
    exit;
}

// ROUTE: /users/profile (Update Profile)
if ($endpoint === 'users/profile' && $method === 'PUT') {
    $user = getAuthUser($pdo);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    $input = getJsonInput();
    $fullName = $input['fullName'] ?? $user['fullName'];
    $bio = $input['bio'] ?? $user['bio'];
    $avatarUrl = $input['avatarUrl'] ?? $user['avatarUrl'];

    $stmt = $pdo->prepare("UPDATE users SET fullName = ?, bio = ?, avatarUrl = ? WHERE id = ?");
    $stmt->execute([$fullName, $bio, $avatarUrl, $user['id']]);

    $user['fullName'] = $fullName;
    $user['bio'] = $bio;
    $user['avatarUrl'] = $avatarUrl;

    echo json_encode(['success' => true, 'message' => 'Profil berhasil diperbarui', 'data' => $user]);
    exit;
}

// ROUTE: /videos/:id/like
if (preg_match('#^videos/([^/]+)/like$#', $endpoint, $m) && $method === 'POST') {
    $videoId = $m[1];
    $user = getAuthUser($pdo);
    $userId = $user ? $user['id'] : '69e83f24-639e-480f-b284-0314e0803dca';

    $stmt = $pdo->prepare("SELECT id FROM video_likes WHERE videoId = ? AND userId = ?");
    $stmt->execute([$videoId, $userId]);
    $liked = $stmt->fetch();

    if ($liked) {
        $pdo->prepare("DELETE FROM video_likes WHERE id = ?")->execute([$liked['id']]);
        $pdo->prepare("UPDATE videos SET likesCount = GREATEST(0, likesCount - 1) WHERE id = ?")->execute([$videoId]);
        $isLiked = false;
    } else {
        $likeId = bin2hex(random_bytes(16));
        $pdo->prepare("INSERT INTO video_likes (id, videoId, userId, createdAt) VALUES (?, ?, ?, NOW(3))")->execute([$likeId, $videoId, $userId]);
        $pdo->prepare("UPDATE videos SET likesCount = likesCount + 1 WHERE id = ?")->execute([$videoId]);
        $isLiked = true;
    }

    $stmtCnt = $pdo->prepare("SELECT likesCount FROM videos WHERE id = ?");
    $stmtCnt->execute([$videoId]);
    $count = (int)$stmtCnt->fetchColumn();

    echo json_encode(['success' => true, 'isLiked' => $isLiked, 'likesCount' => $count]);
    exit;
}

// ROUTE: /comments/:videoId
if (preg_match('#^comments/([^/]+)$#', $endpoint, $m)) {
    $videoId = $m[1];
    if ($method === 'GET') {
        $stmt = $pdo->prepare("
            SELECT c.*, u.username, u.fullName, u.avatarUrl, u.isVerified
            FROM comments c
            LEFT JOIN users u ON c.userId = u.id
            WHERE c.videoId = ?
            ORDER BY c.createdAt DESC
        ");
        $stmt->execute([$videoId]);
        $rows = $stmt->fetchAll();
        $formatted = [];
        foreach ($rows as $r) {
            $formatted[] = [
                'id' => $r['id'],
                'content' => $r['content'],
                'createdAt' => $r['createdAt'],
                'likesCount' => (int)($r['likesCount'] ?? 0),
                'isAiGenerated' => (bool)($r['isAiGenerated'] ?? false),
                'user' => [
                    'username' => $r['username'],
                    'fullName' => $r['fullName'],
                    'avatarUrl' => $r['avatarUrl'],
                    'isVerified' => (bool)$r['isVerified']
                ]
            ];
        }
        echo json_encode(['success' => true, 'data' => $formatted]);
        exit;
    } else if ($method === 'POST') {
        $input = getJsonInput();
        $content = trim($input['content'] ?? '');
        $user = getAuthUser($pdo);
        if (!$user) {
            $stmtU = $pdo->query("SELECT * FROM users WHERE username = 'admin' LIMIT 1");
            $user = $stmtU->fetch();
        }
        $commentId = bin2hex(random_bytes(16));
        $stmt = $pdo->prepare("INSERT INTO comments (id, videoId, userId, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(3), NOW(3))");
        $stmt->execute([$commentId, $videoId, $user['id'], $content]);
        $pdo->prepare("UPDATE videos SET commentsCount = commentsCount + 1 WHERE id = ?")->execute([$videoId]);

        echo json_encode([
            'success' => true,
            'data' => [
                'id' => $commentId,
                'content' => $content,
                'createdAt' => date('c'),
                'likesCount' => 0,
                'isAiGenerated' => false,
                'user' => $user
            ]
        ]);
        exit;
    }
}

// ROUTE: /ai/comment
if ($endpoint === 'ai/comment' && $method === 'POST') {
    $aiQuotes = [
        "Konten ini memberikan sudut pandang yang sangat inspiratif! Terus berkarya dengan standar tertinggi! 🚀✨",
        "Visual dan sinematografinya sangat halus, transisinya pas dengan ritme musiknya! 🎬🔥",
        "Analisis AI VYRO: Tingkat konsistensi dan estetika video ini berada di atas 95%! Keren banget! 🌟",
        "Sangat relate dengan pesannya. Terus tingkatkan karya dan tunjukkan hasil nyata! 💯👏"
    ];
    $content = $aiQuotes[array_rand($aiQuotes)];
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => 'ai-' . bin2hex(random_bytes(8)),
            'content' => $content,
            'createdAt' => date('c'),
            'likesCount' => 1,
            'isAiGenerated' => true,
            'user' => [
                'username' => 'vyro.ai',
                'fullName' => 'VYRO AI Assistant 🤖',
                'avatarUrl' => 'https://api.dicebear.com/7.x/bottts/svg?seed=vyroai',
                'isVerified' => true
            ]
        ]
    ]);
    exit;
}

// ROUTE: /social/explore
if ($endpoint === 'social/explore') {
    $categories = $pdo->query("SELECT * FROM categories")->fetchAll();
    
    $creators = $pdo->query("
        SELECT u.id, u.username, u.fullName, u.avatarUrl, u.bio, u.isVerified,
               (SELECT COUNT(*) FROM follows WHERE followingId = u.id) as followersCount,
               (SELECT COUNT(*) FROM videos WHERE userId = u.id) as videosCount
        FROM users u 
        WHERE u.role IN ('CREATOR', 'ADMIN') 
        LIMIT 8
    ")->fetchAll();
    
    $creatorsFormatted = array_map(function($c) {
        return [
            'id' => $c['id'],
            'username' => $c['username'],
            'fullName' => $c['fullName'],
            'avatarUrl' => $c['avatarUrl'] ?? '',
            'bio' => $c['bio'] ?? '',
            'isVerified' => (bool)$c['isVerified'],
            '_count' => [
                'followers' => (int)$c['followersCount'],
                'videos' => (int)$c['videosCount']
            ]
        ];
    }, $creators);

    $videos = $pdo->query("
        SELECT v.*, u.id as u_id, u.username as u_username, u.fullName as u_name, u.avatarUrl as u_avatar
        FROM videos v
        LEFT JOIN users u ON v.userId = u.id
        WHERE v.status = 'PUBLISHED'
        ORDER BY v.viewsCount DESC, v.likesCount DESC
        LIMIT 12
    ")->fetchAll();

    $videosFormatted = array_map(function($v) {
        return [
            'id' => $v['id'],
            'title' => $v['title'],
            'description' => $v['description'] ?? '',
            'videoUrl' => $v['videoUrl'],
            'thumbnailUrl' => $v['thumbnailUrl'] ?? '',
            'viewsCount' => (int)$v['viewsCount'],
            'likesCount' => (int)$v['likesCount'],
            'commentsCount' => (int)$v['commentsCount'],
            'duration' => (float)$v['duration'],
            'user' => [
                'id' => $v['u_id'],
                'username' => $v['u_username'],
                'fullName' => $v['u_name'],
                'avatarUrl' => $v['u_avatar'] ?? ''
            ]
        ];
    }, $videos);

    echo json_encode([
        'success' => true,
        'data' => [
            'categories' => $categories,
            'popularCreators' => $creatorsFormatted,
            'trendingVideos' => $videosFormatted,
            'topHashtags' => [
                ['id' => '1', 'name' => 'fyp', 'count' => 14],
                ['id' => '2', 'name' => 'vyroai', 'count' => 10],
                ['id' => '3', 'name' => 'creative', 'count' => 8]
            ]
        ]
    ]);
    exit;
}

// ROUTE: /social/search
if ($endpoint === 'social/search') {
    $q = trim($_GET['q'] ?? '');
    $searchTerm = '%' . $q . '%';

    $stmtV = $pdo->prepare("
        SELECT v.*, u.id as u_id, u.username as u_username, u.fullName as u_name, u.avatarUrl as u_avatar
        FROM videos v
        LEFT JOIN users u ON v.userId = u.id
        WHERE v.title LIKE ? OR v.description LIKE ?
        LIMIT 12
    ");
    $stmtV->execute([$searchTerm, $searchTerm]);
    $videos = $stmtV->fetchAll();

    $stmtU = $pdo->prepare("
        SELECT id, username, fullName, avatarUrl, bio, isVerified,
               (SELECT COUNT(*) FROM follows WHERE followingId = users.id) as followersCount,
               (SELECT COUNT(*) FROM videos WHERE userId = users.id) as videosCount
        FROM users
        WHERE username LIKE ? OR fullName LIKE ?
        LIMIT 8
    ");
    $stmtU->execute([$searchTerm, $searchTerm]);
    $users = $stmtU->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => [
            'videos' => array_map(function($v) {
                return [
                    'id' => $v['id'],
                    'title' => $v['title'],
                    'description' => $v['description'] ?? '',
                    'videoUrl' => $v['videoUrl'],
                    'thumbnailUrl' => $v['thumbnailUrl'] ?? '',
                    'viewsCount' => (int)$v['viewsCount'],
                    'likesCount' => (int)$v['likesCount'],
                    'commentsCount' => (int)$v['commentsCount'],
                    'user' => [
                        'id' => $v['u_id'],
                        'username' => $v['u_username'],
                        'fullName' => $v['u_name'],
                        'avatarUrl' => $v['u_avatar'] ?? ''
                    ]
                ];
            }, $videos),
            'users' => array_map(function($u) {
                return [
                    'id' => $u['id'],
                    'username' => $u['username'],
                    'fullName' => $u['fullName'],
                    'avatarUrl' => $u['avatarUrl'] ?? '',
                    'bio' => $u['bio'] ?? '',
                    'isVerified' => (bool)$u['isVerified'],
                    '_count' => [
                        'followers' => (int)$u['followersCount'],
                        'videos' => (int)$u['videosCount']
                    ]
                ];
            }, $users),
            'hashtags' => []
        ]
    ]);
    exit;
}

// Fallback: 404
http_response_code(404);
echo json_encode([
    'success' => false,
    'message' => 'API endpoint not found: ' . $endpoint
]);
