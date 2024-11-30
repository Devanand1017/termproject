const API_URL = "https://api.coingecko.com/api/v3/coins/markets";

// Fetch and display cryptocurrency data
async function fetchCryptos() {
    console.log("Fetching cryptocurrency data...");
    try {
        const response = await fetch(`${API_URL}?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`);
        const data = await response.json();
        console.log("Cryptocurrency data fetched successfully:", data);
        displayCryptos(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Display cryptocurrency data in the table
function displayCryptos(data) {
    console.log("Displaying cryptocurrency data...");
    const cryptoTable = document.getElementById("crypto-table");
    cryptoTable.innerHTML = ""; // Clear existing data

    data.forEach(crypto => {
        console.log(`Displaying crypto: ${crypto.name} (${crypto.symbol.toUpperCase()})`);
        const cryptoDiv = document.createElement("div");
        cryptoDiv.innerHTML = `
            <strong>${crypto.name} (${crypto.symbol.toUpperCase()})</strong>
            <p>Price: $${crypto.current_price}</p>
            <p>Market Cap: $${crypto.market_cap.toLocaleString()}</p>
            <button onclick="addToComparison('${crypto.id}')">Compare</button>
        `;
        cryptoTable.appendChild(cryptoDiv);
    });
    console.log("Cryptocurrency data displayed in the table.");
}

// Add cryptocurrency to the comparison section
function addToComparison(id) {
    console.log(`Attempting to add cryptocurrency with ID: ${id} to comparison.`);
    const selectedCryptos = JSON.parse(localStorage.getItem("comparison")) || [];

    if (selectedCryptos.includes(id)) {
        console.log(`Cryptocurrency with ID: ${id} is already in the comparison list.`);
        alert("This cryptocurrency is already added for comparison.");
        return;
    }

    if (selectedCryptos.length < 5) {
        selectedCryptos.push(id);
        localStorage.setItem("comparison", JSON.stringify(selectedCryptos));
        console.log(`Cryptocurrency with ID: ${id} added to comparison list.`);
        updateComparison(selectedCryptos);
    } else {
        console.log("Cannot add more than 5 cryptocurrencies to comparison.");
        alert("You can only compare up to 5 cryptocurrencies!");
    }
}

// Update the comparison section
async function updateComparison(selectedCryptos) {
    console.log("Updating comparison section...");
    const comparisonTable = document.getElementById("comparison-table");
    comparisonTable.innerHTML = ""; // Clear existing data

    // Fetch data for all selected cryptocurrencies
    const fetchPromises = selectedCryptos.map(id => {
        console.log(`Fetching data for cryptocurrency with ID: ${id}`);
        return fetch(`${API_URL}?vs_currency=usd&ids=${id}&order=market_cap_desc`)
            .then(response => response.json())
            .then(data => data[0])
            .catch(error => {
                console.error(`Error fetching data for cryptocurrency with ID: ${id}:`, error);
                return null; // Return null if error occurs
            });
    });

    try {
        const cryptos = await Promise.all(fetchPromises);
        cryptos.forEach(crypto => {
            if (crypto) {
                console.log(`Displaying crypto in comparison: ${crypto.name} (${crypto.symbol.toUpperCase()})`);
                const cryptoDiv = document.createElement("div");
                cryptoDiv.innerHTML = `
                    <strong>${crypto.name} (${crypto.symbol.toUpperCase()})</strong>
                    <p>Price: $${crypto.current_price}</p>
                    <p>24h Change: ${crypto.price_change_percentage_24h?.toFixed(2) || 0}%</p>
                    <button onclick="removeFromComparison('${crypto.id}')">Remove</button>
                `;
                comparisonTable.appendChild(cryptoDiv);
            }
        });
        console.log("Comparison section updated successfully.");
    } catch (error) {
        console.error("Error updating comparison section:", error);
    }
}

// Remove cryptocurrency from the comparison section
function removeFromComparison(id) {
    console.log(`Removing cryptocurrency with ID: ${id} from comparison.`);
    const selectedCryptos = JSON.parse(localStorage.getItem("comparison")) || [];
    const updatedCryptos = selectedCryptos.filter(cryptoId => cryptoId !== id);
    localStorage.setItem("comparison", JSON.stringify(updatedCryptos));
    updateComparison(updatedCryptos);
    console.log(`Cryptocurrency with ID: ${id} removed from comparison.`);
}

// Load initial data on page load
document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded. Fetching initial data...");
    fetchCryptos();
    const selectedCryptos = JSON.parse(localStorage.getItem("comparison")) || [];
    updateComparison(selectedCryptos);
});
