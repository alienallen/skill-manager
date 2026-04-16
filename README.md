# SkillManager

统一管理 Claude Code、Codex、OpenClaw 的 AI Skills。

## 功能

- **列表查看** - 查看所有已安装的 Skills，支持按来源筛选
- **安全删除** - 删除 Skills 时自动备份，可随时恢复
- **批量操作** - 按来源批量删除 Skills
- **启用/禁用** - 启用或禁用指定的 Skill

## 安装

```bash
npm install -g skillmanager
# 或
brew install skillmanager
```

## 命令

### 列出所有 Skills

```bash
skillman list                    # 列出所有
skillman list --claude           # 只看 Claude Code
skillman list --codex             # 只看 Codex
skillman list --openclaw          # 只看 OpenClaw
skillman list --agents            # 只看共享 Skills
skillman list --json             # JSON 输出
```

### 删除 Skills

```bash
skillman remove <skill-id>       # 删除单个 (如 claude:code-review)
skillman remove --claude          # 删除所有 Claude Code Skills
skillman remove --codex           # 删除所有 Codex Skills
skillman remove --openclaw        # 删除所有 OpenClaw Skills
skillman remove --agents          # 删除所有共享 Skills
skillman remove -f <skill-id>    # 跳过确认直接删除
```

### 恢复 Skills

```bash
skillman restore <skill-id>       # 恢复已删除的 Skill
skillman restore --list           # 列出可恢复的 Skills
```

### 启用/禁用 Skills

```bash
skillman enable <skill-id>         # 启用 Skill
skillman disable <skill-id>        # 禁用 Skill
```

### 重建索引

```bash
skillman index                    # 重新扫描所有 Skills
skillman index --force            # 强制重建
```

## 工作原理

SkillManager 通过扫描各平台的 Skills 目录建立统一索引：

| 平台 | 路径 |
|------|------|
| Claude Code | `~/.claude/skills/` |
| Codex | `~/.codex/skills/` |
| OpenClaw | `~/.openclaw/skills/` |
| 共享 | `~/.agents/skills/` |

删除操作会自动备份到 `~/.skill-manager/trash/`，可随时恢复。

## 开发

```bash
npm install
npm run build    # 编译
npm run dev      # 编译并运行
npm test         # 测试
```
