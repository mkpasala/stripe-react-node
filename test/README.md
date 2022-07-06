## Preflight Test

The provided tests should be run before submitting your challenge.

The tests will check:
 - The checkout flow and a test payment.
 - The API flow of scheduling lessons.
 - The API flow of charging for an scheduled lessons.
 - The API flow of refunding a charged lessons.

# How to run:

1. Install dependencies
```
  npm install
```

2. Run e2e tests (for Checkout)
```
  npm run test-checkout
```

3. Run e2e tests (for Videos)
```
  npm run test-videos
```

4. Run e2e tests (for Account Updates)
```
  npm run test-update
```

5. Run API tests
```
  npm run test-api
```
**Notes**: 

For the API tests to run you must provide a valid `customer id` that exists in your Stripe Dashboard and has a valid payment method attached. Please add a valid `customer id` in the file [api-tests/lessons.js](/api-tests/lessons.js) 

The test is configured to run locally. If your challenge runs in a port other than `4242`, modify [api-tests/lessons.js](/api-tests/lessons.js).

```javascript
const url = 'http://localhost:port';
```

**Note**: If you are using react client, change the port for 3000 or the port where react is running.
