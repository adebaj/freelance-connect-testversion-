const navbar = document.querySelector(`.sidebar-toggle`);
const sidebar = document.querySelector(`.close-btn`);
const aside= document.querySelector(`.sidebar`);
// evemt listener for navbar
navbar.addEventListener(`click`, function() {
    aside.classList.toggle(`show-sidebar`)
})
// event listener for side bar cancelation
sidebar.addEventListener(`click`, function(){
// console.log(aside.classList);
// if(aside.classList.contains(`show-sidebar`)){
//     aside.classList.remove(`show-sidebar`)
// }
// note that the remove method does not only work inside
//  a function.the methid can simply be addedinside the function
    aside.classList.remove(`show-sidebar`)
})