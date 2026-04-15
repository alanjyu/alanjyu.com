export default class Gallery {
  constructor(element) {
    this.gallery = element;
    this.cards = this.gallery.querySelectorAll('.gallery__card');
    this.cards.forEach(card => this.bindCard(card));
  }

  bindCard(card) {
    const media = card.querySelector('.gallery__media');
    const image = media?.querySelector('img');
    if (!media || !image) return;
    let resetOriginTimer = null;

    const setZoomLevel = scale => {
      image.style.transform = `scale(${scale})`;
    };

    const updatePointerPosition = event => {
      const rect = media.getBoundingClientRect();
      const relX = ((event.clientX - rect.left) / rect.width) * 100;
      const relY = ((event.clientY - rect.top) / rect.height) * 100;
      const x = Math.max(0, Math.min(100, relX));
      const y = Math.max(0, Math.min(100, relY));

      media.style.setProperty('--zoom-x', `${x}%`);
      media.style.setProperty('--zoom-y', `${y}%`);
    };

    const startZoom = event => {
      if (event.pointerType === 'touch') return;
      if (resetOriginTimer) {
        clearTimeout(resetOriginTimer);
        resetOriginTimer = null;
      }
      updatePointerPosition(event);
      card.classList.add('gallery__card--zoom');
      setZoomLevel(1.5);
    };

    const stopZoom = () => {
      card.classList.remove('gallery__card--zoom');
      image.style.transform = '';

      // Keep the last zoom origin while easing out, then reset to center.
      resetOriginTimer = setTimeout(() => {
        if (card.matches(':hover')) return;
        media.style.setProperty('--zoom-x', '50%');
        media.style.setProperty('--zoom-y', '50%');
        resetOriginTimer = null;
      }, 260);
    };

    media.addEventListener('pointerenter', startZoom);
    media.addEventListener('pointermove', updatePointerPosition);
    media.addEventListener('pointerleave', stopZoom);
    media.addEventListener('pointercancel', stopZoom);

    // Fallback for environments where pointer events are not emitted consistently.
    media.addEventListener('mouseenter', startZoom);
    media.addEventListener('mousemove', updatePointerPosition);
    media.addEventListener('mouseleave', stopZoom);
  }
}
