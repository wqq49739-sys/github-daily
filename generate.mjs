// GitHub 每日早报 — 自动生成器
// 每天由 GitHub Actions 在云端运行：抓取最近 7 天最热的新项目，重建 index.html
// 纯免费，无需任何密钥。

const PER_PAGE = 10;

// 计算 7 天前的日期 (YYYY-MM-DD)
const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
const today = new Date();
const dateCN = `${today.getUTCFullYear()} 年 ${today.getUTCMonth() + 1} 月 ${today.getUTCDate()} 日`;

const api = `https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=${PER_PAGE}`;

const headers = { "Accept": "application/vnd.github+json", "User-Agent": "github-daily-bot" };
if (process.env.GITHUB_TOKEN) headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;

const res = await fetch(api, { headers });
if (!res.ok) {
  console.error("GitHub API error:", res.status, await res.text());
  process.exit(1);
}
const json = await res.json();

// 简单的中文分类猜测（关键词匹配，无需 AI）
function guessCat(r) {
  const t = ((r.description || "") + " " + (r.name || "") + " " + (r.topics || []).join(" ")).toLowerCase();
  if (/(agent|llm|gpt|chatbot|rag|ai\b|model|prompt)/.test(t)) return "AI 智能";
  if (/(3d|gaussian|render|image|video|vision|diffusion)/.test(t)) return "图像/视觉";
  if (/(cli|tool|sdk|framework|dev|sandbox|build)/.test(t)) return "开发工具";
  if (/(game|fun|toy|radio|sdr|hardware)/.test(t)) return "好玩/硬件";
  if (/(security|crypto|auth|hack)/.test(t)) return "安全";
  return "热门";
}

// 免费翻译：调用谷歌翻译公开接口（GitHub 云端服务器可直连，免费、无需密钥）
async function toChinese(text) {
  const t = (text || "").trim();
  if (!t) return "";
  if (/[一-鿿]/.test(t)) return t; // 已含中文则不翻
  try {
    const u = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(t)}`;
    const r = await fetch(u, { headers: { "User-Agent": "github-daily-bot" } });
    const j = await r.json();
    const zh = (j[0] || []).map((s) => s[0]).join("").trim();
    return zh || t;
  } catch (e) {
    return t; // 翻译失败就退回原文，不影响出页
  }
}

const raw = (json.items || []).map((r, i) => ({
  rank: i + 1,
  name: r.full_name.split("/")[1],
  full: r.full_name,
  cat: guessCat(r),
  stars: r.stargazers_count || 0,
  lang: r.language || "—",
  url: r.html_url,
  descEn: (r.description || "").trim(),
}));

const items = await Promise.all(raw.map(async (d) => {
  const zh = await toChinese(d.descEn);
  return { ...d, desc: zh || "（作者暂未填写项目介绍）", descEn: d.descEn };
}));

const esc = (s) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const cards = items.map((d) => `
    <div class="card">
      <button class="fav" data-name="${esc(d.name)}" title="收藏">⭐</button>
      <div><span class="rank">${d.rank}</span><span class="cat">${esc(d.cat)}</span></div>
      <div class="name">${esc(d.name)}<span class="star">★ ${d.stars.toLocaleString()}</span><span class="lang">${esc(d.lang)}</span></div>
      <div class="desc">${esc(d.desc)}</div>
      ${d.descEn && d.descEn !== d.desc ? `<div class="descen">${esc(d.descEn)}</div>` : ""}
      <a class="btn" href="${esc(d.url)}" target="_blank" rel="noopener">去 GitHub 看看 →</a>
    </div>`).join("");

const html = `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GitHub 每日早报</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,"Segoe UI","Microsoft YaHei",sans-serif;background:#f6f8fa;color:#1f2328;line-height:1.65;padding:24px}
  .wrap{max-width:740px;margin:0 auto}
  .head{text-align:center;margin-bottom:6px}
  .kicker{color:#fb8500;font-weight:800;letter-spacing:3px;font-size:13px}
  h1{font-size:28px;margin:6px 0}
  .sub{color:#656d76;font-size:14px}
  .tip{background:#fff8e6;border:1px solid #ffe08a;border-radius:10px;padding:12px 16px;font-size:14px;color:#7a5b00;margin:18px 0}
  .bar{display:flex;justify-content:center;gap:10px;margin:16px 0 22px}
  .bar button{border:1px solid #d0d7de;background:#fff;color:#1f2328;font-size:14px;font-weight:600;padding:7px 16px;border-radius:20px;cursor:pointer}
  .bar button.active{background:#fb8500;color:#fff;border-color:#fb8500}
  .card{position:relative;background:#fff;border:1px solid #d0d7de;border-radius:14px;padding:18px 20px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,.04)}
  .rank{display:inline-block;background:#fb8500;color:#fff;font-weight:800;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;font-size:14px}
  .cat{display:inline-block;background:#ddf4ff;color:#0969da;font-size:12px;font-weight:600;padding:2px 9px;border-radius:20px;margin-left:6px}
  .fav{position:absolute;top:16px;right:16px;background:none;border:none;font-size:24px;cursor:pointer;line-height:1;filter:grayscale(1);opacity:.45}
  .fav.on{filter:none;opacity:1}
  .name{font-size:19px;font-weight:700;color:#0969da;margin-top:8px}
  .star{font-size:13px;color:#bf8700;font-weight:600;margin-left:6px}
  .lang{font-size:12px;color:#656d76;margin-left:8px}
  .desc{font-size:15px;margin:8px 0 2px;color:#3c424a}
  .descen{font-size:12px;color:#a0a8b0;margin-bottom:4px}
  .btn{display:inline-block;margin-top:12px;background:#0969da;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:8px 16px;border-radius:8px}
  .empty{text-align:center;color:#8c959f;padding:40px 0}
  .foot{text-align:center;color:#8c959f;font-size:12px;margin-top:22px}
</style>
</head>
<body>
<div class="wrap">
  <div class="head">
    <div class="kicker">☕ GITHUB 每日早报</div>
    <h1>今天程序员都在追什么？</h1>
    <div class="sub">${dateCN} · 全球最火 ${items.length} 个新项目（自动更新）</div>
  </div>
  <div class="tip">💡 这里每天自动更新「最近 7 天 GitHub 上涨粉最快的新项目」。点右上角 ⭐ 收藏你感兴趣的，点蓝色按钮直达项目主页。</div>
  <div class="bar">
    <button id="btnAll" class="active">📋 全部</button>
    <button id="btnFav">⭐ 我的收藏 (<span id="favCount">0</span>)</button>
  </div>
  <div id="list">${cards}</div>
  <div class="foot">数据：GitHub 官方 API · 每天自动更新 · Powered by Craft Agent</div>
</div>
<script>
const KEY="ghdaily_favs";
let favs=new Set(JSON.parse(localStorage.getItem(KEY)||"[]"));
function save(){localStorage.setItem(KEY,JSON.stringify([...favs]));document.getElementById("favCount").textContent=favs.size;}
function paint(){document.querySelectorAll(".fav").forEach(b=>{const on=favs.has(b.dataset.name);b.classList.toggle("on",on);});}
function applyFilter(f){document.getElementById("btnAll").classList.toggle("active",f==="all");document.getElementById("btnFav").classList.toggle("active",f==="fav");document.querySelectorAll(".card").forEach(c=>{const n=c.querySelector(".fav").dataset.name;c.style.display=(f==="fav"&&!favs.has(n))?"none":"";});const vis=[...document.querySelectorAll(".card")].some(c=>c.style.display!=="none");let e=document.getElementById("empty");if(f==="fav"&&!vis){if(!e){e=document.createElement("div");e.id="empty";e.className="empty";e.innerHTML="还没有收藏的项目 ⭐<br>点卡片右上角的星星收藏吧";document.getElementById("list").appendChild(e);}}else if(e){e.remove();}}
document.querySelectorAll(".fav").forEach(b=>b.onclick=()=>{const n=b.dataset.name;favs.has(n)?favs.delete(n):favs.add(n);save();paint();if(document.getElementById("btnFav").classList.contains("active"))applyFilter("fav");});
document.getElementById("btnAll").onclick=()=>applyFilter("all");
document.getElementById("btnFav").onclick=()=>applyFilter("fav");
save();paint();
</script>
</body>
</html>`;

import { writeFileSync } from "node:fs";
writeFileSync(new URL("./index.html", import.meta.url), html);
console.log(`Generated index.html with ${items.length} items (since ${since}).`);
