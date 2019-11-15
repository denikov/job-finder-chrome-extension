import { Config } from '../config.js';
import { Model } from '../scripts/model.js';
import { Store } from '../scripts/store.js';
import { Handlers } from './handlers.js';
import Services from './services.js';

let app;

class App {

  constructor(config, store, model, handlers, services) {

    this._config = config;
    this._model = model;
    this._store = store;
    this._handlers = handlers;
    this._services = services;

  }

  init() {
    console.log('init');

    const userPrefs = this._store.userPrefs;
    const jobListings = this._store.jobListings;

//set up nav bar listeners
    //document.getElementById('search-button').addEventListener('click', searchHandler);
    document.getElementsByTagName('form')[0].addEventListener('submit', () => this._handlers.searchHandler(event));

    document.getElementsByClassName('nav-back')[0].getElementsByTagName('img')[0].addEventListener('click', () => this._handlers.backButtonHandler(event));

//bookmarked button
    document.getElementsByClassName('saved-listings')[0].addEventListener('click', () => this._handlers.filterSavedListings(event));

//settings button
    document.getElementById('nav-links').getElementsByTagName('img')[1].addEventListener('click', () => this._handlers.settingsHandler(event));

    const settingsPage = document.getElementById('settings-page');

//get the list of sites from settings page
    const sites = settingsPage.getElementsByClassName('job-sites');
//register "change" listeners for the job site checkboxes
    for (let i = 0; i < sites.length; i++) {
      sites[i].addEventListener('change', () => this._handlers.jobSitesCheckboxHandler(event));
    }


//register show more button
    document.getElementById('show-more').addEventListener('click', (event) => {

//data-index contains the current listing index
      const listingIndex = parseInt(event.target.getAttribute('data-index'));

      const listings = this._store.jobListings;
//check if on bookmark page
      if (document.getElementsByClassName('saved-listings')[0].children[0].src.indexOf('active') > -1) {
//book image src of active image...need saved listings only
        const filteredListings = listings.filter(listing => listing.saved);
        this.populateListings(filteredListings, listingIndex, true);
      }else {
        this.populateListings(listings, listingIndex, true);
      }

    });


//register "change" listener for frequency select
    document.getElementById('frequency-interval').addEventListener('change', () => this._handlers.frequencyChangeHandler(event));

//register change listener for aggregate results checkbox
    document.getElementById('aggregate-checkbox').addEventListener('change', () => this._handlers.aggregateResultCBHandler(event));

//register change listener for limiting listings per supported website
    const listingLimitSelect = document.getElementById('listings-limit');
    listingLimitSelect.addEventListener('change', () => this._handlers.listingsLimitHandler(event));

//check user preferences and adjust fields
    const searchButton = document.getElementById('search-button');
    searchButton.disabled = false;
    if (jobListings.length > 0) {
      searchButton.innerText = 'Update';
    }

    if (userPrefs.keywords && userPrefs.location) {

      const keywords = document.getElementById('user-keywords'),
      location = document.getElementById('user-location');

      keywords.value = userPrefs.keywords;
      location.value = userPrefs.location;
    }

    if (userPrefs.omitted_sites.length > 0) {
      userPrefs.omitted_sites.map((site, index) => {
//site eg: site0, site1, site2. extract the number and get the corresponding index from sites
        const siteIndex = parseInt(site.match(/\d+/g)[0]);
        sites[siteIndex].checked = false;
      })
    }

//set frequency option if user set it before
    const frequencyOptions = document.getElementById('frequency-interval').children;
    for (let i = 0; i < frequencyOptions.length; i++) {
      if (frequencyOptions[i].value !== userPrefs.frequency) {
        frequencyOptions[i].selected = false;
      }else {
        frequencyOptions[i].selected = true;
      }
    }

//set aggregate results checkbox
    if (!userPrefs.aggregate_results) {
      document.getElementById('aggregate-label').innerText = 'No';
      document.getElementById('aggregate-checkbox').checked = false;
    }

//set listing limit preference
    const listingLimitOptions = listingLimitSelect.getElementsByTagName('option');
    for (let i = 0; i < listingLimitOptions.length; i++) {
      if (userPrefs.listing_limit != listingLimitOptions[i].value) {
        listingLimitOptions[i].selected = false;
      }else {
        listingLimitOptions[i].selected = true;
      }
    }

//check if any listings saved and prepopulate popup
//ask background if currently searching
    chrome.runtime.sendMessage({
      task: 'searching'
    }, response => {

      if (!response.searching) {
//jobs are not searching, remove spinner
        const spinnerContainer = document.getElementById('spinner-container');
        spinnerContainer.className = 'd-none';
      }
    
      if (jobListings.length > 0) {
//display the show-more button if more listings than limit
        if (jobListings.length > this._config.listingsPageLimit) {
          document.getElementById('show-more').className = '';
        }

//update bookmarks count badge
        const savedListingCounter = jobListings.filter(listing => listing.saved);
        if (savedListingCounter.length > 0) {
          const savedCountElement = document.getElementsByClassName('saved-count')[0];
          if (savedListingCounter.length > 9) {
            savedCountElement.innerText = '9+';
          }else {
            savedCountElement.innerText = savedListingCounter.length.toString();
          }
        }

        this.setLastUpdated(this._store.jobListings[0]);
        this.populateListings(jobListings, 0);

      }else {
        const message = document.getElementById('message');
        message.innerText = 'No saved listings. Run your first search!';
        message.className = '';

        this.setLastUpdated();
      }

      this.setSettingsHeight();
    })
  }


//setting the updated information for user
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


//dynamically adjusting the settings page height
  setSettingsHeight() {
    const headerHeight = document.getElementsByTagName('header')[0].offsetHeight;
    const settingsPage = document.getElementById('settings-page');
    settingsPage.style.height = (600 - headerHeight - 34).toString() + 'px';
  }


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
          editSavedListings(bookmark.getAttribute('data-ref'), true);
        }else {
          bookmark.src = 'icons/icons8-bookmark-saved-50.png';
          savedCount++;
          editSavedListings(bookmark.getAttribute('data-ref'), false);
        }
//set bookmark counter
        savedCountElement.innerText = savedCount;

//checking if the user is on the filtered list and decided to remove the last saved listing
        if (savedCount === 0) {
          const bookImg = document.getElementsByClassName('saved-listings')[0].children[0];
          if (bookImg.src.indexOf('active') > -1) {

//use this function to take care of everything
            filterSavedListings({
              target: bookImg
            });
          }
        }
      })
    }
  }


//pageNum is used for pagination...show more button holds a reference to the last listing index
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
      if (i >= pageNum + config.listingsPageLimit) {
        const showMoreButton = document.getElementById('show-more');
        showMoreButton.setAttribute('data-index', pageNum + config.listingsPageLimit);
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

//append for pagination or toggling bookmarked listings
    if (append) {
      listingsUL.innerHTML += tempDiv.innerHTML;
    }else {
      listingsUL.innerHTML = tempDiv.innerHTML;
    }
    this._services.registerBookmarkListeners();
  }


//filter to show only saved listings
  filterSavedListings(event) {
    this.populateListings(this._services.getCurrentListings(event));

  }

}



//listen to messages from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.listings) {
    sendResponse(true);
//hide spinner
    document.getElementById('spinner-container').className = 'd-none';
    const message = document.getElementById('message');
    message.className = 'd-none';
    message.innerText = '';

//enable search button
    const searchButton = document.getElementById('search-button');
    searchButton.innerText = 'Update';
    searchButton.disabled = false;

    app.setSettingsHeight();

    app.setLastUpdated(request.listings[0]);
    app.populateListings(request.listings, 0);
  }
})



window.addEventListener('DOMContentLoaded', () => {
  const config = new Config();
  const store = new Store(config);
  const model = new Model(config, store);
  const handlers = new Handlers(config, store, model);
  const services = new Services(config, store, model);
  app = new App(config, store, model, handlers, services);

//timeout needed for asyncronous functions to complete in the Model class
  setTimeout(() => {
    app.init()
  }, 2000);
});

//clear browserAction badge when popup opened
chrome.browserAction.setBadgeText({
  text: ''
});
