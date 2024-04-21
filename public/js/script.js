let loading = () => {
    let tl = gsap.timeline()
    
    tl.to('.yellow1', 0.8, {
        top: '-100%',
        delay: 0.5,
        ease: 'expo.out'
    })
    tl.from('.yellow2', 0.7, {
        top: '100%',
        ease: 'expo.out',
    delay:0.5
    },'anim')
    tl.to('.loader h1',0.5,{
        delay: 0.7,
        color:'black'
    },'anim')

    tl.to('.loader',0.01,{
        opacity:0
    })
    tl.to('.loader',0.01,{
        display:'none'
    })
 }
loading();





const scroll = new LocomotiveScroll({
    el: document.querySelector('.main'),
    smooth: true,
    lurp:3
});


const button = document.querySelector('#circle')

function function1(){
    const lt = gsap.timeline()
        lt .to('#circle',0.5,{
            rotation:'45deg'
        },'anim')
        lt.to('#move h3',0.7,{
            x:'100'
        },"anim")
        lt.to('#moveall',0.8,{
            x:'220'
        },'anim')
}
function function2(){
    const lt = gsap.timeline()
        lt.to('#circle',0.5,{
            rotation:'0deg'
        },'anim')
        lt.to('#move h3',0.7,{
            x:'0'
        },"anim")
        lt.to('#moveall',0.8,{
            x:'0'
        },'anim')
}
let currentFunction = function1;

const click = document.getElementById('circle')
click.addEventListener('click',()=>{
    currentFunction();
    
    if(currentFunction == function1){
        currentFunction = function2;
    } else {
        currentFunction = function1;
    }
})
// function handleClick() {
    
// }


    
    // document.querySelector('.page1').addEventListener('scroll',()=>{
    //     console.log('scrolling')
    //     // lt .to('#circle',2,{
    //         //     rotation:'45deg'
    //         // },'anim')
    //         // lt.to('#move h3',2,{
    //             //     x:'100'
    //             // },"anim")
    //             // lt.to('#moveall',2,{
    //         //     x:'220'
    //         // },'anim')
    //         // button.className = 'open'
            
    //     })