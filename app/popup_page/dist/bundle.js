(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Defaults = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

/* *
 * Global default settings are defined here
 * */
var Defaults =
/*#__PURE__*/
function () {
  function Defaults() {
    (0, _classCallCheck2["default"])(this, Defaults);
  }

  (0, _createClass2["default"])(Defaults, [{
    key: "jobUrls",

    /* *
     * Websites currently supported
     * */
    value: function jobUrls() {
      return ['https://www.indeed.com/worldwide', 'https://www.linkedin.com/jobs', 'https://www.careerbuilder.com/'];
    }
    /* *
     * Amount of "jobUrls" - used for comparing to the amount of tabs opened while searching
     * */

  }, {
    key: "supportedSitesAmount",
    value: function supportedSitesAmount() {
      return 3;
    }
    /* *
     * How often to perform searches in the background (in HOURS)
     * */

  }, {
    key: "defaultFrequency",
    value: function defaultFrequency() {
      return '6';
    }
    /* *
     * Limiting the amount of job listings returned from each website
     * */

  }, {
    key: "listingLimit",
    value: function listingLimit() {
      return 50;
    }
    /* *
     * Amount of job listings pagination
     * */

  }, {
    key: "listingsPageLimit",
    value: function listingsPageLimit() {
      return 15;
    }
    /* *
     * Initialize user preferences
     * {string} keywords - job search parameters
     * {string} location - job search parameters
     * {string} frequency - how often in minutes to perform search
     * {Object []} omitted_sites - removes sites which user unchecked
     * {number} listing_limit - defaults to 50 listings per website
     * */

  }, {
    key: "userPrefs",
    value: function userPrefs() {
      return {
        keywords: null,
        location: null,
        aggregate_results: false,
        frequency: null,
        omitted_sites: [],
        listing_limit: null
      };
    }
  }]);
  return Defaults;
}();

exports.Defaults = Defaults;

},{"@babel/runtime/helpers/classCallCheck":6,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/interopRequireDefault":8}],2:[function(require,module,exports){
'use strict';
/* *
 *  CHECKING FOR window.chrome IS REQUIRED FOR TESTING PURPOSES
 *  BROWSER ENVIRONMENTS DO NOT HAVE Chrome API
 * */

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Model = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Model =
/*#__PURE__*/
function () {
  function Model(defaults) {
    (0, _classCallCheck2["default"])(this, Model);
    this._defaults = defaults;
  }
  /* *
   * EVERYTHING TO DO WITH PREFERENCES
   * */


  (0, _createClass2["default"])(Model, [{
    key: "getPrefs",
    value: function getPrefs() {
      var _this = this;

      return new Promise(function (resolve) {
        if (!window.chrome) {
          resolve(_this._defaults.userPrefs());
        }

        chrome.storage.local.get('preferences', function (prefs) {
          prefs = prefs.preferences || _this._defaults.userPrefs();
          resolve(prefs);
        });
      });
    }
    /* *
     * @param {Object} prefs - user preferences
     * */

  }, {
    key: "savePreferences",
    value: function savePreferences(prefs) {
      if (window.chrome) {
        chrome.storage.local.set({
          preferences: prefs
        });
      }
    }
    /* *
     * EVERYTHING TO DO WITH JOB LISTINGS
    * */

    /* *
     * @returns {Object []} - array of job listings
     * */

  }, {
    key: "jobListings",
    value: function jobListings() {
      return new Promise(function (resolve) {
        if (!window.chrome) {
          resolve([]);
        }

        chrome.storage.local.get('job_listings', function (listings) {
          resolve(listings.job_listings || []);
        });
      });
    }
    /* *
     * @param {Object []} listings - array of job listings
     * */

  }, {
    key: "saveListings",
    value: function saveListings(listings) {
      if (window.chrome) {
        chrome.storage.local.set({
          job_listings: listings
        });
      }
    }
    /* *
     * When the user performs a search with new parameters AND user preferences indicate not to aggregate results, previous listings are deleted
     * */

  }, {
    key: "removeListings",
    value: function removeListings() {
      if (window.chrome) {
        chrome.storage.local.remove('job_listings');
      }
    }
    /* *
     * Set alarm interval
     * */

  }, {
    key: "setAlarm",
    value: function setAlarm() {
      var userPrefs, frequency;
      return _regenerator["default"].async(function setAlarm$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator["default"].awrap(this.getPrefs());

            case 2:
              userPrefs = _context.sent;

              if (!(!userPrefs.keywords || !userPrefs.location)) {
                _context.next = 5;
                break;
              }

              return _context.abrupt("return");

            case 5:
              frequency = userPrefs.frequency || this._defaults.defaultFrequency();

              if (window.chrome) {
                chrome.alarms.create('search_interval', {
                  periodInMinutes: parseInt(frequency) * 60
                });
              }

            case 7:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
    /* *
     * @returns {number} - amount of new listings found
     * */

  }, {
    key: "newListingsCount",
    value: function newListingsCount() {
      return new Promise(function (resolve) {
        if (!window.chrome) {
          resolve(0);
        }

        chrome.storage.local.get('new_listings_count', function (count) {
          resolve(count.new_listings_count || 0);
        });
      });
    }
    /* *
     * @param {number} value - amount of new listings found
     * */

  }, {
    key: "saveNewListingsCount",
    value: function saveNewListingsCount(value) {
      if (window.chrome) {
        chrome.storage.local.set({
          new_listings_count: value || 0
        });
      }
    }
    /* *
     * Get saved badge action text
     * @returns {string}
     * */

  }, {
    key: "initialBAtext",
    value: function initialBAtext() {
      return new Promise(function (resolve) {
        if (!window.chrome) {
          resolve('');
        }

        chrome.storage.local.get('initial_BA_test', function (text) {
          resolve(text.initial_BA_test || '');
        });
      });
    }
    /* *
     * @param {string} value - text that was set on the Badge Action button before a job search was started
     * */

  }, {
    key: "saveInitialBAtext",
    value: function saveInitialBAtext(value) {
      if (window.chrome) {
        chrome.storage.local.set({
          initial_BA_test: value
        });
      }
    }
    /* *
     * @returns {Object []} - array of messages from open tabs
     * */

  }, {
    key: "openTabsQueue",
    value: function openTabsQueue() {
      return new Promise(function (resolve) {
        if (!window.chrome) {
          resolve([]);
        }

        chrome.storage.local.get('open_tabs_queue', function (tabs) {
          resolve(tabs.open_tabs_queue || []);
        });
      });
    }
    /* *
     * @returns {Object []} - first message from open tabs
     * */

  }, {
    key: "openTabsQueueFirst",
    value: function openTabsQueueFirst() {
      var _this2 = this;

      return new Promise(function (resolve) {
        if (!window.chrome) {
          resolve();
        }

        chrome.storage.local.get('open_tabs_queue', function (tabs) {
          if (tabs && tabs.open_tabs_queue) {
            var firstQueue = tabs.open_tabs_queue.shift(); //queue modified...save

            _this2.saveOpenTabsQueue(tabs.open_tabs_queue);

            resolve(firstQueue);
          } else {
            resolve([]);
          }
        });
      });
    }
    /* *
     * Adds and returns messages from tabs
     * @returns {Object []} - array of messages from open tabs
     * */

  }, {
    key: "addToTabsQueue",
    value: function addToTabsQueue(msg) {
      var _this3 = this;

      var openTabsQueue;
      return _regenerator["default"].async(function addToTabsQueue$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _regenerator["default"].awrap(this.openTabsQueue());

            case 2:
              openTabsQueue = _context2.sent;
              return _context2.abrupt("return", new Promise(function (resolve) {
                if (!window.chrome) {
                  resolve();
                }

                openTabsQueue.push(msg);

                _this3.saveOpenTabsQueue(openTabsQueue);

                resolve(openTabsQueue);
              }));

            case 4:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
    /* *
     * Saves messages from the tabs
     * @param {Object []} queue - array of messages
     * */

  }, {
    key: "saveOpenTabsQueue",
    value: function saveOpenTabsQueue(queue) {
      if (window.chrome) {
        chrome.storage.local.set({
          open_tabs_queue: queue
        });
      }
    }
    /* *
     * @returns {number|null} - saved window ID of the window where the job search is being performed
     * */

  }, {
    key: "workingWindowId",
    value: function workingWindowId() {
      return new Promise(function (resolve) {
        if (!window.chrome) {
          resolve(null);
        }

        chrome.storage.local.get('working_window_id', function (winId) {
          resolve(winId.working_window_id || null);
        });
      });
    }
    /* *
     * @param {number} winId
     * */

  }, {
    key: "saveWorkingWindowId",
    value: function saveWorkingWindowId(winId) {
      if (window.chrome) {
        chrome.storage.local.set({
          working_window_id: winId
        });
      }
    }
    /* *
     * A tab was has finished searching and closed
     * @returns {number} minusCounter - amount of open tabs performing job search
     * */

  }, {
    key: "minusTabCounter",
    value: function minusTabCounter() {
      var _this4 = this;

      return new Promise(function (resolve) {
        if (!window.chrome) {
          resolve(0);
        }

        chrome.storage.local.get('tab_counter', function (count) {
          var minusCounter = --count.tab_counter; //counter modified...save

          _this4.saveOpenTabCounter(minusCounter);

          resolve(minusCounter);
        });
      });
    }
    /* *
     * @return {number} - amount of currently opened tabs performing job search
     * */

  }, {
    key: "openTabCounter",
    value: function openTabCounter() {
      return new Promise(function (resolve) {
        if (!window.chrome) {
          resolve(0);
        }

        chrome.storage.local.get('open_tab_counter', function (count) {
          resolve(count.open_tab_counter || 0);
        });
      });
    }
    /* *
     * @param {number} count - amount of currently opened tabs performing job search
     * */

  }, {
    key: "saveOpenTabCounter",
    value: function saveOpenTabCounter(count) {
      if (window.chrome) {
        chrome.storage.local.set({
          tab_counter: count
        });
      }
    }
  }]);
  return Model;
}();

exports.Model = Model;

},{"@babel/runtime/helpers/classCallCheck":6,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/interopRequireDefault":8,"@babel/runtime/regenerator":9}],3:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defaults = require("../defaults.js");

var _model = require("../model.js");

var _popupHandlers = require("./popupHandlers.js");

var _popupServices = _interopRequireDefault(require("./popupServices.js"));

var App =
/*#__PURE__*/
function () {
  function App(defaults, model, handlers, services) {
    (0, _classCallCheck2["default"])(this, App);
    this._defaults = defaults;
    this._model = model;
    this._handlers = handlers;
    this._services = services;
  }

  (0, _createClass2["default"])(App, [{
    key: "setSettingsHeight",
    value: function setSettingsHeight() {
      this._services.setSettingsHeight();
    }
  }, {
    key: "setLastUpdated",
    value: function setLastUpdated(listing) {
      this._services.setLastUpdated(listing);
    }
  }, {
    key: "populateListings",
    value: function populateListings(listings, start) {
      this._services.populateListings(listings, start);
    }
  }, {
    key: "init",
    value: function init() {
      var _this = this;

      var userPrefs, jobListings, settingsPage, sites, i, listingLimitSelect, searchButton, keywords, location, frequencyOptions, _i, listingLimitOptions, _i2, openTabCounter, spinnerContainer, savedListingCounter, savedCountElement, message;

      return _regenerator["default"].async(function init$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator["default"].awrap(this._model.getPrefs());

            case 2:
              userPrefs = _context.sent;
              _context.next = 5;
              return _regenerator["default"].awrap(this._model.jobListings());

            case 5:
              jobListings = _context.sent;
              //set up nav bar listeners
              document.getElementsByTagName('form')[0].addEventListener('submit', function (evt) {
                return _this._handlers.searchHandler(evt);
              });
              document.getElementsByClassName('nav-back')[0].getElementsByTagName('img')[0].addEventListener('click', function (evt) {
                return _this._handlers.backButtonHandler(evt);
              }); //bookmarked button

              document.getElementsByClassName('saved-listings')[0].addEventListener('click', function (evt) {
                return _this._services.filterSavedListings(evt);
              }); //settings button

              document.getElementById('nav-links').getElementsByTagName('img')[1].addEventListener('click', function (evt) {
                return _this._handlers.settingsHandler(evt);
              });
              settingsPage = document.getElementById('settings-page'); //get the list of sites from settings page

              sites = settingsPage.getElementsByClassName('job-sites'); //register "change" listeners for the job site checkboxes

              for (i = 0; i < sites.length; i++) {
                sites[i].addEventListener('change', function (evt) {
                  return _this._handlers.jobSitesCheckboxHandler(evt);
                });
              } //register show more button


              document.getElementById('show-more').addEventListener('click', function (evt) {
                return _this._handlers.showMoreHandler(evt);
              }); //register "change" listener for frequency select

              document.getElementById('frequency-interval').addEventListener('change', function (evt) {
                return _this._handlers.frequencyChangeHandler(evt);
              }); //register change listener for aggregate results checkbox

              document.getElementById('aggregate-checkbox').addEventListener('change', function (evt) {
                return _this._handlers.aggregateResultCBHandler(evt);
              }); //register change listener for limiting listings per supported website

              listingLimitSelect = document.getElementById('listings-limit');
              listingLimitSelect.addEventListener('change', function (evt) {
                return _this._handlers.listingsLimitHandler(evt);
              }); //check user preferences and adjust fields

              searchButton = document.getElementById('search-button');
              searchButton.disabled = false;

              if (jobListings.length > 0) {
                searchButton.innerText = 'Update';
              }

              if (userPrefs.keywords && userPrefs.location) {
                keywords = document.getElementById('user-keywords'), location = document.getElementById('user-location');
                keywords.value = userPrefs.keywords;
                location.value = userPrefs.location;
              }

              if (userPrefs.omitted_sites.length > 0) {
                userPrefs.omitted_sites.map(function (site, index) {
                  //site eg: site0, site1, site2. extract the number and get the corresponding index from sites
                  var siteIndex = parseInt(site.match(/\d+/g)[0]);
                  sites[siteIndex].checked = false;
                });
              } //set frequency option if user set it before


              frequencyOptions = document.getElementById('frequency-interval').children;

              for (_i = 0; _i < frequencyOptions.length; _i++) {
                if (frequencyOptions[_i].value !== userPrefs.frequency) {
                  frequencyOptions[_i].selected = false;
                } else {
                  frequencyOptions[_i].selected = true;
                }
              } //set aggregate results checkbox


              if (!userPrefs.aggregate_results) {
                document.getElementById('aggregate-label').innerText = 'No';
                document.getElementById('aggregate-checkbox').checked = false;
              } //set listing limit preference


              listingLimitOptions = listingLimitSelect.getElementsByTagName('option');

              for (_i2 = 0; _i2 < listingLimitOptions.length; _i2++) {
                if (userPrefs.listing_limit != listingLimitOptions[_i2].value) {
                  listingLimitOptions[_i2].selected = false;
                } else {
                  listingLimitOptions[_i2].selected = true;
                }
              } //check if any listings saved and prepopulate popup


              _context.next = 30;
              return _regenerator["default"].awrap(this._model.openTabCounter());

            case 30:
              openTabCounter = _context.sent;

              if (openTabCounter === 0) {
                //jobs are not searching, remove spinner
                spinnerContainer = document.getElementById('spinner-container');
                spinnerContainer.className = 'd-none';
              }

              if (jobListings.length > 0) {
                //display the show-more button if more listings than limit
                if (jobListings.length > this._defaults.listingsPageLimit) {
                  document.getElementById('show-more').className = '';
                } //update bookmarks count badge


                savedListingCounter = jobListings.filter(function (listing) {
                  return listing.saved;
                });

                if (savedListingCounter.length > 0) {
                  savedCountElement = document.getElementsByClassName('saved-count')[0];

                  if (savedListingCounter.length > 9) {
                    savedCountElement.innerText = '9+';
                  } else {
                    savedCountElement.innerText = savedListingCounter.length.toString();
                  }
                }

                this._services.setLastUpdated(jobListings[0]);

                this._services.populateListings(jobListings, 0);
              } else {
                message = document.getElementById('message');
                message.innerText = 'No saved listings. Run your first search!';
                message.className = '';

                this._services.setLastUpdated();
              }

              this._services.setSettingsHeight();

            case 34:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }]);
  return App;
}();
/* *
 * Listen to messages from background
 * */


if (window.chrome) {
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.listings) {
      sendResponse(true); //hide spinner

      document.getElementById('spinner-container').className = 'd-none';
      var message = document.getElementById('message');
      message.className = 'd-none';
      message.innerText = ''; //enable search button

      var searchButton = document.getElementById('search-button');
      searchButton.innerText = 'Update';
      searchButton.disabled = false;

      _App.setSettingsHeight();

      _App.setLastUpdated(request.listings[0]);

      _App.populateListings(request.listings, 0);
    }
  });
}

window.addEventListener('DOMContentLoaded', function () {
  var defaults = new _defaults.Defaults();
  var model = new _model.Model(defaults);
  var services = new _popupServices["default"](defaults, model);
  var handlers = new _popupHandlers.Handlers(defaults, model, services);
  window._App = new App(defaults, model, handlers, services); //timeout needed for asyncronous functions to complete in the Model class

  setTimeout(function () {
    _App.init();
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

},{"../defaults.js":1,"../model.js":2,"./popupHandlers.js":4,"./popupServices.js":5,"@babel/runtime/helpers/classCallCheck":6,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/interopRequireDefault":8,"@babel/runtime/regenerator":9}],4:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Handlers = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Handlers =
/*#__PURE__*/
function () {
  function Handlers(defaults, model, services) {
    (0, _classCallCheck2["default"])(this, Handlers);
    this._defaults = defaults;
    this._model = model;
    this._services = services;
  }
  /* *
   * Search jobs button clicked handler
   * */


  (0, _createClass2["default"])(Handlers, [{
    key: "searchHandler",
    value: function searchHandler(event) {
      var userPrefs, message, initialMessage, keywords, location, errorRow, searchButton, settings, spinnerContainer;
      return _regenerator["default"].async(function searchHandler$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              event.preventDefault();
              _context.next = 3;
              return _regenerator["default"].awrap(this._model.getPrefs());

            case 3:
              userPrefs = _context.sent;

              if (!(userPrefs.omitted_sites.length === this._defaults.supportedSitesAmount())) {
                _context.next = 12;
                break;
              }

              message = document.getElementById('message');
              initialMessage = message.innerText;
              message.innerText = 'You unchecked all supported websites. Please select at least one website from the settings and perform a search again.';
              message.style.color = 'red';
              message.className = 'error';
              setTimeout(function () {
                message.style.color = 'initial';

                if (initialMessage.length > 0) {
                  message.className = '';
                  message.innerText = initialMessage;
                } else {
                  message.className = 'd-none';
                  message.innerText = '';
                }
              }, 4000);
              return _context.abrupt("return");

            case 12:
              keywords = document.getElementById('user-keywords').value, location = document.getElementById('user-location').value;

              if (!(keywords === '' || location === '')) {
                _context.next = 19;
                break;
              }

              errorRow = document.getElementById('error-row');
              errorRow.children[0].innerText = 'Please fill in both fields before performing a search!';
              errorRow.className = '';
              setTimeout(function () {
                errorRow.children[0].innerText = '';
                errorRow.className = 'd-none';
              }, 3000);
              return _context.abrupt("return");

            case 19:
              //disable search button
              searchButton = document.getElementById('search-button');
              searchButton.disabled = true; //save search values if different

              if (userPrefs.keywords != keywords || userPrefs.location != location) {
                userPrefs.keywords = keywords;
                userPrefs.location = location;

                this._model.savePreferences(userPrefs);
              } //call background script to open up the necessary pages


              if (window.chrome) {
                chrome.runtime.sendMessage({
                  task: 'searchJobs',
                  prefs: [keywords, location]
                });
              } //close settings page if open


              settings = document.getElementById('settings-page');

              if (settings.style.transform.indexOf('-100') > -1) {
                this.settingsHandler({
                  target: document.getElementById('nav-links').children[1]
                });
              } //display loading spinner


              spinnerContainer = document.getElementById('spinner-container');
              spinnerContainer.getElementsByTagName('span')[1].className = '';
              spinnerContainer.className = '';

              this._services.setSettingsHeight();

            case 29:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
    /* *
     * Settings click handler
     * */

  }, {
    key: "settingsHandler",
    value: function settingsHandler(event) {
      var settingsButton = event.target; //sliding animation for settings section

      var settings = document.getElementById('settings-page');
      var backButton = document.getElementsByClassName('nav-back')[0];

      if (settings.style.transform == '' || settings.style.transform.indexOf('-100') === -1) {
        //show settings
        settings.style.transform = 'translateX(-100%)';
        backButton.className = backButton.className.replace(/ hide/g, '');
        settingsButton.src = 'icons/icons8-settings-active-50.png';
      } else {
        settings.style.transform = 'translateX(100%)';
        backButton.className += ' hide';
        settingsButton.src = 'icons/icons8-settings-50.png';
      }
    }
    /* *
     * Back click handler
     * */

  }, {
    key: "backButtonHandler",
    value: function backButtonHandler(event) {
      var settings = document.getElementById('settings-page');
      var settingsButton = document.getElementsByClassName('saved-listings')[0].nextElementSibling;

      if (settings.style.transform.indexOf('-100') > -1) {
        settings.style.transform = 'translateX(100%)';
        var backButton = document.getElementsByClassName('nav-back')[0];
        backButton.className += ' hide';
        settingsButton.src = 'icons/icons8-settings-50.png';
      }
    }
    /* *
     * Toggle job sites handler
     * */

  }, {
    key: "jobSitesCheckboxHandler",
    value: function jobSitesCheckboxHandler(event) {
      var target, siteName, userPrefs, omitted_sites, filtered;
      return _regenerator["default"].async(function jobSitesCheckboxHandler$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              target = event.target;
              siteName = target.name;
              _context2.next = 4;
              return _regenerator["default"].awrap(this._model.getPrefs());

            case 4:
              userPrefs = _context2.sent;
              omitted_sites = userPrefs.omitted_sites;

              if (target.checked) {
                filtered = omitted_sites.filter(function (omitted_site) {
                  return omitted_site != siteName;
                });
                userPrefs.omitted_sites = filtered;

                this._model.savePreferences(userPrefs);
              } else {
                omitted_sites.push(siteName);
                userPrefs.omitted_sites = omitted_sites;

                this._model.savePreferences(userPrefs);
              }

            case 7:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
    /* *
     * Frequency select handler
     * */

  }, {
    key: "frequencyChangeHandler",
    value: function frequencyChangeHandler(event) {
      var frequencyValue, userPrefs;
      return _regenerator["default"].async(function frequencyChangeHandler$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              frequencyValue = event.target.value;
              _context3.next = 3;
              return _regenerator["default"].awrap(this._model.getPrefs());

            case 3:
              userPrefs = _context3.sent;

              if (userPrefs.frequency !== frequencyValue) {
                userPrefs.frequency = frequencyValue;

                this._model.savePreferences(userPrefs); //update alarm with new frequency


                this._model.setAlarm();
              }

            case 5:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
    /* *
     * User clicks on SHOW MORE
     * */

  }, {
    key: "showMoreHandler",
    value: function showMoreHandler(event) {
      var listingIndex, listings, filteredListings;
      return _regenerator["default"].async(function showMoreHandler$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              //data-index contains the current listing index
              listingIndex = parseInt(event.target.getAttribute('data-index'));
              _context4.next = 3;
              return _regenerator["default"].awrap(this._model.jobListings());

            case 3:
              listings = _context4.sent;

              //check if on bookmark page
              if (document.getElementsByClassName('saved-listings')[0].children[0].src.indexOf('active') > -1) {
                //book image src of active image...need saved listings only
                filteredListings = listings.filter(function (listing) {
                  return listing.saved;
                });

                this._services.populateListings(filteredListings, listingIndex, true);
              } else {
                this._services.populateListings(listings, listingIndex, true);
              }

            case 5:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
    /* *
     * Aggregate results checkbox handler
     * */

  }, {
    key: "aggregateResultCBHandler",
    value: function aggregateResultCBHandler(event) {
      var userPrefs, checkboxVal, checkboxLabel;
      return _regenerator["default"].async(function aggregateResultCBHandler$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _regenerator["default"].awrap(this._model.getPrefs());

            case 2:
              userPrefs = _context5.sent;
              checkboxVal = event.target;
              checkboxLabel = document.getElementById('aggregate-label');

              if (checkboxVal.checked) {
                checkboxLabel.innerText = 'Yes';
              } else {
                checkboxLabel.innerText = 'No';
              }

              userPrefs.aggregate_results = checkboxVal.checked;

              this._model.savePreferences(userPrefs);

            case 8:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
    /* *
     * Listings limiting SELECT change handler
     * */

  }, {
    key: "listingsLimitHandler",
    value: function listingsLimitHandler(event) {
      var userPrefs, listingLimitValue, listingLimit;
      return _regenerator["default"].async(function listingsLimitHandler$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _regenerator["default"].awrap(this._model.getPrefs());

            case 2:
              userPrefs = _context6.sent;
              listingLimitValue = event.target.value; //possible value "default"

              listingLimit = isNaN(parseInt(listingLimitValue)) ? 0 : listingLimitValue;
              userPrefs.listing_limit = listingLimit;

              this._model.savePreferences(userPrefs);

            case 7:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this);
    }
  }]);
  return Handlers;
}();

exports.Handlers = Handlers;

},{"@babel/runtime/helpers/classCallCheck":6,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/interopRequireDefault":8,"@babel/runtime/regenerator":9}],5:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Services =
/*#__PURE__*/
function () {
  function Services(defaults, model) {
    (0, _classCallCheck2["default"])(this, Services);
    this._defaults = defaults;
    this._model = model;
  }
  /* *
   * Add/remove bookmarks
   * @param {string} reference - link to the job listing
   * @param {Boolean} remove - whether to remove the bookmark
   * */


  (0, _createClass2["default"])(Services, [{
    key: "editSavedListings",
    value: function editSavedListings(reference, remove) {
      var jobListings;
      return _regenerator["default"].async(function editSavedListings$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator["default"].awrap(this._model.jobListings());

            case 2:
              jobListings = _context.sent;
              jobListings.forEach(function (listing, index) {
                if (listing.link === reference) {
                  if (remove) {
                    listing.saved = false;
                  } else {
                    listing.saved = true;
                  }
                }
              });

              this._model.saveListings(jobListings);

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
    /* *
     * When user toggles bookmark, use the IMG source to determine whether to show saved bookmarks or not
     * @param event - DIV wrapper for the book IMG and SPAN for counter of saved listings
     * */

  }, {
    key: "getCurrentListings",
    value: function getCurrentListings(event) {
      var listings, bookImg, showMoreButton, filtered, _showMoreButton;

      return _regenerator["default"].async(function getCurrentListings$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _regenerator["default"].awrap(this._model.jobListings());

            case 2:
              listings = _context2.sent;
              //click could be on the img or the span...checking the target and finding the first child IMG
              bookImg = event.target.className === 'saved-listings' ? event.target.children[0] : event.target.parentElement.children[0];

              if (!(bookImg.src.indexOf('active') > -1)) {
                _context2.next = 10;
                break;
              }

              //currently filtered images are shown
              bookImg.src = 'icons/icons8-book-50.png'; //reset pagination index on the show more button

              if (listings.length > this._defaults.listingsPageLimit) {
                showMoreButton = document.getElementById('show-more');
                showMoreButton.setAttribute('data-index', '0');
              }

              return _context2.abrupt("return", [listings, 0]);

            case 10:
              bookImg.src = 'icons/icons8-book-active-50.png';
              filtered = listings.filter(function (listing) {
                return listing.saved;
              }); //reset pagination index on the show more button

              if (filtered.length > this._defaults.listingsPageLimit) {
                _showMoreButton = document.getElementById('show-more');

                _showMoreButton.setAttribute('data-index', '0');
              }

              return _context2.abrupt("return", [filtered, 0]);

            case 14:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
    /* *
     * Showing the user when the last time a job search was run
     * @param {Object []} listing - first listing of all jobs will contain last updated information
     * */

  }, {
    key: "setLastUpdated",
    value: function setLastUpdated(listing) {
      var lastUpdatedColumn = document.getElementById('last-updated');

      if (listing) {
        if (!listing.hasOwnProperty('last_updated')) {
          lastUpdatedColumn.innerHTML = 'Last Updated:<br>' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
        } else {
          lastUpdatedColumn.innerHTML = 'Last Updated:<br>' + new Date(listing.last_updated).toLocaleDateString() + ' ' + new Date(listing.last_updated).toLocaleTimeString();
        }
      } else {
        lastUpdatedColumn.innerText = 'Last Updated: --';
      }
    }
    /* *
     * Dynamically settings the settings page height when the popup page loads
     * */

  }, {
    key: "setSettingsHeight",
    value: function setSettingsHeight() {
      var headerHeight = document.getElementsByTagName('header')[0].offsetHeight;
      var settingsPage = document.getElementById('settings-page');
      settingsPage.style.height = (600 - headerHeight - 34).toString() + 'px';
    }
    /* *
     * This function is called when popup page loads or when SHOW MORE is clicked
     * */

  }, {
    key: "registerBookmarkListeners",
    value: function registerBookmarkListeners() {
      var _this = this;

      var bookmarks = document.getElementsByClassName('listing-bookmark');

      for (var i = 0; i < bookmarks.length; i++) {
        //check if element already has a click listener
        if (bookmarks[i].getAttribute('data-listener')) {
          continue;
        }

        bookmarks[i].setAttribute('data-listener', true);
        bookmarks[i].addEventListener('click', function (event) {
          var bookmark = event.target;
          var savedCountElement = document.getElementsByClassName('saved-count')[0];
          var savedCount = parseInt(savedCountElement.innerText); //use image source to determine if listing is currently saved or not

          if (bookmark.src.indexOf('saved') > -1) {
            //removing saved listing
            bookmark.src = 'icons/icons8-bookmark-50.png';
            --savedCount;

            _this.editSavedListings(bookmark.getAttribute('data-ref'), true);
          } else {
            bookmark.src = 'icons/icons8-bookmark-saved-50.png';
            savedCount++;

            _this.editSavedListings(bookmark.getAttribute('data-ref'), false);
          } //set bookmark counter


          savedCountElement.innerText = savedCount; //checking if the user is on the filtered list and decided to remove the last saved listing

          if (savedCount === 0) {
            var bookImg = document.getElementsByClassName('saved-listings')[0].children[0];

            if (bookImg.src.indexOf('active') > -1) {
              //use this function to take care of everything
              _this.filterSavedListings({
                target: bookImg
              });
            }
          }
        });
      }
    }
    /* *
     * @param {Object []} listings
     * @param {number} pageNum - used for pagination...SHOW MORE button holds a reference to the last listing index
     * @param {Boolean} append - if TRUE, append to the UL; else FALSE, set innerHTML of UL
     * */

  }, {
    key: "populateListings",
    value: function populateListings(listings, pageNum, append) {
      var _this2 = this;

      var listingsUL = document.getElementById('listings');
      var savedListingCounter = 0; //create temporary div to hold the list elements
      //append to listingUL when all listings created...avoids reflow/redraw

      var tempDiv = document.createElement('div'); //temp link to set the href and get the host

      var listingSource = document.createElement('a');

      var _loop = function _loop(i) {
        //check if limit reached for page
        if (i >= pageNum + _this2._defaults.listingsPageLimit()) {
          var showMoreButton = document.getElementById('show-more');
          showMoreButton.setAttribute('data-index', pageNum + _this2._defaults.listingsPageLimit());

          if (i >= listings.length) {
            showMoreButton.className = 'd-none';
          } else {
            showMoreButton.className = '';
          }

          return "break";
        } //reached last listing


        if (i === listings.length - 1) {
          var _showMoreButton2 = document.getElementById('show-more'); //next starting index is last index plus one


          _showMoreButton2.setAttribute('data-index', i + 1);

          _showMoreButton2.className = 'd-none';
        }

        var listing = listings[i];
        var li = document.createElement('li'); //set correct src for bookmark if the listing is saved

        var bookmarkSrc = function () {
          if (listing.saved) {
            savedListingCounter++;
            return 'icons/icons8-bookmark-saved-50.png';
          } else {
            return 'icons/icons8-bookmark-50.png';
          }
        }();

        listingSource.href = listing.link;
        li.className = 'job-listing';
        li.innerHTML = '<div class="job-title-wrapper"> \
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
      };

      for (var i = pageNum; i < listings.length; i++) {
        var _ret = _loop(i);

        if (_ret === "break") break;
      }

      if (append) {
        listingsUL.innerHTML += tempDiv.innerHTML;
      } else {
        listingsUL.innerHTML = tempDiv.innerHTML;
      }

      this.registerBookmarkListeners();
    }
    /* *
     * Filter to show only saved/all listings
     * @param event - Click event when user toggles book IMG
     * */

  }, {
    key: "filterSavedListings",
    value: function filterSavedListings(event) {
      var _this3 = this;

      this.getCurrentListings(event).then(function (result) {
        _this3.populateListings(result[0], result[1]);
      });
    }
  }]);
  return Services;
}();

exports["default"] = Services;

},{"@babel/runtime/helpers/classCallCheck":6,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/interopRequireDefault":8,"@babel/runtime/regenerator":9}],6:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],7:[function(require,module,exports){
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
},{}],8:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],9:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":10}],10:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvZGVmYXVsdHMuanMiLCJhcHAvbW9kZWwuanMiLCJhcHAvcG9wdXBfcGFnZS9wb3B1cC5qcyIsImFwcC9wb3B1cF9wYWdlL3BvcHVwSGFuZGxlcnMuanMiLCJhcHAvcG9wdXBfcGFnZS9wb3B1cFNlcnZpY2VzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2suanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jcmVhdGVDbGFzcy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7O0FDQUE7OztJQUlhLFE7Ozs7Ozs7Ozs7QUFHYjs7OzhCQUdZO0FBQ1IsYUFBTyxDQUNMLGtDQURLLEVBRUwsK0JBRkssRUFHTCxnQ0FISyxDQUFQO0FBS0Q7QUFHSDs7Ozs7OzJDQUd5QjtBQUNyQixhQUFPLENBQVA7QUFDRDtBQUdIOzs7Ozs7dUNBR3FCO0FBQ2pCLGFBQU8sR0FBUDtBQUNEO0FBR0g7Ozs7OzttQ0FHaUI7QUFDYixhQUFPLEVBQVA7QUFDRDtBQUdIOzs7Ozs7d0NBR3NCO0FBQ2xCLGFBQU8sRUFBUDtBQUNEO0FBR0g7Ozs7Ozs7Ozs7O2dDQVFjO0FBQ1YsYUFBTztBQUNMLFFBQUEsUUFBUSxFQUFFLElBREw7QUFFTCxRQUFBLFFBQVEsRUFBRSxJQUZMO0FBR0wsUUFBQSxpQkFBaUIsRUFBRSxLQUhkO0FBSUwsUUFBQSxTQUFTLEVBQUUsSUFKTjtBQUtMLFFBQUEsYUFBYSxFQUFFLEVBTFY7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qICpcbiAqIEdsb2JhbCBkZWZhdWx0IHNldHRpbmdzIGFyZSBkZWZpbmVkIGhlcmVcbiAqICovXG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0cyB7XG4gIFxuXG4vKiAqXG4gKiBXZWJzaXRlcyBjdXJyZW50bHkgc3VwcG9ydGVkXG4gKiAqL1xuICBqb2JVcmxzKCkge1xuICAgIHJldHVybiBbXG4gICAgICAnaHR0cHM6Ly93d3cuaW5kZWVkLmNvbS93b3JsZHdpZGUnLFxuICAgICAgJ2h0dHBzOi8vd3d3LmxpbmtlZGluLmNvbS9qb2JzJyxcbiAgICAgICdodHRwczovL3d3dy5jYXJlZXJidWlsZGVyLmNvbS8nXG4gICAgXTtcbiAgfVxuXG5cbi8qICpcbiAqIEFtb3VudCBvZiBcImpvYlVybHNcIiAtIHVzZWQgZm9yIGNvbXBhcmluZyB0byB0aGUgYW1vdW50IG9mIHRhYnMgb3BlbmVkIHdoaWxlIHNlYXJjaGluZ1xuICogKi9cbiAgc3VwcG9ydGVkU2l0ZXNBbW91bnQoKSB7XG4gICAgcmV0dXJuIDM7XG4gIH1cblxuXG4vKiAqXG4gKiBIb3cgb2Z0ZW4gdG8gcGVyZm9ybSBzZWFyY2hlcyBpbiB0aGUgYmFja2dyb3VuZCAoaW4gSE9VUlMpXG4gKiAqL1xuICBkZWZhdWx0RnJlcXVlbmN5KCkge1xuICAgIHJldHVybiAnNic7XG4gIH1cblxuXG4vKiAqXG4gKiBMaW1pdGluZyB0aGUgYW1vdW50IG9mIGpvYiBsaXN0aW5ncyByZXR1cm5lZCBmcm9tIGVhY2ggd2Vic2l0ZVxuICogKi9cbiAgbGlzdGluZ0xpbWl0KCkge1xuICAgIHJldHVybiA1MDtcbiAgfVxuXG5cbi8qICpcbiAqIEFtb3VudCBvZiBqb2IgbGlzdGluZ3MgcGFnaW5hdGlvblxuICogKi9cbiAgbGlzdGluZ3NQYWdlTGltaXQoKSB7XG4gICAgcmV0dXJuIDE1O1xuICB9XG5cblxuLyogKlxuICogSW5pdGlhbGl6ZSB1c2VyIHByZWZlcmVuY2VzXG4gKiB7c3RyaW5nfSBrZXl3b3JkcyAtIGpvYiBzZWFyY2ggcGFyYW1ldGVyc1xuICoge3N0cmluZ30gbG9jYXRpb24gLSBqb2Igc2VhcmNoIHBhcmFtZXRlcnNcbiAqIHtzdHJpbmd9IGZyZXF1ZW5jeSAtIGhvdyBvZnRlbiBpbiBtaW51dGVzIHRvIHBlcmZvcm0gc2VhcmNoXG4gKiB7T2JqZWN0IFtdfSBvbWl0dGVkX3NpdGVzIC0gcmVtb3ZlcyBzaXRlcyB3aGljaCB1c2VyIHVuY2hlY2tlZFxuICoge251bWJlcn0gbGlzdGluZ19saW1pdCAtIGRlZmF1bHRzIHRvIDUwIGxpc3RpbmdzIHBlciB3ZWJzaXRlXG4gKiAqL1xuICB1c2VyUHJlZnMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGtleXdvcmRzOiBudWxsLFxuICAgICAgbG9jYXRpb246IG51bGwsXG4gICAgICBhZ2dyZWdhdGVfcmVzdWx0czogZmFsc2UsXG4gICAgICBmcmVxdWVuY3k6IG51bGwsXG4gICAgICBvbWl0dGVkX3NpdGVzOiBbXSxcbiAgICAgIGxpc3RpbmdfbGltaXQ6IG51bGxcbiAgICB9O1xuICB9XG5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG4vKiAqXG4gKiAgQ0hFQ0tJTkcgRk9SIHdpbmRvdy5jaHJvbWUgSVMgUkVRVUlSRUQgRk9SIFRFU1RJTkcgUFVSUE9TRVNcbiAqICBCUk9XU0VSIEVOVklST05NRU5UUyBETyBOT1QgSEFWRSBDaHJvbWUgQVBJXG4gKiAqL1xuXG5leHBvcnQgY2xhc3MgTW9kZWwge1xuXG4gIGNvbnN0cnVjdG9yKGRlZmF1bHRzKSB7XG4gICAgdGhpcy5fZGVmYXVsdHMgPSBkZWZhdWx0cztcbiAgfVxuXG5cbi8qICpcbiAqIEVWRVJZVEhJTkcgVE8gRE8gV0lUSCBQUkVGRVJFTkNFU1xuICogKi9cbiAgZ2V0UHJlZnMoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgaWYgKCF3aW5kb3cuY2hyb21lKSB7XG4gICAgICAgIHJlc29sdmUodGhpcy5fZGVmYXVsdHMudXNlclByZWZzKCkpO1xuICAgICAgfVxuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KCdwcmVmZXJlbmNlcycsIHByZWZzID0+IHtcbiAgICAgICAgcHJlZnMgPSBwcmVmcy5wcmVmZXJlbmNlcyB8fCB0aGlzLl9kZWZhdWx0cy51c2VyUHJlZnMoKTtcbiAgICAgICAgcmVzb2x2ZShwcmVmcyk7XG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuXG4vKiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcHJlZnMgLSB1c2VyIHByZWZlcmVuY2VzXG4gKiAqL1xuICBzYXZlUHJlZmVyZW5jZXMocHJlZnMpIHtcbiAgICBpZiAod2luZG93LmNocm9tZSkge1xuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgICAgcHJlZmVyZW5jZXM6IHByZWZzXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG5cbi8qICpcbiAqIEVWRVJZVEhJTkcgVE8gRE8gV0lUSCBKT0IgTElTVElOR1NcbiogKi9cblxuLyogKlxuICogQHJldHVybnMge09iamVjdCBbXX0gLSBhcnJheSBvZiBqb2IgbGlzdGluZ3NcbiAqICovXG4gIGpvYkxpc3RpbmdzKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGlmICghd2luZG93LmNocm9tZSkge1xuICAgICAgICByZXNvbHZlKFtdKTtcbiAgICAgIH1cbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldCgnam9iX2xpc3RpbmdzJywgbGlzdGluZ3MgPT4ge1xuICAgICAgICByZXNvbHZlKGxpc3RpbmdzLmpvYl9saXN0aW5ncyB8fCBbXSk7XG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuXG4vKiAqXG4gKiBAcGFyYW0ge09iamVjdCBbXX0gbGlzdGluZ3MgLSBhcnJheSBvZiBqb2IgbGlzdGluZ3NcbiAqICovXG4gIHNhdmVMaXN0aW5ncyhsaXN0aW5ncykge1xuICAgIGlmICh3aW5kb3cuY2hyb21lKSB7XG4gICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe1xuICAgICAgICBqb2JfbGlzdGluZ3M6IGxpc3RpbmdzXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG5cbi8qICpcbiAqIFdoZW4gdGhlIHVzZXIgcGVyZm9ybXMgYSBzZWFyY2ggd2l0aCBuZXcgcGFyYW1ldGVycyBBTkQgdXNlciBwcmVmZXJlbmNlcyBpbmRpY2F0ZSBub3QgdG8gYWdncmVnYXRlIHJlc3VsdHMsIHByZXZpb3VzIGxpc3RpbmdzIGFyZSBkZWxldGVkXG4gKiAqL1xuICByZW1vdmVMaXN0aW5ncygpIHtcbiAgICBpZiAod2luZG93LmNocm9tZSkge1xuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwucmVtb3ZlKCdqb2JfbGlzdGluZ3MnKTtcbiAgICB9XG4gIH1cblxuXG4vKiAqXG4gKiBTZXQgYWxhcm0gaW50ZXJ2YWxcbiAqICovXG4gIGFzeW5jIHNldEFsYXJtKCkge1xuICAgIGNvbnN0IHVzZXJQcmVmcyA9IGF3YWl0IHRoaXMuZ2V0UHJlZnMoKTtcblxuLy9kbyBub3Qgc2V0IGFuIGFsYXJtIGlmIHVzZXIgaGFzIG5vdCBwZXJmb3JtZWQgYSBzZWFyY2hcbiAgICBpZiAoIXVzZXJQcmVmcy5rZXl3b3JkcyB8fCAhdXNlclByZWZzLmxvY2F0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZnJlcXVlbmN5ID0gdXNlclByZWZzLmZyZXF1ZW5jeSB8fCB0aGlzLl9kZWZhdWx0cy5kZWZhdWx0RnJlcXVlbmN5KCk7XG4gICAgaWYgKHdpbmRvdy5jaHJvbWUpIHtcbiAgICAgIGNocm9tZS5hbGFybXMuY3JlYXRlKCdzZWFyY2hfaW50ZXJ2YWwnLCB7XG4gICAgICAgIHBlcmlvZEluTWludXRlczogcGFyc2VJbnQoZnJlcXVlbmN5KSAqIDYwXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuXG4vKiAqXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIGFtb3VudCBvZiBuZXcgbGlzdGluZ3MgZm91bmRcbiAqICovXG4gIG5ld0xpc3RpbmdzQ291bnQoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgaWYgKCF3aW5kb3cuY2hyb21lKSB7XG4gICAgICAgIHJlc29sdmUoMCk7XG4gICAgICB9XG4gICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoJ25ld19saXN0aW5nc19jb3VudCcsIGNvdW50ID0+IHtcbiAgICAgICAgcmVzb2x2ZShjb3VudC5uZXdfbGlzdGluZ3NfY291bnQgfHwgMCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG5cbi8qICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIGFtb3VudCBvZiBuZXcgbGlzdGluZ3MgZm91bmRcbiAqICovXG4gIHNhdmVOZXdMaXN0aW5nc0NvdW50KHZhbHVlKSB7XG4gICAgaWYgKHdpbmRvdy5jaHJvbWUpIHtcbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICAgIG5ld19saXN0aW5nc19jb3VudDogdmFsdWUgfHwgMFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cblxuLyogKlxuICogR2V0IHNhdmVkIGJhZGdlIGFjdGlvbiB0ZXh0XG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICogKi9cbiAgaW5pdGlhbEJBdGV4dCgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBpZiAoIXdpbmRvdy5jaHJvbWUpIHtcbiAgICAgICAgcmVzb2x2ZSgnJyk7XG4gICAgICB9XG4gICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoJ2luaXRpYWxfQkFfdGVzdCcsIHRleHQgPT4ge1xuICAgICAgICByZXNvbHZlKHRleHQuaW5pdGlhbF9CQV90ZXN0IHx8ICcnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cblxuLyogKlxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gdGV4dCB0aGF0IHdhcyBzZXQgb24gdGhlIEJhZGdlIEFjdGlvbiBidXR0b24gYmVmb3JlIGEgam9iIHNlYXJjaCB3YXMgc3RhcnRlZFxuICogKi9cbiAgc2F2ZUluaXRpYWxCQXRleHQodmFsdWUpIHtcbiAgICBpZiAod2luZG93LmNocm9tZSkge1xuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgICAgaW5pdGlhbF9CQV90ZXN0OiB2YWx1ZVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cblxuLyogKlxuICogQHJldHVybnMge09iamVjdCBbXX0gLSBhcnJheSBvZiBtZXNzYWdlcyBmcm9tIG9wZW4gdGFic1xuICogKi9cbiAgb3BlblRhYnNRdWV1ZSgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBpZiAoIXdpbmRvdy5jaHJvbWUpIHtcbiAgICAgICAgcmVzb2x2ZShbXSk7XG4gICAgICB9XG4gICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoJ29wZW5fdGFic19xdWV1ZScsIHRhYnMgPT4ge1xuICAgICAgICByZXNvbHZlKHRhYnMub3Blbl90YWJzX3F1ZXVlIHx8IFtdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cblxuLyogKlxuICogQHJldHVybnMge09iamVjdCBbXX0gLSBmaXJzdCBtZXNzYWdlIGZyb20gb3BlbiB0YWJzXG4gKiAqL1xuICBvcGVuVGFic1F1ZXVlRmlyc3QoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgaWYgKCF3aW5kb3cuY2hyb21lKSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldCgnb3Blbl90YWJzX3F1ZXVlJywgdGFicyA9PiB7XG4gICAgICAgIGlmICh0YWJzICYmIHRhYnMub3Blbl90YWJzX3F1ZXVlKSB7XG4gICAgICAgICAgY29uc3QgZmlyc3RRdWV1ZSA9IHRhYnMub3Blbl90YWJzX3F1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgICAvL3F1ZXVlIG1vZGlmaWVkLi4uc2F2ZVxuICAgICAgICAgIHRoaXMuc2F2ZU9wZW5UYWJzUXVldWUodGFicy5vcGVuX3RhYnNfcXVldWUpO1xuXG4gICAgICAgICAgcmVzb2x2ZShmaXJzdFF1ZXVlKTtcbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoW10pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG5cbi8qICpcbiAqIEFkZHMgYW5kIHJldHVybnMgbWVzc2FnZXMgZnJvbSB0YWJzXG4gKiBAcmV0dXJucyB7T2JqZWN0IFtdfSAtIGFycmF5IG9mIG1lc3NhZ2VzIGZyb20gb3BlbiB0YWJzXG4gKiAqL1xuICBhc3luYyBhZGRUb1RhYnNRdWV1ZShtc2cpIHtcbiAgICBjb25zdCBvcGVuVGFic1F1ZXVlID0gYXdhaXQgdGhpcy5vcGVuVGFic1F1ZXVlKCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgaWYgKCF3aW5kb3cuY2hyb21lKSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICAgIG9wZW5UYWJzUXVldWUucHVzaChtc2cpO1xuICAgICAgdGhpcy5zYXZlT3BlblRhYnNRdWV1ZShvcGVuVGFic1F1ZXVlKTtcbiAgICAgIHJlc29sdmUob3BlblRhYnNRdWV1ZSk7XG4gICAgfSk7XG4gIH1cblxuXG4vKiAqXG4gKiBTYXZlcyBtZXNzYWdlcyBmcm9tIHRoZSB0YWJzXG4gKiBAcGFyYW0ge09iamVjdCBbXX0gcXVldWUgLSBhcnJheSBvZiBtZXNzYWdlc1xuICogKi9cbiAgc2F2ZU9wZW5UYWJzUXVldWUocXVldWUpIHtcbiAgICBpZiAod2luZG93LmNocm9tZSkge1xuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgICAgb3Blbl90YWJzX3F1ZXVlOiBxdWV1ZVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cblxuLyogKlxuICogQHJldHVybnMge251bWJlcnxudWxsfSAtIHNhdmVkIHdpbmRvdyBJRCBvZiB0aGUgd2luZG93IHdoZXJlIHRoZSBqb2Igc2VhcmNoIGlzIGJlaW5nIHBlcmZvcm1lZFxuICogKi9cbiAgd29ya2luZ1dpbmRvd0lkKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGlmICghd2luZG93LmNocm9tZSkge1xuICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgfVxuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KCd3b3JraW5nX3dpbmRvd19pZCcsIHdpbklkID0+IHtcbiAgICAgICAgcmVzb2x2ZSh3aW5JZC53b3JraW5nX3dpbmRvd19pZCB8fCBudWxsKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cblxuLyogKlxuICogQHBhcmFtIHtudW1iZXJ9IHdpbklkXG4gKiAqL1xuICBzYXZlV29ya2luZ1dpbmRvd0lkKHdpbklkKSB7XG4gICAgaWYgKHdpbmRvdy5jaHJvbWUpIHtcbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICAgIHdvcmtpbmdfd2luZG93X2lkOiB3aW5JZFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cblxuLyogKlxuICogQSB0YWIgd2FzIGhhcyBmaW5pc2hlZCBzZWFyY2hpbmcgYW5kIGNsb3NlZFxuICogQHJldHVybnMge251bWJlcn0gbWludXNDb3VudGVyIC0gYW1vdW50IG9mIG9wZW4gdGFicyBwZXJmb3JtaW5nIGpvYiBzZWFyY2hcbiAqICovXG4gIG1pbnVzVGFiQ291bnRlcigpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBpZiAoIXdpbmRvdy5jaHJvbWUpIHtcbiAgICAgICAgcmVzb2x2ZSgwKTtcbiAgICAgIH1cbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldCgndGFiX2NvdW50ZXInLCBjb3VudCA9PiB7XG4gICAgICAgIGNvbnN0IG1pbnVzQ291bnRlciA9IC0tY291bnQudGFiX2NvdW50ZXI7XG5cbiAgICAgICAgLy9jb3VudGVyIG1vZGlmaWVkLi4uc2F2ZVxuICAgICAgICB0aGlzLnNhdmVPcGVuVGFiQ291bnRlcihtaW51c0NvdW50ZXIpO1xuXG4gICAgICAgIHJlc29sdmUobWludXNDb3VudGVyKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cblxuLyogKlxuICogQHJldHVybiB7bnVtYmVyfSAtIGFtb3VudCBvZiBjdXJyZW50bHkgb3BlbmVkIHRhYnMgcGVyZm9ybWluZyBqb2Igc2VhcmNoXG4gKiAqL1xuICBvcGVuVGFiQ291bnRlcigpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBpZiAoIXdpbmRvdy5jaHJvbWUpIHtcbiAgICAgICAgcmVzb2x2ZSgwKTtcbiAgICAgIH1cbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldCgnb3Blbl90YWJfY291bnRlcicsIGNvdW50ID0+IHtcbiAgICAgICAgcmVzb2x2ZShjb3VudC5vcGVuX3RhYl9jb3VudGVyIHx8IDApO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuXG4vKiAqXG4gKiBAcGFyYW0ge251bWJlcn0gY291bnQgLSBhbW91bnQgb2YgY3VycmVudGx5IG9wZW5lZCB0YWJzIHBlcmZvcm1pbmcgam9iIHNlYXJjaFxuICogKi9cbiAgc2F2ZU9wZW5UYWJDb3VudGVyKGNvdW50KSB7XG4gICAgaWYgKHdpbmRvdy5jaHJvbWUpIHtcbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICAgIHRhYl9jb3VudGVyOiBjb3VudFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbn1cbiIsImltcG9ydCB7IERlZmF1bHRzIH0gZnJvbSAnLi4vZGVmYXVsdHMuanMnO1xuaW1wb3J0IHsgTW9kZWwgfSBmcm9tICcuLi9tb2RlbC5qcyc7XG5pbXBvcnQgeyBIYW5kbGVycyB9IGZyb20gJy4vcG9wdXBIYW5kbGVycy5qcyc7XG5pbXBvcnQgU2VydmljZXMgZnJvbSAnLi9wb3B1cFNlcnZpY2VzLmpzJztcblxuXG5jbGFzcyBBcHAge1xuXG4gIGNvbnN0cnVjdG9yKGRlZmF1bHRzLCBtb2RlbCwgaGFuZGxlcnMsIHNlcnZpY2VzKSB7XG5cbiAgICB0aGlzLl9kZWZhdWx0cyA9IGRlZmF1bHRzO1xuICAgIHRoaXMuX21vZGVsID0gbW9kZWw7XG4gICAgdGhpcy5faGFuZGxlcnMgPSBoYW5kbGVycztcbiAgICB0aGlzLl9zZXJ2aWNlcyA9IHNlcnZpY2VzO1xuXG4gIH1cblxuXG4gIHNldFNldHRpbmdzSGVpZ2h0KCkge1xuICAgIHRoaXMuX3NlcnZpY2VzLnNldFNldHRpbmdzSGVpZ2h0KCk7XG4gIH1cblxuXG4gIHNldExhc3RVcGRhdGVkKGxpc3RpbmcpIHtcbiAgICB0aGlzLl9zZXJ2aWNlcy5zZXRMYXN0VXBkYXRlZChsaXN0aW5nKVxuICB9XG5cblxuICBwb3B1bGF0ZUxpc3RpbmdzKGxpc3RpbmdzLCBzdGFydCkge1xuICAgIHRoaXMuX3NlcnZpY2VzLnBvcHVsYXRlTGlzdGluZ3MobGlzdGluZ3MsIHN0YXJ0KTtcbiAgfVxuXG5cbiAgYXN5bmMgaW5pdCgpIHtcblxuICAgIGNvbnN0IHVzZXJQcmVmcyA9IGF3YWl0IHRoaXMuX21vZGVsLmdldFByZWZzKCk7XG4gICAgY29uc3Qgam9iTGlzdGluZ3MgPSBhd2FpdCB0aGlzLl9tb2RlbC5qb2JMaXN0aW5ncygpO1xuXG4vL3NldCB1cCBuYXYgYmFyIGxpc3RlbmVyc1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdmb3JtJylbMF0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZXZ0ID0+IHRoaXMuX2hhbmRsZXJzLnNlYXJjaEhhbmRsZXIoZXZ0KSk7XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCduYXYtYmFjaycpWzBdLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKVswXS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2dCA9PiB0aGlzLl9oYW5kbGVycy5iYWNrQnV0dG9uSGFuZGxlcihldnQpKTtcblxuLy9ib29rbWFya2VkIGJ1dHRvblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NhdmVkLWxpc3RpbmdzJylbMF0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4gdGhpcy5fc2VydmljZXMuZmlsdGVyU2F2ZWRMaXN0aW5ncyhldnQpKTtcblxuLy9zZXR0aW5ncyBidXR0b25cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2LWxpbmtzJykuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpWzFdLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHRoaXMuX2hhbmRsZXJzLnNldHRpbmdzSGFuZGxlcihldnQpKTtcblxuICAgIGNvbnN0IHNldHRpbmdzUGFnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5ncy1wYWdlJyk7XG5cbi8vZ2V0IHRoZSBsaXN0IG9mIHNpdGVzIGZyb20gc2V0dGluZ3MgcGFnZVxuICAgIGNvbnN0IHNpdGVzID0gc2V0dGluZ3NQYWdlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pvYi1zaXRlcycpO1xuLy9yZWdpc3RlciBcImNoYW5nZVwiIGxpc3RlbmVycyBmb3IgdGhlIGpvYiBzaXRlIGNoZWNrYm94ZXNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBzaXRlc1tpXS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBldnQgPT4gdGhpcy5faGFuZGxlcnMuam9iU2l0ZXNDaGVja2JveEhhbmRsZXIoZXZ0KSk7XG4gICAgfVxuXG4vL3JlZ2lzdGVyIHNob3cgbW9yZSBidXR0b25cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvdy1tb3JlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4gdGhpcy5faGFuZGxlcnMuc2hvd01vcmVIYW5kbGVyKGV2dCkpO1xuXG4vL3JlZ2lzdGVyIFwiY2hhbmdlXCIgbGlzdGVuZXIgZm9yIGZyZXF1ZW5jeSBzZWxlY3RcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnJlcXVlbmN5LWludGVydmFsJykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZXZ0ID0+IHRoaXMuX2hhbmRsZXJzLmZyZXF1ZW5jeUNoYW5nZUhhbmRsZXIoZXZ0KSk7XG5cbi8vcmVnaXN0ZXIgY2hhbmdlIGxpc3RlbmVyIGZvciBhZ2dyZWdhdGUgcmVzdWx0cyBjaGVja2JveFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZ2dyZWdhdGUtY2hlY2tib3gnKS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBldnQgPT4gdGhpcy5faGFuZGxlcnMuYWdncmVnYXRlUmVzdWx0Q0JIYW5kbGVyKGV2dCkpO1xuXG4vL3JlZ2lzdGVyIGNoYW5nZSBsaXN0ZW5lciBmb3IgbGltaXRpbmcgbGlzdGluZ3MgcGVyIHN1cHBvcnRlZCB3ZWJzaXRlXG4gICAgY29uc3QgbGlzdGluZ0xpbWl0U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3RpbmdzLWxpbWl0Jyk7XG4gICAgbGlzdGluZ0xpbWl0U2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGV2dCA9PiB0aGlzLl9oYW5kbGVycy5saXN0aW5nc0xpbWl0SGFuZGxlcihldnQpKTtcblxuLy9jaGVjayB1c2VyIHByZWZlcmVuY2VzIGFuZCBhZGp1c3QgZmllbGRzXG4gICAgY29uc3Qgc2VhcmNoQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaC1idXR0b24nKTtcbiAgICBzZWFyY2hCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBpZiAoam9iTGlzdGluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgc2VhcmNoQnV0dG9uLmlubmVyVGV4dCA9ICdVcGRhdGUnO1xuICAgIH1cblxuICAgIGlmICh1c2VyUHJlZnMua2V5d29yZHMgJiYgdXNlclByZWZzLmxvY2F0aW9uKSB7XG5cbiAgICAgIGNvbnN0IGtleXdvcmRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXIta2V5d29yZHMnKSxcbiAgICAgIGxvY2F0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItbG9jYXRpb24nKTtcblxuICAgICAga2V5d29yZHMudmFsdWUgPSB1c2VyUHJlZnMua2V5d29yZHM7XG4gICAgICBsb2NhdGlvbi52YWx1ZSA9IHVzZXJQcmVmcy5sb2NhdGlvbjtcbiAgICB9XG5cbiAgICBpZiAodXNlclByZWZzLm9taXR0ZWRfc2l0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgdXNlclByZWZzLm9taXR0ZWRfc2l0ZXMubWFwKChzaXRlLCBpbmRleCkgPT4ge1xuLy9zaXRlIGVnOiBzaXRlMCwgc2l0ZTEsIHNpdGUyLiBleHRyYWN0IHRoZSBudW1iZXIgYW5kIGdldCB0aGUgY29ycmVzcG9uZGluZyBpbmRleCBmcm9tIHNpdGVzXG4gICAgICAgIGNvbnN0IHNpdGVJbmRleCA9IHBhcnNlSW50KHNpdGUubWF0Y2goL1xcZCsvZylbMF0pO1xuICAgICAgICBzaXRlc1tzaXRlSW5kZXhdLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgfVxuXG4vL3NldCBmcmVxdWVuY3kgb3B0aW9uIGlmIHVzZXIgc2V0IGl0IGJlZm9yZVxuICAgIGNvbnN0IGZyZXF1ZW5jeU9wdGlvbnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnJlcXVlbmN5LWludGVydmFsJykuY2hpbGRyZW47XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcmVxdWVuY3lPcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoZnJlcXVlbmN5T3B0aW9uc1tpXS52YWx1ZSAhPT0gdXNlclByZWZzLmZyZXF1ZW5jeSkge1xuICAgICAgICBmcmVxdWVuY3lPcHRpb25zW2ldLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICB9ZWxzZSB7XG4gICAgICAgIGZyZXF1ZW5jeU9wdGlvbnNbaV0uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuLy9zZXQgYWdncmVnYXRlIHJlc3VsdHMgY2hlY2tib3hcbiAgICBpZiAoIXVzZXJQcmVmcy5hZ2dyZWdhdGVfcmVzdWx0cykge1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FnZ3JlZ2F0ZS1sYWJlbCcpLmlubmVyVGV4dCA9ICdObyc7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWdncmVnYXRlLWNoZWNrYm94JykuY2hlY2tlZCA9IGZhbHNlO1xuICAgIH1cblxuLy9zZXQgbGlzdGluZyBsaW1pdCBwcmVmZXJlbmNlXG4gICAgY29uc3QgbGlzdGluZ0xpbWl0T3B0aW9ucyA9IGxpc3RpbmdMaW1pdFNlbGVjdC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnb3B0aW9uJyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0aW5nTGltaXRPcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodXNlclByZWZzLmxpc3RpbmdfbGltaXQgIT0gbGlzdGluZ0xpbWl0T3B0aW9uc1tpXS52YWx1ZSkge1xuICAgICAgICBsaXN0aW5nTGltaXRPcHRpb25zW2ldLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICB9ZWxzZSB7XG4gICAgICAgIGxpc3RpbmdMaW1pdE9wdGlvbnNbaV0uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuLy9jaGVjayBpZiBhbnkgbGlzdGluZ3Mgc2F2ZWQgYW5kIHByZXBvcHVsYXRlIHBvcHVwXG4gICAgY29uc3Qgb3BlblRhYkNvdW50ZXIgPSBhd2FpdCB0aGlzLl9tb2RlbC5vcGVuVGFiQ291bnRlcigpO1xuXG4gICAgaWYgKG9wZW5UYWJDb3VudGVyID09PSAwKSB7XG4vL2pvYnMgYXJlIG5vdCBzZWFyY2hpbmcsIHJlbW92ZSBzcGlubmVyXG4gICAgICBjb25zdCBzcGlubmVyQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwaW5uZXItY29udGFpbmVyJyk7XG4gICAgICBzcGlubmVyQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdkLW5vbmUnO1xuICAgIH1cbiAgXG4gICAgaWYgKGpvYkxpc3RpbmdzLmxlbmd0aCA+IDApIHtcbi8vZGlzcGxheSB0aGUgc2hvdy1tb3JlIGJ1dHRvbiBpZiBtb3JlIGxpc3RpbmdzIHRoYW4gbGltaXRcbiAgICAgIGlmIChqb2JMaXN0aW5ncy5sZW5ndGggPiB0aGlzLl9kZWZhdWx0cy5saXN0aW5nc1BhZ2VMaW1pdCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvdy1tb3JlJykuY2xhc3NOYW1lID0gJyc7XG4gICAgICB9XG5cbi8vdXBkYXRlIGJvb2ttYXJrcyBjb3VudCBiYWRnZVxuICAgICAgY29uc3Qgc2F2ZWRMaXN0aW5nQ291bnRlciA9IGpvYkxpc3RpbmdzLmZpbHRlcihsaXN0aW5nID0+IGxpc3Rpbmcuc2F2ZWQpO1xuICAgICAgaWYgKHNhdmVkTGlzdGluZ0NvdW50ZXIubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBzYXZlZENvdW50RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NhdmVkLWNvdW50JylbMF07XG4gICAgICAgIGlmIChzYXZlZExpc3RpbmdDb3VudGVyLmxlbmd0aCA+IDkpIHtcbiAgICAgICAgICBzYXZlZENvdW50RWxlbWVudC5pbm5lclRleHQgPSAnOSsnO1xuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgc2F2ZWRDb3VudEVsZW1lbnQuaW5uZXJUZXh0ID0gc2F2ZWRMaXN0aW5nQ291bnRlci5sZW5ndGgudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9zZXJ2aWNlcy5zZXRMYXN0VXBkYXRlZChqb2JMaXN0aW5nc1swXSk7XG4gICAgICB0aGlzLl9zZXJ2aWNlcy5wb3B1bGF0ZUxpc3RpbmdzKGpvYkxpc3RpbmdzLCAwKTtcblxuICAgIH1lbHNlIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWVzc2FnZScpO1xuICAgICAgbWVzc2FnZS5pbm5lclRleHQgPSAnTm8gc2F2ZWQgbGlzdGluZ3MuIFJ1biB5b3VyIGZpcnN0IHNlYXJjaCEnO1xuICAgICAgbWVzc2FnZS5jbGFzc05hbWUgPSAnJztcblxuICAgICAgdGhpcy5fc2VydmljZXMuc2V0TGFzdFVwZGF0ZWQoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zZXJ2aWNlcy5zZXRTZXR0aW5nc0hlaWdodCgpO1xuICB9XG5cbn1cblxuXG4vKiAqXG4gKiBMaXN0ZW4gdG8gbWVzc2FnZXMgZnJvbSBiYWNrZ3JvdW5kXG4gKiAqL1xuaWYgKHdpbmRvdy5jaHJvbWUpIHtcbiAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGlmIChyZXF1ZXN0Lmxpc3RpbmdzKSB7XG4gICAgICBzZW5kUmVzcG9uc2UodHJ1ZSk7XG4gIC8vaGlkZSBzcGlubmVyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3Bpbm5lci1jb250YWluZXInKS5jbGFzc05hbWUgPSAnZC1ub25lJztcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWVzc2FnZScpO1xuICAgICAgbWVzc2FnZS5jbGFzc05hbWUgPSAnZC1ub25lJztcbiAgICAgIG1lc3NhZ2UuaW5uZXJUZXh0ID0gJyc7XG5cbiAgLy9lbmFibGUgc2VhcmNoIGJ1dHRvblxuICAgICAgY29uc3Qgc2VhcmNoQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaC1idXR0b24nKTtcbiAgICAgIHNlYXJjaEJ1dHRvbi5pbm5lclRleHQgPSAnVXBkYXRlJztcbiAgICAgIHNlYXJjaEJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgICBfQXBwLnNldFNldHRpbmdzSGVpZ2h0KCk7XG5cbiAgICAgIF9BcHAuc2V0TGFzdFVwZGF0ZWQocmVxdWVzdC5saXN0aW5nc1swXSk7XG4gICAgICBfQXBwLnBvcHVsYXRlTGlzdGluZ3MocmVxdWVzdC5saXN0aW5ncywgMCk7XG4gICAgfVxuICB9KVxufVxuXG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICBjb25zdCBkZWZhdWx0cyA9IG5ldyBEZWZhdWx0cygpO1xuICBjb25zdCBtb2RlbCA9IG5ldyBNb2RlbChkZWZhdWx0cyk7XG4gIGNvbnN0IHNlcnZpY2VzID0gbmV3IFNlcnZpY2VzKGRlZmF1bHRzLCBtb2RlbCk7XG4gIGNvbnN0IGhhbmRsZXJzID0gbmV3IEhhbmRsZXJzKGRlZmF1bHRzLCBtb2RlbCwgc2VydmljZXMpO1xuICB3aW5kb3cuX0FwcCA9IG5ldyBBcHAoZGVmYXVsdHMsIG1vZGVsLCBoYW5kbGVycywgc2VydmljZXMpO1xuXG4vL3RpbWVvdXQgbmVlZGVkIGZvciBhc3luY3Jvbm91cyBmdW5jdGlvbnMgdG8gY29tcGxldGUgaW4gdGhlIE1vZGVsIGNsYXNzXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIF9BcHAuaW5pdCgpXG4gIH0sIDIwMDApO1xuXG59KTtcblxuXG4vKiAqXG4gKiBDbGVhciBicm93c2VyQWN0aW9uIGJhZGdlIHdoZW4gcG9wdXAgb3BlbmVkXG4gKiAqL1xuaWYgKHdpbmRvdy5jaHJvbWUpIHtcbiAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0QmFkZ2VUZXh0KHtcbiAgICB0ZXh0OiAnJ1xuICB9KTtcbn1cbiIsImV4cG9ydCBjbGFzcyBIYW5kbGVycyB7XG5cbiAgY29uc3RydWN0b3IoZGVmYXVsdHMsIG1vZGVsLCBzZXJ2aWNlcykge1xuICAgIHRoaXMuX2RlZmF1bHRzID0gZGVmYXVsdHM7XG4gICAgdGhpcy5fbW9kZWwgPSBtb2RlbDtcbiAgICB0aGlzLl9zZXJ2aWNlcyA9IHNlcnZpY2VzO1xuICB9XG5cblxuLyogKlxuICogU2VhcmNoIGpvYnMgYnV0dG9uIGNsaWNrZWQgaGFuZGxlclxuICogKi9cbiAgYXN5bmMgc2VhcmNoSGFuZGxlcihldmVudCkge1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnN0IHVzZXJQcmVmcyA9IGF3YWl0IHRoaXMuX21vZGVsLmdldFByZWZzKCk7XG5cbi8vY2hlY2sgaWYgdXNlciBkZXNlbGVjdGVkIGFsbCBzaXRlcywgc2hvdyBlcnJvclxuICAgIGlmICh1c2VyUHJlZnMub21pdHRlZF9zaXRlcy5sZW5ndGggPT09IHRoaXMuX2RlZmF1bHRzLnN1cHBvcnRlZFNpdGVzQW1vdW50KCkpIHtcblxuICAgICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZXNzYWdlJyk7XG4gICAgICBjb25zdCBpbml0aWFsTWVzc2FnZSA9IG1lc3NhZ2UuaW5uZXJUZXh0O1xuICAgICAgbWVzc2FnZS5pbm5lclRleHQgPSAnWW91IHVuY2hlY2tlZCBhbGwgc3VwcG9ydGVkIHdlYnNpdGVzLiBQbGVhc2Ugc2VsZWN0IGF0IGxlYXN0IG9uZSB3ZWJzaXRlIGZyb20gdGhlIHNldHRpbmdzIGFuZCBwZXJmb3JtIGEgc2VhcmNoIGFnYWluLidcbiAgICAgIG1lc3NhZ2Uuc3R5bGUuY29sb3IgPSAncmVkJztcbiAgICAgIG1lc3NhZ2UuY2xhc3NOYW1lID0gJ2Vycm9yJztcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIG1lc3NhZ2Uuc3R5bGUuY29sb3IgPSAnaW5pdGlhbCc7XG4gICAgICAgIGlmIChpbml0aWFsTWVzc2FnZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbWVzc2FnZS5jbGFzc05hbWUgPSAnJztcbiAgICAgICAgICBtZXNzYWdlLmlubmVyVGV4dCA9IGluaXRpYWxNZXNzYWdlO1xuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgbWVzc2FnZS5jbGFzc05hbWUgPSAnZC1ub25lJztcbiAgICAgICAgICBtZXNzYWdlLmlubmVyVGV4dCA9ICcnO1xuICAgICAgICB9XG4gICAgICB9LCA0MDAwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBrZXl3b3JkcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWtleXdvcmRzJykudmFsdWUsXG4gICAgbG9jYXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1sb2NhdGlvbicpLnZhbHVlO1xuXG4gICAgaWYgKGtleXdvcmRzID09PSAnJyB8fCBsb2NhdGlvbiA9PT0gJycpIHtcbiAgICAgIGNvbnN0IGVycm9yUm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Vycm9yLXJvdycpO1xuICAgICAgZXJyb3JSb3cuY2hpbGRyZW5bMF0uaW5uZXJUZXh0ID0gJ1BsZWFzZSBmaWxsIGluIGJvdGggZmllbGRzIGJlZm9yZSBwZXJmb3JtaW5nIGEgc2VhcmNoISc7XG4gICAgICBlcnJvclJvdy5jbGFzc05hbWUgPSAnJztcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGVycm9yUm93LmNoaWxkcmVuWzBdLmlubmVyVGV4dCA9ICcnO1xuICAgICAgICBlcnJvclJvdy5jbGFzc05hbWUgPSAnZC1ub25lJztcbiAgICAgIH0sIDMwMDApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuLy9kaXNhYmxlIHNlYXJjaCBidXR0b25cbiAgICBjb25zdCBzZWFyY2hCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoLWJ1dHRvbicpO1xuICAgIHNlYXJjaEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG5cbi8vc2F2ZSBzZWFyY2ggdmFsdWVzIGlmIGRpZmZlcmVudFxuICAgIGlmICh1c2VyUHJlZnMua2V5d29yZHMgIT0ga2V5d29yZHMgfHwgdXNlclByZWZzLmxvY2F0aW9uICE9IGxvY2F0aW9uKSB7XG4gICAgICB1c2VyUHJlZnMua2V5d29yZHMgPSBrZXl3b3JkcztcbiAgICAgIHVzZXJQcmVmcy5sb2NhdGlvbiA9IGxvY2F0aW9uO1xuICAgICAgdGhpcy5fbW9kZWwuc2F2ZVByZWZlcmVuY2VzKHVzZXJQcmVmcyk7XG4gICAgfVxuXG4vL2NhbGwgYmFja2dyb3VuZCBzY3JpcHQgdG8gb3BlbiB1cCB0aGUgbmVjZXNzYXJ5IHBhZ2VzXG4gICAgaWYgKHdpbmRvdy5jaHJvbWUpIHtcbiAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgdGFzazogJ3NlYXJjaEpvYnMnLFxuICAgICAgICBwcmVmczogW2tleXdvcmRzLCBsb2NhdGlvbl1cbiAgICAgIH0pO1xuICAgIH1cblxuLy9jbG9zZSBzZXR0aW5ncyBwYWdlIGlmIG9wZW5cbiAgICBjb25zdCBzZXR0aW5ncyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5ncy1wYWdlJyk7XG4gICAgaWYgKHNldHRpbmdzLnN0eWxlLnRyYW5zZm9ybS5pbmRleE9mKCctMTAwJykgPiAtMSkge1xuICAgICAgdGhpcy5zZXR0aW5nc0hhbmRsZXIoe1xuICAgICAgICB0YXJnZXQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYXYtbGlua3MnKS5jaGlsZHJlblsxXVxuICAgICAgfSlcbiAgICB9XG5cbi8vZGlzcGxheSBsb2FkaW5nIHNwaW5uZXJcbiAgICBjb25zdCBzcGlubmVyQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwaW5uZXItY29udGFpbmVyJyk7XG4gICAgc3Bpbm5lckNvbnRhaW5lci5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3BhbicpWzFdLmNsYXNzTmFtZSA9ICcnO1xuICAgIHNwaW5uZXJDb250YWluZXIuY2xhc3NOYW1lID0gJyc7XG4gICAgdGhpcy5fc2VydmljZXMuc2V0U2V0dGluZ3NIZWlnaHQoKTtcbiAgfVxuXG5cbi8qICpcbiAqIFNldHRpbmdzIGNsaWNrIGhhbmRsZXJcbiAqICovXG4gIHNldHRpbmdzSGFuZGxlcihldmVudCkge1xuXG4gICAgY29uc3Qgc2V0dGluZ3NCdXR0b24gPSBldmVudC50YXJnZXQ7XG5cbi8vc2xpZGluZyBhbmltYXRpb24gZm9yIHNldHRpbmdzIHNlY3Rpb25cbiAgICBjb25zdCBzZXR0aW5ncyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR0aW5ncy1wYWdlJyk7XG4gICAgY29uc3QgYmFja0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ25hdi1iYWNrJylbMF07XG5cbiAgICBpZiAoc2V0dGluZ3Muc3R5bGUudHJhbnNmb3JtID09ICcnIHx8IHNldHRpbmdzLnN0eWxlLnRyYW5zZm9ybS5pbmRleE9mKCctMTAwJykgPT09IC0xKSB7XG4vL3Nob3cgc2V0dGluZ3NcbiAgICAgIHNldHRpbmdzLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKC0xMDAlKSc7XG4gICAgICBiYWNrQnV0dG9uLmNsYXNzTmFtZSA9IGJhY2tCdXR0b24uY2xhc3NOYW1lLnJlcGxhY2UoLyBoaWRlL2csICcnKTtcbiAgICAgIHNldHRpbmdzQnV0dG9uLnNyYyA9ICdpY29ucy9pY29uczgtc2V0dGluZ3MtYWN0aXZlLTUwLnBuZyc7XG5cbiAgICB9ZWxzZSB7XG4gICAgICBzZXR0aW5ncy5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgxMDAlKSc7XG4gICAgICBiYWNrQnV0dG9uLmNsYXNzTmFtZSArPSAnIGhpZGUnO1xuICAgICAgc2V0dGluZ3NCdXR0b24uc3JjID0gJ2ljb25zL2ljb25zOC1zZXR0aW5ncy01MC5wbmcnO1xuXG4gICAgfVxuICB9XG5cblxuLyogKlxuICogQmFjayBjbGljayBoYW5kbGVyXG4gKiAqL1xuICBiYWNrQnV0dG9uSGFuZGxlcihldmVudCkge1xuXG4gICAgY29uc3Qgc2V0dGluZ3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0dGluZ3MtcGFnZScpO1xuICAgIGNvbnN0IHNldHRpbmdzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2F2ZWQtbGlzdGluZ3MnKVswXS5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgaWYgKHNldHRpbmdzLnN0eWxlLnRyYW5zZm9ybS5pbmRleE9mKCctMTAwJykgPiAtMSkge1xuICAgICAgc2V0dGluZ3Muc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoMTAwJSknO1xuICAgICAgY29uc3QgYmFja0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ25hdi1iYWNrJylbMF07XG4gICAgICBiYWNrQnV0dG9uLmNsYXNzTmFtZSArPSAnIGhpZGUnO1xuICAgICAgc2V0dGluZ3NCdXR0b24uc3JjID0gJ2ljb25zL2ljb25zOC1zZXR0aW5ncy01MC5wbmcnO1xuICAgIH1cbiAgfVxuXG5cbi8qICpcbiAqIFRvZ2dsZSBqb2Igc2l0ZXMgaGFuZGxlclxuICogKi9cbiAgYXN5bmMgam9iU2l0ZXNDaGVja2JveEhhbmRsZXIoZXZlbnQpIHtcblxuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICBjb25zdCBzaXRlTmFtZSA9IHRhcmdldC5uYW1lO1xuICAgIGNvbnN0IHVzZXJQcmVmcyA9IGF3YWl0IHRoaXMuX21vZGVsLmdldFByZWZzKCk7XG4gICAgY29uc3Qgb21pdHRlZF9zaXRlcyA9IHVzZXJQcmVmcy5vbWl0dGVkX3NpdGVzO1xuICAgIGlmICh0YXJnZXQuY2hlY2tlZCkge1xuICAgICAgY29uc3QgZmlsdGVyZWQgPSBvbWl0dGVkX3NpdGVzLmZpbHRlcihvbWl0dGVkX3NpdGUgPT4ge1xuICAgICAgICByZXR1cm4gb21pdHRlZF9zaXRlICE9IHNpdGVOYW1lO1xuICAgICAgfSlcbiAgICAgIHVzZXJQcmVmcy5vbWl0dGVkX3NpdGVzID0gZmlsdGVyZWQ7XG4gICAgICB0aGlzLl9tb2RlbC5zYXZlUHJlZmVyZW5jZXModXNlclByZWZzKTtcblxuICAgIH1lbHNlIHtcbiAgICAgIG9taXR0ZWRfc2l0ZXMucHVzaChzaXRlTmFtZSk7XG4gICAgICB1c2VyUHJlZnMub21pdHRlZF9zaXRlcyA9IG9taXR0ZWRfc2l0ZXM7XG4gICAgICB0aGlzLl9tb2RlbC5zYXZlUHJlZmVyZW5jZXModXNlclByZWZzKTtcblxuICAgIH1cbiAgfVxuXG5cbi8qICpcbiAqIEZyZXF1ZW5jeSBzZWxlY3QgaGFuZGxlclxuICogKi9cbiAgYXN5bmMgZnJlcXVlbmN5Q2hhbmdlSGFuZGxlcihldmVudCkge1xuXG4gICAgY29uc3QgZnJlcXVlbmN5VmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgY29uc3QgdXNlclByZWZzID0gYXdhaXQgdGhpcy5fbW9kZWwuZ2V0UHJlZnMoKTtcbiAgICBpZiAodXNlclByZWZzLmZyZXF1ZW5jeSAhPT0gZnJlcXVlbmN5VmFsdWUpIHtcblxuICAgICAgdXNlclByZWZzLmZyZXF1ZW5jeSA9IGZyZXF1ZW5jeVZhbHVlO1xuICAgICAgdGhpcy5fbW9kZWwuc2F2ZVByZWZlcmVuY2VzKHVzZXJQcmVmcyk7XG5cbi8vdXBkYXRlIGFsYXJtIHdpdGggbmV3IGZyZXF1ZW5jeVxuICAgICAgdGhpcy5fbW9kZWwuc2V0QWxhcm0oKTtcbiAgICB9XG4gIH1cblxuXG4vKiAqXG4gKiBVc2VyIGNsaWNrcyBvbiBTSE9XIE1PUkVcbiAqICovXG4gIGFzeW5jIHNob3dNb3JlSGFuZGxlcihldmVudCkge1xuXG4vL2RhdGEtaW5kZXggY29udGFpbnMgdGhlIGN1cnJlbnQgbGlzdGluZyBpbmRleFxuICAgIGNvbnN0IGxpc3RpbmdJbmRleCA9IHBhcnNlSW50KGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnKSk7XG5cbiAgICBjb25zdCBsaXN0aW5ncyA9IGF3YWl0IHRoaXMuX21vZGVsLmpvYkxpc3RpbmdzKCk7XG4vL2NoZWNrIGlmIG9uIGJvb2ttYXJrIHBhZ2VcbiAgICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2F2ZWQtbGlzdGluZ3MnKVswXS5jaGlsZHJlblswXS5zcmMuaW5kZXhPZignYWN0aXZlJykgPiAtMSkge1xuLy9ib29rIGltYWdlIHNyYyBvZiBhY3RpdmUgaW1hZ2UuLi5uZWVkIHNhdmVkIGxpc3RpbmdzIG9ubHlcbiAgICAgIGNvbnN0IGZpbHRlcmVkTGlzdGluZ3MgPSBsaXN0aW5ncy5maWx0ZXIobGlzdGluZyA9PiBsaXN0aW5nLnNhdmVkKTtcbiAgICAgIHRoaXMuX3NlcnZpY2VzLnBvcHVsYXRlTGlzdGluZ3MoZmlsdGVyZWRMaXN0aW5ncywgbGlzdGluZ0luZGV4LCB0cnVlKTtcbiAgICB9ZWxzZSB7XG4gICAgICB0aGlzLl9zZXJ2aWNlcy5wb3B1bGF0ZUxpc3RpbmdzKGxpc3RpbmdzLCBsaXN0aW5nSW5kZXgsIHRydWUpO1xuICAgIH1cbiAgfVxuXG5cbi8qICpcbiAqIEFnZ3JlZ2F0ZSByZXN1bHRzIGNoZWNrYm94IGhhbmRsZXJcbiAqICovXG4gIGFzeW5jIGFnZ3JlZ2F0ZVJlc3VsdENCSGFuZGxlcihldmVudCkge1xuXG4gICAgY29uc3QgdXNlclByZWZzID0gYXdhaXQgdGhpcy5fbW9kZWwuZ2V0UHJlZnMoKTtcbiAgICBjb25zdCBjaGVja2JveFZhbCA9IGV2ZW50LnRhcmdldDtcbiAgICBjb25zdCBjaGVja2JveExhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FnZ3JlZ2F0ZS1sYWJlbCcpO1xuICAgIGlmIChjaGVja2JveFZhbC5jaGVja2VkKSB7XG4gICAgICBjaGVja2JveExhYmVsLmlubmVyVGV4dCA9ICdZZXMnO1xuICAgIH1lbHNlIHtcbiAgICAgIGNoZWNrYm94TGFiZWwuaW5uZXJUZXh0ID0gJ05vJztcbiAgICB9XG4gICAgdXNlclByZWZzLmFnZ3JlZ2F0ZV9yZXN1bHRzID0gY2hlY2tib3hWYWwuY2hlY2tlZDtcbiAgICB0aGlzLl9tb2RlbC5zYXZlUHJlZmVyZW5jZXModXNlclByZWZzKTtcbiAgfVxuXG5cbi8qICpcbiAqIExpc3RpbmdzIGxpbWl0aW5nIFNFTEVDVCBjaGFuZ2UgaGFuZGxlclxuICogKi9cbiAgYXN5bmMgbGlzdGluZ3NMaW1pdEhhbmRsZXIoZXZlbnQpIHtcblxuICAgIGNvbnN0IHVzZXJQcmVmcyA9IGF3YWl0IHRoaXMuX21vZGVsLmdldFByZWZzKCk7XG4gICAgY29uc3QgbGlzdGluZ0xpbWl0VmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4vL3Bvc3NpYmxlIHZhbHVlIFwiZGVmYXVsdFwiXG4gICAgY29uc3QgbGlzdGluZ0xpbWl0ID0gaXNOYU4ocGFyc2VJbnQobGlzdGluZ0xpbWl0VmFsdWUpKSA/IDAgOiBsaXN0aW5nTGltaXRWYWx1ZTtcblxuICAgIHVzZXJQcmVmcy5saXN0aW5nX2xpbWl0ID0gbGlzdGluZ0xpbWl0O1xuICAgIHRoaXMuX21vZGVsLnNhdmVQcmVmZXJlbmNlcyh1c2VyUHJlZnMpO1xuICB9XG5cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcnZpY2VzIHtcblxuICBjb25zdHJ1Y3RvcihkZWZhdWx0cywgbW9kZWwpIHtcblxuICAgIHRoaXMuX2RlZmF1bHRzID0gZGVmYXVsdHM7XG4gICAgdGhpcy5fbW9kZWwgPSBtb2RlbDtcbiAgfVxuXG5cbi8qICpcbiAqIEFkZC9yZW1vdmUgYm9va21hcmtzXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVmZXJlbmNlIC0gbGluayB0byB0aGUgam9iIGxpc3RpbmdcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVtb3ZlIC0gd2hldGhlciB0byByZW1vdmUgdGhlIGJvb2ttYXJrXG4gKiAqL1xuICBhc3luYyBlZGl0U2F2ZWRMaXN0aW5ncyhyZWZlcmVuY2UsIHJlbW92ZSkge1xuXG4gICAgY29uc3Qgam9iTGlzdGluZ3MgPSBhd2FpdCB0aGlzLl9tb2RlbC5qb2JMaXN0aW5ncygpO1xuXG4gICAgam9iTGlzdGluZ3MuZm9yRWFjaCgobGlzdGluZywgaW5kZXgpID0+IHtcbiAgICAgIGlmIChsaXN0aW5nLmxpbmsgPT09IHJlZmVyZW5jZSkge1xuICAgICAgICBpZiAocmVtb3ZlKSB7XG4gICAgICAgICAgbGlzdGluZy5zYXZlZCA9IGZhbHNlO1xuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgbGlzdGluZy5zYXZlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMuX21vZGVsLnNhdmVMaXN0aW5ncyhqb2JMaXN0aW5ncyk7XG4gIH1cblxuXG4vKiAqXG4gKiBXaGVuIHVzZXIgdG9nZ2xlcyBib29rbWFyaywgdXNlIHRoZSBJTUcgc291cmNlIHRvIGRldGVybWluZSB3aGV0aGVyIHRvIHNob3cgc2F2ZWQgYm9va21hcmtzIG9yIG5vdFxuICogQHBhcmFtIGV2ZW50IC0gRElWIHdyYXBwZXIgZm9yIHRoZSBib29rIElNRyBhbmQgU1BBTiBmb3IgY291bnRlciBvZiBzYXZlZCBsaXN0aW5nc1xuICogKi9cbiAgYXN5bmMgZ2V0Q3VycmVudExpc3RpbmdzKGV2ZW50KSB7XG4gICAgY29uc3QgbGlzdGluZ3MgPSBhd2FpdCB0aGlzLl9tb2RlbC5qb2JMaXN0aW5ncygpO1xuXG4vL2NsaWNrIGNvdWxkIGJlIG9uIHRoZSBpbWcgb3IgdGhlIHNwYW4uLi5jaGVja2luZyB0aGUgdGFyZ2V0IGFuZCBmaW5kaW5nIHRoZSBmaXJzdCBjaGlsZCBJTUdcbiAgICBjb25zdCBib29rSW1nID0gZXZlbnQudGFyZ2V0LmNsYXNzTmFtZSA9PT0gJ3NhdmVkLWxpc3RpbmdzJyA/IGV2ZW50LnRhcmdldC5jaGlsZHJlblswXSA6IGV2ZW50LnRhcmdldC5wYXJlbnRFbGVtZW50LmNoaWxkcmVuWzBdO1xuXG4gICAgaWYgKGJvb2tJbWcuc3JjLmluZGV4T2YoJ2FjdGl2ZScpID4gLTEpIHtcbi8vY3VycmVudGx5IGZpbHRlcmVkIGltYWdlcyBhcmUgc2hvd25cbiAgICAgIGJvb2tJbWcuc3JjID0gJ2ljb25zL2ljb25zOC1ib29rLTUwLnBuZyc7XG5cbi8vcmVzZXQgcGFnaW5hdGlvbiBpbmRleCBvbiB0aGUgc2hvdyBtb3JlIGJ1dHRvblxuICAgICAgaWYgKGxpc3RpbmdzLmxlbmd0aCA+IHRoaXMuX2RlZmF1bHRzLmxpc3RpbmdzUGFnZUxpbWl0KSB7XG4gICAgICAgIGNvbnN0IHNob3dNb3JlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3ctbW9yZScpO1xuICAgICAgICBzaG93TW9yZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnLCAnMCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtsaXN0aW5ncywgMF07XG5cbiAgICB9ZWxzZSB7XG4gICAgICBib29rSW1nLnNyYyA9ICdpY29ucy9pY29uczgtYm9vay1hY3RpdmUtNTAucG5nJztcbiAgICAgIGNvbnN0IGZpbHRlcmVkID0gbGlzdGluZ3MuZmlsdGVyKGxpc3RpbmcgPT4gbGlzdGluZy5zYXZlZCk7XG5cbi8vcmVzZXQgcGFnaW5hdGlvbiBpbmRleCBvbiB0aGUgc2hvdyBtb3JlIGJ1dHRvblxuICAgICAgaWYgKGZpbHRlcmVkLmxlbmd0aCA+IHRoaXMuX2RlZmF1bHRzLmxpc3RpbmdzUGFnZUxpbWl0KSB7XG4gICAgICAgIGNvbnN0IHNob3dNb3JlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3ctbW9yZScpO1xuICAgICAgICBzaG93TW9yZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnLCAnMCcpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gW2ZpbHRlcmVkLCAwXTtcbiAgICB9XG4gIH1cblxuXG4gIC8qICpcbiAgICogU2hvd2luZyB0aGUgdXNlciB3aGVuIHRoZSBsYXN0IHRpbWUgYSBqb2Igc2VhcmNoIHdhcyBydW5cbiAgICogQHBhcmFtIHtPYmplY3QgW119IGxpc3RpbmcgLSBmaXJzdCBsaXN0aW5nIG9mIGFsbCBqb2JzIHdpbGwgY29udGFpbiBsYXN0IHVwZGF0ZWQgaW5mb3JtYXRpb25cbiAgICogKi9cbiAgc2V0TGFzdFVwZGF0ZWQobGlzdGluZykge1xuXG4gICAgY29uc3QgbGFzdFVwZGF0ZWRDb2x1bW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGFzdC11cGRhdGVkJyk7XG4gICAgaWYgKGxpc3RpbmcpIHtcbiAgICAgIGlmICghbGlzdGluZy5oYXNPd25Qcm9wZXJ0eSgnbGFzdF91cGRhdGVkJykpIHtcbiAgICAgICAgbGFzdFVwZGF0ZWRDb2x1bW4uaW5uZXJIVE1MID0gJ0xhc3QgVXBkYXRlZDo8YnI+JyArIG5ldyBEYXRlKCkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgKyAnICcgKyBuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpIDtcbiAgICAgIH1lbHNlIHtcbiAgICAgICAgbGFzdFVwZGF0ZWRDb2x1bW4uaW5uZXJIVE1MID0gJ0xhc3QgVXBkYXRlZDo8YnI+JyArIG5ldyBEYXRlKGxpc3RpbmcubGFzdF91cGRhdGVkKS50b0xvY2FsZURhdGVTdHJpbmcoKSArICcgJyArIG5ldyBEYXRlKGxpc3RpbmcubGFzdF91cGRhdGVkKS50b0xvY2FsZVRpbWVTdHJpbmcoKSA7XG4gICAgICB9XG5cbiAgICB9ZWxzZSB7XG4gICAgICBsYXN0VXBkYXRlZENvbHVtbi5pbm5lclRleHQgPSAnTGFzdCBVcGRhdGVkOiAtLSc7XG4gICAgfVxuICB9XG5cblxuLyogKlxuICogRHluYW1pY2FsbHkgc2V0dGluZ3MgdGhlIHNldHRpbmdzIHBhZ2UgaGVpZ2h0IHdoZW4gdGhlIHBvcHVwIHBhZ2UgbG9hZHNcbiAqICovXG4gIHNldFNldHRpbmdzSGVpZ2h0KCkge1xuICAgIGNvbnN0IGhlYWRlckhlaWdodCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkZXInKVswXS5vZmZzZXRIZWlnaHQ7XG4gICAgY29uc3Qgc2V0dGluZ3NQYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmdzLXBhZ2UnKTtcbiAgICBzZXR0aW5nc1BhZ2Uuc3R5bGUuaGVpZ2h0ID0gKDYwMCAtIGhlYWRlckhlaWdodCAtIDM0KS50b1N0cmluZygpICsgJ3B4JztcbiAgfVxuXG5cbi8qICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHdoZW4gcG9wdXAgcGFnZSBsb2FkcyBvciB3aGVuIFNIT1cgTU9SRSBpcyBjbGlja2VkXG4gKiAqL1xuICByZWdpc3RlckJvb2ttYXJrTGlzdGVuZXJzKCkge1xuXG4gICAgY29uc3QgYm9va21hcmtzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbGlzdGluZy1ib29rbWFyaycpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYm9va21hcmtzLmxlbmd0aDsgaSsrKSB7XG5cbi8vY2hlY2sgaWYgZWxlbWVudCBhbHJlYWR5IGhhcyBhIGNsaWNrIGxpc3RlbmVyXG4gICAgICBpZiAoYm9va21hcmtzW2ldLmdldEF0dHJpYnV0ZSgnZGF0YS1saXN0ZW5lcicpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBib29rbWFya3NbaV0uc2V0QXR0cmlidXRlKCdkYXRhLWxpc3RlbmVyJywgdHJ1ZSk7XG4gICAgICBib29rbWFya3NbaV0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG5cbiAgICAgICAgY29uc3QgYm9va21hcmsgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGNvbnN0IHNhdmVkQ291bnRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2F2ZWQtY291bnQnKVswXTtcbiAgICAgICAgbGV0IHNhdmVkQ291bnQgPSBwYXJzZUludChzYXZlZENvdW50RWxlbWVudC5pbm5lclRleHQpO1xuXG4vL3VzZSBpbWFnZSBzb3VyY2UgdG8gZGV0ZXJtaW5lIGlmIGxpc3RpbmcgaXMgY3VycmVudGx5IHNhdmVkIG9yIG5vdFxuICAgICAgICBpZiAoYm9va21hcmsuc3JjLmluZGV4T2YoJ3NhdmVkJykgPiAtMSkge1xuLy9yZW1vdmluZyBzYXZlZCBsaXN0aW5nXG4gICAgICAgICAgYm9va21hcmsuc3JjID0gJ2ljb25zL2ljb25zOC1ib29rbWFyay01MC5wbmcnO1xuICAgICAgICAgIC0tc2F2ZWRDb3VudDtcbiAgICAgICAgICB0aGlzLmVkaXRTYXZlZExpc3RpbmdzKGJvb2ttYXJrLmdldEF0dHJpYnV0ZSgnZGF0YS1yZWYnKSwgdHJ1ZSk7XG4gICAgICAgIH1lbHNlIHtcbiAgICAgICAgICBib29rbWFyay5zcmMgPSAnaWNvbnMvaWNvbnM4LWJvb2ttYXJrLXNhdmVkLTUwLnBuZyc7XG4gICAgICAgICAgc2F2ZWRDb3VudCsrO1xuICAgICAgICAgIHRoaXMuZWRpdFNhdmVkTGlzdGluZ3MoYm9va21hcmsuZ2V0QXR0cmlidXRlKCdkYXRhLXJlZicpLCBmYWxzZSk7XG4gICAgICAgIH1cbi8vc2V0IGJvb2ttYXJrIGNvdW50ZXJcbiAgICAgICAgc2F2ZWRDb3VudEVsZW1lbnQuaW5uZXJUZXh0ID0gc2F2ZWRDb3VudDtcblxuLy9jaGVja2luZyBpZiB0aGUgdXNlciBpcyBvbiB0aGUgZmlsdGVyZWQgbGlzdCBhbmQgZGVjaWRlZCB0byByZW1vdmUgdGhlIGxhc3Qgc2F2ZWQgbGlzdGluZ1xuICAgICAgICBpZiAoc2F2ZWRDb3VudCA9PT0gMCkge1xuICAgICAgICAgIGNvbnN0IGJvb2tJbWcgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzYXZlZC1saXN0aW5ncycpWzBdLmNoaWxkcmVuWzBdO1xuICAgICAgICAgIGlmIChib29rSW1nLnNyYy5pbmRleE9mKCdhY3RpdmUnKSA+IC0xKSB7XG5cbi8vdXNlIHRoaXMgZnVuY3Rpb24gdG8gdGFrZSBjYXJlIG9mIGV2ZXJ5dGhpbmdcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyU2F2ZWRMaXN0aW5ncyh7XG4gICAgICAgICAgICAgIHRhcmdldDogYm9va0ltZ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG5cbi8qICpcbiAqIEBwYXJhbSB7T2JqZWN0IFtdfSBsaXN0aW5nc1xuICogQHBhcmFtIHtudW1iZXJ9IHBhZ2VOdW0gLSB1c2VkIGZvciBwYWdpbmF0aW9uLi4uU0hPVyBNT1JFIGJ1dHRvbiBob2xkcyBhIHJlZmVyZW5jZSB0byB0aGUgbGFzdCBsaXN0aW5nIGluZGV4XG4gKiBAcGFyYW0ge0Jvb2xlYW59IGFwcGVuZCAtIGlmIFRSVUUsIGFwcGVuZCB0byB0aGUgVUw7IGVsc2UgRkFMU0UsIHNldCBpbm5lckhUTUwgb2YgVUxcbiAqICovXG4gIHBvcHVsYXRlTGlzdGluZ3MobGlzdGluZ3MsIHBhZ2VOdW0sIGFwcGVuZCkge1xuXG4gICAgY29uc3QgbGlzdGluZ3NVTCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0aW5ncycpO1xuICAgIGxldCBzYXZlZExpc3RpbmdDb3VudGVyID0gMDtcblxuLy9jcmVhdGUgdGVtcG9yYXJ5IGRpdiB0byBob2xkIHRoZSBsaXN0IGVsZW1lbnRzXG4vL2FwcGVuZCB0byBsaXN0aW5nVUwgd2hlbiBhbGwgbGlzdGluZ3MgY3JlYXRlZC4uLmF2b2lkcyByZWZsb3cvcmVkcmF3XG4gICAgY29uc3QgdGVtcERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4vL3RlbXAgbGluayB0byBzZXQgdGhlIGhyZWYgYW5kIGdldCB0aGUgaG9zdFxuICAgIGNvbnN0IGxpc3RpbmdTb3VyY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG5cbiAgICBmb3IgKGxldCBpID0gcGFnZU51bTsgaSA8IGxpc3RpbmdzLmxlbmd0aDsgaSsrKSB7XG5cbi8vY2hlY2sgaWYgbGltaXQgcmVhY2hlZCBmb3IgcGFnZVxuICAgICAgaWYgKGkgPj0gcGFnZU51bSArIHRoaXMuX2RlZmF1bHRzLmxpc3RpbmdzUGFnZUxpbWl0KCkpIHtcbiAgICAgICAgY29uc3Qgc2hvd01vcmVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvdy1tb3JlJyk7XG4gICAgICAgIHNob3dNb3JlQnV0dG9uLnNldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcsIHBhZ2VOdW0gKyB0aGlzLl9kZWZhdWx0cy5saXN0aW5nc1BhZ2VMaW1pdCgpKTtcbiAgICAgICAgaWYgKGkgPj0gbGlzdGluZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgc2hvd01vcmVCdXR0b24uY2xhc3NOYW1lID0gJ2Qtbm9uZSc7XG4gICAgICAgIH1lbHNlIHtcbiAgICAgICAgICBzaG93TW9yZUJ1dHRvbi5jbGFzc05hbWUgPSAnJztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuLy9yZWFjaGVkIGxhc3QgbGlzdGluZ1xuICAgICAgaWYgKGkgPT09IGxpc3RpbmdzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgY29uc3Qgc2hvd01vcmVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvdy1tb3JlJyk7XG4vL25leHQgc3RhcnRpbmcgaW5kZXggaXMgbGFzdCBpbmRleCBwbHVzIG9uZVxuICAgICAgICBzaG93TW9yZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnLCBpICsgMSk7XG4gICAgICAgIHNob3dNb3JlQnV0dG9uLmNsYXNzTmFtZSA9ICdkLW5vbmUnO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBsaXN0aW5nID0gbGlzdGluZ3NbaV07XG4gICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG5cbi8vc2V0IGNvcnJlY3Qgc3JjIGZvciBib29rbWFyayBpZiB0aGUgbGlzdGluZyBpcyBzYXZlZFxuICAgICAgY29uc3QgYm9va21hcmtTcmMgPSAoKCkgPT4ge1xuICAgICAgICBpZiAobGlzdGluZy5zYXZlZCkge1xuICAgICAgICAgIHNhdmVkTGlzdGluZ0NvdW50ZXIrKztcbiAgICAgICAgICByZXR1cm4gJ2ljb25zL2ljb25zOC1ib29rbWFyay1zYXZlZC01MC5wbmcnO1xuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgcmV0dXJuICdpY29ucy9pY29uczgtYm9va21hcmstNTAucG5nJztcbiAgICAgICAgfVxuICAgICAgfSkoKVxuXG4gICAgICBsaXN0aW5nU291cmNlLmhyZWYgPSBsaXN0aW5nLmxpbms7XG5cbiAgICAgIGxpLmNsYXNzTmFtZSA9ICdqb2ItbGlzdGluZyc7XG4gICAgICBsaS5pbm5lckhUTUwgPSBcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJqb2ItdGl0bGUtd3JhcHBlclwiPiBcXFxuICAgICAgICAgIDxoMyBjbGFzcz1cImxpc3RpbmctdGl0bGVcIj4nICsgbGlzdGluZy50aXRsZSArICc8L2gzPiBcXFxuICAgICAgICAgIDxpbWcgY2xhc3M9XCJsaXN0aW5nLWJvb2ttYXJrXCIgc3JjPVwiJyArIGJvb2ttYXJrU3JjICsgJ1wiIGRhdGEtcmVmPVwiJyArIGxpc3RpbmcubGluayArICdcIj4gXFxcbiAgICAgICAgPC9kaXY+IFxcXG4gICAgICAgIDxzcGFuIGNsYXNzPVwibGlzdGluZy1zb3VyY2VcIj4oJyArIGxpc3RpbmdTb3VyY2UuaG9zdC5yZXBsYWNlKCd3d3cuJywgJycpLnRvVXBwZXJDYXNlKCkgKyAnKTwvc3Bhbj4gXFxcbiAgICAgICAgPHAgY2xhc3M9XCJsaXN0aW5nLXN1bW1hcnlcIj4nICsgbGlzdGluZy5zdW1tYXJ5ICsgJyBcXFxuICAgICAgICA8YSBocmVmPVwiJyArIGxpc3RpbmcubGluayArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj5WaWV3IExpc3Rpbmc8L2E+PC9wPiBcXFxuICAgICAgICA8c3Ryb25nPjxzcGFuIGNsYXNzPVwibGlzdGluZy1jb21wYW55XCI+JyArIGxpc3RpbmcuY29tcGFueSArICc8L3NwYW4+PC9zdHJvbmc+IFxcXG4gICAgICAgIDxzcGFuPiYjODIyNjs8L3NwYW4+IFxcXG4gICAgICAgIDxzcGFuIGNsYXNzPVwibGlzdGluZy1kYXRlXCI+JyArIGxpc3RpbmcuZGF0ZSArICc8L3NwYW4+JztcblxuICAgICAgdGVtcERpdi5hcHBlbmRDaGlsZChsaSk7XG4gICAgfVxuXG4gICAgaWYgKGFwcGVuZCkge1xuICAgICAgbGlzdGluZ3NVTC5pbm5lckhUTUwgKz0gdGVtcERpdi5pbm5lckhUTUw7XG4gICAgfWVsc2Uge1xuICAgICAgbGlzdGluZ3NVTC5pbm5lckhUTUwgPSB0ZW1wRGl2LmlubmVySFRNTDtcbiAgICB9XG4gICAgdGhpcy5yZWdpc3RlckJvb2ttYXJrTGlzdGVuZXJzKCk7XG4gIH1cblxuXG4vKiAqXG4gKiBGaWx0ZXIgdG8gc2hvdyBvbmx5IHNhdmVkL2FsbCBsaXN0aW5nc1xuICogQHBhcmFtIGV2ZW50IC0gQ2xpY2sgZXZlbnQgd2hlbiB1c2VyIHRvZ2dsZXMgYm9vayBJTUdcbiAqICovXG4gIGZpbHRlclNhdmVkTGlzdGluZ3MoZXZlbnQpIHtcbiAgICB0aGlzLmdldEN1cnJlbnRMaXN0aW5ncyhldmVudClcbiAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIHRoaXMucG9wdWxhdGVMaXN0aW5ncyhyZXN1bHRbMF0sIHJlc3VsdFsxXSk7XG4gICAgICB9KVxuICB9XG5cbn1cbiIsImZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NsYXNzQ2FsbENoZWNrOyIsImZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gIGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gIHJldHVybiBDb25zdHJ1Y3Rvcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfY3JlYXRlQ2xhc3M7IiwiZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBcImRlZmF1bHRcIjogb2JqXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdDsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZWdlbmVyYXRvci1ydW50aW1lXCIpO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG52YXIgcnVudGltZSA9IChmdW5jdGlvbiAoZXhwb3J0cykge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgT3AgPSBPYmplY3QucHJvdG90eXBlO1xuICB2YXIgaGFzT3duID0gT3AuaGFzT3duUHJvcGVydHk7XG4gIHZhciB1bmRlZmluZWQ7IC8vIE1vcmUgY29tcHJlc3NpYmxlIHRoYW4gdm9pZCAwLlxuICB2YXIgJFN5bWJvbCA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbCA6IHt9O1xuICB2YXIgaXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLml0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiO1xuICB2YXIgYXN5bmNJdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuYXN5bmNJdGVyYXRvciB8fCBcIkBAYXN5bmNJdGVyYXRvclwiO1xuICB2YXIgdG9TdHJpbmdUYWdTeW1ib2wgPSAkU3ltYm9sLnRvU3RyaW5nVGFnIHx8IFwiQEB0b1N0cmluZ1RhZ1wiO1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIGV4cG9ydHMud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIEl0ZXJhdG9yUHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlW3RvU3RyaW5nVGFnU3ltYm9sXSA9XG4gICAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgcHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgZXhwb3J0cy5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBpZiAoISh0b1N0cmluZ1RhZ1N5bWJvbCBpbiBnZW5GdW4pKSB7XG4gICAgICAgIGdlbkZ1blt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKWAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuXG4gIGV4cG9ydHMuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbih1bndyYXBwZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAgIC8vIGN1cnJlbnQgaXRlcmF0aW9uLlxuICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgLy8gSWYgYSByZWplY3RlZCBQcm9taXNlIHdhcyB5aWVsZGVkLCB0aHJvdyB0aGUgcmVqZWN0aW9uIGJhY2tcbiAgICAgICAgICAvLyBpbnRvIHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gc28gaXQgY2FuIGJlIGhhbmRsZWQgdGhlcmUuXG4gICAgICAgICAgcmV0dXJuIGludm9rZShcInRocm93XCIsIGVycm9yLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcHJldmlvdXNQcm9taXNlO1xuXG4gICAgZnVuY3Rpb24gZW5xdWV1ZShtZXRob2QsIGFyZykge1xuICAgICAgZnVuY3Rpb24gY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldmlvdXNQcm9taXNlID1cbiAgICAgICAgLy8gSWYgZW5xdWV1ZSBoYXMgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIHdlIHdhbnQgdG8gd2FpdCB1bnRpbFxuICAgICAgICAvLyBhbGwgcHJldmlvdXMgUHJvbWlzZXMgaGF2ZSBiZWVuIHJlc29sdmVkIGJlZm9yZSBjYWxsaW5nIGludm9rZSxcbiAgICAgICAgLy8gc28gdGhhdCByZXN1bHRzIGFyZSBhbHdheXMgZGVsaXZlcmVkIGluIHRoZSBjb3JyZWN0IG9yZGVyLiBJZlxuICAgICAgICAvLyBlbnF1ZXVlIGhhcyBub3QgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIGl0IGlzIGltcG9ydGFudCB0b1xuICAgICAgICAvLyBjYWxsIGludm9rZSBpbW1lZGlhdGVseSwgd2l0aG91dCB3YWl0aW5nIG9uIGEgY2FsbGJhY2sgdG8gZmlyZSxcbiAgICAgICAgLy8gc28gdGhhdCB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhcyB0aGUgb3Bwb3J0dW5pdHkgdG8gZG9cbiAgICAgICAgLy8gYW55IG5lY2Vzc2FyeSBzZXR1cCBpbiBhIHByZWRpY3RhYmxlIHdheS4gVGhpcyBwcmVkaWN0YWJpbGl0eVxuICAgICAgICAvLyBpcyB3aHkgdGhlIFByb21pc2UgY29uc3RydWN0b3Igc3luY2hyb25vdXNseSBpbnZva2VzIGl0c1xuICAgICAgICAvLyBleGVjdXRvciBjYWxsYmFjaywgYW5kIHdoeSBhc3luYyBmdW5jdGlvbnMgc3luY2hyb25vdXNseVxuICAgICAgICAvLyBleGVjdXRlIGNvZGUgYmVmb3JlIHRoZSBmaXJzdCBhd2FpdC4gU2luY2Ugd2UgaW1wbGVtZW50IHNpbXBsZVxuICAgICAgICAvLyBhc3luYyBmdW5jdGlvbnMgaW4gdGVybXMgb2YgYXN5bmMgZ2VuZXJhdG9ycywgaXQgaXMgZXNwZWNpYWxseVxuICAgICAgICAvLyBpbXBvcnRhbnQgdG8gZ2V0IHRoaXMgcmlnaHQsIGV2ZW4gdGhvdWdoIGl0IHJlcXVpcmVzIGNhcmUuXG4gICAgICAgIHByZXZpb3VzUHJvbWlzZSA/IHByZXZpb3VzUHJvbWlzZS50aGVuKFxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnLFxuICAgICAgICAgIC8vIEF2b2lkIHByb3BhZ2F0aW5nIGZhaWx1cmVzIHRvIFByb21pc2VzIHJldHVybmVkIGJ5IGxhdGVyXG4gICAgICAgICAgLy8gaW52b2NhdGlvbnMgb2YgdGhlIGl0ZXJhdG9yLlxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnXG4gICAgICAgICkgOiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpO1xuICAgIH1cblxuICAgIC8vIERlZmluZSB0aGUgdW5pZmllZCBoZWxwZXIgbWV0aG9kIHRoYXQgaXMgdXNlZCB0byBpbXBsZW1lbnQgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiAoc2VlIGRlZmluZUl0ZXJhdG9yTWV0aG9kcykuXG4gICAgdGhpcy5faW52b2tlID0gZW5xdWV1ZTtcbiAgfVxuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhBc3luY0l0ZXJhdG9yLnByb3RvdHlwZSk7XG4gIEFzeW5jSXRlcmF0b3IucHJvdG90eXBlW2FzeW5jSXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBleHBvcnRzLkFzeW5jSXRlcmF0b3IgPSBBc3luY0l0ZXJhdG9yO1xuXG4gIC8vIE5vdGUgdGhhdCBzaW1wbGUgYXN5bmMgZnVuY3Rpb25zIGFyZSBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAgLy8gQXN5bmNJdGVyYXRvciBvYmplY3RzOyB0aGV5IGp1c3QgcmV0dXJuIGEgUHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9mXG4gIC8vIHRoZSBmaW5hbCByZXN1bHQgcHJvZHVjZWQgYnkgdGhlIGl0ZXJhdG9yLlxuICBleHBvcnRzLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICB2YXIgaXRlciA9IG5ldyBBc3luY0l0ZXJhdG9yKFxuICAgICAgd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdClcbiAgICApO1xuXG4gICAgcmV0dXJuIGV4cG9ydHMuaXNHZW5lcmF0b3JGdW5jdGlvbihvdXRlckZuKVxuICAgICAgPyBpdGVyIC8vIElmIG91dGVyRm4gaXMgYSBnZW5lcmF0b3IsIHJldHVybiB0aGUgZnVsbCBpdGVyYXRvci5cbiAgICAgIDogaXRlci5uZXh0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRvbmUgPyByZXN1bHQudmFsdWUgOiBpdGVyLm5leHQoKTtcbiAgICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KSB7XG4gICAgdmFyIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVFeGVjdXRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUNvbXBsZXRlZCkge1xuICAgICAgICBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCZSBmb3JnaXZpbmcsIHBlciAyNS4zLjMuMy4zIG9mIHRoZSBzcGVjOlxuICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgIHJldHVybiBkb25lUmVzdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnRleHQubWV0aG9kID0gbWV0aG9kO1xuICAgICAgY29udGV4dC5hcmcgPSBhcmc7XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGNvbnRleHQuZGVsZWdhdGU7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgICAgIHZhciBkZWxlZ2F0ZVJlc3VsdCA9IG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0ID09PSBDb250aW51ZVNlbnRpbmVsKSBjb250aW51ZTtcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZVJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgLy8gU2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgICAgICBjb250ZXh0LnNlbnQgPSBjb250ZXh0Ll9zZW50ID0gY29udGV4dC5hcmc7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0KSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgICAgdGhyb3cgY29udGV4dC5hcmc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZyk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgIGNvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIGNvbnRleHQuYXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gR2VuU3RhdGVFeGVjdXRpbmc7XG5cbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIpIHtcbiAgICAgICAgICAvLyBJZiBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gaW5uZXJGbiwgd2UgbGVhdmUgc3RhdGUgPT09XG4gICAgICAgICAgLy8gR2VuU3RhdGVFeGVjdXRpbmcgYW5kIGxvb3AgYmFjayBmb3IgYW5vdGhlciBpbnZvY2F0aW9uLlxuICAgICAgICAgIHN0YXRlID0gY29udGV4dC5kb25lXG4gICAgICAgICAgICA/IEdlblN0YXRlQ29tcGxldGVkXG4gICAgICAgICAgICA6IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiByZWNvcmQuYXJnLFxuICAgICAgICAgICAgZG9uZTogY29udGV4dC5kb25lXG4gICAgICAgICAgfTtcblxuICAgICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgIC8vIERpc3BhdGNoIHRoZSBleGNlcHRpb24gYnkgbG9vcGluZyBiYWNrIGFyb3VuZCB0byB0aGVcbiAgICAgICAgICAvLyBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKSBjYWxsIGFib3ZlLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBDYWxsIGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXShjb250ZXh0LmFyZykgYW5kIGhhbmRsZSB0aGVcbiAgLy8gcmVzdWx0LCBlaXRoZXIgYnkgcmV0dXJuaW5nIGEgeyB2YWx1ZSwgZG9uZSB9IHJlc3VsdCBmcm9tIHRoZVxuICAvLyBkZWxlZ2F0ZSBpdGVyYXRvciwgb3IgYnkgbW9kaWZ5aW5nIGNvbnRleHQubWV0aG9kIGFuZCBjb250ZXh0LmFyZyxcbiAgLy8gc2V0dGluZyBjb250ZXh0LmRlbGVnYXRlIHRvIG51bGwsIGFuZCByZXR1cm5pbmcgdGhlIENvbnRpbnVlU2VudGluZWwuXG4gIGZ1bmN0aW9uIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgbWV0aG9kID0gZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdO1xuICAgIGlmIChtZXRob2QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gQSAudGhyb3cgb3IgLnJldHVybiB3aGVuIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgbm8gLnRocm93XG4gICAgICAvLyBtZXRob2QgYWx3YXlzIHRlcm1pbmF0ZXMgdGhlIHlpZWxkKiBsb29wLlxuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIC8vIE5vdGU6IFtcInJldHVyblwiXSBtdXN0IGJlIHVzZWQgZm9yIEVTMyBwYXJzaW5nIGNvbXBhdGliaWxpdHkuXG4gICAgICAgIGlmIChkZWxlZ2F0ZS5pdGVyYXRvcltcInJldHVyblwiXSkge1xuICAgICAgICAgIC8vIElmIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgYSByZXR1cm4gbWV0aG9kLCBnaXZlIGl0IGFcbiAgICAgICAgICAvLyBjaGFuY2UgdG8gY2xlYW4gdXAuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuXG4gICAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIC8vIElmIG1heWJlSW52b2tlRGVsZWdhdGUoY29udGV4dCkgY2hhbmdlZCBjb250ZXh0Lm1ldGhvZCBmcm9tXG4gICAgICAgICAgICAvLyBcInJldHVyblwiIHRvIFwidGhyb3dcIiwgbGV0IHRoYXQgb3ZlcnJpZGUgdGhlIFR5cGVFcnJvciBiZWxvdy5cbiAgICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgXCJUaGUgaXRlcmF0b3IgZG9lcyBub3QgcHJvdmlkZSBhICd0aHJvdycgbWV0aG9kXCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2gobWV0aG9kLCBkZWxlZ2F0ZS5pdGVyYXRvciwgY29udGV4dC5hcmcpO1xuXG4gICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG5cbiAgICBpZiAoISBpbmZvKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcIml0ZXJhdG9yIHJlc3VsdCBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAvLyBBc3NpZ24gdGhlIHJlc3VsdCBvZiB0aGUgZmluaXNoZWQgZGVsZWdhdGUgdG8gdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gdmFyaWFibGUgc3BlY2lmaWVkIGJ5IGRlbGVnYXRlLnJlc3VsdE5hbWUgKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuXG4gICAgICAvLyBSZXN1bWUgZXhlY3V0aW9uIGF0IHRoZSBkZXNpcmVkIGxvY2F0aW9uIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0Lm5leHQgPSBkZWxlZ2F0ZS5uZXh0TG9jO1xuXG4gICAgICAvLyBJZiBjb250ZXh0Lm1ldGhvZCB3YXMgXCJ0aHJvd1wiIGJ1dCB0aGUgZGVsZWdhdGUgaGFuZGxlZCB0aGVcbiAgICAgIC8vIGV4Y2VwdGlvbiwgbGV0IHRoZSBvdXRlciBnZW5lcmF0b3IgcHJvY2VlZCBub3JtYWxseS4gSWZcbiAgICAgIC8vIGNvbnRleHQubWV0aG9kIHdhcyBcIm5leHRcIiwgZm9yZ2V0IGNvbnRleHQuYXJnIHNpbmNlIGl0IGhhcyBiZWVuXG4gICAgICAvLyBcImNvbnN1bWVkXCIgYnkgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yLiBJZiBjb250ZXh0Lm1ldGhvZCB3YXNcbiAgICAgIC8vIFwicmV0dXJuXCIsIGFsbG93IHRoZSBvcmlnaW5hbCAucmV0dXJuIGNhbGwgdG8gY29udGludWUgaW4gdGhlXG4gICAgICAvLyBvdXRlciBnZW5lcmF0b3IuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgIT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmUteWllbGQgdGhlIHJlc3VsdCByZXR1cm5lZCBieSB0aGUgZGVsZWdhdGUgbWV0aG9kLlxuICAgICAgcmV0dXJuIGluZm87XG4gICAgfVxuXG4gICAgLy8gVGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGlzIGZpbmlzaGVkLCBzbyBmb3JnZXQgaXQgYW5kIGNvbnRpbnVlIHdpdGhcbiAgICAvLyB0aGUgb3V0ZXIgZ2VuZXJhdG9yLlxuICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICB9XG5cbiAgLy8gRGVmaW5lIEdlbmVyYXRvci5wcm90b3R5cGUue25leHQsdGhyb3cscmV0dXJufSBpbiB0ZXJtcyBvZiB0aGVcbiAgLy8gdW5pZmllZCAuX2ludm9rZSBoZWxwZXIgbWV0aG9kLlxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoR3ApO1xuXG4gIEdwW3RvU3RyaW5nVGFnU3ltYm9sXSA9IFwiR2VuZXJhdG9yXCI7XG5cbiAgLy8gQSBHZW5lcmF0b3Igc2hvdWxkIGFsd2F5cyByZXR1cm4gaXRzZWxmIGFzIHRoZSBpdGVyYXRvciBvYmplY3Qgd2hlbiB0aGVcbiAgLy8gQEBpdGVyYXRvciBmdW5jdGlvbiBpcyBjYWxsZWQgb24gaXQuIFNvbWUgYnJvd3NlcnMnIGltcGxlbWVudGF0aW9ucyBvZiB0aGVcbiAgLy8gaXRlcmF0b3IgcHJvdG90eXBlIGNoYWluIGluY29ycmVjdGx5IGltcGxlbWVudCB0aGlzLCBjYXVzaW5nIHRoZSBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0IHRvIG5vdCBiZSByZXR1cm5lZCBmcm9tIHRoaXMgY2FsbC4gVGhpcyBlbnN1cmVzIHRoYXQgZG9lc24ndCBoYXBwZW4uXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVnZW5lcmF0b3IvaXNzdWVzLzI3NCBmb3IgbW9yZSBkZXRhaWxzLlxuICBHcFtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KHRydWUpO1xuICB9XG5cbiAgZXhwb3J0cy5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIGV4cG9ydHMudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oc2tpcFRlbXBSZXNldCkge1xuICAgICAgdGhpcy5wcmV2ID0gMDtcbiAgICAgIHRoaXMubmV4dCA9IDA7XG4gICAgICAvLyBSZXNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgIHRoaXMuc2VudCA9IHRoaXMuX3NlbnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICBpZiAoIXNraXBUZW1wUmVzZXQpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzKSB7XG4gICAgICAgICAgLy8gTm90IHN1cmUgYWJvdXQgdGhlIG9wdGltYWwgb3JkZXIgb2YgdGhlc2UgY29uZGl0aW9uczpcbiAgICAgICAgICBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwidFwiICYmXG4gICAgICAgICAgICAgIGhhc093bi5jYWxsKHRoaXMsIG5hbWUpICYmXG4gICAgICAgICAgICAgICFpc05hTigrbmFtZS5zbGljZSgxKSkpIHtcbiAgICAgICAgICAgIHRoaXNbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgdmFyIHJvb3RFbnRyeSA9IHRoaXMudHJ5RW50cmllc1swXTtcbiAgICAgIHZhciByb290UmVjb3JkID0gcm9vdEVudHJ5LmNvbXBsZXRpb247XG4gICAgICBpZiAocm9vdFJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcm9vdFJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJ2YWw7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoRXhjZXB0aW9uOiBmdW5jdGlvbihleGNlcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHtcbiAgICAgICAgcmVjb3JkLnR5cGUgPSBcInRocm93XCI7XG4gICAgICAgIHJlY29yZC5hcmcgPSBleGNlcHRpb247XG4gICAgICAgIGNvbnRleHQubmV4dCA9IGxvYztcblxuICAgICAgICBpZiAoY2F1Z2h0KSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRpc3BhdGNoZWQgZXhjZXB0aW9uIHdhcyBjYXVnaHQgYnkgYSBjYXRjaCBibG9jayxcbiAgICAgICAgICAvLyB0aGVuIGxldCB0aGF0IGNhdGNoIGJsb2NrIGhhbmRsZSB0aGUgZXhjZXB0aW9uIG5vcm1hbGx5LlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gISEgY2F1Z2h0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gXCJyb290XCIpIHtcbiAgICAgICAgICAvLyBFeGNlcHRpb24gdGhyb3duIG91dHNpZGUgb2YgYW55IHRyeSBibG9jayB0aGF0IGNvdWxkIGhhbmRsZVxuICAgICAgICAgIC8vIGl0LCBzbyBzZXQgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgdGhlIGVudGlyZSBmdW5jdGlvbiB0b1xuICAgICAgICAgIC8vIHRocm93IHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZShcImVuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7XG4gICAgICAgICAgdmFyIGhhc0NhdGNoID0gaGFzT3duLmNhbGwoZW50cnksIFwiY2F0Y2hMb2NcIik7XG4gICAgICAgICAgdmFyIGhhc0ZpbmFsbHkgPSBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpO1xuXG4gICAgICAgICAgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhYnJ1cHQ6IGZ1bmN0aW9uKHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmXG4gICAgICAgICAgICB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgIHR5cGUgPT09IFwiY29udGludWVcIikgJiZcbiAgICAgICAgICBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJlxuICAgICAgICAgIGFyZyA8PSBmaW5hbGx5RW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAvLyBJZ25vcmUgdGhlIGZpbmFsbHkgZW50cnkgaWYgY29udHJvbCBpcyBub3QganVtcGluZyB0byBhXG4gICAgICAgIC8vIGxvY2F0aW9uIG91dHNpZGUgdGhlIHRyeS9jYXRjaCBibG9jay5cbiAgICAgICAgZmluYWxseUVudHJ5ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlY29yZCA9IGZpbmFsbHlFbnRyeSA/IGZpbmFsbHlFbnRyeS5jb21wbGV0aW9uIDoge307XG4gICAgICByZWNvcmQudHlwZSA9IHR5cGU7XG4gICAgICByZWNvcmQuYXJnID0gYXJnO1xuXG4gICAgICBpZiAoZmluYWxseUVudHJ5KSB7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIHRoaXMubmV4dCA9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jO1xuICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICB9LFxuXG4gICAgY29tcGxldGU6IGZ1bmN0aW9uKHJlY29yZCwgYWZ0ZXJMb2MpIHtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgcmVjb3JkLnR5cGUgPT09IFwiY29udGludWVcIikge1xuICAgICAgICB0aGlzLm5leHQgPSByZWNvcmQuYXJnO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICB0aGlzLnJ2YWwgPSB0aGlzLmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gXCJlbmRcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIgJiYgYWZ0ZXJMb2MpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gYWZ0ZXJMb2M7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uKGZpbmFsbHlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykge1xuICAgICAgICAgIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZVxuICAvLyBvciBub3QsIHJldHVybiB0aGUgcnVudGltZSBvYmplY3Qgc28gdGhhdCB3ZSBjYW4gZGVjbGFyZSB0aGUgdmFyaWFibGVcbiAgLy8gcmVnZW5lcmF0b3JSdW50aW1lIGluIHRoZSBvdXRlciBzY29wZSwgd2hpY2ggYWxsb3dzIHRoaXMgbW9kdWxlIHRvIGJlXG4gIC8vIGluamVjdGVkIGVhc2lseSBieSBgYmluL3JlZ2VuZXJhdG9yIC0taW5jbHVkZS1ydW50aW1lIHNjcmlwdC5qc2AuXG4gIHJldHVybiBleHBvcnRzO1xuXG59KFxuICAvLyBJZiB0aGlzIHNjcmlwdCBpcyBleGVjdXRpbmcgYXMgYSBDb21tb25KUyBtb2R1bGUsIHVzZSBtb2R1bGUuZXhwb3J0c1xuICAvLyBhcyB0aGUgcmVnZW5lcmF0b3JSdW50aW1lIG5hbWVzcGFjZS4gT3RoZXJ3aXNlIGNyZWF0ZSBhIG5ldyBlbXB0eVxuICAvLyBvYmplY3QuIEVpdGhlciB3YXksIHRoZSByZXN1bHRpbmcgb2JqZWN0IHdpbGwgYmUgdXNlZCB0byBpbml0aWFsaXplXG4gIC8vIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgdmFyaWFibGUgYXQgdGhlIHRvcCBvZiB0aGlzIGZpbGUuXG4gIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgPyBtb2R1bGUuZXhwb3J0cyA6IHt9XG4pKTtcblxudHJ5IHtcbiAgcmVnZW5lcmF0b3JSdW50aW1lID0gcnVudGltZTtcbn0gY2F0Y2ggKGFjY2lkZW50YWxTdHJpY3RNb2RlKSB7XG4gIC8vIFRoaXMgbW9kdWxlIHNob3VsZCBub3QgYmUgcnVubmluZyBpbiBzdHJpY3QgbW9kZSwgc28gdGhlIGFib3ZlXG4gIC8vIGFzc2lnbm1lbnQgc2hvdWxkIGFsd2F5cyB3b3JrIHVubGVzcyBzb21ldGhpbmcgaXMgbWlzY29uZmlndXJlZC4gSnVzdFxuICAvLyBpbiBjYXNlIHJ1bnRpbWUuanMgYWNjaWRlbnRhbGx5IHJ1bnMgaW4gc3RyaWN0IG1vZGUsIHdlIGNhbiBlc2NhcGVcbiAgLy8gc3RyaWN0IG1vZGUgdXNpbmcgYSBnbG9iYWwgRnVuY3Rpb24gY2FsbC4gVGhpcyBjb3VsZCBjb25jZWl2YWJseSBmYWlsXG4gIC8vIGlmIGEgQ29udGVudCBTZWN1cml0eSBQb2xpY3kgZm9yYmlkcyB1c2luZyBGdW5jdGlvbiwgYnV0IGluIHRoYXQgY2FzZVxuICAvLyB0aGUgcHJvcGVyIHNvbHV0aW9uIGlzIHRvIGZpeCB0aGUgYWNjaWRlbnRhbCBzdHJpY3QgbW9kZSBwcm9ibGVtLiBJZlxuICAvLyB5b3UndmUgbWlzY29uZmlndXJlZCB5b3VyIGJ1bmRsZXIgdG8gZm9yY2Ugc3RyaWN0IG1vZGUgYW5kIGFwcGxpZWQgYVxuICAvLyBDU1AgdG8gZm9yYmlkIEZ1bmN0aW9uLCBhbmQgeW91J3JlIG5vdCB3aWxsaW5nIHRvIGZpeCBlaXRoZXIgb2YgdGhvc2VcbiAgLy8gcHJvYmxlbXMsIHBsZWFzZSBkZXRhaWwgeW91ciB1bmlxdWUgcHJlZGljYW1lbnQgaW4gYSBHaXRIdWIgaXNzdWUuXG4gIEZ1bmN0aW9uKFwiclwiLCBcInJlZ2VuZXJhdG9yUnVudGltZSA9IHJcIikocnVudGltZSk7XG59XG4iXX0=
