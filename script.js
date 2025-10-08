const apiUrl = "https://2j2cydoqi9.execute-api.us-east-1.amazonaws.com/prod";

// Fetch products from Lambda
async function fetchProducts() {
  try {
    const response = await fetch(`${apiUrl}/products`);
    const data = await response.json();
    console.log("Products:", data);
    document.getElementById("awsOutput").innerText = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error("Error fetching products:", err);
    document.getElementById("awsOutput").innerText = "Error fetching products";
  }
}

// Submit order to Lambda
async function submitOrder() {
  const productId = document.getElementById("userInput").value;
  if (!productId) return alert("Enter a product ID");

  try {
    const response = await fetch(`${apiUrl}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, quantity: 1 })
    });
    const result = await response.json();
    console.log("Order Response:", result);
    document.getElementById("output").innerText = JSON.stringify(result, null, 2);
  } catch (err) {
    console.error("Error submitting order:", err);
    document.getElementById("output").innerText = "Error submitting order";
  }
}

// Event listeners
document.getElementById("fetchDataBtn").addEventListener("click", fetchProducts);
document.getElementById("submitBtn").addEventListener("click", submitOrder);
