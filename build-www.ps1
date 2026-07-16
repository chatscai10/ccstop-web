# 把遊戲網頁檔複製進 Capacitor 的 www 目錄（App 打包用）
$root = $PSScriptRoot
$www = Join-Path $root 'www'
if(Test-Path $www){ Remove-Item -Recurse -Force $www }
New-Item -ItemType Directory -Force $www | Out-Null
Copy-Item (Join-Path $root 'index.html') $www
Copy-Item (Join-Path $root 'style.css') $www
Copy-Item (Join-Path $root 'js') (Join-Path $www 'js') -Recurse
Write-Output "www 已更新：$((Get-ChildItem $www -Recurse -File).Count) 個檔案"
