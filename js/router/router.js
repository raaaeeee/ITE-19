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
      window.location.pathname === "/citizen.html" ||
      window.location.pathname === "/history.html" ||
      window.location.pathname === "/supplies.html" ||
      window.location.pathname === "/admin.html" ||
      window.location.pathname === "/bhw.html" ||
      window.location.pathname === "/profiling.html" ||
      window.location.pathname === "/reports.html" ||
      window.location.pathname === "/view_users.html" ||
      window.location.pathname === "/demo.html" ||
      window.location.pathname === "/service_view.html" ||
      window.location.pathname === "/services.html" ||
      window.location.pathname === "/stakeholder.html" ||
      window.location.pathname === "/superadmin_report.html" ||
      window.location.pathname === "/superadmin.html" ||
      window.location.pathname === "/users.html" ||
      window.location.pathname === "/admin_user_view.html" ||
      window.location.pathname === "/user_view.html" ||
      window.location.pathname === "/stakeholder-dashboard.html" ||
      window.location.pathname === "/services.html")
  ) {
    window.location.pathname = "/";
    return; // Exit early to prevent further checks
  }
}

export { setRouter };
