if (window.scriptinserted === undefined) {
//checks if script already inserted
  window.scriptinserted = true;

  (function(window, document) {
    let port,
    tabId,
    userPrefs;

    function getUserPrefs() {
//ask background to send user prefs
      port.postMessage({
        type: 'userPrefs',
        tabId: tabId
      });
    }

    function processIndeed() {

      if (location.pathname.indexOf('jobs') === -1) {
//still on home page
        
//remove saved localStorage listings
        localStorage.removeItem('listings');

        if (!userPrefs) {
          getUserPrefs()
          return;
        }
        
//find input fields
        const keywords = document.getElementById('what'),
        location = document.getElementById('where'),
        searchButton = document.getElementsByClassName('input_submit')[0];
        keywords.value = userPrefs.keywords;
        location.value = userPrefs.location;
        searchButton.click();

      }else {
//results page
        console.log('result page');

        //check if sorted by date
        if (location.search.indexOf('sort=date') === -1) {
          const sortLink = document.getElementsByClassName('serp-filters-sort-by-container')[0].getElementsByTagName('a')[0];
//link is on the "date"...otherwise it would be on "relevance"
          if (sortLink.innerText.match(/date/g)) {
            sortLink.click();
          }
          return;
        }

        const resultSection = document.getElementById('resultsCol');

//give time for results to populate
        if (!resultSection) {
          setTimeout(init, 3000);
          return;
        }

        if (!userPrefs) {
          getUserPrefs();
          return;
        }

        const listings = resultSection.getElementsByClassName('result clickcard');
        let dataToSend = [];

//check if localStorage has saved listings
        const savedListings = localStorage.getItem('listings');
        if (savedListings) {
          dataToSend = JSON.parse(savedListings);
        }

        for (let i = 0; i < listings.length; i++) {
          const listing = listings[i];
          const titleContainer = listing.getElementsByClassName('title')[0];
          const title = titleContainer.innerText.trim();
          const link = titleContainer.getElementsByTagName('a')[0].href;
          const company = listing.getElementsByClassName('company')[0].innerText.trim();
          const summary = listing.getElementsByClassName('summary')[0].innerText.trim();
          const date = listing.getElementsByClassName('date')[0].innerText.trim();

          dataToSend.push({
            title: title,
            company: company,
            link: link,
            summary: summary,
            date: date,
            last_updated: new Date().getTime()
          });

//check if listing_limit reached
          if (dataToSend.length === parseInt(userPrefs.listing_limit)) {
            break;
          }
        }

//check if there are more results available than user preferences listing_limit
        if (dataToSend.length < parseInt(userPrefs.listing_limit) && document.getElementsByClassName('pagination').length > 0) {
//save dataToSend locally (localStorage) and click on NEXT button
          localStorage.setItem('listings', JSON.stringify(dataToSend));

          const extraLinks = document.getElementsByClassName('pagination')[0].getElementsByTagName('a');
//last link is NEXT
          extraLinks[extraLinks.length - 1].click();

        }else {
          setTimeout(() => {
            port.postMessage({
              type: 'close',
              tabId: tabId,
              data: dataToSend
            });
          }, 5000);
        }

      }
    }


    function processLinkedIn() {

      if (location.search.length === 0) {
//home page

        if (!userPrefs) {
          getUserPrefs()
          return;
        }
        
//find input fields
        const mainForm = document.getElementById('JOBS');

//if user logged in to LinkedIn, page structure is different
        if (mainForm) {
          const keywords = mainForm.getElementsByClassName('dismissable-input__input')[0],
          location = mainForm.getElementsByClassName('dismissable-input__input')[1];
          searchButton = mainForm.getElementsByTagName('button')[2];
          keywords.value = userPrefs.keywords;
          location.value = userPrefs.location;
          searchButton.click();

        }else {
//logged in users get a Single Page App which requires trusted inputs...close page for now
          port.postMessage({
            type: 'close',
            tabId: tabId,
            data: null
          });
          return;

          const searchBox = document.getElementsByClassName('jobs-search-box')[0];
          const inputs = searchBox.getElementsByClassName('jobs-search-box__text-input');
          inputs[0].focus = true;
          inputs[0].value = userPrefs.keywords;
          inputs[2].focus = true;
          inputs[2].value = userPrefs.location;
          setTimeout(() => {
            //searchBox.getElementsByClassName('jobs-search-box__submit-button')[0].click();
          }, 2000);

//navigation bar populated with querystring...allow the page to populate and run func again
          //setTimeout(processLinkedIn, 5000);
        }

      }else {
        //results page
        
        const resultSection = document.getElementsByClassName('jobs-search__results-list')[0];

//give time for results to populate
        if (!resultSection) {
          setTimeout(init, 3000);
          return;
        }

        if (!userPrefs) {
          getUserPrefs();
          return;
        }

        const listings = resultSection.getElementsByTagName('li');

//check if there are more results available than user preferences listing_limit
        if (listings.length < parseInt(userPrefs.listing_limit) && document.getElementsByClassName('see-more-jobs').length > 0) {
//"SEE MORE JOBS" button
          document.getElementsByClassName('see-more-jobs')[0].click();
          setTimeout(processLinkedIn, 4000);
          return;
        }

        let dataToSend = [];

        for (let i = 0; i < listings.length; i++) {
          const listing = listings[i];
          const titleContainer = listing.getElementsByClassName('job-result-card__title')[0];
          const title = titleContainer.innerText.trim();
          const link = listing.getElementsByTagName('a')[0].href;
          const company = listing.getElementsByClassName('job-result-card__subtitle')[0].innerText.trim();
          const summary = listing.getElementsByClassName('job-result-card__snippet')[0].innerText.trim();

          //classname for new listings differs
          const date = (() => {
            if (listing.getElementsByClassName('job-result-card__listdate').length > 0) {
              return listing.getElementsByClassName('job-result-card__listdate')[0];
            }else {
              return listing.getElementsByClassName('job-result-card__listdate--new')[0];
            }
          })()

          dataToSend.push({
            title: title,
            company: company,
            link: link,
            summary: summary,
            date: date.innerText,
            last_updated: new Date().getTime()
          });

//check if listing_limit preference reached
          if (dataToSend.length === parseInt(userPrefs.listing_limit)) {
            break;
          }
        }

        setTimeout(() => {
          port.postMessage({
            type: 'close',
            tabId: tabId,
            data: dataToSend
          });
        }, 5000);
      }
    }

    function processCareerBuilder() {
      if (location.search.length === 0) {
//still on home page
        
        if (!userPrefs) {
          getUserPrefs()
          return;
        }
        
//find input fields
        const keywords = document.getElementById('Keywords'),
        location = document.getElementById('Location'),
        searchButton = document.getElementById('sbmt');
        keywords.value = userPrefs.keywords;
        location.value = userPrefs.location;
        searchButton.click();

      }else {
//results page
        console.log('result page');

//check if sorted by date
        const sortContainer = document.getElementById('sortby');
        const sortLinks = sortContainer.getElementsByTagName('a');
        if (sortLinks[1].className.indexOf('selected') === -1) {
          sortLinks[1].click();
          return;
        }

        const resultSection = document.getElementById('jobs_collection');

//give time for results to populate
        if (!resultSection) {
          setTimeout(init, 3000);
          return;
        }

        if (!userPrefs) {
          getUserPrefs();
          return;
        }

        const listings = resultSection.getElementsByClassName('job-listing-item');

//check if there are more results available than user preferences listing_limit
        const loadMoreContainer = document.getElementById('load_more_jobs');
        if (listings.length < parseInt(userPrefs.listing_limit) && loadMoreContainer && loadMoreContainer.children[0].style.display != 'none') {
//"SEE MORE JOBS" button
          document.getElementById('load_more_jobs').getElementsByTagName('a')[0].click();
          setTimeout(processCareerBuilder, 4000);
          return;
        }

        let dataToSend = [];

        for (let i = 0; i < listings.length; i++) {
          const listing = listings[i];
          const title = listing.getElementsByClassName('data-results-title')[0].innerText.trim();
          const link = listing.href;
          const company = listing.getElementsByClassName('data-details')[0].children[0].innerText.trim();
          const summary = listing.getElementsByClassName('data-snapshot')[0].textContent.trim();
          const date = listing.getElementsByClassName('data-results-publish-time')[0].innerText.trim();

          dataToSend.push({
            title: title,
            company: company,
            link: link,
            summary: summary,
            date: date,
            last_updated: new Date().getTime()
          });

//check if listing_limit reached
          if (dataToSend.length === parseInt(userPrefs.listing_limit)) {
            break;
          }
        }

        setTimeout(() => {
          port.postMessage({
            type: 'close',
            tabId: tabId,
            data: dataToSend
          });
        }, 5000);

      }
    }


    function init() {
      console.log('init');

      if (location.href.indexOf('indeed.com') > -1) {
        processIndeed();
      }else if (location.href.indexOf('linkedin.com') > -1) {
        processLinkedIn();
      }else if (location.href.indexOf('careerbuilder.com') > -1) {
        processCareerBuilder();
      }

    }


//listen to messages from background
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.type === 'userPrefs') {
        userPrefs = request.prefs;

        if (!userPrefs.hasOwnProperty('listing_limit')) {
          userPrefs['listing_limit'] = '50';
        }

//delay execution to simulate user
        setTimeout(() => {
          init();
        }, 2000);

      }
    });

    chrome.runtime.onConnect.addListener(Port => {
      const startedLoading = new Date().getTime();
      port = Port;

      //after initial connection, background sends
      port.onMessage.addListener(msg => {
        tabId = msg.tabId;
      });

//interval to make sure page fully loaded
      const interval = setInterval(() => {
        if (document.readyState === 'complete') {

          clearInterval(interval);
          init();

        }else if (new Date().getTime() - window._started > 30000) {
//if page is stuck on loading for longer than 30 seconds, remove it and start another tab it from the background script

          clearInterval(interval);
          port.postMessage({
            type: 'kill',
            tabId: tabId,
//send url so background script does not need to look it up
            url: location.href
          });

        }
      }, 1000);
    });
  })(window, document);

  console.log('injected');
//last "injected" string gets returned to background
  'injected';
}
