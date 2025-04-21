import {
  backendURL,
  successNotification,
  errorNotification,
} from "../utils/utils.js";

// Fetch and display product types on page load
document.addEventListener("DOMContentLoaded", function () {
  const categoryId = new URLSearchParams(window.location.search).get(
    "category_id"
  );
  if (categoryId) {
    getProductTypes(categoryId); // Fetch product types for the category
  } else {
    errorNotification("Category ID is missing in the URL.");
  }
});


// Fetch product types for a specific category
async function getProductTypes(categoryId) {
  const productTypeContainer = document.getElementById("productTypeContainer");
  productTypeContainer.innerHTML = `<div class="text-center">Loading product types...</div>`;

  try {
    const response = await fetch(
      `${backendURL}/api/category/${categoryId}/subcategory`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.ok) {
      const productTypes = await response.json();
      console.log("Fetched Product Types:", productTypes);

      if (productTypes.length === 0) {
        productTypeContainer.innerHTML = `<div class="text-center text-muted">No product types found for this category.</div>`;
        return;
      }

      let productTypeHTML = `<div class="row">`;
      productTypes.forEach((productType) => {
        console.log("Product Type ID:", productType.product_type_id); // Debugging line
        productTypeHTML += `
     <div class="col-12 col-md-3 mb-4">
       <div class="card product-card" style="width: 18rem;" data-id="${productType.product_type_id}">
         <div class="card-body" style="background-color: #054003">
           <h5 class="card-title mb-2" style="color: #dfe101;">${productType.name}</h5>
         </div>
       </div>
     </div>`;
      });

      productTypeHTML += `</div>`;
      productTypeContainer.innerHTML = productTypeHTML;

      // Attach click events to product type cards
      document.querySelectorAll(".product-card").forEach((card) => {
        card.addEventListener("click", () => {
          const productTypeId = card.dataset.id; // Get the product type ID
          const categoryId = new URLSearchParams(window.location.search).get(
            "category_id"
          ); // Get the category ID
          const storeId = new URLSearchParams(window.location.search).get(
            "store_id"
          ); // Get the store ID

          if (categoryId && storeId && productTypeId) {
            console.log(
              `Redirecting to store page with Category ID: ${categoryId}, Product Type ID: ${productTypeId}, Store ID: ${storeId}`
            );
            // Redirect to store.html with category_id, product_type_id, and store_id
            window.location.href = `store.html?category_id=${categoryId}&product_type_id=${productTypeId}&store_id=${storeId}`;
          } else {
            errorNotification("Required parameters are missing.");
          }
        });
      });
    } else {
      errorNotification(
        `Failed to load product types: HTTP Error ${response.status}`
      );
      productTypeContainer.innerHTML = `<div class="text-center">No products to load.</div>`;
    }
  } catch (error) {
    errorNotification(
      "An error occurred while fetching product types: " + error.message
    );
    productTypeContainer.innerHTML = `<div class="text-center">No products to load.</div>`;
  }
}

// Handle form submission for adding a new product type
document.addEventListener("DOMContentLoaded", () => {
  const addProductTypeForm = document.getElementById("addProductTypeForm");
  const submitButton = addProductTypeForm
    ? addProductTypeForm.querySelector('button[type="submit"]')
    : null;

  if (!addProductTypeForm) {
    console.error("Form with ID 'addProductTypeForm' not found.");
    return;
  }
  if (!submitButton) {
    console.error("Submit button not found in 'addProductTypeForm'.");
    return;
  }

  addProductTypeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitButton.disabled = true;
    submitButton.innerHTML = `<div class="spinner-border me-2" role="status"></div><span>Saving...</span>`;

    const categoryId = new URLSearchParams(window.location.search).get(
      "category_id"
    );

    if (!categoryId) {
      errorNotification("Category ID is missing.");
      submitButton.disabled = false;
      submitButton.innerHTML = `Save`;
      return;
    }

    const formData = new FormData(e.target);
    const categoryData = {};
    formData.forEach((value, key) => {
      categoryData[key] = value;
    });

    // Ensure the correct parent_type_id is included in the request
    categoryData.parent_type_id = categoryId;

    try {
      const response = await fetch(`${backendURL}/api/product_type`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        successNotification("Subcategory added successfully.");
        addProductTypeForm.reset();

        const modalElement = document.getElementById("addSubCategoryModal");
        if (modalElement) {
          const modal =
            bootstrap.Modal.getInstance(modalElement) ||
            new bootstrap.Modal(modalElement);
          modal.hide();
        }

        await getProductTypes(categoryId); // Refresh the product types for this category
      } else if (response.status === 422) {
        const json = await response.json();
        errorNotification(json.message || "Validation error.");
      } else {
        throw new Error(`Network response error: ${response.status}`);
      }
    } catch (error) {
      errorNotification("An error occurred: " + error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = `Save`;
    }
  });
});
