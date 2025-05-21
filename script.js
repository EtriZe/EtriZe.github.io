window.onscroll = function(){
    let titleBarProjets = document.getElementsByTagName("title-bar")[0];

    if(window.scrollY >= 700) { // change target to number
        titleBarProjets.style.position = 'fixed';
    }else{
        titleBarProjets.style.position = 'relative';
    }
};

window.addEventListener("load", (event) => {
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
});

