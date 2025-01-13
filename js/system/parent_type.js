import {
  backendURL,
  successNotification,
  errorNotification,
  logout,
} from "../utils/utils.js";

// Fetch and display all categories on page load
document.addEventListener("DOMContentLoaded", function () {
  const storeId = new URLSearchParams(window.location.search).get("id");
  if (storeId) {
    getCategory(storeId); // Pass the store ID to fetch categories for this store
    updateSalesLink(storeId); // Update the sales link dynamically
  } else {
    errorNotification("Store ID is missing in the URL.");
  }
});

// Update the Sales link in the navbar with the storeId
function updateSalesLink(storeId) {
  const salesLink = document.querySelector(
    '.nav-link[href="store_sales.html"]'
  );
  if (salesLink) {
    salesLink.href = `store_sales.html?id=${storeId}`;
  }
}

// Fetch categories from the backend for a specific store
async function getCategory(storeId, query = "") {
  const productContainer = document.getElementById("parentContainer");
  productContainer.innerHTML = `<div class="text-center">Loading categories...</div>`;

  try {
    const response = await fetch(
      `${backendURL}/api/store/${storeId}/category${
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
      const parent_type = await response.json();
      console.log("Fetched Categories:", parent_type);

      if (parent_type.length === 0) {
        productContainer.innerHTML = `<div class="text-center text-muted">No categories found.</div>`;
        return;
      }

      let cardHTML = `<div class="row">`;
      parent_type.forEach((type) => {
        cardHTML += `
          <div class="col-12 col-md-3 mb-4">
            <div class="card product-card" style="width: 18rem;" data-id="${type.parent_type_id}" data-name="${type.name}">
              <div class="card-body" style="background-color: #013a30; ">
                <h5 class="card-title mb-2" style=" color: #dfe101;">${type.name}</h5>
              </div>
            </div>
          </div>`;
      });
      cardHTML += `</div>`;
      productContainer.innerHTML = cardHTML;

      // Attach click events to category cards
      document.querySelectorAll(".product-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          const categoryId = card.dataset.id;
          const categoryName = card.dataset.name;

          // Ensure the storeId is passed to the product type page
          window.location.href = `product_type.html?category_id=${categoryId}&store_id=${storeId}`;
        });
      });
    } else {
      errorNotification(`No categories to load: HTTP Error ${response.status}`);
      productContainer.innerHTML = `<div class="text-center text-black">No categories to load.</div>`;
    }
  } catch (error) {
    errorNotification(
      "An error occurred while fetching categories: " + error.message
    );
    productContainer.innerHTML = `<div class="text-center text-danger">Error loading categories.</div>`;
  }
}

// Fetch all products from the backend for a specific store
async function getAllProductsByStore(storeId, query = "") {
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
        productContainer.innerHTML = `<div class="text-center text-muted">No products found for this store.</div>`;
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
