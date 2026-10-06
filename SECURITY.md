# 密钥与隐私保护

本仓库是**公开**仓库。任何一次 push 都会把内容公开，任何泄漏都不可撤回。
因此这里配置了三层互相独立的防线。

---

## 一、`.gitignore` —— 第一层

覆盖范围（详见根目录 `.gitignore`）：

| 类别 | 例子 |
|------|------|
| 环境变量 | `.env`、`.env.*`、`*.env`、`.envrc`、`env.js/ts` |
| 私钥与证书 | `id_rsa`、`*.key`、`*.pem`、`*.p12`、`*.pfx`、`*.jks`、`.ssh/` |
| 凭据文件 | `credentials.json`、`service-account*.json`、`auth.json`、`.netrc`、`.npmrc` |
| 本地数据 | `config.local.*`、`*.sqlite`、`*.db`、`secrets/` |

> ⚠️ 这里**刻意没有**使用裸的 `*secret*` / `*token*` / `*password*` 通配。
> 实测踩过：`guard-secrets.mjs` 会被 `*secret*` 直接误伤而永远进不了仓库，
> 结果是「守卫上线了但根本没提交」这种最危险的假安全。
> 宽松匹配改由 `tools/guard-secrets.mjs` 的路径规则按路径段精确判断。

---

## 二、pre-commit 钩子 —— 第二层

```bash
# 每个 clone 只需执行一次
git config core.hooksPath .githooks
```

之后每次 `git commit` 都会先跑 `tools/guard-secrets.mjs --staged`，三道检查任一不过
即中止提交：

1. **路径黑名单** —— 敏感文件名一律拒绝入库
2. **内容特征** —— 已暂存内容里的密钥格式
   （私钥块、OpenAI / Anthropic / GitHub / AWS / Google / Slack / Coze / npm / JWT，
   以及硬编码的 password / secret / api_key）
3. **体积闸门** —— 单文件超过 5 MB 拒绝（防止又塞进一张 6 MB 的死图）

**误报处理**：确认安全后，把该文件的完整相对路径写进 `tools/secret-allowlist.txt`。
请勿为了图省事直接用 `--no-verify`。

---

## 三、CI —— 第三层

`.github/workflows/secret-guard.yml` 在**每次 push 和每个 PR** 上强制执行：

- 守卫自测（确认检查器本身没坏）
- 全历史敏感路径扫描（`fetch-depth: 0`，覆盖所有分支）
- 工作区内容特征扫描
- gitleaks 深度扫描
- 构建校验（防止守卫上线后把构建搞坏）

本地钩子可以用 `--no-verify` 绕过，但 **CI 这一层绕不过去**。

---

## 附加：屏蔽自己的个人信息

在仓库根目录建 `.personal-deny.txt`，每行写一条真实标识（手机号、身份证号、住址等）：

```
13800000000
110101199001011234
```

守卫会自动把它当作内容正则扫描。**该文件本身已在 `.gitignore` 中。**

---

## 验证防线是否真的有效

```bash
node tools/guard-secrets.mjs --self-test   # 14 项：正例必须抓到，正常源码不得误报
node tools/guard-secrets.mjs --history     # 扫描全部历史提交
node tools/guard-secrets.mjs --all         # 扫描工作区全部受控文件
```

> `--self-test` 存在的意义：**跑一遍全绿不能证明检查器有效。**
> 它用注入的假密钥和假路径逐条验证「该抓的确实抓到了」，并反向断言
> 正常源码不会被误报。改守卫规则后务必重跑。

---

## 当前历史的安全状态

2026-10-06 对全部 40 个提交做过一次完整回溯扫描，结论：

- 12 类密钥格式（私钥块、OpenAI、Anthropic、GitHub PAT / fine-grained、AWS、Google、
  Slack、Coze、npm token、JWT、硬编码密码、api_key 赋值）—— **零命中**
- 大陆手机号 —— 零命中
- 真实邮箱 —— 零命中（仅有 `your@email.com` 占位符）
- 泄露本机用户名的绝对路径 —— 零命中
- `.coze` / `wrangler.jsonc` / `netlify.toml` / `friends.json` —— 无凭据、无真实个人信息

因此**不需要重写 git 历史**。历史中确实出现过 `app/admin-server/`（本地 express 服务，
无鉴权 token，已于后续提交加入 `.gitignore`），但它不含任何密钥。

如需自行复核：

```bash
git log --all --pretty=format: --name-only --diff-filter=A | sort -u
```

若将来真的泄漏了密钥，仅靠 `git rm` 是不够的（对象仍在历史里），必须：
**先轮换密钥** → 再用 `git filter-repo` / BFG 重写历史 → 强推 → 通知 GitHub 清缓存。
