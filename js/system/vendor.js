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
} else {
  console.error("Logout button not found in the DOM.");
}

// Function to load stores and their products
async function loadStoresWithProducts(vendorId) {
  const tableBody = document.getElementById("storeProductTable");
  if (!tableBody) {
    console.error("Table body element not found.");
    errorNotification("Table body element not found.");
    return;
  }

  if (!vendorId) {
    errorNotification("Vendor ID not found.");
    console.error("Vendor ID is not passed to the function.");
    return;
  }

  try {
    // Make the API call
    const response = await fetch(`${backendURL}/api/vendor/${vendorId}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("API Error Response:", errorData);
      errorNotification(
        `Failed to load data: HTTP Error ${response.status} ${
          errorData?.message || ""
        }`
      );
      return;
    }

    // Parse the JSON response
    const products = await response.json();
    if (!Array.isArray(products) || products.length === 0) {
      tableBody.innerHTML = ` 
        <tr>
          <td colspan="5" class="text-center">
            No products found for this vendor.
          </td>
        </tr>`;
      errorNotification("No products found for this vendor.");
      return;
    }

    // Group products by store_id to display store-wise
    const stores = products.reduce((acc, product) => {
      const store = acc.find((s) => s.store_id === product.store_id);
      if (store) {
        store.products.push(product);
      } else {
        acc.push({
          store_id: product.store_id,
          store_name: product.store_name,
          store_address: product.store_address,
          products: [product],
        });
      }
      return acc;
    }, []);

    // Generate the table rows
    let rowsHTML = "";

    stores.forEach((store) => {
      if (!store.products || store.products.length === 0) {
        console.warn(`Store "${store.store_name}" has no products.`);
        errorNotification(`Store "${store.store_name}" has no products.`);
        return;
      }

      // Sort products by quantity in ascending order
      const sortedProducts = store.products.sort(
        (a, b) => a.ordered_quantity - b.ordered_quantity
      );

      sortedProducts.forEach((product) => {
        rowsHTML += `
          <tr data-store-order-id="${product.store_order_id}">
            <td>${store.store_name || "No store name provided"}</td>
            <td>${store.store_address || "No address provided"}</td>
            <td>${product.product_name || "Unnamed product"}</td>
            <td>${product.ordered_quantity ?? "N/A"}</td>
            <td>
              <button class="btn btn-purchase" 
                      data-id="${product.product_id}" 
                      data-name="${product.product_name}" 
                      data-price="${product.price}" 
                      data-store-id="${store.store_id}" 
                      data-store-order-id="${product.store_order_id}"  
                      style="background-color: #013a30; color: #dfe101;">
                Approve
              </button>
            </td>
          </tr>`;
      });
    });

    tableBody.innerHTML = rowsHTML;

    // Add event listeners for "Approve" buttons
    document.querySelectorAll(".btn-purchase").forEach((button) => {
      console.log(
        "Attaching event listener to button with data-store-order-id:",
        button.dataset.storeOrderId
      );
      button.addEventListener("click", (e) => {
        const productId = e.currentTarget.dataset.id;
        const storeId = e.currentTarget.dataset.storeId;
        const storeOrderId = e.currentTarget.dataset.storeOrderId;

        console.log(
          "Approve button clicked with productId:",
          productId,
          "storeId:",
          storeId,
          "storeOrderId:",
          storeOrderId
        );

        // Call approveOrder function
        approveOrder(productId, storeId, storeOrderId);
      });
    });

    successNotification("Stores and products loaded successfully!");
  } catch (error) {
    console.error("Error during fetch:", error);
    errorNotification(`Error: ${error.message}`);
  }
}

// Function to approve the order
async function approveOrder(productId, storeId, storeOrderId) {
  const vendorId = localStorage.getItem("vendor_id"); // Fix: Retrieve vendor_id from localStorage

  if (!vendorId) {
    errorNotification("Vendor ID is required.");
    return;
  }

  if (!storeOrderId) {
    errorNotification("Store Order ID is missing.");
    return;
  }

  alert("Processing approval... Please wait.");

  try {
    const response = await fetch(
      `${backendURL}/api/store_order/${storeOrderId}/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          product_id: productId,
          store_id: storeId,
          vendor_id: vendorId,
        }),
      }
    );

    if (response.ok) {
      const approvalResponse = await response.json();
      alert("Order approved successfully.");
      // Remove the approved row from the table
      const row = document.querySelector(
        `tr[data-store-order-id="${storeOrderId}"]`
      );
      if (row) {
        row.remove();
        console.log(`Row with store order ID ${storeOrderId} removed.`);
      } else {
        console.warn(`Row with store order ID ${storeOrderId} not found.`);
      }
    } else {
      const errorData = await response.json().catch(() => null);
      errorNotification(
        `Order approval failed: HTTP Error ${response.status} ${
          errorData?.message || ""
        }`
      );
    }
  } catch (error) {
    errorNotification(`Error: ${error.message}`);
    console.error("Error during approval:", error);
  }
}

// Initialize the table on page load
document.addEventListener("DOMContentLoaded", () => {
  const vendorId = localStorage.getItem("vendor_id");

  if (!vendorId) {
    // If vendorId is missing, log an error and notify the user
    console.error("Vendor ID is not found in localStorage.");
    errorNotification("Unable to load data. Please log in again.");
    return;
  }

  loadStoresWithProducts(vendorId);
});
