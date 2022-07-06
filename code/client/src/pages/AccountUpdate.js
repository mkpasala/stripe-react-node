import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import "../css/lessons.scss";
import { accountUpdate,getCustomerDetails } from "../Services/account";
import UpdateCustomer from "../components/UpdateCustomer";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js"

const promise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
//Component responsable to update user's info.
const AccountUpdate = ({ id }) => {
  const [data, setData] = useState(null);
  //Get info to load page, User payment information, config API route in package.json "proxy"
  useEffect(() => {
    const setup = async () => {
      accountUpdate(id);
      const prom= getCustomerDetails(id);
      prom.then(function(result) {
        if(result){
          setData(result);
        }
      });
    };
    setup();
  }, [id]);

  return (
    <main className="main-lessons">
      <Header />
      { data &&  <div className="eco-items" id="account-information">
        {
          //User's info shoul be display here
        }
        <h3>Account Details</h3>
        <h4>Current Account information</h4>
        <h5>We have the following card information on file for you: </h5>
        <p>
          Billing Email:&nbsp;&nbsp;<span id="billing-email">{ data.card_details? data.card_details.billing_details.email :''}</span>
        </p>
        <p>
          Card Exp Month:&nbsp;&nbsp;<span id="card-exp-month">{ data.card_details? data.card_details.card.exp_month : ''}</span>
        </p>
        <p>
          Card Exp Year:&nbsp;&nbsp;<span id="card-exp-year">{data.card_details? data.card_details.card.exp_year :''}</span>
        </p>
        <p>
          C§ard last 4:&nbsp;&nbsp;<span id="card-last4">{data.card_details? data.card_details.card.last4 :''}</span>
        </p>
      </div>}
      {data && data.clientSecret &&
      <Elements stripe={promise}>
        <UpdateCustomer data={data} />
      </Elements>
      }
    </main>
  );
};

export default AccountUpdate;
