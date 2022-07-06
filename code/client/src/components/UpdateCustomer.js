import React, { useState } from "react";
import { Link } from "@reach/router";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { getExistingCustomer} from '../Services/lession';



const UpdateCustomer = ({data}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [disabled, setDisabled] = useState(true);
  const [processing, setProcessing] = useState('');
  const [email,setEmail] = useState("");
  const [name,setName] = useState("");
  const [errorMessage,setErrorMessage] = useState('');
  const [customerExists,setCustomerExists] = useState(false);
  const [updated,setUpdated] = useState(false);

  const options = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      },
    },
  };

  const updateCustomer = async (_email,_name,_payment_method_id,_customer_id) => {
    let res = await getExistingCustomer(_email,_name,_payment_method_id,_customer_id);
    if(res){
      return res;
    }
  };

  const handleSubmit = async (e)=>{
    e.preventDefault();
    setProcessing(true);
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const {setupIntent,error} = await stripe.confirmCardSetup(
      data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: name,
            email:email
          }
        }
      }
    );
    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setProcessing(false);
      setErrorMessage(error.message);
    } else {
      setErrorMessage('');
      if(setupIntent && setupIntent.payment_method){
        const updated_customer = updateCustomer(email,name,setupIntent.payment_method,data.customer.id);
        updated_customer.then(function(result) {
          setProcessing(false);
          if(result){
            if(!result.isCustomerExist){
              setUpdated(true);
            }else{
              setUpdated(false);
            }
            setCustomerExists(result.isCustomerExist);
          }
       });
        setProcessing(true);
      }
    }
  
  }
  
  const enableBtnHandler = async (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(!event.complete);
    
  };

  return (
    <div className="lesson-form">
      { !updated && <div className="lesson-desc">
        <form id="update-customer-form" onSubmit={handleSubmit}>
        <h3>Update your Payment details</h3>
        <div className="lesson-info">
          Fill out the form below if you'd like to us to use a new card.
        </div>
       
        <div className="lesson-grid">
          <div className="lesson-inputs">
            <div className="lesson-input-box">
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
            <div className="lesson-input-box">
              <input
                type="text"
                id="email"
                placeholder="Email"
                autoComplete="cardholder"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              />
            </div>
            <div className="lesson-input-box">
              <div className="lesson-card-element">
              <CardElement options={options} onChange={enableBtnHandler} />
              </div>
            </div>
          </div>
          {errorMessage && <div className="sr-field-error" id="card-errors" role="alert">{errorMessage}</div>}
          {customerExists && <div className="sr-field-error" id="customer-exists-error" role="alert">Email is already being used</div>}
        </div>
        <button id="submit" disabled={disabled || processing || customerExists }>
        { processing ? 
            (<div className="spinner" id="spinner"></div>) : 
            (<span id="button-text">Register</span>)
            }
        </button>
        </form>
        <div className="lesson-legal-info">
          Your card will not be charged. By registering, you hold a session slot
          which we will confirm within 24 hrs.
        </div>
      </div>}

      { updated &&  <div className="sr-section completed-view">
        <h3 id="signup-status">Payment Information updated </h3>
        <Link to="/lessons">
          <button>Sign up for lessons under a different email address</button>
        </Link>
      </div>}
    </div>
  );
};
export default UpdateCustomer;
