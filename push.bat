@echo off
cd /d %~dp0
echo.
echo ========================================
echo   🚀 Mise a jour GitHub
echo ========================================
echo.

git add .

set MSG=Mise a jour %date% %time:~0,5%
git commit -m "%MSG%"

git push

echo.
echo ========================================
echo   ✅ GitHub mis a jour avec succes !
echo   📅 %MSG%
echo ========================================
echo.
pause