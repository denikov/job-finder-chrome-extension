import { Config } from '../config.js';
import { Model } from '../scripts/model.js';

(function() {

  const config = new Config();
  const model = new Model();


//pageNum is used for pagination...show more button holds a reference to the last listing index
  function populateListings(listings, pageNum, append) {

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
    registerBookmarkListeners();
  }


//add/remove bookmarks
  function editSavedListings(reference, remove) {

    model.jobListings.forEach((listing, index) => {
      if (listing.link === reference) {
        if (remove) {
          listing.saved = false;
        }else {
          listing.saved = true;
        }
      }
    })
    model.saveListings();
  }


  function registerBookmarkListeners() {

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

  
//filter to show only saved listings
  function filterSavedListings(event) {

//get current listings
    model.getListings(listings => {

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
        populateListings(response.listings, 0);

      }else {
        bookImg.src = 'icons/icons8-book-active-50.png';
        const filtered = listings.filter(listing => listing.saved);

//reset pagination index on the show more button
        if (filtered.length > config.listingsPageLimit) {
          const showMoreButton = document.getElementById('show-more');
          showMoreButton.setAttribute('data-index', '0');
        }

        populateListings(filtered, 0);
      }
    });
  }


//search jobs button clicked handler
  function searchHandler(event) {
    event.preventDefault();

//check if user deselected all sites, show error
    if (model.userPrefs.omitted_sites.length === config.supportedSitesAmount) {

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
    if (model.userPrefs.keywords != keywords || model.userPrefs.location != location) {
      model.userPrefs.keywords = keywords;
      model.userPrefs.location = location;
      model.savePreferences();
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
      settingsHandler({
        target: document.getElementById('nav-links').children[1]
      })
    }

//display loading spinner
    const spinnerContainer = document.getElementById('spinner-container');
    spinnerContainer.getElementsByTagName('span')[1].className = '';
    spinnerContainer.className = '';
    setSettingsHeight();
  }


//settings click handler
  function settingsHandler(event) {

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
  function backButtonHandler(event) {

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
  function jobSitesCheckboxHandler(event) {

    const target = event.target;
    const siteName = target.name;
    let sitesCopy = [...model.userPrefs.omitted_sites];
    if (target.checked) {
      const filtered = sitesCopy.filter(omitted_site => {
        return omitted_site != siteName;
      })
      model.updateSinglePreference('omitted_sites', filtered);

    }else {
      sitesCopy.push(siteName);
      model.updateSinglePreference('omitted_sites', sitesCopy);

    }
  }


//frequency select handler
  function frequencyChangeHandler(event) {

    const frequencyValue = event.target.value;
    if (model.userPrefs.frequency != frequencyValue) {

      model.userPrefs.frequency = frequencyValue;
      model.updateSinglePreference('frequency', frequencyValue);

//update alarm with new frequency
      model.setAlarm();
    }
  }


//aggregate results checkbox handler
  function aggregateResultCBHandler(event) {

    const checkboxVal = event.target;
    const checkboxLabel = document.getElementById('aggregate-label');
    if (checkboxVal.checked) {
      checkboxLabel.innerText = 'Yes';
    }else {
      checkboxLabel.innerText = 'No';
    }
    model.updateSinglePreference('aggregate_results', checkboxVal.checked);
  }


//listings limiting SELECT change handler
  function listingsLimitHandler(event) {

    const listingLimitValue = event.target.value;
//possible value "default"
    const listingLimit = isNaN(parseInt(listingLimitValue)) ? 0 : listingLimitValue;

    model.updateSinglePreference('listing_limit', listingLimit);
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

      setSettingsHeight();

      setLastUpdated(request.listings[0]);
      populateListings(request.listings, 0);
    }
  })


//setting the updated information for user
  function setLastUpdated(listing) {

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
  function setSettingsHeight() {
    const headerHeight = document.getElementsByTagName('header')[0].offsetHeight;
    const settingsPage = document.getElementById('settings-page');
    settingsPage.style.height = (600 - headerHeight - 34).toString() + 'px';
  }


  function init() {
    console.log('init');

//set up nav bar listeners
    //document.getElementById('search-button').addEventListener('click', searchHandler);
    document.getElementsByTagName('form')[0].addEventListener('submit', searchHandler);

    document.getElementsByClassName('nav-back')[0].getElementsByTagName('img')[0].addEventListener('click', backButtonHandler);

//bookmarked button
    document.getElementsByClassName('saved-listings')[0].addEventListener('click', filterSavedListings);
//settings button
    document.getElementById('nav-links').getElementsByTagName('img')[1].addEventListener('click', settingsHandler);

    const settingsPage = document.getElementById('settings-page');

//get the list of sites from settings page
    const sites = settingsPage.getElementsByClassName('job-sites');
//register "change" listeners for the job site checkboxes
    for (let i = 0; i < sites.length; i++) {
      sites[i].addEventListener('change', jobSitesCheckboxHandler);
    }


//register show more button
    document.getElementById('show-more').addEventListener('click', (event) => {

//data-index contains the current listing index
      const listingIndex = parseInt(event.target.getAttribute('data-index'));
      
      model.getListings(listings => {
//check if on bookmark page
        if (document.getElementsByClassName('saved-listings')[0].children[0].src.indexOf('active') > -1) {
//book image src of active image...need saved listings only
          const filteredListings = listings.filter(listing => listing.saved);
          populateListings(filteredListings, listingIndex, true);
        }else {
          populateListings(listings, listingIndex, true);
        }
      })

    });


//register "change" listener for frequency select
    document.getElementById('frequency-interval').addEventListener('change', frequencyChangeHandler);

//register change listener for aggregate results checkbox
    document.getElementById('aggregate-checkbox').addEventListener('change', aggregateResultCBHandler);

//register change listener for limiting listings per supported website
    const listingLimitSelect = document.getElementById('listings-limit');
    listingLimitSelect.addEventListener('change', listingsLimitHandler);

//check user preferences and adjust fields
    const searchButton = document.getElementById('search-button');
    searchButton.disabled = false;
    if (model.jobListings.length > 0) {
      searchButton.innerText = 'Update';
    }

    if (model.userPrefs.keywords && model.userPrefs.location) {

      const keywords = document.getElementById('user-keywords'),
      location = document.getElementById('user-location');

      keywords.value = model.userPrefs.keywords;
      location.value = model.userPrefs.location;
    }

    if (model.userPrefs.omitted_sites.length > 0) {
      model.userPrefs.omitted_sites.map((site, index) => {
//site eg: site0, site1, site2. extract the number and get the corresponding index from sites
        const siteIndex = parseInt(site.match(/\d+/g)[0]);
        sites[siteIndex].checked = false;
      })
    }

//set frequency option if user set it before
    const frequencyOptions = document.getElementById('frequency-interval').children;
    for (let i = 0; i < frequencyOptions.length; i++) {
      if (frequencyOptions[i].value !== model.userPrefs.frequency) {
        frequencyOptions[i].selected = false;
      }else {
        frequencyOptions[i].selected = true;
      }
    }

//set aggregate results checkbox
    if (!model.userPrefs.aggregate_results) {
      document.getElementById('aggregate-label').innerText = 'No';
      document.getElementById('aggregate-checkbox').checked = false;
    }

//set listing limit preference
    const listingLimitOptions = listingLimitSelect.getElementsByTagName('option');
    for (let i = 0; i < listingLimitOptions.length; i++) {
      if (model.userPrefs.listing_limit != listingLimitOptions[i].value) {
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
    
      if (model.jobListings.length > 0) {
//display the show-more button if more listings than limit
        if (model.jobListings.length > config.listingsPageLimit) {
          document.getElementById('show-more').className = '';
        }

//update bookmarks count badge
        const savedListingCounter = model.jobListings.filter(listing => listing.saved);
        if (savedListingCounter.length > 0) {
          const savedCountElement = document.getElementsByClassName('saved-count')[0];
          if (savedListingCounter.length > 9) {
            savedCountElement.innerText = '9+';
          }else {
            savedCountElement.innerText = savedListingCounter.length.toString();
          }
        }

        setLastUpdated(model.getFirstListing());
        populateListings(model.jobListings, 0);

      }else {
        const message = document.getElementById('message');
        message.innerText = 'No saved listings. Run your first search!';
        message.className = '';

        setLastUpdated();
      }

      setSettingsHeight();
    })
  }

//timeout needed for asyncronous functions to complete in the Model class
  setTimeout(() => {
    init()
  }, 2000);

//clear browserAction badge
  chrome.browserAction.setBadgeText({
    text: ''
  });

})()
