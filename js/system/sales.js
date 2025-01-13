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
document.addEventListener("DOMContentLoaded", () => {
  fetchDailySalesPerStore();
});

async function fetchDailySalesPerStore() {
  try {
    const response = await fetch(`${backendURL}/api/daily-store-sales`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.sales) {
      populateSalesContainer(data.sales, data.date);
    } else {
      throw new Error("Invalid data structure received.");
    }
  } catch (error) {
    console.error("Error fetching daily sales per store:", error);
    const salesContainer = document.getElementById("salesContainer");
    salesContainer.innerHTML =
      "<p class='text-danger'>Failed to load sales data. Please try again later.</p>";
  }
}

function populateSalesContainer(salesData, date) {
  const salesContainer = document.getElementById("salesContainer");
  salesContainer.innerHTML = ""; // Clear previous content

  // Display the date
  const dateHeader = document.createElement("h5");
  dateHeader.textContent = `Sales for ${date}`;
  dateHeader.className = "mb-4";
  salesContainer.appendChild(dateHeader);

  // Create cards for each store
  salesData.forEach((store) => {
    const card = document.createElement("div");
    card.className = "col-12 col-md-6 col-lg-4 mb-4";

    card.innerHTML = `
      <div class="card">
        <div class="card-body text-center">
          <h5 class="card-title">${store.store_address}</h5>
          <p class="card-text">
            <strong>Daily Sales:</strong> ₱${formatCurrency(store.total_sales)}
          </p>
          <canvas id="chart-${store.store_id}" style="height: 200px;"></canvas>
        </div>
      </div>
    `;

    salesContainer.appendChild(card);

    // Optional: Render a chart for each store
    renderStoreChart(`chart-${store.store_id}`, store.total_sales);
  });
}

// Function to format the sales value in Peso (PHP) format
function formatCurrency(value) {
  return value.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
}

function renderStoreChart(chartId, totalSales) {
  const ctx = document.getElementById(chartId)?.getContext("2d");

  if (ctx) {
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Total Sales"],
        datasets: [
          {
            label: "Sales",
            data: [totalSales],
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }
}
