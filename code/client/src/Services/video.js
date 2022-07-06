export const videoSetup = async (props) => {
  const response = await fetch("/setup-video-page", {
    method: "get",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    console.log(response);
    console.log("Video Setup: Error happened while fetching data");
    return null;
  }
  const data = await response.json();
  return data;
};

export const paymentIntentInfo = async (in_data,isUpdate,intent_id) => {
  console.log("Call:: paymentIntentInfo",in_data,isUpdate,intent_id);
   const response = await fetch("/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({"in_data":in_data,"isUpdate":isUpdate,"intent_id":intent_id }),
  })
  if (!response.ok) {
    console.log(response);
    console.log("Payment Intent Info: Error happened while fetching data");
    return null;
  }
  const data = await response.json();
  return data;
};


