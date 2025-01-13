import {
  backendURL,
  successNotification,
  errorNotification,
  logout,
} from "../utils/utils.js";

// Utility to get URL parameters
function getParam(param) {
  const value = new URLSearchParams(window.location.search).get(param);
  if (!value) {
    errorNotification(`${param} is missing in the URL.`);
    console.error(`${param} is required.`);
    return null;
  }
  return value;
}

// Fetch and display all products on page load
document.addEventListener("DOMContentLoaded", function () {
  try {
    const storeId = getParam("store_id");
    const productTypeId = getParam("product_type_id");
    console.log("Store ID:", storeId, "Product Type ID:", productTypeId);

    getProducts(storeId, productTypeId); // Fetch products based on store and product type
  } catch (error) {
    console.error("Error during DOMContentLoaded:", error.message);
  }
});

// Fetch products from the backend for a specific store and product type
async function getProducts(storeId, productTypeId, query = "") {
  const productContainer = document.getElementById("productContainer");
  if (!productContainer) {
    console.error("Product container element not found.");
    return;
  }

  productContainer.innerHTML = `<div class="text-center">Loading products...</div>`;

  try {
    const response = await fetch(
      `${backendURL}/api/store/${storeId}/products${
        query ? `?search=${query}` : ""
      }`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.ok) {
      const products = await response.json();

      if (products.length === 0) {
        productContainer.innerHTML = `<div class="text-center text-muted">No products found.</div>`;
        return;
      }

      let cardHTML = `<div class="row">`;
      products.forEach((product) => {
        cardHTML += `
    <div class="col-12 col-md-3 mb-4">
      <div class="card product-card" style="width: 18rem;" 
           data-id="${product.product_id}"
           data-name="${product.product_name}" 
           data-price="${product.price}" 
           data-quantity="${product.quantity}" 
           data-description="${
             product.description || "No description available"
           }"
           data-upc="${product.UPC}">
        <div class="card-body">
          <h5 class="card-title mb-2">${product.product_name}</h5>
          <p class="card-text mb-2">Price: ${product.price}</p>
          <p class="card-text mb-2">Quantity: ${product.quantity}</p>
        </div>
      </div>
    </div>`;
      });
      cardHTML += `</div>`;
      productContainer.innerHTML = cardHTML;

      // Attach click events to product cards
      document.querySelectorAll(".product-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          const cardData = e.currentTarget.dataset;
          showProductModal(cardData);
        });
      });
    } else {
      errorNotification(`No products to load: HTTP Error ${response.status}`);
      productContainer.innerHTML = `<div class="text-center text-black">No products to load.</div>`;
    }
  } catch (error) {
    errorNotification(
      "An error occurred while fetching products: " + error.message
    );
    productContainer.innerHTML = `<div class="text-center text-danger">Error loading products.</div>`;
  }
}

// Initialize form submission and validation for adding products
document.addEventListener("DOMContentLoaded", () => {
  const addProductForm = document.getElementById("addProductForm");
  if (!addProductForm) {
    console.error("Form with ID 'addProductForm' not found.");
    return;
  }

  const submitButton = addProductForm.querySelector('button[type="submit"]');
  if (!submitButton) {
    console.error("Submit button not found.");
    return;
  }

  addProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitButton.disabled = true;
    submitButton.innerHTML = `<div class="spinner-border me-2" role="status"></div><span>Saving...</span>`;

    try {
      const storeId = getParam("store_id");
      const productTypeId = getParam("product_type_id");

      const formData = new FormData(e.target);
      const productData = Object.fromEntries(formData.entries());
      productData.store_id = storeId;
      productData.product_type_id = productTypeId;

      const response = await fetch(`${backendURL}/api/product`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        alert("Product added successfully.");
        addProductForm.reset();
        const modalElement = document.getElementById("addProductModal");
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
        await getProducts(storeId, productTypeId);
      } else if (response.status === 422) {
        const json = await response.json();
        errorNotification(json.message || "Validation error.");
      } else {
        throw new Error("Network response was not ok.");
      }
    } catch (error) {
      errorNotification("An error occurred: " + error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = `Save Product`;
    }
  });
});

function showProductModal(cardData) {
  const modal = new bootstrap.Modal(
    document.getElementById("productDetailsModal")
  );

  // Populate modal content with product details
  document.getElementById(
    "modalProductUPC"
  ).textContent = `UPC: ${cardData.upc}`;
  document.getElementById(
    "modalProductName"
  ).textContent = `Name: ${cardData.name}`;
  document.getElementById(
    "modalProductPrice"
  ).textContent = `Price: ${cardData.price}`;
  document.getElementById(
    "modalProductQuantity"
  ).textContent = `Quantity: ${cardData.quantity}`;

  // Attach click event to "Order" button
  const orderButton = document.getElementById("orderButton");
  if (orderButton) {
    orderButton.onclick = () => {
      showOrderFormModal(cardData);
    };
  }

  // Show the modal
  modal.show();
}

function showOrderFormModal(cardData) {
  const orderFormModal = new bootstrap.Modal(
    document.getElementById("orderFormModal")
  );

  const orderForm = document.getElementById("orderForm");

  // Ensure the form and elements exist
  if (!orderForm) {
    console.error("Order form not found.");
    return;
  }

  const storeIdInput = orderForm.querySelector("#storeId");
  const productIdInput = orderForm.querySelector("#productId");

  // Pre-fill form fields
  if (storeIdInput) {
    const storeId = getParam("store_id");
    if (storeId) {
      storeIdInput.value = storeId; // Fill store ID
    } else {
      console.error("store_id is missing in the URL.");
    }
  } else {
    console.error("#storeId input field not found.");
  }

  if (productIdInput) {
    productIdInput.value = cardData.id; // Fill product ID
  } else {
    console.error("#productId input field not found.");
  }

  // Attach submit event to the form
  const submitOrderButton = orderForm.querySelector("#submitOrderButton");
  if (submitOrderButton) {
    submitOrderButton.addEventListener("click", function (e) {
      e.preventDefault(); // Prevent form default submission
      submitOrder(orderForm); // Call submitOrder function
    });
  }

  // Show the modal
  orderFormModal.show();
}

async function submitOrder(orderForm) {
  const formData = new FormData(orderForm);

  // Construct the request payload
  const orderData = {
    order_date: formData.get("order_date"),
    quantity: formData.get("quantity"),
    customer_id: formData.get("customer_id"),
    product_id: formData.get("product_id"),
    store_id: formData.get("store_id"),
  };

  try {
    const response = await fetch(`${backendURL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      alert("Order submitted successfully!");
      // Close the modal
      const orderFormModal = bootstrap.Modal.getInstance(
        document.getElementById("orderFormModal")
      );
      orderFormModal.hide();
    } else {
      alert(`Failed to submit order: ${response.status}`);
    }
  } catch (error) {
    errorNotification(
      `An error occurred while submitting the order: ${error.message}`
    );
  }
}
