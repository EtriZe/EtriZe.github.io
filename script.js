window.onscroll = function(){
    let titleBarProjets = document.getElementsByTagName("title-bar")[0];
    let filtres = document.getElementsByTagName("filtres")[0];
    if(window.scrollY >= window.innerHeight * 0.7) { // change target to number
        filtres.style.visibility = 'visible';
        filtres.style.opacity = 1;
    }else{
        filtres.style.visibility = 'hidden';
        filtres.style.opacity = 0;
    }
};

window.addEventListener("load", (event) => {
    boutonsMenu();
    hoverProjects();
    boutonsFiltres();
    projectPage();
});

function hoverProjects(){
    let projects = document.getElementsByClassName("projectCard");

    Array.prototype.forEach.call(projects, function(project) {

        project.addEventListener("mouseover", (event) => { 
            project.querySelector(".more").style.display = "block";
        });

        project.addEventListener("mouseout", (event) => { 
            project.querySelector(".more").style.display = "none";
        });

        let tooltip = project.querySelector(".more");

        project.addEventListener("mousemove", (e)=>{
            tooltip.style.display = 'block';
            tooltip.style.left = (e.clientX + 10) + 'px'; // décalage en x
            tooltip.style.top = (e.clientY + 10) + 'px';  // décalage en y
        });

        project.addEventListener("click", (e) => {
            openProjects(project.getAttribute('file'));
        });
    });
}

function boutonsMenu(){
    //Boutons du menu -------------------------------
    let menuProjetsBtn = document.getElementById("menuProjets");
    menuProjetsBtn.addEventListener("click", function(){
        window.scroll({
            top: window.innerHeight * 0.93,
            left: 0,
            behavior: "smooth",
        });
    })

    let menuAproposBtn = document.getElementById("menuApropos");
    menuAproposBtn.addEventListener("click", function(){
        console.log("scroll");
        window.scroll({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    })
}

function boutonsFiltres(){
    let buttons = document.getElementsByTagName("filtres")[0].children;
    let all = true;
    
    Array.prototype.forEach.call(buttons, function(button) {

        button.addEventListener("click", function(e){
            let btns = document.getElementsByTagName("filtres")[0].children;

            if( ! all && ! button.classList.contains("notSelected")){
                Array.prototype.forEach.call(btns, function(btn) {
                    btn.classList.remove("notSelected");
                })
                all = true;
                filtreCategories(button, true);
                return;
            }

            Array.prototype.forEach.call(btns, function(btn) {
                if(btn != button) btn.classList.add("notSelected");
                else btn.classList.remove("notSelected");
            })
            filtreCategories(button, false);
            all = false;
        })

    })
}

function filtreCategories(button, all){
    let categorieId = button.getAttribute("categorie");
    let projectCards = document.querySelectorAll(".projectCard");

    if(all){
        Array.prototype.forEach.call(projectCards, function(projectCard) {
            projectCard.classList.remove("hide");
        });
    }else{
        Array.prototype.forEach.call(projectCards, function(projectCard) {
            if( ! projectCard.innerHTML.includes('categorie="'+categorieId+'"')) projectCard.classList.add("hide");
            else projectCard.classList.remove("hide");
        });
    }

    // let newProjectCards = document.querySelectorAll(".projectCard");
    // let count = 0;
    // Array.prototype.forEach.call(newProjectCards, function(newProjectCard) {
    //     if( ! newProjectCard.classList.contains("hide")) count++;
    //     newProjectCard.classList.remove("lastCard");
    // });

    // if((count % 3) == 1){
    //     newProjectCards[count].classList.add("lastCard");
    // }

    //Mettre dans l'ordre, les "hide" à la fin
    const myDiv = document.getElementsByTagName("projects")[0];
    reorderDivChildren(myDiv);
}

function reorderDivChildren(div) {
    const children = Array.from(div.children);
    const visible = [];
    const hidden = [];
  
    for (const child of children) {
      (child.classList.contains('hide') ? hidden : visible).push(child);
    }
  
    for (const child of [...visible, ...hidden]) {
      div.appendChild(child); // appendChild déplace l'élément s'il est déjà dans le DOM
    }
};


async function openProjects(file){
    try {
        const res = await fetch(file);          // GET ./projects/whereareyou.html
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
        const html = await res.text();         // Contenu brut du fichier
        console.log(html);                     // → chaîne de caractères
    
        // Exemple : l’injecter dans le DOM
        document.querySelector("project-page content").innerHTML = html;
        document.querySelector("project-page").classList.remove("hide");
        // Exemple : le transformer en DOM complet
        // const doc = new DOMParser().parseFromString(html, "text/html");
    } catch (err) {
            console.error("Impossible de charger le fichier :", err);
    }
}

function projectPage() {
    let leave = document.querySelector("leave");
    leave.addEventListener("click", (e) => {
        let projectPage = leave.closest("project-page");
        projectPage.classList.add("hide");
    });
}