
let tl = gsap.timeline();
  
document.querySelector(".signinbtn").addEventListener("click", () => {
  tl.to(".signup .right", {
    opacity: 0,
    duration: 0,
  });
  tl.to(".mover", {
    x: 510,
    duration: 1.2,
  });
  gsap.from(".signin .left", {
    x: 100,
    duration: 1.2,
  });
  document.querySelector(".mover").style.borderRadius = "0 15px 15px 0";
  document.querySelector(".signup").style.visibility = "hidden";
  document.querySelector(".signin").style.visibility = "visible";
});
document.querySelector(".signupbtn").addEventListener("click", () => {
  tl.to(".mover", {
    x: 0,
    duration: 1.2,
  });
  gsap.to(".signup .right", {
    opacity: 1,
    duration: 0,
  });
  gsap.from(".signup .right", {
    x: -100,
    opacity: 1,
    duration: 1.2,
  });
  document.querySelector(".mover").style.borderRadius = "15px 0 0 15px";
  document.querySelector(".signin").style.visibility = "hidden";
  document.querySelector(".signup").style.visibility = "visible";
});
