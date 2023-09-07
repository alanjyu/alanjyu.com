export default class Cursor {
  constructor() {
    const coverTargets = document.querySelectorAll('[data-target-cover]');
    const dotTargets = document.querySelectorAll('[data-target-dot]');
    const cursor = document.querySelector('.cursor');
    const cursorInner = document.querySelector('.cursor__inner');

    let borderRadius = 10;

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
    let borderRadiusAnimationSpeed = 1000 / 1; // Adjust the animation speed (e.g., 30 frames per second)

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
        cursor.style.filter = 'blur(12px)';
      } else if (hoverState === 'dot') {
        cursor.style.filter = 'blur(0)';
      } else if (hoverState === 'cover') {
        cursor.style.filter = 'blur(0)';
      }
    };

    // create a new series of randomized border radius
    function getRandomBorderRadius(min, max) {
      let radii = [];

      for (let i = 0; i < 8; i++) {
        let r = Math.floor(Math.random() * (max - min + 1)) + min;
        radii.push(r);
      }
      return `${radii[0]}% ${radii[1]}% ${radii[2]}% ${radii[3]}% / ${radii[4]}% ${radii[5]}% ${radii[6]}% ${radii[7]}%`;
    }

    function updateCursorRadius(currentTime) {
      if (!lastUpdateTime || currentTime - lastUpdateTime >= borderRadiusAnimationSpeed) {
        cursor.style.borderRadius = getRandomBorderRadius(35, 65);
        lastUpdateTime = currentTime;
      }
      requestAnimationFrame(updateCursorRadius);
    }

    updateCursorStyle();
    requestAnimationFrame(updateCursorRadius);

    // update position, dimension, and styles according to state
    document.addEventListener('mousemove', (e) => {
      if (hoverState === 'cover' || hoverState === 'dot') {
        cursorPosX = hoverPosX + wobbleX - cursorBaseWidth * .5;
        cursorPosY = hoverPosY + wobbleY - cursorBaseWidth * .5;
      } else {
        cursorPosX = e.clientX - cursorWidth * .5;
        cursorPosY = e.clientY - cursorHeight * .5;
      }

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

        // get boudning diimensions
        let rect = coverTarget.getBoundingClientRect();
        
        // update cursor width and height (transformation )
        cursorWidth = rect.width;
        cursorHeight = rect.height;

        hoverPosX = (rect.left + rect.right) * .5; // hover position x at center of object
        hoverPosY = (rect.top + rect.bottom) * .5; // hover position y at center of object

        wobbleX = (e.clientX - hoverPosX) / rect.width * wobble; // adjustment on width
        wobbleY = (e.clientY - hoverPosY) / rect.height * wobble; // adjustment on height

        updateCursorStyle('10px', '#fff', 'blur(0)', '1');
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