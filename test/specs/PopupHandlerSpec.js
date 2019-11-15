import { Defaults } from './../../app/defaults.js';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const file = path.join(__dirname, '../../app/popup_page/popup.html');
const options = {
  resources: 'usable',
  runScripts: 'dangerously'
};


describe('PopUp Services ()', () => {

  const defaults = new Defaults();
  let document;
  let window;


  beforeAll(async () => {
    await JSDOM.fromFile(file, options).then(dom => {
      window = dom.window;
      document = window.document;
    });

//hook into the main class to make sure it has loaded
    return new Promise(resolve => {
      const DOMLoadedInterval = setInterval(() => {
        if (window._App) {
          clearInterval(DOMLoadedInterval);

//give more time for _App.init to register all handlers
          setTimeout(() => {
            resolve();
          }, 1000);

        }
      }, 300);
    })
  });


  afterAll(() => {
    window.close();
  });


  it('should return a checeked checkbox aggregateResultCBHandler()', async () => {
    const checkboxLabel = document.querySelector('#aggregate-label');
    const checkbox = document.querySelector('#aggregate-checkbox');

    expect(checkboxLabel.textContent).toBe('Yes');
    expect(checkbox.checked).toBeTrue();

    checkbox.click();

    return new Promise(resolve => {
      setTimeout(() => {
        expect(checkboxLabel.innerText).toBe('No');
        expect(checkbox.checked).toBeFalse();
        resolve();
      }, 1000);
    });
  });


  it('should call savePreferences() when listings limit is changed', async () => {
    const savePrefSpy = spyOn(window._App._model, 'savePreferences').and.resolveTo('');
    const event = {
      target: {
        value: '10'
      }
    };
    await window._App._handlers.listingsLimitHandler(event);
    expect(savePrefSpy).toHaveBeenCalled();

  });


  it('should fire _model functions savePreferences and setAlarm when frequency changes', async () => {
    const savePrefSpy = spyOn(window._App._model, 'savePreferences').and.resolveTo('');
    const alarmSpy = spyOn(window._App._model, 'setAlarm').and.resolveTo('');
    const event = {
      target: {
        value : '1'
      }
    };
    await window._App._handlers.frequencyChangeHandler(event);
    expect(savePrefSpy).toHaveBeenCalled();
    expect(alarmSpy).toHaveBeenCalled();
  });


  it('should set and perform a translateX transform on the settings page settingsHandler()', async () => {
    const settingsButton = document.querySelector('#nav-links').children[1];
    const backButton = document.getElementsByClassName('nav-back')[0];
    const settingsPage = document.querySelector('#settings-page');

    expect(settingsPage.style.transform).toBe('');
    expect(backButton.className).toMatch(/hide/);

    const event = {
      target: settingsButton
    };
    await window._App._handlers.settingsHandler(event);

    return new Promise(resolve => {
//allow the animation to be performed
      setTimeout(() => {
        expect(settingsButton.src).toMatch(/active/);
        expect(settingsPage.style.transform).toMatch(/translateX/);
        expect(backButton.className).not.toMatch(/hide/);
        resolve();
      }, 1000);
    });
  });


  it('should return false when unchecking first website jobSitesCheckboxHandler()', async () => {
    const jobSites = document.querySelectorAll('.job-sites');
    jobSites[0].click();
    expect(jobSites[0].checked).toBeFalse();
    expect(jobSites[1].checked).toBeTrue();
  });

});
