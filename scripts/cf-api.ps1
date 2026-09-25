# Calls the Cloudflare API with the saved token, without printing it.
# Usage: powershell -NoProfile -File scripts\cf-api.ps1 GET  "/accounts/{account}/pages/projects/moddecoded/domains"
#        powershell -NoProfile -File scripts\cf-api.ps1 POST "/accounts/{account}/pages/projects/moddecoded/domains" '{"name":"moddecoded.com"}'
# "{account}" in the path is replaced with the saved account ID.
param(
    [Parameter(Mandatory)][ValidateSet('GET','POST','PATCH','PUT','DELETE')][string]$Method,
    [Parameter(Mandatory)][string]$Path,
    [string]$Body
)

$dir = Join-Path $env:APPDATA 'moddecoded'
$tokenFile = Join-Path $dir 'cf-token.dpapi'
$accountFile = Join-Path $dir 'cf-account-id.txt'
if (-not (Test-Path $tokenFile)) { Write-Error 'No saved token. Run scripts\save-cloudflare-token.ps1 first.'; exit 1 }
if ($Path -like '*{account}*') {
    if (-not (Test-Path $accountFile)) { Write-Error 'No saved account ID.'; exit 1 }
    $Path = $Path.Replace('{account}', (Get-Content $accountFile -Raw).Trim())
}

$secure = Get-Content $tokenFile | ConvertTo-SecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $headers = @{ Authorization = 'Bearer ' + [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
    $params = @{ Method = $Method; Uri = "https://api.cloudflare.com/client/v4$Path"; Headers = $headers; ContentType = 'application/json' }
    if ($Body) { $params.Body = $Body }
    try { $resp = Invoke-RestMethod @params }
    catch {
        $r = $_.ErrorDetails.Message; if (-not $r) { $r = $_.Exception.Message }
        Write-Output $r; exit 1
    }
    $resp | ConvertTo-Json -Depth 8
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    Remove-Variable headers -ErrorAction SilentlyContinue
}
