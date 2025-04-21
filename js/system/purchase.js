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
// Function to load stores and their products
async function loadStoresWithProducts() {
  const tableBody = document.getElementById("storeProductTable");
  if (!tableBody) {
    console.error("Table body element not found.");
    return;
  }

  try {
    const response = await fetch(`${backendURL}/api/purchase`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      const stores = await response.json();

      if (stores.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center">No products with low quantity found.</td></tr>`;
        return;
      }

      let rowsHTML = "";

      // Iterate over stores
      stores.forEach((store) => {
        // Sort products by quantity in ascending order
        const sortedProducts = store.products.sort(
          (a, b) => a.quantity - b.quantity
        );

        // Generate HTML rows for each product
        sortedProducts.forEach((product) => {
          rowsHTML += `
  <tr>
    <td>${store.store_address || "No address provided"}</td>
    <td>${product.product_name}</td>
    <td>${product.quantity}</td>
    <td>
      <button class="btn  btn-purchase" data-id="${
        product.product_id
      }" data-name="${product.product_name}" data-price="${
            product.price
          }" data-store-id="${
            store.store_id
          }" style="background-color: #013a30; color: #dfe101;">
        Purchase
      </button>
    </td>
  </tr>`;
        });
      });

      tableBody.innerHTML = rowsHTML;

      // Add event listeners for purchase buttons
      document.querySelectorAll(".btn-purchase").forEach((button) => {
        button.addEventListener("click", (e) => {
          const productId = e.currentTarget.dataset.id;
          const productName = e.currentTarget.dataset.name;
          const unitPrice = e.currentTarget.dataset.price;
          const storeId = e.currentTarget.dataset.storeId;
          openPurchaseModal(productId, productName, unitPrice, storeId);
        });
      });
    } else {
      errorNotification(`Failed to load data: HTTP Error ${response.status}`);
    }
  } catch (error) {
    errorNotification(`Error: ${error.message}`);
  }
}

// Function to open the purchase modal and fill in product info
function openPurchaseModal(productId, productName, unitPrice, storeId) {
  // Set product details in modal
  document.getElementById("productName").value = productName;
  document.getElementById("unitPrice").value = unitPrice;
  document.getElementById("productQuantity").value = 1;

  // Set store_id in hidden field
  document.getElementById("storeId").value = storeId;

  // Clear vendor_id for user to fill in
  document.getElementById("vendorId").value = "";

  // Show modal
  const purchaseModal = new bootstrap.Modal(
    document.getElementById("purchaseModal")
  );
  purchaseModal.show();

  // Attach the submit order function to the button
  document.getElementById("submitOrderBtn").onclick = () => {
    submitOrder(productId);
  };
}

// Function to handle order submission
async function submitOrder(productId) {
  const quantity = document.getElementById("productQuantity").value;
  // const paymentMethod =
  //   document.getElementById("paymentMethod").value || "Cash"; // Default to 'Cash' if not provided
  const storeId = document.getElementById("storeId").value;
  const vendorId = document.getElementById("vendorId").value;

  if (quantity < 1) {
    errorNotification("Quantity must be at least 1.");
    return;
  }

  if (!vendorId) {
    errorNotification("Vendor ID is required.");
    return;
  }

  const orderData = {
    vendor_id: vendorId,
    store_id: storeId,
    // payment_method: paymentMethod,
    details: [
      {
        product_id: productId,
        quantity: quantity,
        unit_price: document.getElementById("unitPrice").value,
      },
    ],
  };

  try {
    const response = await fetch(`${backendURL}/api/purchase/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      const orderResponse = await response.json();
      alert(
        `Order created successfully! Order ID: ${orderResponse.order.store_order_id}`
      );
      loadStoresWithProducts(); // Refresh the table
      const purchaseModal = bootstrap.Modal.getInstance(
        document.getElementById("purchaseModal")
      );
      purchaseModal.hide();
    } else {
      errorNotification(
        `Order submission failed: HTTP Error ${response.status}`
      );
    }
  } catch (error) {
    errorNotification(`Error: ${error.message}`);
  }
}

// Initialize the table on page load
loadStoresWithProducts();
