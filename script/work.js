document.querySelector("#view").addEventListener("click", () => {
    document.querySelector(".overlay").style.visibility = "hidden";
    // console.log('works')
    document.querySelector(".view_back").style.visibility = "visible";
  });
  
  document.querySelector(".view_back").addEventListener("click", () => {
    document.querySelector(".overlay").style.visibility = "visible";
    document.querySelector(".view_back").style.visibility = "hidden";
  });
  