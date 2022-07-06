import React from 'react';
import '../css/checkout.scss';
import Header from '../components/Header';
const ConcertFailed = ()=>{
    return (<main className="main-checkout">
    <Header />
    <div className="checkout-root">
      <div className="checkout-success">
        <header className="sr-header"></header>
        <div className="payment-summary completed-view">
          <h2 id="headline">Your payment failed</h2>
        </div>
      </div>
    </div>
  </main>)
}

export default ConcertFailed;