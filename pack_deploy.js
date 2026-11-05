const fs = require('fs');
const path = require('path');

(async () => {
  const { ZipArchive } = await import('archiver');

  const outputZipPath = path.join(__dirname, 'VYRO_AI_HOSTINGER_DEPLOY.zip');
  if (fs.existsSync(outputZipPath)) {
    fs.unlinkSync(outputZipPath);
  }

  const output = fs.createWriteStream(outputZipPath);
  const archive = new ZipArchive({
    zlib: { level: 9 }
  });

  output.on('close', function() {
    console.log(`✅ ZIP package created successfully! Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  });

  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.warn(err);
    } else {
      throw err;
    }
  });

  archive.on('error', function(err) {
    throw err;
  });

  archive.pipe(output);

  // 1. ROOT WEB FILES (Directly for LiteSpeed/Apache/Nginx document root)
  const distIndex = path.join(__dirname, 'client/dist/index.html');
  if (fs.existsSync(distIndex)) {
    archive.file(distIndex, { name: 'index.html' });
  }

  const rootHtaccess = path.join(__dirname, '.htaccess');
  if (fs.existsSync(rootHtaccess)) {
    archive.file(rootHtaccess, { name: '.htaccess' });
  }

  // 2. ASSETS DIRECTORY (Frontend CSS/JS bundles)
  const distAssetsDir = path.join(__dirname, 'client/dist/assets');
  if (fs.existsSync(distAssetsDir)) {
    archive.directory(distAssetsDir, 'assets');
  }

  // 3. API DIRECTORY (PHP Universal API Gateway)
  const apiDir = path.join(__dirname, 'api');
  if (fs.existsSync(apiDir)) {
    archive.directory(apiDir, 'api');
  }

  // 4. UPLOADS DIRECTORY (Videos, Avatars, Sounds)
  const uploadsDir = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadsDir)) {
    archive.directory(uploadsDir, 'uploads');
  }

  // 5. DATABASE SQL DUMP
  const sqlFile1 = path.join(__dirname, 'vyro_ai_db.sql');
  if (fs.existsSync(sqlFile1)) {
    archive.file(sqlFile1, { name: 'vyro_ai_db.sql' });
  }
  const sqlFile2 = path.join(__dirname, 'vyro_ai_database.sql');
  if (fs.existsSync(sqlFile2)) {
    archive.file(sqlFile2, { name: 'vyro_ai_database.sql' });
  }

  // 6. NODE.JS SERVER FILES & RUNTIMES
  const indexJs = path.join(__dirname, 'index.js');
  if (fs.existsSync(indexJs)) {
    archive.file(indexJs, { name: 'index.js' });
  }

  const rootPkg = path.join(__dirname, 'package.json');
  if (fs.existsSync(rootPkg)) {
    archive.file(rootPkg, { name: 'package.json' });
  }

  // Server folder (dist, .env, prisma)
  const serverDir = path.join(__dirname, 'server');
  if (fs.existsSync(serverDir)) {
    archive.glob('**/*', {
      cwd: serverDir,
      ignore: ['node_modules/**', 'dist/**/tests/**']
    }, { prefix: 'server' });
  }

  // Client folder (client/dist and source for backup)
  const clientDir = path.join(__dirname, 'client');
  if (fs.existsSync(clientDir)) {
    archive.glob('**/*', {
      cwd: clientDir,
      ignore: ['node_modules/**']
    }, { prefix: 'client' });
  }

  await archive.finalize();
})();
