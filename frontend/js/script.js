let tl = gsap.timeline();
tl.from('.loadpage p',{
    x:100,
    duration:1,
    delay:0.5,
    opacity:0,
    stagger:0.09
})
tl.to('.loadpage p',{
    x:-50,
    duration:0.4,
    opacity:0,
    stagger:0.05
})
tl.to('.loadpage',{
    opacity:0,
    duration:0.9
},1.9)
tl.to('.loadpage',{
    y:-800
})

gsap.from('.navl',{
    y:70,
    duration:0.5,
    delay:2.2,
    
})
gsap.from('.navr',{
    y:70,
    duration:0.7,
    delay:2.2,
    
})
gsap.from('.hero .herotop p',{
    y:200,
    // opacity:0,
    duration:0.6,
    delay:2.2,
    
})
gsap.from('.hero .herobottom p',{
    y:200,
    // opacity:0,
    duration:0.6,
    delay:2.2,
    
})
gsap.from('.hero .herobottom button',{
    y:50,
    opacity:0,
    duration:1,
    delay:2.2,
    
})
