export default class Services {

  constructor(defaults, model) {

    this._defaults = defaults;
    this._model = model;
  }


/* *
 * Add/remove bookmarks
 * @param {string} reference - link to the job listing
 * @param {Boolean} remove - whether to remove the bookmark
 * */
  async editSavedListings(reference, remove) {

    const jobListings = await this._model.jobListings();

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


/* *
 * When user toggles bookmark, use the IMG source to determine whether to show saved bookmarks or not
 * @param event - DIV wrapper for the book IMG and SPAN for counter of saved listings
 * */
  async getCurrentListings(event) {
    const listings = await this._model.jobListings();

//click could be on the img or the span...checking the target and finding the first child IMG
    const bookImg = event.target.className === 'saved-listings' ? event.target.children[0] : event.target.parentElement.children[0];

    if (bookImg.src.indexOf('active') > -1) {
//currently filtered images are shown
      bookImg.src = 'icons/icons8-book-50.png';

//reset pagination index on the show more button
      if (listings.length > this._defaults.listingsPageLimit) {
        const showMoreButton = document.getElementById('show-more');
        showMoreButton.setAttribute('data-index', '0');
      }
      return [listings, 0];

    }else {
      bookImg.src = 'icons/icons8-book-active-50.png';
      const filtered = listings.filter(listing => listing.saved);

//reset pagination index on the show more button
      if (filtered.length > this._defaults.listingsPageLimit) {
        const showMoreButton = document.getElementById('show-more');
        showMoreButton.setAttribute('data-index', '0');
      }

      return [filtered, 0];
    }
  }


  /* *
   * Showing the user when the last time a job search was run
   * @param {Object []} listing - first listing of all jobs will contain last updated information
   * */
  setLastUpdated(listing) {

    const lastUpdatedColumn = document.getElementById('last-updated');
    if (listing) {
      if (!listing.hasOwnProperty('last_updated')) {
        lastUpdatedColumn.innerHTML = 'Last Updated:<br>' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() ;
      }else {
        lastUpdatedColumn.innerHTML = 'Last Updated:<br>' + new Date(listing.last_updated).toLocaleDateString() + ' ' + new Date(listing.last_updated).toLocaleTimeString() ;
      }

    }else {
      lastUpdatedColumn.innerText = 'Last Updated: --';
    }
  }


/* *
 * Dynamically settings the settings page height when the popup page loads
 * */
  setSettingsHeight() {
    const headerHeight = document.getElementsByTagName('header')[0].offsetHeight;
    const settingsPage = document.getElementById('settings-page');
    settingsPage.style.height = (600 - headerHeight - 34).toString() + 'px';
  }


/* *
 * This function is called when popup page loads or when SHOW MORE is clicked
 * */
  registerBookmarkListeners() {

    const bookmarks = document.getElementsByClassName('listing-bookmark');
    for (let i = 0; i < bookmarks.length; i++) {

//check if element already has a click listener
      if (bookmarks[i].getAttribute('data-listener')) {
        continue;
      }

      bookmarks[i].setAttribute('data-listener', true);
      bookmarks[i].addEventListener('click', event => {

        const bookmark = event.target;
        const savedCountElement = document.getElementsByClassName('saved-count')[0];
        let savedCount = parseInt(savedCountElement.innerText);

//use image source to determine if listing is currently saved or not
        if (bookmark.src.indexOf('saved') > -1) {
//removing saved listing
          bookmark.src = 'icons/icons8-bookmark-50.png';
          --savedCount;
          this.editSavedListings(bookmark.getAttribute('data-ref'), true);
        }else {
          bookmark.src = 'icons/icons8-bookmark-saved-50.png';
          savedCount++;
          this.editSavedListings(bookmark.getAttribute('data-ref'), false);
        }
//set bookmark counter
        savedCountElement.innerText = savedCount;

//checking if the user is on the filtered list and decided to remove the last saved listing
        if (savedCount === 0) {
          const bookImg = document.getElementsByClassName('saved-listings')[0].children[0];
          if (bookImg.src.indexOf('active') > -1) {

//use this function to take care of everything
            this.filterSavedListings({
              target: bookImg
            });
          }
        }
      })
    }
  }


/* *
 * @param {Object []} listings
 * @param {number} pageNum - used for pagination...SHOW MORE button holds a reference to the last listing index
 * @param {Boolean} append - if TRUE, append to the UL; else FALSE, set innerHTML of UL
 * */
  populateListings(listings, pageNum, append) {

    const listingsUL = document.getElementById('listings');
    let savedListingCounter = 0;

//create temporary div to hold the list elements
//append to listingUL when all listings created...avoids reflow/redraw
    const tempDiv = document.createElement('div');

//temp link to set the href and get the host
    const listingSource = document.createElement('a');

    for (let i = pageNum; i < listings.length; i++) {

//check if limit reached for page
      if (i >= pageNum + this._defaults.listingsPageLimit()) {
        const showMoreButton = document.getElementById('show-more');
        showMoreButton.setAttribute('data-index', pageNum + this._defaults.listingsPageLimit());
        if (i >= listings.length) {
          showMoreButton.className = 'd-none';
        }else {
          showMoreButton.className = '';
        }
        break;
      }

//reached last listing
      if (i === listings.length - 1) {
        const showMoreButton = document.getElementById('show-more');
//next starting index is last index plus one
        showMoreButton.setAttribute('data-index', i + 1);
        showMoreButton.className = 'd-none';
      }

      const listing = listings[i];
      const li = document.createElement('li');

//set correct src for bookmark if the listing is saved
      const bookmarkSrc = (() => {
        if (listing.saved) {
          savedListingCounter++;
          return 'icons/icons8-bookmark-saved-50.png';
        }else {
          return 'icons/icons8-bookmark-50.png';
        }
      })()

      listingSource.href = listing.link;

      li.className = 'job-listing';
      li.innerHTML = 
        '<div class="job-title-wrapper"> \
          <h3 class="listing-title">' + listing.title + '</h3> \
          <img class="listing-bookmark" src="' + bookmarkSrc + '" data-ref="' + listing.link + '"> \
        </div> \
        <span class="listing-source">(' + listingSource.host.replace('www.', '').toUpperCase() + ')</span> \
        <p class="listing-summary">' + listing.summary + ' \
        <a href="' + listing.link + '" target="_blank">View Listing</a></p> \
        <strong><span class="listing-company">' + listing.company + '</span></strong> \
        <span>&#8226;</span> \
        <span class="listing-date">' + listing.date + '</span>';

      tempDiv.appendChild(li);
    }

    if (append) {
      listingsUL.innerHTML += tempDiv.innerHTML;
    }else {
      listingsUL.innerHTML = tempDiv.innerHTML;
    }
    this.registerBookmarkListeners();
  }


/* *
 * Filter to show only saved/all listings
 * @param event - Click event when user toggles book IMG
 * */
  filterSavedListings(event) {
    this.getCurrentListings(event)
      .then(result => {
        this.populateListings(result[0], result[1]);
      })
  }

}
