export class Handlers {

  constructor(config, store, model) {
    this._config = config;
    this._store = store;
    this._model = model;
  }


//search jobs button clicked handler
  searchHandler(event) {
    event.preventDefault();

    const userPrefs = this._store.userPrefs;

//check if user deselected all sites, show error
    if (userPrefs.omitted_sites.length === this._config.supportedSitesAmount) {

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
      this._store.userPrefs.keywords = keywords;
      this._store.userPrefs.location = location;
      this._model.savePreferences();
    }

//call background script to open up the necessary pages, send omitted sites
//send updated prefs to store globaly in background...background passes prefs to content scripts
//content scripts cannot access chrome storage
    chrome.runtime.sendMessage({
      task: 'searchJobs',
      prefs: [keywords, location]
    })

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
    this.setSettingsHeight();
  }


//settings click handler
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


//back click handler
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


//toggle job sites handler
  jobSitesCheckboxHandler(event) {

    const target = event.target;
    const siteName = target.name;
    const userPrefs = this._store.userPrefs.omitted_sites;
    if (target.checked) {
      const filtered = userPrefs.filter(omitted_site => {
        return omitted_site != siteName;
      })
      this._store.userPrefs.omitted_sites = filtered;
      this._model.savePreferences();

    }else {
      userPrefs.push(siteName);
      this._store.userPrefs.omitted_sites = userPrefs;
      this._model.savePreferences();

    }
  }


//frequency select handler
  frequencyChangeHandler(event) {

    const frequencyValue = event.target.value;
    const userPrefs = this._store.userPrefs;
    if (userPrefs.frequency != frequencyValue) {

      this._store.userPrefs.frequency = frequencyValue;
      this._model.savePreferences();

//update alarm with new frequency
      this._model.setAlarm();
    }
  }


//aggregate results checkbox handler
  aggregateResultCBHandler(event) {

    const checkboxVal = event.target;
    const checkboxLabel = document.getElementById('aggregate-label');
    if (checkboxVal.checked) {
      checkboxLabel.innerText = 'Yes';
    }else {
      checkboxLabel.innerText = 'No';
    }
    this._store.userPrefs.aggregate_results = checkboxVal.checked;
    this._model.savePreferences();
  }


//listings limiting SELECT change handler
  listingsLimitHandler(event) {

    const listingLimitValue = event.target.value;
//possible value "default"
    const listingLimit = isNaN(parseInt(listingLimitValue)) ? 0 : listingLimitValue;

    this._store.userPrefs.listing_limit = listingLimit;
    this._model.savePreferences();
  }


}
