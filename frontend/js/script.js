const lt = gsap.timeline()
const button = document.querySelector('#circle')


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
    function explore(){
        button.addEventListener('click',()=>{
            lt .to('#circle',0.5,{
                rotation:'45deg'
            },'anim')
            lt.to('#move h3',0.7,{
                x:'100'
            },"anim")
            lt.to('#moveall',0.8,{
                x:'220'
            },'anim')
            button.className = 'open'
        }) 
    }
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

    tl.to('.loader',0.1,{
        opacity:0
    })
    tl.to('.loader',0.1,{
        display:'none'
    })
}
loading();


const scroll = new LocomotiveScroll({
    el: document.querySelector('.main'),
    smooth: true,
    lurp:3
});



button.className == 'open'?(
    button.addEventListener('click',()=>{
        lt.to('#circle',{
            rotation:'45deg'
        })
        button.className = ''
    }) 
)
:(
    explore()

)





// document.querySelector('.circle').addEventListener('click',()=>{
//     gsap.to('.circle',{
//         rotation:'0deg'
//     })
// })