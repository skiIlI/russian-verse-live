$ErrorActionPreference = 'Stop'

if (-not $env:LOCALAPPDATA) {
  throw 'LOCALAPPDATA is required to install the local benchmark helpers.'
}

$toolRoot = Join-Path $env:LOCALAPPDATA 'VerseListener\benchmark-tools'
$python = Join-Path $toolRoot 'Scripts\python.exe'

if (-not (Test-Path -LiteralPath $python)) {
  python -m venv $toolRoot
}

& $python -m pip install --disable-pip-version-check --upgrade yt-dlp av numpy
if ($LASTEXITCODE -ne 0) {
  throw 'The benchmark helper installation failed.'
}

Write-Host "Verse Listener benchmark tools are ready in $toolRoot"
