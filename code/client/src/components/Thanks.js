import React from "react";

const Thanks = ({ state,paymentId }) => {
  if (state) {
    return (
      <div className="sr-section completed-view video-thanks">
        <div className="success">
          <img src="/assets/img/success.svg" alt="" />
        </div>
        <h3 id="order-status">Thank you for your order!</h3>
        <p>
          Payment Id: <span style={{color:'#f76076'}} onClick={()=> window.open(`https://dashboard.stripe.com/test/payments/${paymentId}`, "_blank")} id="payment-id">{paymentId}</span>
        </p>
        <p>Please check your email for download instructions.</p>{" "}
        <button onClick={() => window.location.reload(false)}>
          Place Another Order
        </button>
      </div>
    );
  } else {
    return "";
  }
};

export default Thanks;
