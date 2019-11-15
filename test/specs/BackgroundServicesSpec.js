import { Defaults } from './../../app/defaults.js';
import { Model } from './../../app/model.js';
import Services from '../../app/background/backgroundServices.js';

describe('Background Services ()', () => {

  const defaults = new Defaults();
  const model = new Model(defaults);
  const services = new Services(defaults, model);

  const oldListings = [
    {name: 'comp1', link: 'www.indeed.com/link1', date: 'TODAY'},
    {name: 'comp2', link: 'www.indeed.com/link2', date: '2 Days ago'},
    {name: 'comp3', link: 'www.indeed.com/link3', date: '30+ days ago'}
  ];
  const newListings = [
    {name: 'comp1', link: 'www.indeed.com/link1', date: '1 day ago'},
    {name: 'comp2', link: 'www.indeed.com/link2', date: '3 Days ago'},
    {name: 'comp3', link: 'www.indeed.com/link3', date: '30+ days ago'},
    {name: 'comp4', link: 'www.indeed.com/link4', date: 'TODAY'},
  ];


  it('should call processReturnedListings() and all child async functions', async () => {

    spyOn(services, 'processReturnedListings').and.callThrough();
    spyOn(model, 'jobListings').and.resolveTo(oldListings);
    spyOn(services, 'findNewListings').and.returnValue(1);
    spyOn(model, 'newListingsCount').and.resolveTo(6);
    spyOn(model, 'saveNewListingsCount');
    spyOn(model, 'openTabCounter').and.resolveTo(0);
    spyOn(services, 'sortListings').and.returnValue(null);
    spyOn(model, 'saveListings');
    spyOn(services, 'messageToPopup');

    await services.processReturnedListings(newListings)

    expect(services.processReturnedListings).toHaveBeenCalled();
    expect(model.jobListings).toHaveBeenCalled();
    expect(services.findNewListings).toHaveBeenCalled();
    expect(model.newListingsCount).toHaveBeenCalled();
    expect(model.saveNewListingsCount).toHaveBeenCalled();
    expect(model.openTabCounter).toHaveBeenCalled();
    expect(model.saveListings).toHaveBeenCalled();
    expect(services.sortListings).toHaveBeenCalled();
    expect(services.messageToPopup).toHaveBeenCalled();

  })
  

  it('should properly format and return dates', () => {
//possible values for dates when job listings were uploaded
    const randomDates = {
      'today': new Date().getTime(),
      'TODAY': new Date().getTime(),
      '2019-12-12': new Date('2019-12-12').getTime(),
      '30+ days ago': new Date().getTime() - (30 * 60000 * 60 * 24),
      '5 hours ago': new Date().getTime() - (5 * 60000 * 60),
      '4 months ago': new Date().getTime() - (4 * 60000 * 60 * 24 * 7 * 4),
      '8 weeks ago': new Date().getTime() - (8 * 60000 * 60 * 24 * 7)
    };

//divide timestamps by 1000 in order to provide a percision in toBeCloseTo(obj, percision)
    Object.entries(randomDates).forEach( ( [key, value] ) => {
      const formattedDate = services.formatDate(key) / 1000;
      expect(formattedDate).toBeCloseTo(value / 1000, 1);
    });
  })


  it('should append and update new listings to old ones', () => {
    const newCount = services.findNewListings(newListings, oldListings);
    expect(newCount).toEqual(1);
    expect(oldListings.length).toEqual(4);
  })


//order of "it" execution not guaranteed...newListings should be used
  it('should sort in descending order', () => {
    const sortedListing = services.sortListings(newListings);
    expect(sortedListing[0].name).toBe('comp4');
    expect(sortedListing[sortedListing.length - 1].name).toBe('comp3');
  })
})
