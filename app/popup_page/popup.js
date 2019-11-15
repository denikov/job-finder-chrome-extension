import { Defaults } from '../defaults.js';
import { Model } from '../model.js';
import { Handlers } from './popupHandlers.js';
import Services from './popupServices.js';


class App {

  constructor(defaults, model, handlers, services) {

    this._defaults = defaults;
    this._model = model;
    this._handlers = handlers;
    this._services = services;

  }


  setSettingsHeight() {
    this._services.setSettingsHeight();
  }


  setLastUpdated(listing) {
    this._services.setLastUpdated(listing)
  }


  populateListings(listings, start) {
    this._services.populateListings(listings, start);
  }


  async init() {

    const userPrefs = await this._model.getPrefs();
    const jobListings = await this._model.jobListings();

//set up nav bar listeners
    document.getElementsByTagName('form')[0].addEventListener('submit', evt => this._handlers.searchHandler(evt));

    document.getElementsByClassName('nav-back')[0].getElementsByTagName('img')[0].addEventListener('click', evt => this._handlers.backButtonHandler(evt));

//bookmarked button
    document.getElementsByClassName('saved-listings')[0].addEventListener('click', evt => this._services.filterSavedListings(evt));

//settings button
    document.getElementById('nav-links').getElementsByTagName('img')[1].addEventListener('click', evt => this._handlers.settingsHandler(evt));

    const settingsPage = document.getElementById('settings-page');

//get the list of sites from settings page
    const sites = settingsPage.getElementsByClassName('job-sites');
//register "change" listeners for the job site checkboxes
    for (let i = 0; i < sites.length; i++) {
      sites[i].addEventListener('change', evt => this._handlers.jobSitesCheckboxHandler(evt));
    }

//register show more button
    document.getElementById('show-more').addEventListener('click', evt => this._handlers.showMoreHandler(evt));

//register "change" listener for frequency select
    document.getElementById('frequency-interval').addEventListener('change', evt => this._handlers.frequencyChangeHandler(evt));

//register change listener for aggregate results checkbox
    document.getElementById('aggregate-checkbox').addEventListener('change', evt => this._handlers.aggregateResultCBHandler(evt));

//register change listener for limiting listings per supported website
    const listingLimitSelect = document.getElementById('listings-limit');
    listingLimitSelect.addEventListener('change', evt => this._handlers.listingsLimitHandler(evt));

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
    const openTabCounter = await this._model.openTabCounter();

    if (openTabCounter === 0) {
//jobs are not searching, remove spinner
      const spinnerContainer = document.getElementById('spinner-container');
      spinnerContainer.className = 'd-none';
    }
  
    if (jobListings.length > 0) {
//display the show-more button if more listings than limit
      if (jobListings.length > this._defaults.listingsPageLimit) {
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

      this._services.setLastUpdated(jobListings[0]);
      this._services.populateListings(jobListings, 0);

    }else {
      const message = document.getElementById('message');
      message.innerText = 'No saved listings. Run your first search!';
      message.className = '';

      this._services.setLastUpdated();
    }

    this._services.setSettingsHeight();
  }

}


/* *
 * Listen to messages from background
 * */
if (window.chrome) {
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

      _App.setSettingsHeight();

      _App.setLastUpdated(request.listings[0]);
      _App.populateListings(request.listings, 0);
    }
  })
}


window.addEventListener('DOMContentLoaded', () => {
  const defaults = new Defaults();
  const model = new Model(defaults);
  const services = new Services(defaults, model);
  const handlers = new Handlers(defaults, model, services);
  window._App = new App(defaults, model, handlers, services);

//timeout needed for asyncronous functions to complete in the Model class
  setTimeout(() => {
    _App.init()
  }, 2000);

});


/* *
 * Clear browserAction badge when popup opened
 * */
if (window.chrome) {
  chrome.browserAction.setBadgeText({
    text: ''
  });
}
