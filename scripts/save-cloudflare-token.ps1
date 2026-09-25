# Stores a Cloudflare API token encrypted with Windows DPAPI.
# Only your Windows user account on this PC can decrypt it; the file is useless if copied elsewhere.
# The token never appears on screen, in shell history, or in this repo.

$dir = Join-Path $env:APPDATA 'moddecoded'
$tokenFile = Join-Path $dir 'cf-token.dpapi'
$accountFile = Join-Path $dir 'cf-account-id.txt'

New-Item -ItemType Directory -Force -Path $dir | Out-Null

$secure = Read-Host -AsSecureString -Prompt 'Paste your Cloudflare API token (input is hidden), then press Enter'
if ($secure.Length -eq 0) { Write-Host 'Nothing entered. No changes made.'; exit 1 }
$secure | ConvertFrom-SecureString | Set-Content -Path $tokenFile -Encoding ascii

$account = Read-Host -Prompt 'Cloudflare Account ID (not secret; shown on the dashboard sidebar). Leave blank to skip'
if ($account) { $account.Trim() | Set-Content -Path $accountFile -Encoding ascii }

Write-Host "Saved. Token encrypted to your Windows account at $tokenFile"
