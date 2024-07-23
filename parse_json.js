const fs = require("fs").promises;
const path = require("path");

async function appendToCSV(exam_name) {
  try {
    // Parse the JSON data
    let jsonData;
    try {
      jsonData = require("./quizlet_data.json");
    } catch (error) {
      console.error("Error reading or parsing quizlet_data.json:", error);
      return;
    }

    // Safely extract URLs and titles
    const sets = jsonData?.responses?.[0]?.models?.set || [];
    if (sets.length === 0) {
      console.warn("No set data found in the JSON file.");
      return;
    }

    const data = sets.map((set) => ({
      title: set?.title || "",
      url: set?._webUrl || "",
      numTerms: set?.numTerms || 0,
    }));

    // Prepare CSV content
    const csvRows = data.map((item) => {
      const title = item.title.replace(/"/g, '""').replace(/\n/g, " ");
      const url = item.url.replace(/"/g, '""');
      const numTerms = isNaN(item.numTerms) ? 0 : item.numTerms;
      return `"${title}","${url}",${numTerms}`;
    });

    const csvFilePath = path.join(__dirname, "./output/quizlet_sets_cpa.csv");


    // Check if file exists
    let fileExists = false;
    try {
      await fs.access(csvFilePath);
      fileExists = true;
    } catch (error) {
      // File doesn't exist, we'll create it
    }

    if (!fileExists) {
      // If file doesn't exist, add header
      await fs.writeFile(csvFilePath, "Title,URL,numTerms\n");
    }

    // Append new data to CSV file
    if (csvRows.length > 0) {
      await fs.appendFile(csvFilePath, csvRows.join("\n") + "\n");
      console.log(`Appended ${csvRows.length} sets to quizlet_sets_ptcb.csv`);
    } else {
      console.log("No valid data to append to CSV.");
    }
  } catch (error) {
    console.error("Unexpected error occurred:", error);
  }
}

// Run the function
appendToCSV();
