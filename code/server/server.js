/* eslint-disable no-console */
const express = require('express');

const app = express();
const {
  resolve
} = require('path');
// Replace if using a different env file or config
require('dotenv').config({
  path: './.env'
});
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const allitems = {};

// const MIN_ITEMS_FOR_DISCOUNT = 2;
app.use(express.static(process.env.STATIC_DIR));
app.use(express.urlencoded({
  extended: true
}))
app.use(
  express.json({
    // Should use middleware or a function to compute it only when
    // hitting the Stripe webhook endpoint.
    verify: (req, res, buf) => {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  }, ),
);

//below code is work around for webhook if its uncomment then comment line 20 - 30
/* app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
}); */

// load config file
const fs = require('fs');

const configFile = fs.readFileSync('../config.json');
const config = JSON.parse(configFile);

// load items file for video courses
const file = require('../items.json');
const {
  pathToFileURL
} = require('url');

file.forEach((item) => {
  const initializedItem = item;
  initializedItem.selected = false;
  allitems[item.itemId] = initializedItem;
});


// const asyncMiddleware = fn => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

// Routes
// Get started! Shows the main page of the challenge with links to the
// different sections.
app.get('/', (req, res) => {
  try {
    const path = resolve(`${process.env.STATIC_DIR}/index.html`);
    if (!fs.existsSync(path)) throw Error();
    res.sendFile(path);
  } catch (error) {
    const path = resolve('./public/static-file-error.html');
    res.sendFile(path);
  }
});

// Challenge Section 1
// Challenge section 1: shows the concert tickets page.
app.get('/concert', (req, res) => {
  try {
    const path = resolve(`${process.env.STATIC_DIR}/concert.html`);
    if (!fs.existsSync(path)) throw Error();
    res.sendFile(path);
  } catch (error) {
    const path = resolve('./public/static-file-error.html');
    res.sendFile(path);
  }
});


app.get('/setup-concert-page', (req, res) => {
  res.send({
    basePrice: config.checkout_base_price,
    currency: config.checkout_currency,
  });
});
//get Price of the Product ( Spring Academy Concert ) prod_L9zIfrJE00iKGO 
const getPrice = async ()=>{
  const PRODUCT = 'prod_L9zIfrJE00iKGO'; // Product created using dash board 
  const prices = await stripe.prices.list({
    limit: 100,
    });
    if(prices && prices.data.length>0 && !prices.has_more){
      const price = prices.data.find((pri)=>pri.product===PRODUCT);
      if(price && price.id){
        return price.id;
      }
    }
    return "";
}

app.post('/create-checkout-session', async (req, res) => {
  try{
    const domainURL = process.env.DOMAIN;
    //const PRICE = await getPrice(); //get the PRICE of the product per unit quantity
    const {
      quantity: quantity
    } = req.body;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price: "price_1KTfJqSBQJWfwuq1DB2A2ztzs", // this should be match PRICE_ID of your dashboard.
        quantity: quantity
      }],
      metadata:{
        concerttickets:quantity
      },
      success_url: `${domainURL}/concert-success/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}/concert-failed`,
      // automatic_tax: {enabled: true},
    });
    return res.redirect(303, session.url);
  }catch(ex){
    res.setHeader('Content-type','text/html');
    res.send(`<p>${ex.message}, please update the PRICE_ID</p>`); // as per your dashboard update the price_id.
    console.log(ex.message);
  }
  
});

// Show success page, after user buy concert tickets
app.get('/concert-success', (req, res) => {
  try {
    const path = resolve(`${process.env.STATIC_DIR}/concert-success.html`);
    if (!fs.existsSync(path)) throw Error();
    res.sendFile(path);
  } catch (error) {
    const path = resolve('./public/static-file-error.html');
    res.sendFile(path);
  }
});

// Chalellenge Section 2
// Challenge section 2: shows the videos purchase page.
app.get('/videos', (req, res) => {
  try {
    const path = resolve(`${process.env.STATIC_DIR}/videos.html`);
    if (!fs.existsSync(path)) throw Error();
    res.sendFile(path);
  } catch (error) {
    const path = resolve('./public/static-file-error.html');
    res.sendFile(path);
  }
});

// Challenge section 2: returns config information that is used by the client JavaScript
// to display the videos page.
app.get('/setup-video-page', (req, res) => {
  res.send({
    discountFactor: config.video_discount_factor,
    minItemsForDiscount: config.video_min_items_for_discount,
    items: allitems,
  });
});


const calculateOrderAmount = (items,discount) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  if (items.length > 0) {
    let subTotal= items
      .map((item) => item.price)
      .reduce((item1, item2) => item1 + item2, 0);
    
      return subTotal - discount;
  }
  return 0;
};



app.post("/create-payment-intent", async (req, res) => {

  try {
    const {
      in_data,
      isUpdate,
      intent_id
    } = req.body;

    let items = in_data.totalItems;
    let discount = in_data.discount;
    let videos = in_data.videos;
    // Create a PaymentIntent with the order amount and currency
    
    if (!isUpdate) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items,discount),
        currency: process.env.USD_CURRENCY,
        metadata: {
          videos: videos || ''
        }
      });
      res.send({
        paymentIntent: paymentIntent
      });
    } else if (intent_id) {
      const updatedPaymentIntent = await stripe.paymentIntents.update(
        intent_id, {
          amount: calculateOrderAmount(items,discount),
          currency: process.env.USD_CURRENCY,
          metadata: {
            videos: videos || ''
          }
        }
      );
      res.send({
        paymentIntent: updatedPaymentIntent
      });
    } else {
      res.send({
        error: "no data"
      })
    }


  } catch (ex) {
    console.log(ex.message);
  }

});

//webhook handler
app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  let event = request.body;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Then define and call a method to handle the successful payment intent.
      handlePaymentIntentSucceeded(paymentIntent,event.type);
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object;
      console.log(`PaymentIntent for ${paymentIntentFailed.amount} was failed!`);
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      handlePaymentIntentFailed(paymentIntent,event.type);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

//method to update metadata of a paymentintent success
const handlePaymentIntentSucceeded = async (paymentIntent,type)=>{
  if(paymentIntent.id){
    await stripe.paymentIntents.update(
      paymentIntent.id,
      {
        metadata: {"event_recieved": type}
      }
    );
  }
};

//method to update metadata of a paymentintent success
const handlePaymentIntentFailed = async (paymentIntent,type)=>{
  if(paymentIntent.id){
    await stripe.paymentIntents.update(
      paymentIntent.id,
      {
        metadata: {"event_recieved": type}
      }
    );
  }
};


// Challenge Section 3
// Challenge section 3: shows the lesson sign up page.
app.get('/lessons', (req, res) => {
  try {
    const path = resolve(`${process.env.STATIC_DIR}/lessons.html`);
    if (!fs.existsSync(path)) throw Error();
    res.sendFile(path);
  } catch (error) {
    const path = resolve('./public/static-file-error.html');
    res.sendFile(path);
  }
});

app.post('/create-guitar-lession', async (req, res) => {
  try {
    const {
      email,
      name,
      first_lession,
      isUpdate,
      customer_id,
      payment_method_id
    } = req.body;
    let isCustomerExist = false;
    let cust;
    const response = {
      setupIntent: {},
      customer: {},
      isCustomerExist: false,
      paymentMethod:{}
    }
    //if no existing customer create new customer with email,name,metadata
    if (!isUpdate) {
      const customer = await stripe.customers.create();
      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
      });
      response.setupIntent = setupIntent;
      response.customer = customer;
    } else if (isUpdate && email) {
      //sending customers list in customer object to return existing customer list.
      //check customer exists with the given email
      const customers = await stripe.customers.list({
        email: email,
      });
      if (customers && customers.data && customers.data.length > 0) {
        isCustomerExist = true;
      }
      if (isCustomerExist) {
        cust = customers.data.filter((customer) => {
          return customer.email === email
        })[0];
      } //isCustomerExist
      else {
        cust = await stripe.customers.update(
          customer_id, {
            email: email,
            name: name,
            metadata: {
              first_lession: first_lession
            },
          });
      }
      if(payment_method_id){
        const paymentMethod = await stripe.paymentMethods.retrieve(
          payment_method_id
        );
        response.paymentMethod = paymentMethod;
      }
      response.customer = cust;
      response.isCustomerExist = isCustomerExist;
    }//isUpdate && email
    res.send(response);
  } catch (ex) {
    res.send(ex);
  }
});

app.post('/get-exising-customer', async (req, res) => {
  try {
    const {
      email,
      name,
      payment_method_id,
      customer_id
    } = req.body;
    let isCustomerExist = false;
    let customer;
    //check customer exists with the given email
    const customers = await stripe.customers.list({
      email: email
    });

    if (customers && customers.data && customers.data.length > 0) {
      customer = customers.data[0];
      isCustomerExist = true;
    } else {
      if (!isCustomerExist) {
        const attachedPM = await stripe.paymentMethods.attach(
          payment_method_id, {
            customer: customer_id
          }
        );
        if (attachedPM) {
          const updated_cust = await stripe.customers.update(
            customer_id, {
              invoice_settings: {
                default_payment_method: payment_method_id
              },
              email: email,
              name: name
            }
          );
          if (updated_cust) {
            const paymentMethods = await stripe.customers.listPaymentMethods(
              customer_id, {
                type: 'card'
              }
            );
            if (paymentMethods && paymentMethods.data[0]) {
              let paymentMethod = paymentMethods.data[0];
              await stripe.paymentMethods.update(
                paymentMethod.id, {
                  billing_details: {
                    email: email,
                    name: name
                  }
                }
              );
            } //paymentMethods
            customer = await stripe.customers.retrieve(
              customer_id
            );
          } //updated_cust
        } //attachedPM
      } // !isCustomerExist
    }
    res.send({
      customer: customer,
      isCustomerExist: isCustomerExist
    })
  } catch (ex) {
    console.log("exception under::GET EXISTING CUSTOMER", ex);
    res.send(ex);
  }
});

// Challenge section 4: '/schedule-lesson'
// Authorize a payment for a lesson
//
// Parameters:
// customer_id: id of the customer
// amount: amount of the lesson in cents
// description: a description of this lesson
//
// Example call:
// curl -X POST http://localhost:4242/schdeule-lesson \
//  -d customer_id=cus_GlY8vzEaWTFmps \
//  -d amount=4500 \
//  -d description='Lesson on Feb 25th'
//
// Returns: a JSON response of one of the following forms:
// For a successful payment, return the payment intent:
//   {
//        payment: <payment_intent>
//    }
//
// For errors:
//  {
//    error:
//       code: the code returned from the Stripe error if there was one
//       message: the message returned from the Stripe error. if no payment method was
//         found for that customer return an msg 'no payment methods found for <customer_id>'
//    payment_intent_id: if a payment intent was created but not successfully authorized
// }
app.post('/schedule-lesson', async (req, res) => {
  const {
    customer_id,
    amount,
    currency,
    description,
    date
  } = req.body;

  let errorObject = {
    "error": {
      "code": "",
      "message": "",
      "payment_intent_id": ""
    }
  }
  try {
    const paymentMethods = await stripe.customers.listPaymentMethods(
      customer_id, {
        type: 'card'
      }
    );

    if (paymentMethods.data.length > 0) {
      const payment_method_id = paymentMethods.data[0].id ? paymentMethods.data[0].id : '';
      const customerId = paymentMethods.data[0].customer;
      //checking existing customer Id before returning the payment Intent
      if (customerId === customer_id) {
        const paymentIntent = await stripe.paymentIntents.create({
          customer: customer_id,
          amount: amount,
          description: description,
          currency: currency,
          capture_method: "manual",
          payment_method: payment_method_id,
          setup_future_usage: "off_session",
          confirm: true,
          metadata: {
            type: "lessons-payment",
            date: date
          }
        });
        if (paymentIntent) {
          res.send({
            payment: paymentIntent
          });
        }
      }
    } else {
      //if customer don't have a payment method.
      if (paymentMethods.data.length === 0) {
        errorObject.error.message = `no payment methods found for <${customer_id}>`
      }
      throw errorObject;
    }

  } catch (ex) {
    errorObject.error.code = ex.code;
    errorObject.error.message = ex.message;
    if (ex.code === 'authentication_required') {
      const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(ex.raw.payment_intent.id);
      errorObject.error.payment_intent_id = paymentIntentRetrieved.id;
    }
    res.send(errorObject);
  }



});


// Challenge section 4: '/complete-lesson-payment'
// Capture a payment for a lesson.
//
// Parameters:
// amount: (optional) amount to capture if different than the original amount authorized
//
// Example call:
// curl -X POST http://localhost:4242/complete_lesson_payment \
//  -d payment_intent_id=pi_XXX \
//  -d amount=4500
//
// Returns: a JSON response of one of the following forms:
//
// For a successful payment, return the payment intent:
//   {
//        payment: <payment_intent>
//    }
//
// for errors:
//  {
//    error:
//       code: the code returned from the error
//       message: the message returned from the error from Stripe
// }
//
app.post('/complete-lesson-payment', async (req, res) => {
  let errorObject = {
    "error": {
      "code": "",
      "message": ""
    }
  }
  try {
    const {
      payment_intent_id,
      amount
    } = req.body;
    const paymentIntent = await stripe.paymentIntents.capture(
      payment_intent_id, {
        amount_to_capture: amount
      }
    );

    res.send({
      paymentIntent: paymentIntent
    });
  } catch (ex) {
    errorObject.error.code = ex.code;
    errorObject.error.message = ex.message;
    res.send(errorObject);
  }

});

// Challenge section 4: '/refund-lesson'
// Refunds a lesson payment.  Refund the payment from the customer (or cancel the auth
// if a payment hasn't occurred).
// Sets the refund reason to 'requested_by_customer'
//
// Parameters:
// payment_intent_id: the payment intent to refund
// amount: (optional) amount to refund if different than the original payment
//
// Example call:
// curl -X POST http://localhost:4242/refund-lesson \
//   -d payment_intent_id=pi_XXX \
//   -d amount=2500
//
// Returns
// If the refund is successfully created returns a JSON response of the format:
//
// {
//   refund: refund.id
// }
//
// If there was an error:
//  {
//    error: {
//        code: e.error.code,
//        message: e.error.message
//      }
//  }


const checkPaymentCancelation = async (payment_intent_id) => {
  try{
    const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(payment_intent_id);
    let canBeCanceled = false;
    switch (paymentIntentRetrieved.status) {
      case 'requires_payment_method':
        canBeCanceled = true;
        break;
      case 'requires_capture':
        canBeCanceled = true;
        break;
      case 'requires_confirmation':
        canBeCanceled = true;
        break;
      case 'requires_action':
        canBeCanceled = true;
        break;
      default:
        break;
    }
    return canBeCanceled;
  }catch(ex){
    console.log(ex);
  }
  
}

app.post('/refund-lesson', async (req, res) => {
  let errorObject = {
    error: {
      "code": "",
      "message": ""
    }
  }
  try {
    const {
      payment_intent_id,
      amount
    } = req.body;

    let cancelable = checkPaymentCancelation(payment_intent_id);
    if (cancelable) {
      const refund = await stripe.refunds.create({
        payment_intent: payment_intent_id,
        amount: amount,
        reason: 'requested_by_customer'
      });
      res.send({
        refund: refund.id
      })
    }
  } catch (ex) {
    errorObject.error.code = ex.code;
    errorObject.error.message = ex.message;
    res.send(errorObject);
  }
});

// Challenge Section 5
// Displays the account update page for a given customer
app.get('/account-update/:customer_id', (req, res) => {
  try {
    const path = resolve(`${process.env.STATIC_DIR}/account-update.html`);
    if (!fs.existsSync(path)) throw Error();
    res.sendFile(path);
  } catch (error) {
    const path = resolve('./public/static-file-error.html');
    res.sendFile(path);
  }
});

app.get('/customer-details/:customer_id', async (req, res) => {
  try {
    const customer_id = req.params['customer_id'];
    const response = {
      clientSecret: "",
      card_details: null,
      customer: {
        id: "",
        email: "",
        name: ""
      }
    };
    const customer = await stripe.customers.retrieve(
      customer_id
    );

    if (customer) {
      response.customer.id = customer.id;
      response.customer.name = customer.name;
      response.customer.email = customer.email;

      const paymentMethods = await stripe.customers.listPaymentMethods(
        customer_id, {
          type: 'card'
        }
      );
      if (paymentMethods && paymentMethods.data.length > 0) {
        response.card_details = paymentMethods.data[0];
      }

      const setupIntent = await stripe.setupIntents.create();
      if (setupIntent && setupIntent.client_secret) {
        response.clientSecret = setupIntent.client_secret;
      }
      res.send(response);
    }


  } catch (ex) {
    console.log("ERROR in GET Account Details:::", ex);
  }

});


// Challenge section 5: '/delete-account'
// Deletes a customer object if there are no uncaptured payment intents for them.
//
// Parameters:
//   customer_id: the id of the customer to delete
//
// Example request
//   curl -X POST http://localhost:4242/delete-account \
//    -d customer_id=cusXXX
//
// Returns 1 of 3 responses:
// If the customer had no uncaptured charges and was successfully deleted returns the response:
//   {
//        deleted: true
//   }
//
// If the customer had uncaptured payment intents, return a list of the payment intent ids:
//   {
//     uncaptured_payments: ids of any uncaptured payment intents
//   }
//
// If there was an error:
//  {
//    error: {
//        code: e.error.code,
//        message: e.error.message
//      }
//  }
//
app.post('/delete-account/:customer_id', async (req, res) => {
  try {
    const customer_id = req.params['customer_id'];
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customer_id,
    });
    if (paymentIntents && paymentIntents.data.length > 0) {
      let intents = paymentIntents.data;

      let uncaptured_payments = intents.filter((intent) => {
        return intent.status.toLowerCase() === 'requires_capture';
      });
      //no uncaptured payments
      if (uncaptured_payments.length === 0) {
        const deleted = await stripe.customers.del(
          customer_id
        );
        if (deleted.deleted) {
          res.send({
            deleted: true
          })
        }
      } else {
        let intentIdList = uncaptured_payments.map(PI => PI.id);
        res.send({
          uncaptured_payments: intentIdList
        });
      }
    } else { //no payment associated information.
      const deleted = await stripe.customers.del(
        customer_id
      );
      if (deleted.deleted) {
        res.send({
          deleted: true
        })
      }
    }
  } catch (ex) {
    res.send({
      error: {
        code: ex.code,
        message: ex.message
      }
    });
  }

});


// Challenge section 6: '/calculate-lesson-total'
// Returns the total amounts for payments for lessons, ignoring payments
// for videos and concert tickets.
//
// Example call: curl -X GET http://localhost:4242/calculate-lesson-total
//
// Returns a JSON response of the format:
// {
//      payment_total: total before fees and refunds (including disputes), and excluding payments
//         that haven't yet been captured.
//         This should be equivalent to net + fee totals.
//      fee_total: total amount in fees that the store has paid to Stripe
//      net_total: net amount the store has earned from the payments.
// }
//
app.get('/calculate-lesson-total', async (req, res) => {
  try {

    let response = {
      "payment_total": 0,
      "fee_total": 0,
      "net_total": 0
    }
    //calculating last 7 days Transaction amounts
    const created_date = Math.round(+(new Date().setDate(new Date().getDate() - 7)) / 1000); //from last 7 days
    const balanceTransactions = [];
    for await (const balanceTransaction of stripe.balanceTransactions.list({
      created: {
        gt: created_date
      },
      limit: 10
    })) {
      balanceTransactions.push(balanceTransaction);
    }
    if (balanceTransactions.length > 0) {
      let output = balanceTransactions.reduce(function (accumulator, item) {
        Object.keys(item).forEach(function (key) {
          if (key === 'net' || key === 'fee' || key === 'amount') {
            accumulator[key] = ((accumulator[key] || 0) + item[key]) / 100;
          }
        });
        return accumulator;
      }, {});

      response.payment_total = Math.round(output.amount * 100) / 100;
      response.fee_total = Math.round(output.fee * 100) / 100;
      response.net_total = Math.round(output.net * 100) / 100;

      res.send(response);
    } else {
      res.send({
        "error": "no data"
      })
    }

  } catch (ex) {
    res.send(ex);
  }
});


// Challenge section 6: '/find-customers-with-failed-payments'
// Returns any customer who meets the following conditions:
// The last attempt to make a payment for that customer failed.
// The payment method associated with that customer is the same payment method used
// for the failed payment, in other words, the customer has not yet supplied a new payment method.
//
// Example request: curl -X GET http://localhost:4242/find-customers-with-failed-payments
//
// Returns a JSON response with information about each customer identified and
// their associated last payment
// attempt and, info about the payment method on file.
// {
//   <customer_id>:
//     customer: {
//       email: customer.email,
//       name: customer.name,
//     },
//     payment_intent: {
//       created: created timestamp for the payment intent
//       description: description from the payment intent
//       status: the status of the payment intent
//       error: the error returned from the payment attempt
//     },
//     payment_method: {
//       last4: last four of the card stored on the customer
//       brand: brand of the card stored on the customer
//     }
//   },
//   <customer_id>: {},
//   <customer_id>: {},
// }
//

//get status and error
const getReadableStatus = (_val) => {
  if (_val.last_payment_error) {
    if (_val.last_payment_error.code) {
      return _val.last_payment_error.code;
    } else {
      return _val.last_payment_error.type;
    }
  }
  return "";
};
//method to get brand and last4 digits of the card
const getCardDetails = (_val) => {
  if (_val.status === 'requires_payment_method') {
    if (_val.last_payment_error.payment_method) {
      return {
        brand: _val.last_payment_error.payment_method.card.brand || '',
        last4: _val.last_payment_error.payment_method.card.last4 || ''
      }
    } else if (_val.last_payment_error.source) {
      return {
        brand: _val.last_payment_error.source.card.brand || '',
        last4: _val.last_payment_error.source.card.last4 || ''
      }
    }
  }  else {
    return {
      brand: '',
      last4: ''
    }
  }
}

app.get('/find-customers-with-failed-payments', async (req, res) => {
  try {
    //calculating last 7 days Transaction amounts
    const created_date = Math.round(+(new Date().setDate(new Date().getDate() - 7)) / 1000); //from last 7 days
    const paymentIntents = [];
    const customers = [];
    let failedPayments = [];
    let customerFailedPayments = [];
    let cust_details = [];
    for await (const paymentIntent of stripe.paymentIntents.list({
      created: {
        gt: created_date
      },
      limit: 100
    })) {
      paymentIntents.push(paymentIntent);
    }

    for await (const customer of stripe.customers.list({
      created: {
        gt: created_date
      },
      limit: 100
    })) {
      customers.push(customer);
    }

    if (paymentIntents.length > 0 && customers.length > 0) {
      failedPayments = paymentIntents.filter((pi) => {
        if(pi.customer){
          return pi.status.toLowerCase() === 'requires_payment_method';
        }
      });
        customers.forEach((item) => {
          const paymentIntent = failedPayments.find(({ customer }) => customer === item.id);
          
              if (paymentIntent) {
                  customerFailedPayments.push({
                  ...item,
                  ...paymentIntent,
                  })
              }
          });

          if(customerFailedPayments.length>0){
            cust_details = customerFailedPayments.map((val) => {
                return {
                  [val.customer]: {
                    name: val.name,
                    email: val.email
                  },
                  payment_intent: {
                    created: val.created,
                    description: val.description,
                    status: val.status,
                    error: getReadableStatus(val)
                  },
                  payment_method: {
                    last4: getCardDetails(val).last4,
                    brand: getCardDetails(val).brand
                  }
      
                }
              
            }); // promise then 
          } 
      res.send(cust_details);
    } //paymentIntents length >0

  } catch (ex) {
    res.send(ex);
  }
});

function errorHandler(err, req, res, next) {
  res.status(500).send({
    error: {
      message: err.message
    }
  });
}

app.use(errorHandler);

app.listen(4242, () => console.log(`Node server listening on port http://localhost:${4242}`));