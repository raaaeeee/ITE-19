import {
  backendURL,
  successNotification,
  errorNotification,
  logout,
} from "../utils/utils.js";

// Logout Button
const btn_logout = document.getElementById("btn_logout");
if (btn_logout) {
  btn_logout.addEventListener("click", logout);
}

// Fetch and display all stores and their products on page load
document.addEventListener("DOMContentLoaded", function () {
  getStoresAndProducts(); // Fetch all stores and their products
});

// Function to fetch all stores and their products
async function getStoresAndProducts(query = "") {
  const storeContainer = document.getElementById("storeContainer");
  storeContainer.innerHTML = `<div class="text-center">Loading stores and products...</div>`;

  try {
    const response = await fetch(
      `${backendURL}/api/inventory${query ? `?search=${query}` : ""}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch stores and products");
    }

    const data = await response.json();

    if (data.message) {
      storeContainer.innerHTML = `<div class="text-center">${data.message}</div>`;
    } else {
      displayStoresAndProducts(data); // Function to display the stores and their products in the UI
    }
  } catch (error) {
    storeContainer.innerHTML = `<div class="text-center">${error.message}</div>`;
    errorNotification(`Error: ${error.message}`);
  }
}

// Function to display the stores and their products in the UI
function displayStoresAndProducts(stores) {
  const storeContainer = document.getElementById("storeContainer");
  storeContainer.innerHTML = ""; // Clear the loading text

  // Loop through each store and its products
  stores.forEach((store) => {
    const storeCard = document.createElement("div");
    storeCard.classList.add("col-12", "col-md-6", "col-lg-3", "mb-4");
    storeCard.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${store.store_address}</h5>

          <table class="table ">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${store.products
                .map(
                  (product) => `
                <tr>
                  <td>${product.product_name}</td>
                  <td>${product.quantity}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
    storeContainer.appendChild(storeCard);
  });
}
