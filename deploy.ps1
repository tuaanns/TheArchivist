# ============================================
# THE ARCHIVIST - Deploy Script
# Pushes Backend (Azure) + Frontend (Vercel)
# ============================================

param(
    [string]$Message = "Update full system"
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  THE ARCHIVIST - Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Commit all changes in monorepo
Write-Host "[1/5] Committing changes..." -ForegroundColor Yellow
git add .
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Host "  -> No changes to commit, continuing..." -ForegroundColor Gray
}

# Step 2: Push monorepo -> Azure backend auto-deploy
Write-Host "[2/5] Pushing to origin (Azure backend)..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "  -> Backend pushed OK!" -ForegroundColor Green
} else {
    Write-Host "  -> Backend push FAILED!" -ForegroundColor Red
}

# Step 3: Push monorepo -> secondary backup
Write-Host "[3/5] Pushing to secondary (backup)..." -ForegroundColor Yellow
git push secondary main 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  -> Backup pushed OK!" -ForegroundColor Green
} else {
    Write-Host "  -> Backup push skipped" -ForegroundColor Gray
}

# Step 4: Sync frontend to gom-web repo -> Vercel auto-deploy
Write-Host "[4/5] Syncing frontend to Vercel..." -ForegroundColor Yellow
$tempDir = Join-Path $PSScriptRoot "temp-gom-web"
$sourceDir = Join-Path $PSScriptRoot "gom-web"

# Clone gom-web repo
git clone --depth 1 https://github.com/tuaanns/gom-web.git $tempDir 2>$null

if (Test-Path $tempDir) {
    # Remove old files (keep .git)
    Get-ChildItem -Path $tempDir -Exclude ".git" -Force | Remove-Item -Recurse -Force

    # Copy new files
    robocopy $sourceDir $tempDir /E /XD node_modules .git /XF .env /NFL /NDL /NJH /NJS /NC /NS /NP > $null

    # Commit and push
    Push-Location $tempDir
    git add -A
    git commit -m $Message 2>$null
    if ($LASTEXITCODE -eq 0) {
        git push origin main
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  -> Frontend pushed OK! Vercel will auto-deploy." -ForegroundColor Green
        } else {
            Write-Host "  -> Frontend push FAILED!" -ForegroundColor Red
        }
    } else {
        Write-Host "  -> No frontend changes to push." -ForegroundColor Gray
    }
    Pop-Location

    # Cleanup
    Remove-Item -Recurse -Force $tempDir
} else {
    Write-Host "  -> Failed to clone gom-web repo!" -ForegroundColor Red
}

# Step 5: Done
Write-Host ""
Write-Host "[5/5] Deploy complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend:  https://thearchivist-edemdeeaf4ahamgs.southeastasia-01.azurewebsites.net" -ForegroundColor White
Write-Host "  Frontend: https://thearchivistai.vercel.app" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
