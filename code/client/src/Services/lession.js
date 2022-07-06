export const createCustomer = async (_email,_name,_lessionDate,_isUpdate,_customer_id,_payment_method_id) => {
    const response = await fetch("/create-guitar-lession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "email":_email,"name":_name,"first_lession":_lessionDate,"isUpdate":_isUpdate,"customer_id":_customer_id, "payment_method_id":_payment_method_id})
    })
    if (!response.ok) {
      console.log(response);
      console.log("Create Customer: Error happened while fetching data");
      return null;
    }
    const data = await response.json();
    return data;
  };

  export const getExistingCustomer = async (_email,_name,_payment_method_id,_customer_id) => {
    const response = await fetch("/get-exising-customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "email":_email,"name":_name,"payment_method_id":_payment_method_id ,"customer_id":_customer_id }),
    })
    if (!response.ok) {
      console.log(response);
      console.log("FAILED: Get Existing Customer");
      return null;
    }
    const data = await response.json();
    return data;
  };