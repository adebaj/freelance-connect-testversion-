
// local reviews data
const reviews = [
  {
    id: 1,
    name: 'jack smith',
    job: 'web developer',
    // img: 'https://www.course-api.com/images/people/person-1.jpeg',
        img: './pic/img1.jpg',

    text: "I'm baby meggings twee health goth +1. Bicycle rights tumeric chartreuse before they sold out chambray pop-up. Shaman humblebrag pickled coloring book salvia hoodie, cold-pressed four dollar toast everyday carry",
  },
  {
    id: 2,
    name: 'williams Adebayo',
    job: 'web designer',
    // img: 'https://www.course-api.com/images/people/person-2.jpeg',
            img: './pic/img2.jpg',

    text: 'Helvetica artisan kinfolk thundercats lumbersexual blue bottle. Disrupt glossier gastropub deep v vice franzen hell of brooklyn twee enamel pin fashion axe.photo booth jean shorts artisan narwhal.',
  },
  {
    id: 3,
    name: 'Kibitzu Muzan',
    job: 'intern',
    // img: 'https://www.course-api.com/images/people/person-4.jpeg',
            img: './pic/img3.jpg',

    text: 'Sriracha literally flexitarian irony, vape marfa unicorn. Glossier tattooed 8-bit, fixie waistcoat offal activated charcoal slow-carb marfa hell of pabst raclette post-ironic jianbing swag.',
  },
  {
    id: 4,
    name: 'Tosin Adebayo',
    job: 'the boss',
    // img: 'https://www.course-api.com/images/people/person-3.jpeg',
            img: './pic/img4.jpg',

    text: 'Edison bulb put a bird on it humblebrag, marfa pok pok heirloom fashion axe cray stumptown venmo actually seitan. VHS farm-to-table schlitz, edison bulb pop-up 3 wolf moon tote bag street art shabby chic. ',
  },
];
// element selection by id
const img= document.getElementById(`person-img`);
const aurthor= document.getElementById(`author`);
const job= document.getElementById(`job`);
const info= document.getElementById(`info`);
// elements selections by class(queryselector)
const prevbtn = document.querySelector(`.prev-btn`)
const nextbtn = document.querySelector(`.next-btn`)
const randombtn = document.querySelector(`.random-btn`)

// index value for the array
let currentvalue = 0;

// callback function/ event listener
window.addEventListener(`DOMContentLoaded`, function() {
  //  const item = reviews[currentvalue];
  // img.src = item.img
  // aurthor.textContent = item.name;
  // job.textContent = item.job;
  // info.textContent = item.text
  // the above code works also,
  //  but to practice arguements, the function below was created
 showperson(currentvalue)
  
})
function showperson(person){
  console.log(currentvalue);
  
   const item = reviews[person];
  img.src = item.img
  aurthor.textContent = item.name;
  job.textContent = item.job;
  info.textContent = item.text
}
// prev button functionality
prevbtn.addEventListener(`click`, function () {
  currentvalue--;
  if(currentvalue < 0){
    currentvalue = reviews.length - 1
  }
showperson(currentvalue)
})
// next button functionality
nextbtn.addEventListener(`click`, function () {
  currentvalue++;
  if(currentvalue> reviews.length - 1){
    currentvalue = 0
    
  }
showperson(currentvalue)
})

// random functionality
randombtn.addEventListener(`click`, function () {
currentvalue =  Math.floor(Math.random()*reviews.length)
showperson(currentvalue)
console.log(currentvalue);

}
)
