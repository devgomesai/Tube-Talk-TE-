document.addEventListener("DOMContentLoaded", () => {
  const resultsContainer = document.getElementById("resultsContainer");
  
  // Initialize Showdown converter
  const converter = new showdown.Converter();
  
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    try {
      // Get current tab
      const currentTab = tabs[0];
      
      // Extract YouTube video ID from URL
      const url = new URL(currentTab.url);
      let videoId = "";
      
      if (url.hostname.includes("youtube.com") && url.pathname.includes("watch")) {
        videoId = url.searchParams.get("v");
      } else if (url.hostname.includes("youtu.be")) {
        videoId = url.pathname.substring(1);
      }
      
      if (!videoId) {
        resultsContainer.innerHTML = "No YouTube video detected on this page.";
        return;
      }
      
      // Show loading message
      resultsContainer.innerHTML = `
        <div class="loading">
          Summarizing video...
        </div>
      `;
      
      // Fetch summary
      const response = await fetch("http://localhost:8000/summarize_video/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_id: videoId
        }),
      });
      
      if (!response.ok) throw new Error("Server error");
      
      const data = await response.json();
      
      // Convert the markdown summary to HTML using Showdown
      const htmlSummary = converter.makeHtml(data.summary);
      
      // Display the converted HTML summary
      resultsContainer.innerHTML = htmlSummary;
      
    } catch (error) {
      console.error("Error:", error);
      resultsContainer.innerHTML = `
        <div class="loading">
          Failed to load summary. Ensure the server is running on port 8000.
        </div>
      `;
    }
  });
});
