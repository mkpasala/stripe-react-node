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

// ***********************************************************
// Please fill with an existing customerId
// that has attached a valid payment method
// ***********************************************************
const existingCustomerId = "cus_LIGZD2XizW0TeE";
const existingCustomerEmail = "lessons-test-1971@mail9324.com";
//input email should be different because once the email is attached to a customer it won't allow to update ( mentioned requirement in the challenge )
//added random string to generate different email for each time
const r = ()=>{
  return  (Math.random() + 1).toString(36).substring(7); // return a random string
}
fixture`Update an account with *4242 card`
  .page`${url}/account-update/${existingCustomerId}`;

test("Update an account succesfully", async (t) => {
  await t.typeText("#name", "Lessons Test Name Updated");
  await t.typeText("#email",`${r()}_`+existingCustomerEmail);

  let name = await Selector("#name").value;
  let email = await Selector("#email").value;
  await t.expect(name).eql("Lessons Test Name Updated");
  await t.expect(email).contains(existingCustomerEmail);

  await inputCardData(".lesson-card-element", {
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.click("#submit").wait(4000);

  let signUpStatus = await Selector("#signup-status");
  await t.expect(signUpStatus.innerText).contains("updated");
  console.log(" Success message after updating account");
});

fixture`Update an account with *3184 and 3DS secure card`
  .page`${url}/account-update/${existingCustomerId}`;

test("Update an account succesfully after 3DS", async (t) => {
  await t.typeText("#name", "Lessons Test Name Updated 3DS");
  await t.typeText("#email", `${r()}_`+existingCustomerEmail);

  let name = await Selector("#name").value;
  let email = await Selector("#email").value;
  await t.expect(name).eql("Lessons Test Name Updated 3DS");
  await t.expect(email).contains(existingCustomerEmail);

  await inputCardData(".lesson-card-element", {
    cardNumber: "4000 0027 6000 3184",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.click("#submit").wait(2000);

  await complete3DSAuth(true);
  let signUpStatus = await Selector("#signup-status");
  await t.expect(signUpStatus.innerText).contains("updated");
  console.log(" Success message after updating account");
});

test("Update an account and fail  3DS", async (t) => {
  await t.typeText("#name", "Lessons Test Name Updated 3DS");
  await t.typeText("#email", `${r()}_`+existingCustomerEmail);

  let name = await Selector("#name").value;
  let email = await Selector("#email").value;
  await t.expect(name).eql("Lessons Test Name Updated 3DS");
  await t.expect(email).contains(existingCustomerEmail);

  await inputCardData(".lesson-card-element", {
    cardNumber: "4000 0027 6000 3184",
    cardExpiry: "12/24",
    cardCVC: "777",
    postalCode: "12345",
  });

  await t.click("#submit").wait(2000);

  await complete3DSAuth(false);
  let signUpStatus = await Selector("#card-errors");
  await t.expect(signUpStatus.innerText).contains("unable to authenticate");
  console.log(" Error message after failed payment");
});

fixture`Update an account with failing card`
  .page`${url}/account-update/${existingCustomerId}`;

test("Update an account failing payment method", async (t) => {
  await t.typeText("#name", "Lessons Test Name failing");
  await t.typeText("#email", `${r()}_`+existingCustomerEmail);

  let name = await Selector("#name").value;
  let email = await Selector("#email").value;
  await t.expect(name).eql("Lessons Test Name failing");
  await t.expect(email).contains(existingCustomerEmail);

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

fixture`Update an account with Failing card and Retry`
  .page`${url}/account-update/${existingCustomerId}`;

test("Update an account failing and retrying", async (t) => {
  await t.typeText("#name", "Lessons Test Name");
  await t.typeText("#email", `${r()}_`+existingCustomerEmail);

  let name = await Selector("#name").value;
  let email = await Selector("#email").value;
  await t.expect(name).eql("Lessons Test Name");
  await t.expect(email).contains(existingCustomerEmail);

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
  await t.expect(signUpStatus.innerText).contains("updated");
  console.log(" Success message after updating account");
});
