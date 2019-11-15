export class Handlers {

  constructor(defaults, model, services) {
    this._defaults = defaults;
    this._model = model;
    this._services = services;
  }


/* *
 * Search jobs button clicked handler
 * */
  async searchHandler(event) {

    event.preventDefault();

    const userPrefs = await this._model.getPrefs();

//check if user deselected all sites, show error
    if (userPrefs.omitted_sites.length === this._defaults.supportedSitesAmount()) {

      const message = document.getElementById('message');
      const initialMessage = message.innerText;
      message.innerText = 'You unchecked all supported websites. Please select at least one website from the settings and perform a search again.'
      message.style.color = 'red';
      message.className = 'error';

      setTimeout(() => {
        message.style.color = 'initial';
        if (initialMessage.length > 0) {
          message.className = '';
          message.innerText = initialMessage;
        }else {
          message.className = 'd-none';
          message.innerText = '';
        }
      }, 4000);
      return;
    }

    const keywords = document.getElementById('user-keywords').value,
    location = document.getElementById('user-location').value;

    if (keywords === '' || location === '') {
      const errorRow = document.getElementById('error-row');
      errorRow.children[0].innerText = 'Please fill in both fields before performing a search!';
      errorRow.className = '';
      setTimeout(function() {
        errorRow.children[0].innerText = '';
        errorRow.className = 'd-none';
      }, 3000);
      return;
    }

//disable search button
    const searchButton = document.getElementById('search-button');
    searchButton.disabled = true;

//save search values if different
    if (userPrefs.keywords != keywords || userPrefs.location != location) {
      userPrefs.keywords = keywords;
      userPrefs.location = location;
      this._model.savePreferences(userPrefs);
    }

//call background script to open up the necessary pages
    if (window.chrome) {
      chrome.runtime.sendMessage({
        task: 'searchJobs',
        prefs: [keywords, location]
      });
    }

//close settings page if open
    const settings = document.getElementById('settings-page');
    if (settings.style.transform.indexOf('-100') > -1) {
      this.settingsHandler({
        target: document.getElementById('nav-links').children[1]
      })
    }

//display loading spinner
    const spinnerContainer = document.getElementById('spinner-container');
    spinnerContainer.getElementsByTagName('span')[1].className = '';
    spinnerContainer.className = '';
    this._services.setSettingsHeight();
  }


/* *
 * Settings click handler
 * */
  settingsHandler(event) {

    const settingsButton = event.target;

//sliding animation for settings section
    const settings = document.getElementById('settings-page');
    const backButton = document.getElementsByClassName('nav-back')[0];

    if (settings.style.transform == '' || settings.style.transform.indexOf('-100') === -1) {
//show settings
      settings.style.transform = 'translateX(-100%)';
      backButton.className = backButton.className.replace(/ hide/g, '');
      settingsButton.src = 'icons/icons8-settings-active-50.png';

    }else {
      settings.style.transform = 'translateX(100%)';
      backButton.className += ' hide';
      settingsButton.src = 'icons/icons8-settings-50.png';

    }
  }


/* *
 * Back click handler
 * */
  backButtonHandler(event) {

    const settings = document.getElementById('settings-page');
    const settingsButton = document.getElementsByClassName('saved-listings')[0].nextElementSibling;
    if (settings.style.transform.indexOf('-100') > -1) {
      settings.style.transform = 'translateX(100%)';
      const backButton = document.getElementsByClassName('nav-back')[0];
      backButton.className += ' hide';
      settingsButton.src = 'icons/icons8-settings-50.png';
    }
  }


/* *
 * Toggle job sites handler
 * */
  async jobSitesCheckboxHandler(event) {

    const target = event.target;
    const siteName = target.name;
    const userPrefs = await this._model.getPrefs();
    const omitted_sites = userPrefs.omitted_sites;
    if (target.checked) {
      const filtered = omitted_sites.filter(omitted_site => {
        return omitted_site != siteName;
      })
      userPrefs.omitted_sites = filtered;
      this._model.savePreferences(userPrefs);

    }else {
      omitted_sites.push(siteName);
      userPrefs.omitted_sites = omitted_sites;
      this._model.savePreferences(userPrefs);

    }
  }


/* *
 * Frequency select handler
 * */
  async frequencyChangeHandler(event) {

    const frequencyValue = event.target.value;
    const userPrefs = await this._model.getPrefs();
    if (userPrefs.frequency !== frequencyValue) {

      userPrefs.frequency = frequencyValue;
      this._model.savePreferences(userPrefs);

//update alarm with new frequency
      this._model.setAlarm();
    }
  }


/* *
 * User clicks on SHOW MORE
 * */
  async showMoreHandler(event) {

//data-index contains the current listing index
    const listingIndex = parseInt(event.target.getAttribute('data-index'));

    const listings = await this._model.jobListings();
//check if on bookmark page
    if (document.getElementsByClassName('saved-listings')[0].children[0].src.indexOf('active') > -1) {
//book image src of active image...need saved listings only
      const filteredListings = listings.filter(listing => listing.saved);
      this._services.populateListings(filteredListings, listingIndex, true);
    }else {
      this._services.populateListings(listings, listingIndex, true);
    }
  }


/* *
 * Aggregate results checkbox handler
 * */
  async aggregateResultCBHandler(event) {

    const userPrefs = await this._model.getPrefs();
    const checkboxVal = event.target;
    const checkboxLabel = document.getElementById('aggregate-label');
    if (checkboxVal.checked) {
      checkboxLabel.innerText = 'Yes';
    }else {
      checkboxLabel.innerText = 'No';
    }
    userPrefs.aggregate_results = checkboxVal.checked;
    this._model.savePreferences(userPrefs);
  }


/* *
 * Listings limiting SELECT change handler
 * */
  async listingsLimitHandler(event) {

    const userPrefs = await this._model.getPrefs();
    const listingLimitValue = event.target.value;
//possible value "default"
    const listingLimit = isNaN(parseInt(listingLimitValue)) ? 0 : listingLimitValue;

    userPrefs.listing_limit = listingLimit;
    this._model.savePreferences(userPrefs);
  }

}
