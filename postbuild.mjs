import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const clientDir = path.join(distDir, 'client');
const serverDir = path.join(distDir, 'server');
const workerDir = path.join(distDir, '_worker.js');

// 1. client 폴더의 파일들을 dist 최상단으로 이동
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
  
  // 4. wrangler.json 파일이 있으면 충돌 방지를 위해 삭제
  const wranglerJson = path.join(workerDir, 'wrangler.json');
  if (fs.existsSync(wranglerJson)) {
    fs.unlinkSync(wranglerJson);
  }
}

console.log('Successfully rearranged build output for Cloudflare Pages (_worker.js module worker format).');
