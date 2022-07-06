import { Selector, t } from "testcafe";

const frontendPort = "3000"; // or 3000
const url = "http://localhost:" + frontendPort;
console.count(
  "If you are working with React client change port for the one Frontend is using."
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

fixture`Lessons Booking with *4242 card`
  .page`${url}/lessons`;

test("Lessons Booking", async (t) => {
  const randomEmail = `lessons-test-${Math.floor(
    Math.random() * 10000
  )}@mail${Math.floor(Math.random() * 10000)}.com`;
  await t.click("#first");
  await t.click("#second");
  await t.typeText("#name", "Lessons Test Name");
  await t.typeText("#email", randomEmail);

  let name = await Selector("#name").value;
  let email = await Selector("#email").value;
  await t.expect(name).eql("Lessons Test Name");
  await t.expect(email).eql(randomEmail);

  await inputCardData(".lesson-card-element", {
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.click("#submit").wait(4000);

  let signUpStatus = await Selector("#signup-status");
  await t
    .expect(signUpStatus.innerText)
    .contains("They are going to call you the shredder");
  console.log(" Success message after signup");

  let last4 = await Selector("#last4");
  await t.expect(last4.textContent).contains("4242");
  console.log(" Success message includes last4 numbers of card");
});

fixture`Lessons Booking with *3184 and 3DS secure card`
  .page`${url}/lessons`;

test("Lessons Booking succesfully after 3DS", async (t) => {
  const randomEmail = `lessons-test-${Math.floor(
    Math.random() * 10000
  )}@mail${Math.floor(Math.random() * 10000)}.com`;
  await t.click("#first");
  await t.click("#second");
  await t.typeText("#name", "Lessons Test Name");
  await t.typeText("#email", randomEmail);

  let name = await Selector("#name").value;
  let email = await Selector("#email").value;
  await t.expect(name).eql("Lessons Test Name");
  await t.expect(email).eql(randomEmail);

  await inputCardData(".lesson-card-element", {
    cardNumber: "4000 0027 6000 3184",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.click("#submit").wait(2000);

  await complete3DSAuth(true);
  let signUpStatus = await Selector("#signup-status");
  await t
    .expect(signUpStatus.innerText)
    .contains("They are going to call you the shredder");
  console.log(" Success message after signup");

  let last4 = await Selector("#last4");
  await t.expect(last4.textContent).contains("3184");
  console.log(" Success message includes last4 numbers of card");
});

fixture`Lessons Booking with failing card`
  .page`${url}/lessons`;

test("Lessons Booking failing", async (t) => {
  const randomEmail = `lessons-test-${Math.floor(
    Math.random() * 10000
  )}@mail${Math.floor(Math.random() * 10000)}.com`;
  await t.click("#first");
  await t.click("#second");
  await t.typeText("#name", "Lessons Test Name");
  await t.typeText("#email", randomEmail);

  let name = await Selector("#name").value;
  let email = await Selector("#email").value;
  await t.expect(name).eql("Lessons Test Name");
  await t.expect(email).eql(randomEmail);

  await inputCardData(".lesson-card-element", {
    cardNumber: "4000 0000 0000 0002",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.click("#submit").wait(4000);

  let signUpStatus = await Selector("#card-errors");
  await t.expect(signUpStatus.innerText).contains("declined");
  console.log(" Error message after failed payment");
});

fixture`Lessons Booking with failing card (3DS)`
  .page`${url}/lessons`;

test("Lessons Booking failing (3DS)", async (t) => {
  const randomEmail = `lessons-test-${Math.floor(
    Math.random() * 10000
  )}@mail${Math.floor(Math.random() * 10000)}.com`;
  await t.click("#first");
  await t.click("#second");
  await t.typeText("#name", "Lessons Test Name");
  await t.typeText("#email", randomEmail);

  let name = await Selector("#name").value;
  let email = await Selector("#email").value;
  await t.expect(name).eql("Lessons Test Name");
  await t.expect(email).eql(randomEmail);

  await inputCardData(".lesson-card-element", {
    cardNumber: "4000 0027 6000 3184",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.click("#submit").wait(2000);

  await complete3DSAuth(false);

  let errorShowing = await Selector("#card-errors");
  await t.expect(errorShowing.innerText).contains("unable to authenticate");
  console.log(" Error message after failed payment");
});

fixture`Lessons Booking with Failing card and Retry`
  .page`${url}/lessons`;

test("Lessons Booking failing and retrying", async (t) => {
  const randomEmail = `lessons-test-${Math.floor(
    Math.random() * 10000
  )}@mail${Math.floor(Math.random() * 10000)}.com`;
  await t.click("#first");
  await t.click("#second");
  await t.typeText("#name", "Lessons Test Name");
  await t.typeText("#email", randomEmail);

  let name = await Selector("#name").value;
  let email = await Selector("#email").value;
  await t.expect(name).eql("Lessons Test Name");
  await t.expect(email).eql(randomEmail);

  await inputCardData(".lesson-card-element", {
    cardNumber: "4000 0000 0000 0002",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.click("#submit").wait(4000);

  let errorShowing = await Selector("#card-errors");
  await t.expect(errorShowing.innerText).contains("declined");
  console.log(" Error message after failed payment");

  await cleanAndInputCardData(".lesson-card-element", {
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.click("#submit").wait(4000);
  let signUpStatus = await Selector("#signup-status");
  await t
    .expect(signUpStatus.innerText)
    .contains("They are going to call you the shredder");
  console.log(" Success message after signup");

  let last4 = await Selector("#last4");
  await t.expect(last4.textContent).contains("4242");
  console.log(" Success message includes last4 numbers of card");
});

fixture`Lessons Booking input validation`
  .page`${url}/lessons`;

test("Lessons Booking email required", async (t) => {
  await t.click("#first");
  await t.click("#second");
  await t.typeText("#name", "Lessons Test Name");

  let name = await Selector("#name").value;
  await t.expect(name).eql("Lessons Test Name");

  await inputCardData(".lesson-card-element", {
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.expect(Selector("#submit").hasAttribute("disabled")).ok();
});

test("Lessons Booking name required", async (t) => {
  const randomEmail = `lessons-test-${Math.floor(
    Math.random() * 10000
  )}@mail${Math.floor(Math.random() * 10000)}.com`;
  await t.click("#first");
  await t.click("#second");
  await t.typeText("#email", randomEmail);

  let email = await Selector("#email").value;
  await t.expect(email).eql(randomEmail);

  await inputCardData(".lesson-card-element", {
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.expect(Selector("#submit").hasAttribute("disabled")).ok();
});
