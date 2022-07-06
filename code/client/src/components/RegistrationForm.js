import React, { useEffect, useState } from "react";
import SingupComplete from "./SingupComplete";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { createCustomer} from '../Services/lession';

const getCustomer = async (_email,_name,_lessionDate,_isUpdate,_customer_id,_payment_method_id) => {
  let res = await createCustomer(_email,_name,_lessionDate,_isUpdate,_customer_id,_payment_method_id);
  if(res){
    return res;
  }
};

//Registration Form Component, process user info for online session.
//const textSingup = ;
const RegistrationForm = ({ selected, details,customer_details }) => {
  const [email,setEmail] = useState("");
  const [name,setName] = useState("");
  const [lessionDate,setLessionDate] = useState("");
  const [customerInfo,setCustomerInfo] = useState({});
  const [active,setActive] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const [disabled, setDisabled] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [customerExist , setCustomerExist] = useState(false);
  const [completeData,setCompleteData] = useState({
    "email":"",
      "id":"",
      "last4":""
    });

  const options = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      },
    },
  };
  useEffect(()=>{
   if(details){
    setLessionDate(details.substring(32,47));
    if(Object.keys(customerInfo).length === 0){
      const customerDetails = getCustomer('','',lessionDate,false,'');
      customerDetails.then((result)=> {
        if(result && result.customer){
          setCustomerInfo(result);
        }
      });
    }
   }
   
  },[details]);

  const handleSubmit = async(e)=>{
    e.preventDefault();
    setProcessing(true);
    setActive(false);
    if (!stripe || !elements || (Object.keys(customerInfo).length===0) ) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const {setupIntent,error} = await stripe.confirmCardSetup(
      customerInfo.setupIntent.client_secret, {
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
      setActive(false);
      console.log("error",error);
    } else {
      let obj = {
        "email":"",
          "id":"",
          "last4":""
        }
      const updatedCustomer = getCustomer(email,name,lessionDate,true,customerInfo.customer.id,setupIntent.payment_method);
      updatedCustomer.then((result)=> {
          if(result && result.customer){
            setProcessing(false);
            if(!result.isCustomerExist){
              setActive(true);
              obj.email = result.customer.email;
              obj.id = result.customer.id;
              obj.last4 = result.paymentMethod.card.last4;
              setCompleteData(obj);
              setCustomerExist(false);
            }//if user exits
            else{
              setCustomerExist(true);
            }
            
          }
      });
    }

  }

  const enableBtnHandler = async (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(!event.complete);
    
  };

  if (selected !== -1) {
    return (
      <div className={`lesson-form`}>
      {!active && <div className={`lesson-desc`}>
          <form id="registration-form" onSubmit={handleSubmit}>
          <h3>Registration details</h3>
          <div id="summary-table" className="lesson-info">
            {details}
          </div>
          <div className="lesson-grid">
            <div className="lesson-inputs">
              <div className="lesson-input-box first">
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
              <div className="lesson-input-box middle">
                <input
                  type="text"
                  id="email"
                  placeholder="Email"
                  autoComplete="cardholder"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                />
              </div>
              <div className="lesson-input-box last">
                <div className="lesson-card-element">
                    <CardElement options={options} onChange={enableBtnHandler} />
                </div>
              </div>
            </div>
            <div className="sr-field-error" id="card-errors" role="alert"></div>
            { customerExist && <div
              className="sr-field-error"
              id="customer-exists-error"
              role="alert" 
            >
              A customer with the email address of{" "}
              <span id="error_msg_customer_email"></span> already exists. If
              you'd like to update the card on file, please visit 
              <span id="account_link">{ (Object.keys(customerInfo).length>0)? ` ${window.location.origin}/account-update/${customerInfo.customer.id} ` :''}</span>.
            </div>}
          </div>
           <span id="new-customer">
            { !customerExist && <button id="submit" type="submit" disabled={disabled || processing || (Object.keys(customerInfo).length===0) }  >
            { processing ? 
            (<div className="spinner" id="spinner"></div>) : 
            (<span id="button-text">Request Lesson</span>)
            }
            </button>}
            <div className="lesson-legal-info" >
              Your card will not be charged. By registering, you hold a session
              slot which we will confirm within 24 hrs.
            </div>
          </span>
          </form>
        </div>
        }
        <SingupComplete active={active} email={completeData.email} last4={completeData.last4} customer_id={completeData.id} />
      </div>
    );
  } else {
    return "";
  }
};
export default RegistrationForm;
