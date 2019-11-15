import { Defaults } from './../../app/defaults.js';
import { Model } from './../../app/model.js';
import Services from '../../app/popup_page/popupServices.js';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const file = path.join(__dirname, '../../app/popup_page/popup.html');
const options = {
  resources: 'usable',
  runScripts: 'dangerously'
};


describe('PopUp Services ()', () => {

/* *
 * Instantiate all required classes to unit test individual functions
 * JSDOM needed to test certain function which rely on the DOM
 * */
  const defaults = new Defaults();
  const model = new Model(defaults);
  const services = new Services(defaults, model);
  let document;
  let window;
  let listings;


  beforeAll(async () => {
    await JSDOM.fromFile(file, options).then(dom => {
      window = dom.window;
      document = dom.window.document;
    });

//hook into the main class to make sure the script has loaded
    return new Promise(resolve => {
      const DOMLoadedInterval = setInterval(() => {
        if (window._App) {
          clearInterval(DOMLoadedInterval);
          resolve();
        }
      }, 300);
    })
  });


  beforeEach(async () => {
    listings = [
      {name: 'comp1', link: 'www.indeed.com/link1', date: '1 day ago', last_updated: new Date().getTime()},
      {name: 'comp2', link: 'www.indeed.com/link2', date: '3 Days ago', saved: true},
      {name: 'comp3', link: 'www.indeed.com/link3', date: '30+ days ago', saved: true},
      {name: 'comp4', link: 'www.indeed.com/link4', date: 'TODAY'},
    ];
    spyOn(model, 'jobListings').and.resolveTo(listings);
  });


  it('should edit specified bookmark in editSavedListings', async () => {
    spyOn(model, 'saveListings'); //ignore this func

    await services.editSavedListings('www.indeed.com/link2', true)
    expect(listings[1].saved).toBeFalse();

    await services.editSavedListings('www.indeed.com/link4', false)
    expect(listings[3].saved).toBeTrue();
  });


  it('should return only saved listings from getCurrentListings()', () => {
    const bookmarkFilter = document.querySelector('.saved-listings');

    bookmarkFilter.addEventListener('click', function _listener(event) {
      event.target.removeEventListener('click', _listener);
      services.getCurrentListings(event).then(filtered => {
        expect(filtered.length).toEqual(2);
      });
    });

    bookmarkFilter.click();
  });


  it('should return all listings from getCurrentListings()', () => {
    const bookmarkFilter = document.querySelector('.saved-listings');
    bookmarkFilter.children[0].src = 'icons/icons8-book-active-50.png';

    bookmarkFilter.addEventListener('click', function _listener(event) {
      event.target.removeEventListener('click', _listener);
      services.getCurrentListings(event).then(filtered => {
//filtered is an array [listings, startingIndex]
        expect(filtered[0].length).toEqual(4);
      });
    });

    bookmarkFilter.click();
  });


  it('should return the last_updated from the DOM element', () => {
    const lastUpdatedDiv = document.querySelector('#last-updated');
    window._App.setLastUpdated(listings[0]);
    const date = new Date(listings[0].last_updated).toLocaleDateString();
    const re = new RegExp(date, 'gi');
    expect(lastUpdatedDiv.textContent).not.toBe('');
    expect(lastUpdatedDiv.textContent).toMatch(re);
  });


  it('should return settings height to be set dynamically', () => {
//JSDOM "element.style" will only be set if the style is set inline
    const settingsPage = document.querySelector('#settings-page');
    expect(settingsPage.style.height).toBe('');
    window._App.setSettingsHeight();
    expect(settingsPage.style.height).not.toBe('');
  });

  it('should return 4 populated listings on the page', () => {
    const listingsUL = document.getElementById('listings');
    window._App.populateListings(listings, 0);
    expect(listingsUL.children.length).toBe(4);
  });

});
