import { Selector, t } from "testcafe";

const frontendPort = "3000"; // or 3000
const url = "http://localhost:" + frontendPort;
console.count(
  "If you are working with react client change port for the one react is using."
);

async function inputCardData(
  cardElementSelector,
  { cardNumber, cardExpiry, cardCVC, postalCode }
) {
  await t
    .switchToIframe(Selector(cardElementSelector).find("iframe"))
    .typeText(".CardField-number", cardNumber)
    .typeText(".CardField-expiry", cardExpiry)
    .typeText(".CardField-cvc", cardCVC)
    .typeText(".CardField-postalCode", postalCode)
    .switchToMainWindow();
}

async function cleanAndInputCardData(
  cardElementSelector,
  { cardNumber, cardExpiry, cardCVC, postalCode }
) {
  await t
    .switchToIframe(Selector(cardElementSelector).find("iframe"))
    .click(".CardField-number")
    .pressKey("ctrl+a delete")
    .typeText(".CardField-number", cardNumber)
    .typeText(".CardField-expiry", cardExpiry)
    .typeText(".CardField-cvc", cardCVC)
    .typeText(".CardField-postalCode", postalCode)
    .switchToMainWindow();
}

async function complete3DSAuth(success = true) {
  const button = success
    ? "#test-source-authorize-3ds"
    : "#test-source-fail-3ds";
  await t
    .wait(2000)
    .switchToIframe(Selector("body").find("iframe"))
    .wait(2000)
    .switchToIframe(Selector("iframe"))
    .wait(2000)
    .switchToIframe(Selector("iframe"))
    .click(button)
    .wait(2000)
    .switchToMainWindow();
}

fixture`Video Courses`
  .page`${url}/videos`;

test("Video Courses successful payment", async (t) => {
  await t.click("#guitar");
  let randomizedName = "Test Name " + Math.floor(Math.random() * 10000);
  let randomEmail = `test-${Math.floor(
    Math.random() * 10000
  )}@mail-${Math.floor(Math.random() * 10000)}.com`;
  await t.typeText("#name", randomizedName);
  await t.typeText("#email", randomEmail);
  let name = await Selector("#name").value;
  let email = await Selector("#email").value;
  await t.expect(name).eql(randomizedName);
  await t.expect(email).eql(randomEmail);

  await inputCardData("#card-element", {
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.click("#submit").wait(4000);

  let orderStatus = await Selector("#order-status").innerText;
  await t.expect(orderStatus).contains("Thank you for your order!");
});

test("Video Courses successful payment 3DS", async (t) => {
  await t.click("#guitar");
  let randomizedName = "Test Name " + Math.floor(Math.random() * 10000);
  let randomEmail = `test-${Math.floor(
    Math.random() * 10000
  )}@mail-${Math.floor(Math.random() * 10000)}.com`;
  await t.typeText("#name", randomizedName);
  await t.typeText("#email", randomEmail);
  let name = await Selector("#name").value;
  let email = await Selector("#email").value;
  await t.expect(name).eql(randomizedName);
  await t.expect(email).eql(randomEmail);

  await inputCardData("#card-element", {
    cardNumber: "4000 0027 6000 3184",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.click("#submit").wait(4000);

  await complete3DSAuth(true);

  let orderStatus = await Selector("#order-status").innerText;
  await t.expect(orderStatus).contains("Thank you for your order!");
});

fixture`Video Courses payment errors`
  .page`${url}/videos`;

test("Video Courses rejected payment", async (t) => {
  await t.click("#guitar");
  let randomizedName = "Test Name " + Math.floor(Math.random() * 10000);
  let randomEmail = `test-${Math.floor(
    Math.random() * 10000
  )}@mail-${Math.floor(Math.random() * 10000)}.com`;
  await t.typeText("#name", randomizedName);
  await t.typeText("#email", randomEmail);
  let name = await Selector("#name").value;
  let email = await Selector("#email").value;
  await t.expect(name).eql(randomizedName);
  await t.expect(email).eql(randomEmail);

  await inputCardData("#card-element", {
    cardNumber: "4000 0000 0000 0002",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.click("#submit").wait(4000);
  let declinedMessage = await Selector("#name-errors").innerText;
  await t.expect(declinedMessage).contains("declined");
});

test("Video Courses rejected payment 3DS", async (t) => {
  await t.click("#guitar");
  let randomizedName = "Test Name " + Math.floor(Math.random() * 10000);
  let randomEmail = `test-${Math.floor(
    Math.random() * 10000
  )}@mail-${Math.floor(Math.random() * 10000)}.com`;
  await t.typeText("#name", randomizedName);
  await t.typeText("#email", randomEmail);
  let name = await Selector("#name").value;
  let email = await Selector("#email").value;
  await t.expect(name).eql(randomizedName);
  await t.expect(email).eql(randomEmail);

  await inputCardData("#card-element", {
    cardNumber: "4000 0027 6000 3184",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.click("#submit").wait(4000);
  await complete3DSAuth(false);
  let declinedMessage = await Selector("#name-errors").innerText;
  //await t.expect(declinedMessage).contains("Payment failed");
  await t.expect(declinedMessage).contains("unable to authenticate"); // changed above assertion as per stripe error message
});

test("Video Courses rejected allows retry", async (t) => {
  await t.click("#guitar");
  let randomizedName = "Test Name " + Math.floor(Math.random() * 10000);
  let randomEmail = `test-${Math.floor(
    Math.random() * 10000
  )}@mail-${Math.floor(Math.random() * 10000)}.com`;
  await t.typeText("#name", randomizedName);
  await t.typeText("#email", randomEmail);
  let name = await Selector("#name").value;
  let email = await Selector("#email").value;
  await t.expect(name).eql(randomizedName);
  await t.expect(email).eql(randomEmail);

  await inputCardData("#card-element", {
    cardNumber: "4000 0000 0000 0002",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.click("#submit").wait(4000);
  let declinedMessage = await Selector("#name-errors").innerText;
  await t.expect(declinedMessage).contains("declined");
  await cleanAndInputCardData("#card-element", {
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });
  await t.click("#submit").wait(3000);
  let orderStatus = await Selector("#order-status").innerText;
  await t.expect(orderStatus).contains("Thank you for your order!");
});

fixture`Video Courses input validation`
  .page`${url}/videos`;

test("Video Courses email required", async (t) => {
  await t.click("#guitar");
  let randomizedName = "Test Name " + Math.floor(Math.random() * 10000);
  await t.typeText("#name", randomizedName);
  let name = await Selector("#name").value;
  await t.expect(name).eql(randomizedName);

  await inputCardData("#card-element", {
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.expect(Selector("#submit").hasAttribute("disabled")).ok();
});

test("Video Courses name required", async (t) => {
  await t.click("#guitar");
  let randomizedName = "Test Name " + Math.floor(Math.random() * 10000);
  await t.typeText("#name", randomizedName);
  let name = await Selector("#name").value;
  await t.expect(name).eql(randomizedName);

  await inputCardData("#card-element", {
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });
  await t.expect(Selector("#submit").hasAttribute("disabled")).ok();
});
