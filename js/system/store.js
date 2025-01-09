import {
  backendURL,
  successNotification,
  errorNotification,
  logout,
} from "../utils/utils.js";

// Fetch and display all products on page load
document.addEventListener("DOMContentLoaded", function () {
  const storeId = new URLSearchParams(window.location.search).get("id");
  if (storeId) {
    getProducts(storeId); // Pass the store ID to fetch products for this store
  } else {
    errorNotification("Store ID is missing in the URL.");
  }
});

// Fetch products from the backend for a specific store
async function getProducts(storeId, query = "") {
  const productContainer = document.getElementById("productContainer");
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

      let cardHTML = `<div class="product-row">`;

      products.forEach((product) => {
        cardHTML += `
          <div class="col-12 col-md-3 mb-4">
            <div class="card product-card" style="width: 18rem;" data-id="${
              product.id
            }" data-name="${product.product_name}" data-price="${
          product.price
        }" data-quantity="${product.quantity}" data-description="${
          product.description || "No description available"
        }">
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

function showProductModal(productData) {
  // Populate the modal with product details
  document.getElementById("modalProductUPC").textContent = productData.UPC;
  document.getElementById("modalProductName").textContent = productData.name;
  document.getElementById("modalProductPrice").textContent = productData.price;
  document.getElementById("modalProductQuantity").textContent =
    productData.quantity;

  // Set up the order button
  const orderButton = document.getElementById("orderButton");
  orderButton.dataset.id = productData.id;
  // Show the modal
  const modalElement = document.getElementById("productDetailsModal");
  const modal = new bootstrap.Modal(modalElement);
  modal.show();

  // Handle order button click
  orderButton.onclick = () => handleOrder(productData.id);
}

async function handleOrder(productId) {
  try {
    const response = await fetch(`${backendURL}/api/order`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId }),
    });

    if (response.ok) {
      successNotification("Order placed successfully!");
      const modalElement = document.getElementById("productDetailsModal");
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal.hide();
    } else {
      const json = await response.json();
      errorNotification(json.message || "Failed to place the order.");
    }
  } catch (error) {
    errorNotification(
      "An error occurred while placing the order: " + error.message
    );
  }
}

// Handle form submission for adding a new product
document.addEventListener("DOMContentLoaded", () => {
  const addProductForm = document.getElementById("addProductForm");
  const submitButton = addProductForm
    ? addProductForm.querySelector('button[type="submit"]')
    : null;

  // Make sure the form and submit button exist
  if (!addProductForm) {
    console.error("Form with ID 'addProductForm' not found.");
    return;
  }
  if (!submitButton) {
    console.error("Submit button not found.");
    return;
  }

  addProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitButton.disabled = true;
    submitButton.innerHTML = `<div class="spinner-border me-2" role="status"></div><span>Saving...</span>`;

    // Get the store ID from URL query parameter
    const storeId = new URLSearchParams(window.location.search).get("id");

    // Prepare product data, including store_id
    const formData = new FormData(e.target);
    const productData = {};
    formData.forEach((value, key) => {
      productData[key] = value;
    });
    productData.store_id = storeId; // Add the store_id to the product data

    try {
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

        // Hide the modal after the form is submitted successfully
        const modalElement = document.getElementById("addProductModal");
        const modal =
          bootstrap.Modal.getInstance(modalElement) ||
          new bootstrap.Modal(modalElement);
        modal.hide();

        await getProducts(storeId); // Refresh the products for this store
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
