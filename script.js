window.onscroll = function () {
  let filtres = document.getElementsByTagName("filtres")[0];
  if (window.scrollY >= window.innerHeight * 0.7) {
    filtres.classList.add("is-visible");
  } else {
    filtres.classList.remove("is-visible");
  }
};

window.addEventListener("load", (event) => {
  boutonsMenu();
  hoverProjects();
  boutonsFiltres();
  projectPage();
});

function isMobile() {
  return (
    window.matchMedia("(max-width: 900px)").matches &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

function hoverProjects() {
  let projects = document.querySelectorAll(".projectCard");

  Array.prototype.forEach.call(projects, function (project) {
    if (!isMobile()) {
      project.addEventListener("mouseover", (event) => {
        document.querySelector(".more").style.display = "block";
      });

      project.addEventListener("mouseout", (event) => {
        document.querySelector(".more").style.display = "none";
      });

      let tooltip = document.querySelector(".more");

      project.addEventListener("mousemove", (e) => {
        tooltip.style.display = "block";
        tooltip.style.left = e.clientX + 10 + "px";
        tooltip.style.top = e.clientY + 10 + "px";
      });
    }
    project.addEventListener("click", (e) => {
      openProjects(project.getAttribute("file"));
    });
  });
}

function boutonsMenu() {
  //Boutons du menu -------------------------------
  let menuProjetsBtn = document.getElementById("menuProjets");
  menuProjetsBtn.addEventListener("click", function () {
    window.scroll({
      top: window.innerHeight * 0.93,
      left: 0,
      behavior: "smooth",
    });
  });

  let menuAproposBtn = document.getElementById("menuApropos");
  menuAproposBtn.addEventListener("click", function () {
    console.log("scroll");
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  });
}

function boutonsFiltres() {
  let buttons = document.getElementsByTagName("filtres")[0].children;
  let all = true;

  Array.prototype.forEach.call(buttons, function (button) {
    button.addEventListener("click", function (e) {
      let btns = document.getElementsByTagName("filtres")[0].children;

      if (!all && !button.classList.contains("notSelected")) {
        Array.prototype.forEach.call(btns, function (btn) {
          btn.classList.remove("notSelected");
        });
        all = true;
        filtreCategories(button, true);
        return;
      }

      Array.prototype.forEach.call(btns, function (btn) {
        if (btn != button) btn.classList.add("notSelected");
        else btn.classList.remove("notSelected");
      });
      filtreCategories(button, false);
      all = false;
    });
  });
}

function filtreCategories(button, all) {
  let categorieId = button.getAttribute("categorie");
  let projectCards = document.querySelectorAll(".projectCard");

  if (all) {
    Array.prototype.forEach.call(projectCards, function (projectCard) {
      projectCard.classList.remove("hide");
    });
  } else {
    Array.prototype.forEach.call(projectCards, function (projectCard) {
      if (!projectCard.innerHTML.includes('categorie="' + categorieId + '"'))
        projectCard.classList.add("hide");
      else projectCard.classList.remove("hide");
    });
  }

  const myDiv = document.getElementsByTagName("projects")[0];
  reorderDivChildren(myDiv);
}

function reorderDivChildren(div) {
  const children = Array.from(div.children);
  const visible = [];
  const hidden = [];

  for (const child of children) {
    (child.classList.contains("hide") ? hidden : visible).push(child);
  }

  for (const child of [...visible, ...hidden]) {
    div.appendChild(child);
  }
}

async function openProjects(file) {
  try {
    document.querySelector("project-page content").innerHTML = "";

    const res = await fetch(file);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    document.querySelector("project-page content").innerHTML = html;
    document.querySelector("project-page").classList.remove("hide");
    document.body.classList.add("no-scroll");

    // ── Ré-exécute les <script> injectés via innerHTML ──────
    document.querySelectorAll("project-page content script").forEach(function (oldScript) {
      const newScript = document.createElement("script");
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
      newScript.remove();
    });
    // ────────────────────────────────────────────────────────

    // ── Applique la langue courante au contenu du projet ────
    window.applyCurrentLangToModal && window.applyCurrentLangToModal();
    // ────────────────────────────────────────────────────────

    if (isMobile()) {
      const gameWrapper = document.querySelector("project-page content .game-wrapper");
      const mobileMsg = document.getElementById("mobile-message");
      if (gameWrapper) {
        gameWrapper.remove();
        if (mobileMsg) mobileMsg.style.display = "block";
      }
    }
  } catch (err) {
    console.error("Impossible de charger le fichier :", err);
  }
}

function projectPage() {
  let leave = document.querySelector("leave");
  leave.addEventListener("click", (e) => {
    let projectPage = leave.closest("project-page");
    projectPage.classList.add("hide");
    document.body.classList.remove("no-scroll");

    // Coupe l'iframe pour libérer le contexte WebGL
    const iframe = document.querySelector("project-page content iframe");
    if (iframe) iframe.removeAttribute("src");
  });
}

function openCVModal() {
  const lang = localStorage.getItem("vb_lang") || "fr";
  const cvFiles = {
    fr: "./images/cv_barrere_valentin_game_dev.pdf",
    en: "./images/cv_barrere_valentin_game_dev_en.pdf",
  };
  const cvFile = cvFiles[lang] || cvFiles.fr;

  document.getElementById("cv-iframe").src = cvFile;
  document.getElementById("cv-download-link").href = cvFile;

  const modal = document.getElementById("cv-modal");
  modal.style.display = "flex";
  modal.addEventListener(
    "click",
    function (e) {
      if (e.target === modal) closeCVModal();
    },
    { once: true },
  );
}

function closeCVModal() {
  document.getElementById("cv-modal").style.display = "none";
}

// Fermer avec Échap
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeCVModal();
});