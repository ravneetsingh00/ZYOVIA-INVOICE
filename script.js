/*********************************
 * BASIC SETUP
 *********************************/
const MAX_ROWS = 17;
const itemsBody = document.getElementById("itemsBody");
const SELLER_STATE = "Punjab";

/*********************************
 * CREATE FIXED ROWS (EMPTY BY DEFAULT)
 *********************************/
function createRows() {
  itemsBody.innerHTML = "";

  for (let i = 1; i <= MAX_ROWS; i++) {
    const tr = document.createElement("tr");
    tr.className = "item-row";

    tr.innerHTML = `
      <td>${i}</td>
      <td contenteditable="true" class="desc"></td>
      <td contenteditable="true" class="qty"></td>
      <td contenteditable="true" class="rate"></td>
      <td contenteditable="true" class="gst-rate"></td>
      <td class="gst-amount"></td>
      <td class="row-total"></td>
    `;

    itemsBody.appendChild(tr);
  }
}

/*********************************
 * SAFE NUMBER PARSER
 *********************************/
function getNumber(text) {
  if (!text) return 0;
  return parseFloat(text.replace(/[₹,]/g, "")) || 0;
}

/*********************************
 * AUTO GST RULE (₹999 LOGIC)
 *********************************/
function autoGST(rateCell, gstCell) {
  const price = getNumber(rateCell.innerText);

  if (price > 0) {
    gstCell.innerText = price <= 999 ? "5" : "12";
  } else {
    gstCell.innerText = "";
  }
}

/*********************************
 * GST TYPE MANAGEMENT
 *********************************/
function toggleGSTType() {
  const gstType = document.getElementById("gstType")?.value || "cgst_sgst";

  if (gstType === "igst") {
    document.getElementById("igstRow").style.display = "table-row";
    document.getElementById("cgstRow").style.display = "none";
    document.getElementById("sgstRow").style.display = "none";
  } else {
    document.getElementById("igstRow").style.display = "none";
    document.getElementById("cgstRow").style.display = "table-row";
    document.getElementById("sgstRow").style.display = "table-row";
  }

  calculateInvoice();
}

/*********************************
 * CALCULATE INVOICE (CORE LOGIC)
 *********************************/
function calculateInvoice() {
  let subtotal = 0;
  let totalGST = 0;

  document.querySelectorAll(".item-row").forEach(row => {
    const qtyCell = row.querySelector(".qty");
    const rateCell = row.querySelector(".rate");
    const gstRateCell = row.querySelector(".gst-rate");

    const qty = getNumber(qtyCell.innerText);
    const rate = getNumber(rateCell.innerText);

    autoGST(rateCell, gstRateCell);

    const gstRate = getNumber(gstRateCell.innerText);
    const rowAmount = qty * rate;
    const gstAmount = (rowAmount * gstRate) / 100;
    const total = rowAmount + gstAmount;

    row.querySelector(".gst-amount").innerText =
      gstAmount > 0 ? `₹${gstAmount.toFixed(2)}` : "";

    row.querySelector(".row-total").innerText =
      total > 0 ? `₹${total.toFixed(2)}` : "";

    subtotal += rowAmount;
    totalGST += gstAmount;
  });

  // SUBTOTAL
  document.getElementById("subTotal").innerText =
    subtotal > 0 ? `₹${subtotal.toFixed(2)}` : "";

  // GST VALUES
  const gstType = document.getElementById("gstType")?.value || "cgst_sgst";

  if (gstType === "igst") {
    document.getElementById("igstValue").innerText =
      totalGST > 0 ? `₹${totalGST.toFixed(2)}` : "";
    document.getElementById("cgstValue").innerText = "";
    document.getElementById("sgstValue").innerText = "";
  } else {
    const halfGST = totalGST / 2;
    document.getElementById("cgstValue").innerText =
      halfGST > 0 ? `₹${halfGST.toFixed(2)}` : "";
    document.getElementById("sgstValue").innerText =
      halfGST > 0 ? `₹${halfGST.toFixed(2)}` : "";
    document.getElementById("igstValue").innerText = "";
  }

  // TRANSPORT
  const transport = getNumber(document.getElementById("transport").innerText);

  // GRAND TOTAL
  const grandTotal = subtotal + totalGST + transport;
  document.getElementById("grandTotal").innerText =
    grandTotal > 0 ? `₹${grandTotal.toFixed(2)}` : "";

  updateAmountInWords(grandTotal);
}

/*********************************
 * AMOUNT IN WORDS (INDIAN)
 *********************************/
function updateAmountInWords(amount) {
  const target = document.getElementById("amountWords");
  if (!target) return;

  if (amount > 0) {
    target.innerText = numberToWords(Math.round(amount)) + " Rupees Only";
  } else {
    target.innerText = "";
  }
}

/*********************************
 * NUMBER TO WORDS (INDIAN SYSTEM)
 *********************************/
function numberToWords(num) {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
    "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty",
    "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "";

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + " Crore " + inWords(n % 10000000);
  }

  return inWords(num).replace(/\s+/g, " ").trim();
}

/*********************************
 * LIVE INPUT LISTENER
 *********************************/
document.addEventListener("input", e => {
  if (
    e.target.classList.contains("qty") ||
    e.target.classList.contains("rate") ||
    e.target.classList.contains("gst-rate") ||
    e.target.id === "transport"
  ) {
    calculateInvoice();
  }
});

/*********************************
 * THEME SWITCHER
 *********************************/
function setMood(mode) {
  const root = document.documentElement;

  if (mode === "classic") {
    root.style.setProperty("--bg-page", "#d7bc34ff");
    root.style.setProperty("--bg-header", "#000");
    root.style.setProperty("--text-main", "#000");
    root.style.setProperty("--text-light", "#fff");
    root.style.setProperty("--border-color", "#000");
    root.style.setProperty("--table-border", "#000");
    root.style.setProperty("--accent", "#000");
  }

  if (mode === "luxury") {
    root.style.setProperty("--bg-page", "#ffffff");
    root.style.setProperty("--bg-header", "#000000ff");
    root.style.setProperty("--text-main", "#1c1c1c");
    root.style.setProperty("--text-light", "#f5f2ed");
    root.style.setProperty("--border-color", "#555");
    root.style.setProperty("--table-border", "#777");
    root.style.setProperty("--accent", "#bfa76f");
  }
}

/*********************************
 * SAVE (HIDE BUTTONS ONLY)
 *********************************/
function saveInvoice() {
  document.body.classList.remove("edit-mode");
  document.body.classList.add("saved-mode");
}

/*********************************
 * INIT (VERY IMPORTANT)
 *********************************/
createRows();
toggleGSTType();
calculateInvoice();




/*********************************
 * PASSWORD OR WELCOME WINDOW SECTION
 *********************************/

const INVOICE_PASSWORD = "12345"; // your password

function checkPassword() {
  const inputEl = document.getElementById("invoicePassword");
  const errorEl = document.getElementById("passwordError");

  if (inputEl.value === INVOICE_PASSWORD) {
    errorEl.innerText = ""; // clear error
    document.getElementById("welcomePopup").style.display = "none";
  } else {
    errorEl.innerText = "Incorrect password";
  }
}


function togglePassword() {
  const input = document.getElementById("invoicePassword");

  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
}


document.addEventListener("input", function (e) {
  if (e.target.id === "invoicePassword") {
    document.getElementById("passwordError").innerText = "";
  }
});
