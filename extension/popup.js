document.addEventListener("DOMContentLoaded", () => {
  const productNameEl = document.getElementById("productName");
  const resultsContainer = document.getElementById("resultsContainer");

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    try {
      // Get product title
      const [scriptResult] = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => document.getElementById("productTitle")?.innerText.trim(),
      });

      const productTitle = scriptResult?.result || "No product found";
      productNameEl.textContent = `Product: ${productTitle}`;

      // Fetch recommendations
      const response = await fetch(`http://127.0.0.1:5000/eco`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_title: productTitle,
        }),
      });

      if (!response.ok) throw new Error("Server error");
      //
      const data = await response.json();
      // Clear loading message
      resultsContainer.innerHTML = data.suggestions;

      // Check if suggestions exist in the data
      //  if (data.suggestions) {
      //    // Create container for suggestions
      //    const suggestionsEl = document.createElement("div");
      //    suggestionsEl.className = "suggestions-container";
      //
      //    // Split the content by double newlines to separate sections
      //    //const sections = data.suggestions.split("\n\n");
      //
      //    //sections.forEach((section) => {
      //    //  if (section.trim()) {
      //    //    // Create section element
      //    //    const sectionEl = document.createElement("div");
      //    //    sectionEl.className = "suggestion-section";
      //    //
      //    //    // Process the section content
      //    //    let content = section
      //    //      // Convert markdown-style bold to HTML
      //    //      .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
      //    //      // Convert bullet points to HTML list items
      //    //      .split("\n")
      //    //      .map((line) => {
      //    //        line = line.trim();
      //    //        if (line.startsWith("*")) {
      //    //          return `<li>${line.substring(1).trim()}</li>`;
      //    //        }
      //    //        return `<p>${line}</p>`;
      //    //      })
      //    //      .join("");
      //    //
      //    //    // Wrap lists in ul tags
      //    //    if (content.includes("<li>")) {
      //    //      content = `<ul>${content}</ul>`;
      //    //    }
      //    //
      //    //    sectionEl.innerHTML = content;
      //    //    suggestionsEl.appendChild(sectionEl);
      //    //  }
      //    //});
      //
      //    resultsContainer.appendChild(suggestionsEl);
      //
      //    // Add CSS styles
      //    const style = document.createElement("style");
      //    style.textContent = `
      //  .suggestions-container {
      //    padding: 20px;
      //    max-width: 800px;
      //    margin: 0 auto;
      //  }
      //  .suggestion-section {
      //    margin-bottom: 20px;
      //  }
      //  .suggestion-section ul {
      //    padding-left: 20px;
      //    margin: 10px 0;
      //  }
      //  .suggestion-section li {
      //    margin: 5px 0;
      //  }
      //  .suggestion-section p {
      //    margin: 10px 0;
      //  }
      //  .suggestion-section strong {
      //    color: #333;
      //  }
      //`;
      //    document.head.appendChild(style);
      //  }
    } catch (error) {
      console.error("Error:", error);
      resultsContainer.innerHTML = `
    <div class="loading">
      Failed to load suggestions. Ensure the server is running on port 9000.
    </div>
  `;
    }
  });
});
