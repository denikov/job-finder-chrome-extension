import Helper from '../../src/scripts/helper.js';

describe('Helper Functions', () => {

  const helper = new Helper();
  const newListings = [
    {name: 'comp1', link: 'www.indeed.com/link1', date: '1 day ago'},
    {name: 'comp2', link: 'www.indeed.com/link2', date: '3 Days ago'},
    {name: 'comp3', link: 'www.indeed.com/link3', date: '30+ days ago'},
    {name: 'comp4', link: 'www.indeed.com/link4', date: 'TODAY'},
  ];

  it('should append and update new listings to old ones', () => {
    const oldListings = [
      {name: 'comp1', link: 'www.indeed.com/link1', date: 'TODAY'},
      {name: 'comp2', link: 'www.indeed.com/link2', date: '2 Days ago'},
      {name: 'comp3', link: 'www.indeed.com/link3', date: '30+ days ago'}
    ];
    const newCount = helper.findNewListings(newListings, oldListings);
    expect(newCount).toEqual(1);
    expect(oldListings.length).toEqual(4);
  })

//order of "it" execution not guaranteed...newListings should be used
  it('should sort in descending order', () => {
    const sortedListing = helper.sortListings(newListings);
    expect(sortedListing[0].name).toBe('comp4');
    expect(sortedListing[sortedListing.length - 1].name).toBe('comp3');
  })
})
