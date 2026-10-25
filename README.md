# Dual-Platform Publishing Vault (Hashnode + Medium)

Author in **Obsidian**, publish with **Google Antigravity Agents** to both **Hashnode** and **Medium** ([Pushpendra – Medium](https://overflowbyte.medium.com/)).

---

## 🛠️ Integrated Capabilities

| Feature | Hashnode | Medium |
| :--- | :--- | :--- |
| **Integration** | Official Remote MCP (`https://mcp.hashnode.com/mcp`) + `@hashnode/cli` | REST API Tool (`scripts/medium.mjs`) + Web Importer |
| **Agent Skill** | [`.agents/skills/hashnode-publishing/SKILL.md`](file:///c:/Users/Push1/Documents/obsidian/hashnode_blog/.agents/skills/hashnode-publishing/SKILL.md) | [`.agents/skills/medium-publishing/SKILL.md`](file:///c:/Users/Push1/Documents/obsidian/hashnode_blog/.agents/skills/medium-publishing/SKILL.md) |
| **Auth** | `hashnode login` or `HASHNODE_PAT` in `.env` | `MEDIUM_TOKEN` in `.env` |
| **Target Blog** | `HASHNODE_PUBLICATION_ID` | `https://overflowbyte.medium.com/` |

---

## 🚀 Setup & Credentials

Copy [`.env.example`](file:///c:/Users/Push1/Documents/obsidian/hashnode_blog/.env.example) to `.env`:
```powershell
cp .env.example .env
```

### 1. Hashnode Setup
```powershell
hashnode login
hashnode --host yourblog.hashnode.dev publication get
```

### 2. Medium Setup
1. On Medium, go to **Settings** > **Security and apps** > **Integration tokens**.
2. Generate a token and add it to `.env`:
   ```env
   MEDIUM_TOKEN=your_token_here
   ```
3. Verify connection:
   ```powershell
   node scripts/medium.mjs whoami
   ```

---

## ✍️ Publishing Workflows

### Option A: Publish / Draft via Antigravity Agent
Just ask the agent in conversation:
> *"Create a draft on Hashnode and Medium for `linux_kernel_architecture_permissions_inodes_and_newgrp.md`"*
> *"Cross-post my latest Hashnode article to Medium with proper canonical link"*

### Option B: Terminal Commands

#### Create a Draft on Medium
```powershell
node scripts/medium.mjs publish sample-post.md --status draft --tags "javascript,webdev"
```

#### Cross-Post to Medium with Canonical URL (SEO Safe)
```powershell
node scripts/medium.mjs publish sample-post.md --status draft --canonical "https://yourblog.hashnode.dev/post-slug"
```

#### Publish to Hashnode
```powershell
hashnode -p <publication-id> post create --title "Title" --content-file sample-post.md --tag javascript
```

#### Medium Web Import Tool
Alternatively, you can visit Medium's native import tool at [medium.com/p/import](https://medium.com/p/import), paste your published Hashnode URL, and Medium will automatically parse the article and set the canonical tag.
