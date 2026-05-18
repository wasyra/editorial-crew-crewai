# Libera el puerto 8000 (uvicorn colgado / --reload)
Write-Host "Buscando procesos en puerto 8000..." -ForegroundColor Cyan

$procIds = @(
  (Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue).OwningProcess
) | Where-Object { $_ -gt 0 } | Sort-Object -Unique

foreach ($id in $procIds) {
  try {
    Stop-Process -Id $id -Force -ErrorAction Stop
    Write-Host "  Detenido PID $id" -ForegroundColor Green
  } catch {
    Write-Host "  No se pudo detener PID $id (puede ser zombie)" -ForegroundColor Yellow
  }
}

Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -match 'uvicorn.*api\.main' } |
  ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    Write-Host "  Detenido uvicorn PID $($_.ProcessId)" -ForegroundColor Green
  }

Start-Sleep -Seconds 2
$listen = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if ($listen) {
  Write-Host ""
  Write-Host "El puerto 8000 sigue ocupado." -ForegroundColor Red
  Write-Host "Cierra la terminal donde corria uvicorn (icono papelera) o reinicia Cursor." -ForegroundColor Yellow
  Write-Host "Alternativa (recomendada):" -ForegroundColor Yellow
  Write-Host "  .\scripts\run-api.ps1" -ForegroundColor Yellow
  Write-Host "  (usa puerto 8001; web/.env.local ya apunta ahi)" -ForegroundColor Yellow
  Write-Host "Si sigue bloqueado: reinicia Cursor o el PC para liberar el socket fantasma." -ForegroundColor DarkGray
} else {
  Write-Host ""
  Write-Host "Puerto 8000 libre. Arranca: uvicorn api.main:app --port 8000" -ForegroundColor Green
}
