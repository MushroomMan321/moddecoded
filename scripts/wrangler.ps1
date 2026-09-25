# Runs wrangler with the saved Cloudflare token, without printing it.
# The token is decrypted into this process's environment only and removed when wrangler exits.
# Usage: powershell -NoProfile -File scripts\wrangler.ps1 pages deploy site --project-name=moddecoded

$dir = Join-Path $env:APPDATA 'moddecoded'
$tokenFile = Join-Path $dir 'cf-token.dpapi'
$accountFile = Join-Path $dir 'cf-account-id.txt'

if (-not (Test-Path $tokenFile)) {
    Write-Error 'No saved token. Run scripts\save-cloudflare-token.ps1 first.'
    exit 1
}

$secure = Get-Content $tokenFile | ConvertTo-SecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $env:CLOUDFLARE_API_TOKEN = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    if (Test-Path $accountFile) { $env:CLOUDFLARE_ACCOUNT_ID = (Get-Content $accountFile -Raw).Trim() }
    & npx --yes wrangler@4 @args
    $code = $LASTEXITCODE
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    Remove-Item Env:CLOUDFLARE_API_TOKEN -ErrorAction SilentlyContinue
    Remove-Item Env:CLOUDFLARE_ACCOUNT_ID -ErrorAction SilentlyContinue
}
exit $code
