import {Selector} from 'testcafe';

const url = 'http://localhost:3000';
 console.count("If you are working with react client change port for the one react is using.");

fixture `Home Page`
  .page `${url}`;

test('Link Vide Courses', async t => {
  await t
    .click('#videos')
    .expect(
      Selector('#title').find('h2').innerText
    ).eql('Video Courses');
});

test('Link Concert Tickets', async t => {
  await t
    .click('#concert')
    .expect(
      Selector('#headline').innerText
    ).eql('Annual Spring Academy Concert');
});

test('Link Lessons', async t => {
  await t
    .click('#lessons')
    .expect(
      Selector('#title').find('h2').innerText
    ).eql('Guitar lessons');
});

fixture `Video Courses`
  .page `${url}/videos`;

test('Video Courses', async t => {
  await t.click('#banjo');
  await t.typeText('#name', 'Test Name');
  await t.typeText('#email', 'test@mail.com');
  let name = await Selector('#name').value;
  let email = await Selector('#email').value;
  await t.expect(name).eql('Test Name');
  await t.expect(email).eql('test@mail.com');

});


fixture `Concert Tickets`
  .page `${url}/concert`;

test('Concert Tickets', async t => {
  await t.click('#add');
  await t.click('#add');
  await t.click('#add');
  await t.click('#subtract');
  let quantity = await Selector('#quantity-input').value;
  await t.expect(quantity).eql('3');

});

fixture `Music Lessons`
  .page `${url}/lessons`;

test('Music Lessons', async t => {
  await t.click('#first');
  await t.typeText('#name', 'Test Name');
  await t.typeText('#email', 'test@mail.com');
  let name = await Selector('#name').value;
  let email = await Selector('#email').value;
  await t.expect(name).eql('Test Name');
  await t.expect(email).eql('test@mail.com');

});