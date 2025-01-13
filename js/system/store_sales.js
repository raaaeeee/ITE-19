import {
  backendURL,
  successNotification,
  errorNotification,
  logout,
} from "../utils/utils.js";

// Fetch the top products for a specific store by storeId
async function fetchTopProducts(storeId) {
  try {
    const response = await fetch(
      `${backendURL}/api/top-products-per-store/${storeId}`,
      {
        method: "GET", // Explicitly define the HTTP method
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch top products");
    }

    const data = await response.json();

    if (data.message) {
      errorNotification(data.message);
    } else {
      renderChart(data);
      successNotification(
        "Top products fetched and chart rendered successfully"
      );
    }
  } catch (error) {
    console.error("Error fetching top products:", error);
    errorNotification("Failed to fetch top products");
  }
}

// Render the chart with the fetched data
function renderChart(data) {
  if (data && Array.isArray(data.products)) {
    const productNames = data.products.map((product) => product.product_name);
    const productSales = data.products.map((product) =>
      parseInt(product.total_sales)
    );

    const chartData = {
      labels: productNames,
      datasets: [
        {
          label: "Units Sold",
          data: productSales,
          backgroundColor: [
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    const ctx = document.getElementById("storeChart");
    if (ctx) {
      const chart = new Chart(ctx.getContext("2d"), {
        type: "pie",
        data: chartData,
        options: {
          responsive: true, // Responsive
          maintainAspectRatio: false, // Allow resizing to fit container
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return `${tooltipItem.label}: ${tooltipItem.raw} units`;
                },
              },
            },
          },
        },
      });
    } else {
      errorNotification("Chart container not found.");
    }
  } else {
    errorNotification("Invalid data format for top products");
  }
}

const id = new URLSearchParams(window.location.search).get("id"); // Get the `id` param

if (id) {
  // Fetch and display top products for the store using the `id`
  fetchTopProducts(id);
} else {
  console.error("Store ID is not provided in the URL");
}
