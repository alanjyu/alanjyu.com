export default class Cursor {
  constructor() {
    const coverTargets = document.querySelectorAll('[data-target-cover]');
    const dotTargets = document.querySelectorAll('[data-target-dot]');
    const cursor = document.querySelector('.cursor');
    const cursorInner = document.querySelector('.cursor__inner');
    let hoverState = 'none'; // none; 'dot'; 'cover'
    let cursorPosX = document.documentElement.clientWidth * .5; // center initial mouse position
    let cursorPosY = document.documentElement.clientHeight * .5;

    let wobbleX = 0, wobbleY = 0; // further adjustments (wobbling while a target hover is triggered) for cursor position
    let cursorBaseWidth = 40; // base width and height
    let cursorWidth = cursorBaseWidth, cursorHeight = cursorBaseWidth; // dyanmic cursor width and height

    let hoverPosX = 0, hoverPosY = 0;
    let dotOffsetX = 20, dotOffsetY = 20; // dot placement off the bottom right while hovered
    let wobble = 5;

    let lastUpdateTime = 0;

    let sensitivity = .3; // Adjust the sensitivity factor (between 0 and 1)
    let borderRadiusAnimationSpeed = 1000; // in seconds

    function updateCursor(x, y) {
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    }

    function updateCursorInner(w, h) {
      let scaleX = w / cursorBaseWidth;
      let scaleY = h / cursorBaseWidth;
      cursorInner.style.transform = `scale(${scaleX}, ${scaleY})`;
    }

    function updateCursorStyle () {
      if (hoverState === 'none') {
        cursorInner.classList.add('cursor--no-target');
        cursorInner.classList.remove('cursor--dot');
        cursorInner.classList.remove('cursor--cover');
      } else if (hoverState === 'dot') {
        cursorInner.classList.add('cursor--dot');
        cursorInner.classList.remove('cursor--no-target');
        cursorInner.classList.remove('cursor--cover');
      } else if (hoverState === 'cover') {
        cursorInner.classList.add('cursor--cover');
        cursorInner.classList.remove('cursor--no-target');
        cursorInner.classList.remove('cursor--dot');
      }
    };

    updateCursorStyle();

    // update position, dimension, and styles according to state
    document.addEventListener('mousemove', (e) => {
      if (hoverState === 'cover' || hoverState === 'dot') {
        cursorPosX = hoverPosX + wobbleX - cursorBaseWidth * .5;
        cursorPosY = hoverPosY + wobbleY - cursorBaseWidth * .5;
      } else {
        cursorPosX = e.clientX - cursorWidth * .5;
        cursorPosY = e.clientY - cursorHeight * .5;
      }
      
      updateCursorStyle();
      updateCursor(cursorPosX, cursorPosY);
      updateCursorInner(cursorWidth, cursorHeight);
    });

    // reset cursor state after scroll
    document.addEventListener('scroll', () => {
      hoverState = 'none';
      updateCursorStyle();
    });

    // mouse shadow covers the entire target
    coverTargets.forEach(coverTarget => {
      coverTarget.addEventListener('mousemove', (e) => {
        hoverState = 'cover';

        let rect = coverTarget.getBoundingClientRect();
        
        cursorWidth = rect.width;
        cursorHeight = rect.height;

        hoverPosX = (rect.left + rect.right) * .5; // hover position x at center of object
        hoverPosY = (rect.top + rect.bottom) * .5; // hover position y at center of object

        wobbleX = (e.clientX - hoverPosX) / rect.width * wobble; // adjustment on width
        wobbleY = (e.clientY - hoverPosY) / rect.height * wobble; // adjustment on height

        updateCursorStyle();
      });

      coverTarget.addEventListener('mouseleave', (e) => {
        hoverState = 'none';

        cursorWidth = cursorBaseWidth;
        cursorHeight = cursorBaseWidth;

        updateCursorStyle();
      });
    });

    // transform into a dot
    dotTargets.forEach(dotTarget => {
      dotTarget.addEventListener('mousemove', (e) => {
        hoverState = 'dot';

        // get bounding dimensions
        let rect = dotTarget.getBoundingClientRect();

        hoverPosX = rect.right;
        hoverPosY = rect.bottom;

        wobbleX = (e.clientX - (rect.left + rect.right) * .5) * wobble * .005;
        wobbleY = (e.clientY - (rect.top + rect.bottom) * .5) * wobble * .005;

        updateCursorStyle();
      });

      dotTarget.addEventListener('mouseleave', (e) => {
        hoverState = 'none';

        updateCursorStyle();
       });
    });
  }
}