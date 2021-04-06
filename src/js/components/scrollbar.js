export default class Scrollbar {
  constructor() {
    var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0); // viewport width
    var vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0); // viewport height
    var dw = Math.max(document.body.clientWidth || 0, document.documentElement.clientWidth || 0, document.documentElement.scrollWidth || 0); // document width
    var dh = Math.max(document.body.clientHeight || 0, document.documentElement.clientHeight || 0, document.documentElement.scrollHeight || 0); // document height

    document.addEventListener('scroll', (e) => {

    });

    window.addEventListener('resize', (e) => {
      vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0); // viewport width
      vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0); // viewport height
      dw = Math.max(document.body.clientWidth || 0, document.documentElement.clientWidth || 0, document.documentElement.scrollWidth || 0); // document width
      dh = Math.max(document.body.clientHeight || 0, document.documentElement.clientHeight || 0, document.documentElement.scrollHeight || 0); // document height
    })
  }
}