import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const clientDir = path.join(distDir, 'client');
const serverDir = path.join(distDir, 'server');
const workerDir = path.join(distDir, '_worker.js');

// 1. client 파일들을 dist 최상단으로 이동
if (fs.existsSync(clientDir)) {
  const files = fs.readdirSync(clientDir);
  for (const file of files) {
    fs.renameSync(path.join(clientDir, file), path.join(distDir, file));
  }
  fs.rmdirSync(clientDir);
}

// 2. server 폴더를 _worker.js 로 이름 변경
if (fs.existsSync(serverDir)) {
  fs.renameSync(serverDir, workerDir);
}

// 3. _worker.js 내부의 entry.mjs를 index.js로 이름 변경
if (fs.existsSync(workerDir)) {
  const entryFile = path.join(workerDir, 'entry.mjs');
  const indexFile = path.join(workerDir, 'index.js');
  if (fs.existsSync(entryFile)) {
    fs.renameSync(entryFile, indexFile);
  }
  
  // 충돌 방지를 위해 dist/_worker.js/wrangler.json 삭제
  const workerWranglerJson = path.join(workerDir, 'wrangler.json');
  if (fs.existsSync(workerWranglerJson)) {
    fs.unlinkSync(workerWranglerJson);
  }
}

// 4. Astro가 생성한 .wrangler 메타데이터 폴더 삭제 (Wrangler 배포 오류 방지)
const wranglerDir = path.join(__dirname, '.wrangler');
if (fs.existsSync(wranglerDir)) {
  fs.rmSync(wranglerDir, { recursive: true, force: true });
}

console.log('Successfully rearranged build output for Cloudflare Pages and cleaned up .wrangler metadata.');
