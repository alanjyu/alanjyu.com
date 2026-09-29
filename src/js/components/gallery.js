export default class Gallery {
  constructor() {
    this.galleryPhotos = document.querySelectorAll('.gallery__photo > img');

    this.galleryPhotos.forEach(photo => {
      let position = photo.dataset.objectPosition;
      console.log(position);
      if (position) {
        photo.style.setProperty('--object-position', position);
      }
    });
  }
}


