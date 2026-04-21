#!/bin/bash
# 确保只有一个 serve 进程在 5000 端口运行

# 杀掉所有现有的 serve 和 http.server 进程
pkill -f "serve.*5000" 2>/dev/null
pkill -f "http.server.*5000" 2>/dev/null
sleep 1

# 切换到正确目录
cd /workspace/projects

# 启动新的 serve 进程
node /root/.npm/_npx/aab42732f01924e5/node_modules/.bin/serve -l 5000 public > /app/work/logs/bypass/dev.log 2>&1 &

echo "服务已启动"
