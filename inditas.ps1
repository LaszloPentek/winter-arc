$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$winterNode = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $winterNode) {
    $winterNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
}
if (-not (Test-Path -LiteralPath $winterNode)) { throw 'A Node.js nem található. Telepíts Node.js 24 LTS-t.' }
if (-not (Test-Path -LiteralPath 'node_modules\vite\bin\vite.js')) { throw 'A függőségek hiányoznak. Futtasd: npm ci' }
& $winterNode 'node_modules\vite\bin\vite.js' --host 127.0.0.1
