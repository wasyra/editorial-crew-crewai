# Arranca API (8001, sin --reload) + frontend VetaUI (3000)

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Set-Location $root



Write-Host "API: http://localhost:8001 (run-api.ps1)" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\scripts\run-api.ps1"



Start-Sleep -Seconds 3



Write-Host "Web: http://localhost:3000" -ForegroundColor Cyan

Set-Location web

if (-not (Test-Path .env.local)) {

  Copy-Item .env.local.example .env.local

  (Get-Content .env.local) -replace '8000', '8001' | Set-Content .env.local

}

npm run dev

