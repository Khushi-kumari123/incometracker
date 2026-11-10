// Get saved transactions
function getTransactions() {
    return JSON.parse(
        localStorage.getItem("moneytrack_transactions") || "[]"
    );
}

// Save transactions
function saveTransactions(data) {
    localStorage.setItem(
        "moneytrack_transactions",
        JSON.stringify(data)
    );
}

// Format amount in Indian Rupees
function money(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);
}

// Show success or error message
function showMessage(message) {
    const element = document.getElementById("message");

    if (element) {
        element.textContent = message;
    }
}

// ADD INCOME AND EXPENSE

function setupTransactionForm() {

    const form = document.getElementById("transactionForm");

    if (!form) return;

    const dateInput = form.elements.date;

    if (dateInput) {
        dateInput.value = new Date().toISOString().slice(0, 10);
    }

    form.addEventListener("submit", function(event) {

        event.preventDefault();

        const data = new FormData(form);

        const amount = Number(data.get("amount"));

        if (!Number.isFinite(amount) || amount <= 0) {
            showMessage("Enter a valid amount.");
            return;
        }

        const transaction = {
            id: Date.now().toString(),
            type: form.dataset.type,
            amount: amount,
            category: data.get("category"),
            date: data.get("date"),
            description: data.get("description") || ""
        };

        const transactions = getTransactions();

        transactions.push(transaction);

        saveTransactions(transactions);

        form.reset();

        dateInput.value = new Date().toISOString().slice(0, 10);

        showMessage("Transaction saved successfully!");

    });
}

// PROFILE PAGE

function setupProfile() {

    const form = document.getElementById("profileForm");

    if (!form) return;

    const profile = JSON.parse(
        localStorage.getItem("moneytrack_profile") || "{}"
    );

    form.elements.name.value = profile.name || "";
    form.elements.email.value = profile.email || "";
    form.elements.phone.value = profile.phone || "";

    form.addEventListener("submit", function(event) {

        event.preventDefault();

        const user = {
            name: form.elements.name.value.trim(),
            email: form.elements.email.value.trim(),
            phone: form.elements.phone.value.trim()
        };

        localStorage.setItem(
            "moneytrack_profile",
            JSON.stringify(user)
        );

        showMessage("Profile updated successfully!");

    });
}

// REPORT PAGE

function setupReport() {

    const monthFilter = document.getElementById("monthFilter");

    if (!monthFilter) return;

    monthFilter.value = new Date().toISOString().slice(0, 7);

    function renderReport() {

        const selectedMonth = monthFilter.value;

        const transactions = getTransactions();

        const filtered = transactions.filter(function(item) {

            return !selectedMonth ||
                item.date.startsWith(selectedMonth);

        });

        const income = filtered
            .filter(item => item.type === "income")
            .reduce((total, item) => total + item.amount, 0);

        const expense = filtered
            .filter(item => item.type === "expense")
            .reduce((total, item) => total + item.amount, 0);

        const balance = income - expense;

        document.getElementById("incomeTotal").textContent =
            money(income);

        document.getElementById("expenseTotal").textContent =
            money(expense);

        document.getElementById("balanceTotal").textContent =
            money(balance);

        const tbody = document.getElementById("reportRows");

        if (filtered.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5">No transactions found.</td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML = "";

        filtered.sort((a, b) => b.date.localeCompare(a.date))
            .forEach(function(item) {

                const row = document.createElement("tr");

                const values = [
                    item.date,
                    item.category,
                    item.type,
                    money(item.amount),
                    item.description || "-"
                ];

                values.forEach(function(value) {

                    const cell = document.createElement("td");

                    cell.textContent = value;

                    row.appendChild(cell);

                });

                tbody.appendChild(row);

            });

    }

    monthFilter.addEventListener("change", renderReport);

    renderReport();
}

// START ALL FEATURES

document.addEventListener("DOMContentLoaded", function() {

    setupTransactionForm();

    setupProfile();

    setupReport();

});

