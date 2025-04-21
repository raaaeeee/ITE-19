function setRouter() {
  const token = localStorage.getItem("token");
  const user_id = localStorage.getItem("user_id");
  const vendor_id = localStorage.getItem("vendor_id");

  // Debugging logs to check the values
  console.log("Token:", token);
  console.log("user_id:", user_id);
  console.log("vendor_id:", vendor_id);

  // If user is logged in, redirect to dashboard if on login or register page
  if (
    (window.location.pathname === "/" ||
      window.location.pathname === "/login.html" ||
      window.location.pathname === "/vendor_login.html" ||
      window.location.pathname === "/register.html") &&
    token
  ) {
    window.location.pathname = "/dashboard.html";
    return; // Exit early to prevent further checks
  }

  // If user is not logged in, redirect to home page if accessing protected pages
  if (
    !token &&
    (window.location.pathname === "/dashboard.html" ||
      window.location.pathname === "/inventory.html" ||
      window.location.pathname === "/parent_type.html" ||
      window.location.pathname === "/product_type.html" ||
      window.location.pathname === "/products.html" ||
      window.location.pathname === "/purchase.html" ||
      window.location.pathname === "/sales.html" ||
      window.location.pathname === "/store_inventory.html" ||
      window.location.pathname === "/store_sales.html" ||
      window.location.pathname === "/store.html" ||
      window.location.pathname === "/vendor_dashboard.html")
  ) {
    window.location.pathname = "/";
    return; // Exit early to prevent further checks
  }
}

export { setRouter };
