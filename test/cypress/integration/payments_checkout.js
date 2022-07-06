const frontendPort = "3000"; // or 3000
const url = "http://localhost:" + frontendPort;

describe("Payments Checkout Basic Setup", () => {
  it("visits page /concerts by url", () => {
    cy.visit(url + "/concert");
  });

  it("visits page /concerts by clicking navbar", () => {
    cy.visit(url);
    cy.contains("Concert Tickets").click();
  });

  it("visits page /concerts by clicking button", () => {
    cy.visit(url);
    cy.get("#concert").click();
  });

  it("Adds 2 tickets (3 total)", () => {
    cy.visit(url + "/concert");
    cy.get("#add").click();
    cy.get("#add").click();
    cy.get("#quantity-input").should("have.value", 3);
  });
});

describe("Payments Checkout Payment Flow", () => {
  it("Renders Stripe Checkout and payment succeeds", () => {
    cy.visit(url + "/concert");
    const ccNumber = "4242424242424242";
    const month = "12";
    const year = "30";
    const cvc = "123";
    const zipCode = "90210";

    cy.get("#submit").click();
    cy.wait(5000);
    let randomizedName = Math.floor(Math.random() * 10000);
    cy.get("#email").type(`auto-${randomizedName}@stripecert.org`);
    cy.get("#cardNumber").type("4242424242424242");
    cy.get("#cardExpiry").type("1226");
    cy.get("#cardCvc").type("123");
    cy.get("#billingName").type("Auto Grader " + randomizedName);

    cy.get("form").submit();

    cy.wait(10000);

    cy.get(".payment-summary").contains("Your payment succeeded");
  });
});

describe("Payments Checkout Back Flow", () => {
  it("Clicking Back returns to Concerts Page", () => {
    cy.visit(url + "/concert");
    cy.get("#add").click();
    cy.get("#submit").click();
    cy.wait(5000);

    cy.get(".Header-businessLink-label").click();
    cy.get("body").contains("Annual Spring Academy Concert");
  });
});
