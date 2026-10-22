(() => {
  "use strict";
  const STORAGE_KEY = "rated-unrated-demonlist-v1";
  const seed = window.DEMONLIST_DATA || {levels:[],records:[],submissions:[]};
  let db = loadDatabase();
  let currentView = "rankings";
  let searchText = "";
  let toastTimer;

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const slug = value => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const levelById = id => db.levels.find(level => level.id === id);
  const sortedLevels = levels => [...levels].sort((a,b) => {
    const ar = Number.isFinite(Number(a.rank)) && Number(a.rank)>0 ? Number(a.rank) : 999999;
    const br = Number.isFinite(Number(b.rank)) && Number(b.rank)>0 ? Number(b.rank) : 999999;
    return ar-br || String(a.name).localeCompare(String(b.name));
  });

  function loadDatabase() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.levels) && Array.isArray(parsed.records) && Array.isArray(parsed.submissions)) return parsed;
      }
    } catch (error) { console.warn("Could not load saved database", error); }
    return JSON.parse(JSON.stringify(seed));
  }
  function saveDatabase() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); return true; }
    catch (error) { showToast("Could not save locally. Export a backup or check browser storage."); return false; }
  }
  function showToast(message) {
    const toast = $("#toast"); toast.textContent = message; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }
  function pillClass(value) {
    const s = String(value || "").toLowerCase();
    if (s.includes("extreme")) return "extreme";
    if (s.includes("insane")) return "insane";
    if (s.includes("hard")) return "hard";
    if (s.includes("rated")) return "rated";
    if (s.includes("legacy") || s.includes("mainlist") || s.includes("extended")) return "legacy";
    if (s.includes("challenge")) return "challenge";
    if (s.includes("verified") && !s.includes("unverified")) return "verified";
    if (s.includes("unverified")) return "unverified";
    if (s.includes("unrated")) return "unrated";
    return "";
  }
  function pill(value) { return `<span class="pill ${pillClass(value)}">${esc(value || "Unknown")}</span>`; }
  function filteredLevels() {
    const q = searchText.trim().toLowerCase();
    let levels = sortedLevels(db.levels);
    const difficulty = $("#difficulty-filter")?.value || "All difficulties";
    const status = $("#status-filter")?.value || "All statuses";
    const category = $("#category-filter")?.value || "All categories";
    if (difficulty !== "All difficulties") levels = levels.filter(l => l.difficulty === difficulty);
    if (status !== "All statuses") levels = levels.filter(l => l.officialStatus === status);
    if (category !== "All categories") levels = levels.filter(l => l.listStatus === category);
    if (q) levels = levels.filter(l => [l.name,l.creator,l.levelId,l.difficulty,l.officialStatus,l.listStatus,l.verification].some(v => String(v||"").toLowerCase().includes(q)));
    return levels;
  }
  function renderStats() {
    const rated = db.levels.filter(l => l.officialStatus === "Rated").length;
    const unrated = db.levels.filter(l => l.officialStatus === "Unrated").length;
    const records = db.records.filter(r => r.status === "Approved").length;
    $("#stats-grid").innerHTML = [
      ["LEVELS TRACKED",db.levels.length,"Across all categories"],
      ["UNRATED LEVELS",unrated,"Community-tracked"],
      ["RATED LEVELS",rated,"Official in-game rating"],
      ["APPROVED RECORDS",records,"Player completions"]
    ].map(([label,num,sub]) => `<article class="stat-card"><div class="stat-label">${label}</div><div class="stat-number">${num.toLocaleString()}</div><div class="stat-sub">${esc(sub)}</div></article>`).join("");
  }
  function filtersHtml() {
    const unique = (key, all) => [...new Set(db.levels.map(l=>l[key]).filter(Boolean))].sort();
    const select = (id,label,values) => `<select class="filter-select" id="${id}" aria-label="${label}"><option>${label}</option>${values.map(v=>`<option>${esc(v)}</option>`).join("")}</select>`;
    return `<div class="filters">${select("difficulty-filter","All difficulties",unique("difficulty"))}${select("status-filter","All statuses",unique("officialStatus"))}${select("category-filter","All categories",unique("listStatus"))}<button class="small-btn" id="clear-filters">Clear filters</button></div>`;
  }
  function tableHtml(levels, showRank=true) {
    if (!levels.length) return `<div class="empty"><strong>No levels found</strong>Try another search or clear the filters.</div>`;
    return `<div class="table-wrap"><table class="level-table"><thead><tr>${showRank?"<th>Rank</th>":""}<th>Level</th><th>Community difficulty</th><th>Official status</th><th>Verification</th><th>Best record</th><th></th></tr></thead><tbody>${levels.map((l,i)=>`<tr>${showRank?`<td class="rank">${Number(l.rank)>0?"#"+esc(l.rank):"—"}</td>`:""}<td><div class="level-name" data-level="${esc(l.id)}">${esc(l.name)}</div><div class="level-sub">${esc(l.creator)}${l.levelId?" · ID "+esc(l.levelId):""}</div></td><td>${pill(l.difficulty)}</td><td>${pill(l.officialStatus)}</td><td>${pill(l.verification)}</td><td><strong>${Number(l.bestRecord)||0}%</strong></td><td><button class="small-btn" data-level="${esc(l.id)}">Details</button></td></tr>`).join("")}</tbody></table></div>`;
  }
  function renderRankings() {
    $("#view-title").textContent = "Main Rankings";
    $("#view-content").innerHTML = filtersHtml() + `<div id="level-table-slot">${tableHtml(filteredLevels().filter(l=>l.listStatus==="Mainlist" || !l.listStatus))}</div><p class="form-help">Rankings are community-defined. Official rating status is separate from community difficulty.</p>`;
    wireFilters();
  }
  function renderLevels() {
    $("#view-title").textContent = "All Levels";
    $("#view-content").innerHTML = filtersHtml() + `<div id="level-table-slot">${tableHtml(filteredLevels(),true)}</div><p class="form-help">Search by level name, creator, level ID, difficulty, or status.</p>`;
    wireFilters();
  }
  function wireFilters() {
    ["difficulty-filter","status-filter","category-filter"].forEach(id => $("#"+id)?.addEventListener("change",updateTable));
    $("#clear-filters")?.addEventListener("click",()=>{["difficulty-filter","status-filter","category-filter"].forEach(id=>{const el=$("#"+id);if(el)el.selectedIndex=0;});$("#search").value="";searchText="";updateTable();});
    wireLevelButtons();
  }
  function updateTable() {
    const levels = filteredLevels();
    const slot = $("#level-table-slot");
    if (slot) slot.innerHTML = tableHtml(currentView==="rankings" ? levels.filter(l=>l.listStatus==="Mainlist" || !l.listStatus) : levels,true);
    wireLevelButtons();
  }
  function renderRecords() {
    $("#view-title").textContent = "Player Records";
    const records = [...db.records].sort((a,b)=>Number(b.percent)-Number(a.percent));
    const rows = records.map(r=>{const l=levelById(r.levelId);return `<div class="record-row"><div class="avatar">${esc((r.player||"?").slice(0,2).toUpperCase())}</div><div class="grow"><div class="row-title">${esc(r.player)}</div><div class="row-sub">${esc(l?.name || "Unknown level")} · ${esc(r.date || "Date not set")}</div></div><div class="percent">${Number(r.percent)||0}%</div><div>${pill(r.status)}</div></div>`;}).join("");
    $("#view-content").innerHTML = `<div class="two-col"><section class="panel"><h3>Recent submitted records</h3>${rows || '<div class="empty">No records yet.</div>'}</section><section class="panel"><h3>Add a record</h3><form id="record-form"><div class="form-grid"><div class="form-field full"><label for="record-player">Player name</label><input id="record-player" required maxlength="50" placeholder="Your in-game name"></div><div class="form-field full"><label for="record-level">Level</label><select id="record-level" required><option value="">Choose a level…</option>${sortedLevels(db.levels).map(l=>`<option value="${esc(l.id)}">${esc(l.name)} — ${esc(l.creator)}</option>`).join("")}</select></div><div class="form-field"><label for="record-percent">Progress (%)</label><input id="record-percent" type="number" min="1" max="100" required placeholder="e.g. 83"></div><div class="form-field"><label for="record-proof">Proof URL (optional)</label><input id="record-proof" type="url" placeholder="https://…"></div></div><p class="form-help">Local demo only: records are stored in this browser and are not reviewed by moderators.</p><button class="btn btn-primary" type="submit">Save record</button></form></section></div>`;
    $("#record-form").addEventListener("submit",e=>{e.preventDefault();const player=$("#record-player").value.trim(),levelId=$("#record-level").value,percent=Number($("#record-percent").value),proof=$("#record-proof").value.trim();if(!player||!levelById(levelId)||percent<1||percent>100)return showToast("Check the player, level, and progress fields.");db.records.unshift({id:"rec-"+Date.now(),player,levelId,percent,proof,status:"Pending",date:new Date().toISOString().slice(0,10)});saveDatabase();renderStats();renderRecords();showToast("Record saved locally as pending.");});
  }
  function renderLeaderboard() {
    $("#view-title").textContent = "Player Leaderboard";
    const totals = {};
    db.records.filter(r=>r.status==="Approved").forEach(r=>{const p=r.player||"Unknown";if(!totals[p])totals[p]={player:p,records:0,points:0,completions:0};totals[p].records++;totals[p].points+=Number(r.percent)||0;if(Number(r.percent)===100)totals[p].completions++;});
    const players = Object.values(totals).sort((a,b)=>b.points-a.points || b.completions-a.completions);
    $("#view-content").innerHTML = `<div class="panel"><h3>Community players</h3>${players.length?players.map((p,i)=>`<div class="player-row"><div class="rank">#${i+1}</div><div class="avatar">${esc(p.player.slice(0,2).toUpperCase())}</div><div class="grow"><div class="row-title">${esc(p.player)}</div><div class="row-sub">${p.records} approved record${p.records===1?"":"s"} · ${p.completions} full completion${p.completions===1?"":"s"}</div></div><div class="percent">${p.points} pts</div></div>`).join(""):'<div class="empty"><strong>No approved records yet</strong>Once records are approved, players will appear here.</div>'}</div><p class="form-help">Demo scoring: each approved record contributes its percentage to the player's points. Choose a consistent scoring policy for a real community list.</p>`;
  }
  function renderSubmissions() {
    $("#view-title").textContent = "Submit a Level";
    const recent = [...db.submissions].reverse().slice(0,5);
    $("#view-content").innerHTML = `<div class="two-col"><section class="panel"><h3>Propose a level</h3><form id="submission-form"><div class="form-grid"><div class="form-field"><label for="sub-name">Level name *</label><input id="sub-name" required maxlength="100" placeholder="Level name"></div><div class="form-field"><label for="sub-creator">Creator *</label><input id="sub-creator" required maxlength="80" placeholder="Creator username"></div><div class="form-field"><label for="sub-id">Geometry Dash level ID</label><input id="sub-id" inputmode="numeric" maxlength="20" placeholder="Optional"></div><div class="form-field"><label for="sub-official">Official rating status *</label><select id="sub-official"><option>Unrated</option><option>Rated</option><option>Legacy</option></select></div><div class="form-field"><label for="sub-difficulty">Community difficulty *</label><select id="sub-difficulty"><option>Extreme Demon</option><option>Insane Demon</option><option>Hard Demon</option><option>Medium Demon</option><option>Easy Demon</option><option>Auto</option><option>Insane</option><option>Hard</option><option>Normal</option><option>Easy</option><option>Challenge</option><option>Impossible</option><option>Unknown</option></select></div><div class="form-field"><label for="sub-verification">Verification *</label><select id="sub-verification"><option>Unverified</option><option>Verified</option><option>Impossible / challenge</option></select></div><div class="form-field full"><label for="sub-notes">Notes / source links</label><textarea id="sub-notes" maxlength="1000" placeholder="Why should this level be included? Add links to sources or verification evidence."></textarea></div></div><p class="form-help">This starter version stores submissions only in your current browser. It does not send them to a public moderator queue.</p><div class="form-actions"><button class="btn btn-primary" type="submit">Save submission</button><button class="btn btn-secondary" id="export-data" type="button">Export database JSON</button></div></form></section><section class="panel"><h3>Recent local submissions</h3>${recent.length?recent.map(s=>`<div class="record-row"><div class="avatar">+</div><div class="grow"><div class="row-title">${esc(s.name)}</div><div class="row-sub">${esc(s.creator)} · ${esc(s.difficulty)} · ${esc(s.date)}</div></div>${pill("Pending")}</div>`).join(""):'<div class="empty"><strong>No submissions yet</strong>Proposed levels will appear here in this browser.</div>'}<div class="form-help">For a real public queue, connect a database and moderation workflow later.</div></section></div>`;
    $("#submission-form").addEventListener("submit",e=>{e.preventDefault();const submission={id:"sub-"+Date.now(),name:$("#sub-name").value.trim(),creator:$("#sub-creator").value.trim(),levelId:$("#sub-id").value.trim(),officialStatus:$("#sub-official").value,difficulty:$("#sub-difficulty").value,verification:$("#sub-verification").value,notes:$("#sub-notes").value.trim(),status:"Pending",date:new Date().toISOString().slice(0,10)};if(!submission.name||!submission.creator)return showToast("Please enter the level name and creator.");db.submissions.push(submission);saveDatabase();renderSubmissions();showToast("Submission saved locally.");});
    $("#export-data").addEventListener("click",exportDatabase);
  }
  function exportDatabase() {
    const blob = new Blob([JSON.stringify(db,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="rated-unrated-demonlist-backup.json";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);showToast("Database JSON exported.");
  }
  function openLevel(id) {
    const l=levelById(id);if(!l)return;
    const records=db.records.filter(r=>r.levelId===id).sort((a,b)=>b.percent-a.percent);
    $("#dialog-content").innerHTML=`<div class="eyebrow">LEVEL PROFILE</div><h2 class="detail-title">${esc(l.name)}</h2><div class="detail-meta">by ${esc(l.creator)} ${l.levelId?"· Level ID "+esc(l.levelId):""}</div><div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:14px">${pill(l.difficulty)}${pill(l.officialStatus)}${pill(l.verification)}${pill(l.listStatus)}</div><div class="detail-grid"><div class="detail-cell"><small>Community rank</small><strong>${Number(l.rank)>0?"#"+esc(l.rank):"Unranked"}</strong></div><div class="detail-cell"><small>Best listed record</small><strong>${Number(l.bestRecord)||0}%</strong></div><div class="detail-cell"><small>Level ID</small><strong>${esc(l.levelId||"Not entered")}</strong></div><div class="detail-cell"><small>Records in database</small><strong>${records.length}</strong></div></div><h3>Notes</h3><p class="detail-meta">${esc(l.notes||"No notes added.")}</p><h3 style="margin-top:22px">Player records</h3>${records.length?records.map(r=>`<div class="record-row"><div class="grow"><div class="row-title">${esc(r.player)}</div><div class="row-sub">${esc(r.date||"Date not set")} · ${esc(r.status)}</div></div><div class="percent">${Number(r.percent)||0}%</div></div>`).join(""):'<p class="detail-meta">No records submitted for this level yet.</p>'}`;
    const dialog=$("#level-dialog");if(typeof dialog.showModal==="function")dialog.showModal();else alert(`${l.name} — ${l.difficulty}`);
  }
  function wireLevelButtons(){ $$("[data-level]").forEach(el=>{if(el.dataset.bound)return;el.dataset.bound="1";el.addEventListener("click",()=>openLevel(el.dataset.level));}); }
  function renderView(view) {
    currentView=view;
    $$(".nav-link").forEach(btn=>btn.classList.toggle("active",btn.dataset.view===view));
    if(view==="rankings")renderRankings();
    else if(view==="levels")renderLevels();
    else if(view==="records")renderRecords();
    else if(view==="leaderboard")renderLeaderboard();
    else if(view==="submissions")renderSubmissions();
    $("#search").value=searchText;
    window.scrollTo({top:$("#app-view").getBoundingClientRect().top+window.scrollY-85,behavior:"smooth"});
  }
  $$(".nav-link").forEach(btn=>btn.addEventListener("click",()=>renderView(btn.dataset.view)));
  $$("[data-go]").forEach(btn=>btn.addEventListener("click",()=>renderView(btn.dataset.go)));
  $("#search").addEventListener("input",e=>{searchText=e.target.value;if(currentView==="rankings"||currentView==="levels")updateTable();});
  $("#level-dialog").addEventListener("click",e=>{if(e.target.id==="level-dialog")$("#level-dialog").close();});
  renderStats();renderView("rankings");
})();