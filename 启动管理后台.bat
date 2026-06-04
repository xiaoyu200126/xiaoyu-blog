@echo off
cd /d "%~dp0app"
echo.
echo   落笔阁管理后台启动中...
echo.
node admin-server\index.cjs
pause
