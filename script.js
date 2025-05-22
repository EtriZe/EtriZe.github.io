window.onscroll = function(){
    let titleBarProjets = document.getElementsByTagName("title-bar")[0];
    let filtres = document.getElementsByTagName("filtres")[0];
    if(window.scrollY >= 750) { // change target to number
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
    });
}

function boutonsMenu(){
    //Boutons du menu -------------------------------
    let menuProjetsBtn = document.getElementById("menuProjets");
    menuProjetsBtn.addEventListener("click", function(){
        window.scroll({
            top: 820,
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

    let newProjectCards = document.querySelectorAll(".projectCard");
    let count = 0;
    Array.prototype.forEach.call(newProjectCards, function(newProjectCard) {
        if( ! newProjectCard.classList.contains("hide")) count++;
        newProjectCard.classList.remove("lastCard");
    });

    if((count % 3) == 1){
        newProjectCards[count].classList.add("lastCard");
    }
}