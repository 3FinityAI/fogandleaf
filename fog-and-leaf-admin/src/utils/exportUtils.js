// Export utilities for shipping data
import * as XLSX from "xlsx";

export const exportToCSV = (data, filename = "shipments") => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Define CSV headers and mapping
  const headers = [
    "Order Number",
    "Customer Name",
    "Customer Email",
    "Phone",
    "Tracking Number",
    "Carrier",
    "Status",
    "Ship Date",
    "Estimated Delivery",
    "Destination City",
    "Destination State",
    "Delivery Notes",
  ];

  // Transform shipment data to CSV format
  const csvData = data.map((shipment) => [
    shipment.orderNumber || "",
    shipment.customerName || "",
    shipment.order?.contactEmail || "",
    shipment.order?.contactPhone || "",
    shipment.trackingNumber || "",
    shipment.carrier || "",
    shipment.status || "",
    shipment.shippedAt
      ? new Date(shipment.shippedAt).toLocaleDateString("en-IN")
      : "",
    shipment.estimatedDelivery
      ? new Date(shipment.estimatedDelivery).toLocaleDateString("en-IN")
      : "",
    shipment.shippingCity || "",
    shipment.shippingState || "",
    shipment.deliveryNotes || "",
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  // Download CSV file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (data, filename = "shipments") => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Transform data for Excel
  const excelData = data.map((shipment) => ({
    "Order Number": shipment.orderNumber || "",
    "Customer Name": shipment.customerName || "",
    "Customer Email": shipment.order?.contactEmail || "",
    Phone: shipment.order?.contactPhone || "",
    "Tracking Number": shipment.trackingNumber || "",
    Carrier: shipment.carrier?.toUpperCase() || "",
    Status: shipment.status || "",
    "Ship Date": shipment.shippedAt
      ? new Date(shipment.shippedAt).toLocaleDateString("en-IN")
      : "",
    "Estimated Delivery": shipment.estimatedDelivery
      ? new Date(shipment.estimatedDelivery).toLocaleDateString("en-IN")
      : "",
    "Destination City": shipment.shippingCity || "",
    "Destination State": shipment.shippingState || "",
    "Total Amount": shipment.order?.totalAmount || 0,
    "Delivery Notes": shipment.deliveryNotes || "",
  }));

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Shipments");

  // Auto-size columns
  const colWidths = Object.keys(excelData[0] || {}).map((key) => ({
    wch: Math.max(key.length, 15),
  }));
  ws["!cols"] = colWidths;

  // Download Excel file
  XLSX.writeFile(
    wb,
    `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`
  );
};

export const exportToPDF = (data, filename = "shipments") => {
  // For PDF export, you could integrate with jsPDF or similar library
  // For now, we'll use a simple approach
  alert(
    "PDF export feature coming soon! Please use CSV or Excel export for now."
  );
};
