document.addEventListener("DOMContentLoaded", function() {
  // nav menu

  const btnOpenNav = document.querySelector('.js--open-nav');
  const btnCloseNav = document.querySelector('.js--close-nav');
  const navbar = document.querySelector('.js--navbar');

  btnOpenNav.addEventListener('click', () => {
    navbar.classList.add('navbar--is-visible');
  });

  btnCloseNav.addEventListener('click', () => {
    navbar.classList.remove('navbar--is-visible');
  });

  // progress circle

  var progressWrap = document.querySelector(".progress");
  var progressPath = document.querySelector(".progress path");
  var pathLength = progressPath.getTotalLength();

  progressPath.style.transition = progressPath.style.WebkitTransition = "none";
  progressPath.style.strokeDasharray = pathLength + " " + pathLength;
  progressPath.style.strokeDashoffset = pathLength;
  progressPath.getBoundingClientRect();
  progressPath.style.transition = progressPath.style.WebkitTransition =
    "stroke-dashoffset 10ms linear";
  window.addEventListener("scroll", function() {
    var pos =
      window.pageYOffset ||
      (document.documentElement || document.body.parentNode || document.body)
      .scrollTop;
    var pageHeight =
      document.body.clientHeight || document.documentElement.clientHeight;
    var windowHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;
    var progress = pathLength - pos * pathLength / (pageHeight - windowHeight);
    progressPath.style.strokeDashoffset = progress;
  });

  var offset = 125;

  window.addEventListener("scroll", function() {
    var pos = window.pageYOffset ||
      (document.documentElement || document.body.parentNode || document.body)
      .scrollTop;
    if (pos > offset) {
      progressWrap.classList.add("progress--is-active");
    } else {
      progressWrap.classList.remove("progress--is-active");
    }
  });
  progressWrap.addEventListener("click", function(e) {
    event.preventDefault();
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
    return false;
  });

  // pauses video while out of viewport

  var videos = document.getElementsByTagName("video"),
    fraction = 0.05;

  function checkScroll() {

    for (var i = 0; i < videos.length; i++) {

      var video = videos[i];

      var x = video.offsetLeft,
        y = video.offsetTop,
        w = video.offsetWidth,
        h = video.offsetHeight,
        r = x + w, //right
        b = y + h, //bottom
        visibleX, visibleY, visible;

      visibleX = Math.max(0, Math.min(w, window.pageXOffset + window.innerWidth - x, r - window.pageXOffset));
      visibleY = Math.max(0, Math.min(h, window.pageYOffset + window.innerHeight - y, b - window.pageYOffset));

      visible = visibleX * visibleY / (w * h);

      if (visible > fraction) {
        video.play();
      } else {
        video.pause();
      }

    }

  }

  window.addEventListener('scroll', checkScroll, false);
  window.addEventListener('resize', checkScroll, false);


  // fade in elements while in viewport

  var container = document.querySelector('.content');
  var yOffset = window.pageYOffset;

  function scrolled() {
    if (window.yOffset < 100) {
      container.style.opacity = 1;
    }
  }

  window.addEventListener('scroll', scrolled);

  var animateHTML = function() {
    var elems;
    var windowHeight;

    function init() {
      elems = document.querySelectorAll('.hidden');
      windowHeight = window.innerHeight;
      addEventHandlers();
      checkPosition();
    }

    function addEventHandlers() {
      window.addEventListener('scroll', checkPosition);
      window.addEventListener('resize', init);
    }

    function checkPosition() {
      for (var i = 0; i < elems.length; i++) {
        var positionFromTop = elems[i].getBoundingClientRect()
          .top;
        if (positionFromTop - windowHeight <= 0) {
          elems[i].className = elems[i].className.replace('hidden', 'visible');
        }
      }
    }
    return {
      init: init
    };
  };
  animateHTML()
    .init();
});
