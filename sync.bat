@echo off
echo Starting Auto-Sync to GitHub...
:loop
echo ----------------------------------------
echo Syncing at %date% %time%
git add .
git commit -m "Auto-sync: %date% %time%"
git push origin main
if %errorlevel% neq 0 (
    echo Push failed. Please check your remote connection or if there are changes to push.
) else (
    echo Push successful.
)
echo Waiting for 60 seconds...
timeout /t 60 >nul
goto loop
