@echo off
chcp 65001 >nul
cd /d "%~dp0app"

rem app/admin-server/ 属于仅本地运行的管理服务，已被 .gitignore 排除，
rem 因此新克隆的仓库里没有这个目录。这里给出明确提示，而不是让用户
rem 对着一句 "Cannot find module" 发呆。

if not exist "admin-server\index.cjs" (
    echo.
    echo   [X] 找不到本地管理后台 admin-server\index.cjs
    echo.
    echo   原因：app\admin-server\ 只在本机运行，故意不提交到 Git。
    echo         如需使用文章管理后台，请把该目录恢复到 app\ 下。
    echo.
    echo   只想浏览网站的话，直接运行：  npm run dev
    echo.
    pause
    exit /b 1
)

echo.
echo   落笔阁管理后台启动中...
echo.
node admin-server\index.cjs
pause
