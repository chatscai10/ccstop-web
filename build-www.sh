#!/usr/bin/env bash
# CI 用：把遊戲網頁檔複製進 Capacitor 的 www 目錄
set -e
cd "$(dirname "$0")"
rm -rf www
mkdir -p www
cp index.html style.css www/
cp -r js www/js
echo "www ready: $(find www -type f | wc -l) files"
