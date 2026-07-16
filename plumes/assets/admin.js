(function () {
  document.getElementById("siteTitle").textContent = SITE.title;
  document.getElementById("footTitle").textContent = SITE.title;

  const views = {
    login: document.getElementById("loginView"),
    admin: document.getElementById("adminView"),
    config: document.getElementById("configView"),
  };
  function show(name) {
    Object.values(views).forEach((v) => (v.style.display = "none"));
    views[name].style.display = "block";
  }

  if (!configOk()) {
    show("config");
    return;
  }

  const client = getClient();

  // --- Éléments ---
  const who = document.getElementById("who");
  const loginBtn = document.getElementById("loginBtn");
  const loginMsg = document.getElementById("loginMsg");
  const logoutBtn = document.getElementById("logoutBtn");
  const newBtn = document.getElementById("newBtn");
  const formPanel = document.getElementById("formPanel");
  const formTitle = document.getElementById("formTitle");
  const formMsg = document.getElementById("formMsg");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const mediaEditor = document.getElementById("mediaEditor");
  const adminList = document.getElementById("adminList");
  const adminEmpty = document.getElementById("adminEmpty");

  const F = {
    name: document.getElementById("fName"),
    description: document.getElementById("fDescription"),
    diet: document.getElementById("fDiet"),
    behavior: document.getElementById("fBehavior"),
  };

  let editingId = null; // null = création

  // ---------- Éditeur de médias ----------
  function addMediaRow(item) {
    item = item || { type: "image", url: "" };
    const row = document.createElement("div");
    row.className = "media-item";
    row.innerHTML =
      '<select>' +
      '<option value="image">Image (URL)</option>' +
      '<option value="youtube">YouTube (Short / vidéo)</option>' +
      '<option value="instagram">Instagram</option>' +
      "</select>" +
      '<input type="text" placeholder="https://…" />' +
      '<button type="button" class="rm" title="Retirer">×</button>';
    row.querySelector("select").value = item.type;
    row.querySelector("input").value = item.url || "";
    row.querySelector(".rm").addEventListener("click", () => row.remove());
    mediaEditor.appendChild(row);
  }
  function readMedia() {
    return [...mediaEditor.querySelectorAll(".media-item")]
      .map((row) => ({
        type: row.querySelector("select").value,
        url: row.querySelector("input").value.trim(),
      }))
      .filter((m) => m.url);
  }

  const onClick = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  };
  onClick("addImage", () => addMediaRow({ type: "image", url: "" }));
  onClick("addYoutube", () => addMediaRow({ type: "youtube", url: "" }));
  onClick("addInsta", () => addMediaRow({ type: "instagram", url: "" }));

  // ---------- Formulaire ----------
  function openForm(bird) {
    editingId = bird ? bird.id : null;
    formTitle.textContent = bird ? "Modifier : " + bird.name : "Nouvel oiseau";
    F.name.value = bird ? bird.name : "";
    document.getElementById("f-nomsci").value = bird ? bird.nom_scientifique || "" : "";
    F.description.value = bird ? bird.description || "" : "";
    F.diet.value = bird ? bird.diet || "" : "";
    F.behavior.value = bird ? bird.behavior || "" : "";
    mediaEditor.innerHTML = "";
    (bird && bird.media ? bird.media : []).forEach(addMediaRow);
    formMsg.textContent = "";
    formMsg.className = "msg";
    formPanel.style.display = "block";
    formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    F.name.focus();
  }
  function closeForm() {
    formPanel.style.display = "none";
    editingId = null;
  }

  newBtn.addEventListener("click", () => openForm(null));
  cancelBtn.addEventListener("click", closeForm);

  async function uniqueSlug(base, ignoreId) {
    let slug = base || "oiseau";
    let attempt = slug;
    for (let i = 0; i < 20; i++) {
      const { data } = await client
        .from("birds")
        .select("id")
        .eq("slug", attempt)
        .maybeSingle();
      if (!data || data.id === ignoreId) return attempt;
      attempt = slug + "-" + (i + 2);
    }
    return slug + "-" + Date.now().toString(36).slice(-4);
  }

  saveBtn.addEventListener("click", async () => {
    const name = F.name.value.trim();
    if (!name) {
      formMsg.textContent = "Le nom est obligatoire.";
      formMsg.className = "msg msg--err";
      return;
    }
    saveBtn.disabled = true;
    formMsg.textContent = "Enregistrement…";
    formMsg.className = "msg";

    const slug = await uniqueSlug(slugify(name), editingId);
    const payload = {
      name,
      slug,
      nom_scientifique: document.getElementById("f-nomsci").value.trim() || null,
      description: F.description.value.trim() || null,
      diet: F.diet.value.trim() || null,
      behavior: F.behavior.value.trim() || null,
      media: readMedia(),
    };

    let error;
    if (editingId) {
      ({ error } = await client.from("birds").update(payload).eq("id", editingId));
    } else {
      ({ error } = await client.from("birds").insert(payload));
    }

    saveBtn.disabled = false;
    if (error) {
      formMsg.textContent = "Erreur : " + error.message;
      formMsg.className = "msg msg--err";
      return;
    }
    formMsg.textContent = "Enregistré ✓";
    formMsg.className = "msg msg--ok";
    closeForm();
    loadList();
  });

  // ---------- Liste ----------
  async function loadList() {
    const { data, error } = await client.from("birds").select("*");
    if (error) {
      adminEmpty.innerHTML = '<div class="msg msg--err">' + escapeHtml(error.message) + "</div>";
      adminList.innerHTML = "";
      return;
    }
    const birds = sortByNameFr(data || []);
    adminList.innerHTML = "";
    adminEmpty.innerHTML = birds.length
      ? ""
      : '<div style="color:var(--ink-soft)">Aucun oiseau pour l\'instant. Clique sur « + Nouvel oiseau ».</div>';

    birds.forEach((bird, i) => {
      const li = document.createElement("li");
      li.innerHTML =
        '<span class="ai-num">N° ' + padNum(i + 1) + "</span>" +
        '<span class="ai-name"></span>' +
        '<span class="ai-actions">' +
        '<a class="btn btn--ghost btn--sm" target="_blank" href="bird.html?slug=' +
        encodeURIComponent(bird.slug) + '">Voir</a>' +
        '<button class="btn btn--ghost btn--sm edit">Modifier</button>' +
        '<button class="btn btn--danger btn--sm del">Supprimer</button>' +
        "</span>";
      li.querySelector(".ai-name").textContent = bird.name;
      li.querySelector(".edit").addEventListener("click", () => openForm(bird));
      li.querySelector(".del").addEventListener("click", () => remove(bird));
      adminList.appendChild(li);
    });
  }

  async function remove(bird) {
    if (!confirm('Supprimer définitivement « ' + bird.name + ' » ?')) return;
    const { error } = await client.from("birds").delete().eq("id", bird.id);
    if (error) {
      alert("Erreur : " + error.message);
      return;
    }
    if (editingId === bird.id) closeForm();
    loadList();
  }

  // ---------- Authentification ----------
  loginBtn.addEventListener("click", doLogin);
  document.getElementById("password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doLogin();
  });

  async function doLogin() {
    loginMsg.textContent = "";
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    loginBtn.disabled = true;
    const { error } = await client.auth.signInWithPassword({ email, password });
    loginBtn.disabled = false;
    if (error) {
      loginMsg.textContent = "Connexion refusée : " + error.message;
    }
  }

  logoutBtn.addEventListener("click", async () => {
    await client.auth.signOut();
  });

  async function refreshAuth(session) {
    if (session && session.user) {
      who.textContent = session.user.email;
      show("admin");
      loadList();
    } else {
      show("login");
    }
  }

  client.auth.getSession().then(({ data }) => refreshAuth(data.session));
  client.auth.onAuthStateChange((_event, session) => refreshAuth(session));
})();