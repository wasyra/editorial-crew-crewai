# API estable (sin --reload). No arranca si el puerto ya esta en uso.
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$port = if ($args.Count -gt 0) { [int]$args[0] } else { 8001 }

function Test-ApiPort([int]$p) {
  try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:$p/api/health" -UseBasicParsing -TimeoutSec 3
    return $r.StatusCode -eq 200
  } catch {
    return $false
  }
}

if (Test-ApiPort $port) {
  Write-Host ""
  Write-Host "La API YA esta corriendo en http://127.0.0.1:$port" -ForegroundColor Green
  Write-Host "No hace falta arrancar otra vez. Usa el frontend (npm run dev)." -ForegroundColor Cyan
  Write-Host "Si quieres reiniciar: cierra la otra terminal con uvicorn o ejecuta:" -ForegroundColor DarkGray
  Write-Host "  Get-NetTCPConnection -LocalPort $port | %% { Stop-Process -Id `$_.OwningProcess -Force }" -ForegroundColor DarkGray
  Write-Host ""
  exit 0
}

$listen = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($listen) {
  Write-Host "Puerto $port ocupado pero /api/health no responde." -ForegroundColor Yellow
  Write-Host "Prueba otro puerto: .\scripts\run-api.ps1 8002" -ForegroundColor Yellow
  Write-Host "Y en web/.env.local: NEXT_PUBLIC_API_URL=http://localhost:8002" -ForegroundColor Yellow
  exit 1
}

Write-Host "Arrancando API en http://127.0.0.1:$port (sin --reload)" -ForegroundColor Cyan
Write-Host "Frontend: web/.env.local -> NEXT_PUBLIC_API_URL=http://localhost:$port" -ForegroundColor DarkGray
Write-Host "Ctrl+C para detener" -ForegroundColor DarkGray
Write-Host ""

.\.venv\Scripts\activate
uvicorn api.main:app --port $port --host 127.0.0.1
