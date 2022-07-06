import React, { useEffect, useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import {  paymentIntentInfo } from "../Services/video";
import Thanks from "./Thanks";

//Payment Form, process user information to allow payment.
const paymentIntentsetup = async (data,isUpdate,intent_id) => {
  let res = await paymentIntentInfo(data,isUpdate,intent_id);
  if(res && res.paymentIntent.client_secret){
    return res.paymentIntent;
  }
};
const PaymentForm = (props) => {
  const { active,inputData } = props;
  const [disabled, setDisabled] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [email,setEmail] = useState("");
  const [name,setName] = useState("");
  const [intentInfo,setIntentInfo] = useState({});
  const [paymentId,setPaymentId] = useState('');
  const [errorMessage,setErrorMessage] = useState('');
  const stripe = useStripe();
  const elements = useElements();
  const options = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      },
    },
  };

    useEffect(()=>{
      if(inputData.videos && !paymentId){
        let intent_response;
        if(Object.keys(intentInfo).length === 0){
          intent_response = paymentIntentsetup(inputData,false,'');
        }else if(intentInfo && intentInfo.id){
          intent_response = paymentIntentsetup(inputData,true,intentInfo.id);
        }
        if(intent_response){
          intent_response.then(function(result) {
            if(result && result.client_secret){
              setIntentInfo(result);
            }
          });
        }
      }
    },[inputData]);
  const enableBtnHandler = async (event) => {
    // Listen for changes in the CardElement
    setDisabled(!event.complete);   
  };

  const handleSubmit = async(e)=>{
    e.preventDefault();
    setProcessing(true);
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    try{
    const {paymentIntent,error} = await stripe.confirmCardPayment(
      intentInfo.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: name,
            email:email
          },
        },
        receipt_email:email
      }
    );

    if (error) {
      setProcessing(false);
      setErrorMessage(error.message)
    } else {
      setProcessing(false);
      setErrorMessage('');
      paymentIntent.status==='succeeded'? setPaymentId(paymentIntent.id) :setPaymentId('');
    }
  }catch(err){
    console.log("Error::",err);
    setProcessing(false);
  }

  }
  
  if (active) {
    return (
      <div>
        {!paymentId && <form id="payment-form" className={`sr-payment-form payment-view`} onSubmit={handleSubmit}>
          <h3>Payment details</h3>
          <div className="sr-form-row">
            <div className="sr-combo-inputs">
              <div className="sr-combo-inputs-row">
                <input
                  type="text"
                  id="name"
                  placeholder="Name"
                  autoComplete="cardholder"
                  className="sr-input"
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                />
              </div>
              <div className="sr-combo-inputs-row">
                <input
                  type="text"
                  id="email"
                  placeholder="Email"
                  autoComplete="cardholder"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                />
              </div>

              <div className="sr-combo-inputs-row">
                <div id="card-element" className="sr-input sr-card-element">
                  <CardElement options={options} onChange={enableBtnHandler} />
                </div>
              </div>
            </div>
            { errorMessage && <div className="sr-field-error" id="name-errors" role="alert">{errorMessage}</div>}
          </div>
          <button id="submit" type="submit" disabled={disabled || processing || !email || !name } >
          { processing ? 
            (<div className="spinner" id="spinner"></div>) : 
            (<span id="button-text">Purchase</span>)
            }
          </button>
          <div className="legal-text">
            Your card will be immediately charged
          </div>
        </form>}
        <Thanks state={paymentId?true:false} paymentId={paymentId}/>
      </div>
    );
  } else {
    return "";
  }
};

export default PaymentForm;
