import React,{useEffect,useState}  from "react";
import PaymentForm from "./PaymentForm";
import SummaryElement from "./SummaryElement";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
const promise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const SummaryTable = (props) => {
  const { discountFactor, minItemsForDiscount, items, order } = props;
  const [inputData,setInputData] = useState(null);
  //Return array of selected items
  var getSelectedItems = () => {
    return items.filter((item) => item.selected);
  };

  //Calculate total before applying discount
  var computeSubTotal = () => {
    return getSelectedItems()
      .map((item) => item.price)
      .reduce((item1, item2) => item1 + item2, 0);
  };

  //Check if discount apply to order
  var computeDiscountPercentage = () => {
    return minItemsForDiscount <= order.length ? discountFactor : 0;
  };
  //Calculate total discount
  var computeDiscount = () => {
    return computeSubTotal() * computeDiscountPercentage();
  };
  //Calculate total after discount
  var computeTotal = () => {
    let subTotal = computeSubTotal();
    let discount = computeDiscount();
    return subTotal - discount;
  };

  const selectedItems = getSelectedItems();
  const discount = computeDiscount();
  const subTotal = computeSubTotal();
  const active = order.length > 0;
  var getItems = () =>{
    if(getSelectedItems().length>0){
      return getSelectedItems()
      .map((item) => item.itemId)
      .join(",");
    }else{
      return "";
    }
    
  }
  useEffect(()=>{
    setInputData({
      discount:discount,
      videos:getItems(),
      totalItems:selectedItems
    });
  },[JSON.stringify(selectedItems),active]);

  if (active) {
    return (
      <div className="video-summary">
        <div className="summary-content">
          <h3>Purchase Summary</h3>
          {selectedItems.length===0 && <div id="summary-preface" className="sr-legal-text left" >
            No courses selected.
          </div>}
          <div id="summary-table" className="summary-table">
            {selectedItems.map((item) => (
              <SummaryElement
                rowClass="summary-product"
                desc={item.title}
                amountCents={item.price}
                key={item.title.trim()}
              />
            ))}
            {discount > 0 ? (
              <SummaryElement
                rowClass="summary-discount"
                desc="Discount"
                amountCents={discount}
                key="discount"
              />
            ) : (
              ""
            )}

            {discount > 0 ? (
              <SummaryElement
                rowClass="summary-subtotal"
                desc="Subtotal"
                amountCents={subTotal}
                key="subTotal"
              />
            ) : (
              ""
            )}
            <SummaryElement
              rowClass="summary-total"
              desc="Total"
              amountCents={computeTotal()}
              key="total"
            />
          </div>
        </div>
        {
          //Component to generate payment form
        }
        <Elements stripe={promise}>
          <PaymentForm active={active} inputData = {inputData} />
        </Elements>
      </div>
    );
  } else {
    return "";
  }
};

export default SummaryTable;
