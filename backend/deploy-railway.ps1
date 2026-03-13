# DebtWise Backend - Railway Deploy
#
# STEP 1 (first time only): Run in terminal: railway login
#    → Opens browser, complete auth
#
# STEP 2: Run this script: .\deploy-railway.ps1

Set-Location $PSScriptRoot

Write-Host "`nRailway Deploy - DebtWise Backend`n" -ForegroundColor Cyan

$whoami = railway whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Not logged in." -ForegroundColor Red
    Write-Host "Run: railway login" -ForegroundColor Yellow
    Write-Host "This opens your browser. Complete auth, then run this script again.`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "Logged in: $whoami`n"

if (-not (Test-Path ".railway" -PathType Container)) {
    Write-Host "Initializing project..." -ForegroundColor Yellow
    railway init
    if ($LASTEXITCODE -ne 0) { exit 1 }
    Write-Host ""
}

Write-Host "Deploying..." -ForegroundColor Green
railway up

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDeploy complete!" -ForegroundColor Green
    Write-Host "Add GOOGLE_API_KEY, DATABASE_URL, JWT_SECRET in Railway dashboard if not set." -ForegroundColor Cyan
    Write-Host "Generate a domain in Settings > Networking.`n" -ForegroundColor Cyan
} else {
    exit 1
}
