import Helper from '../../src/scripts/helper.js';

describe('Helper Functions', () => {

  const helper = new Helper();
  const oldListings = [
    {name: 'comp1', link: 'www.indeed.com/link1', date: 'TODAY'},
    {name: 'comp2', link: 'www.indeed.com/link2', date: '2 Days ago'},
    {name: 'comp3', link: 'www.indeed.com/link3', date: '30+ days ago'}
  ];

  it('should append and update new listings to old ones', () => {
    const newListing = [
      {name: 'comp1', link: 'www.indeed.com/link1', date: '1 day ago'},
      {name: 'comp2', link: 'www.indeed.com/link2', date: '3 Days ago'},
      {name: 'comp3', link: 'www.indeed.com/link3', date: '30+ days ago'},
      {name: 'comp4', link: 'www.indeed.com/link4', date: 'TODAY'},
    ];
    const newCount = helper.findNewListings(newListing, oldListings);
    expect(newCount).toEqual(1);
    expect(oldListings.length).toEqual(4);
  })

  it('should sort in descending', () => {
    const sortedListing = helper.sortListings(oldListings);
    expect(sortedListing[0].name).toBe('comp4');
    expect(sortedListing[sortedListing.length - 1].name).toBe('comp3');
  })
})
