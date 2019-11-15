export default class Services {

  constructor(config, store, model) {

    this._config = config;
    this._store = store;
    this._model = model;
  }


//add/remove bookmarks
  editSavedListings(reference, remove) {

    const jobListings = this._store.jobListings;

    jobListings.forEach((listing, index) => {
      if (listing.link === reference) {
        if (remove) {
          listing.saved = false;
        }else {
          listing.saved = true;
        }
      }
    })
    this._model.saveListings(jobListings);
  }


  getCurrentListings(event) {
    const listings = this._store.jobListings;

//click could be on the img or the span...checking the target and finding the first child IMG
    const bookImg = event.target.className === 'saved-listings' ? event.target.children[0] : event.target.parentElement.children[0];

    if (bookImg.src.indexOf('active') > -1) {
//currently filtered images are shown
      bookImg.src = 'icons/icons8-book-50.png';

//reset pagination index on the show more button
      if (listings.length > config.listingsPageLimit) {
        const showMoreButton = document.getElementById('show-more');
        showMoreButton.setAttribute('data-index', '0');
      }
      return [listings, 0];

    }else {
      bookImg.src = 'icons/icons8-book-active-50.png';
      const filtered = listings.filter(listing => listing.saved);

//reset pagination index on the show more button
      if (filtered.length > config.listingsPageLimit) {
        const showMoreButton = document.getElementById('show-more');
        showMoreButton.setAttribute('data-index', '0');
      }

      return [filtered, 0];
    }
  }

}
