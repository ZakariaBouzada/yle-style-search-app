# Yle-Style Daycare Search App 🇫🇮

A responsive React web application designed to help citizens explore early childhood education data in Finland. Modeled after Yle's (Finnish Broadcasting Company) journalistic data graphics, the tool allows users to search for any municipality in mainland Finland to instantly view the percentage of foreign-language children in daycares and compare local figures against the national average.

**Live Demo:** [https://yle-style-search-app.vercel.app/](https://yle-style-search-app.vercel.app/)

---

## Key Features & Technical Choices

* **Dynamic JSON-stat2 Parsing (No Hardcoding):** Instead of using flat data structures or rigid, hardcoded lists of 309 municipalities, the application dynamically processes the raw `Kunnat2.json` file in its native **JSON-stat2** format. It extracts municipality names, codes, and numerical indices on the fly directly from the file's metadata, making the architecture highly scalable and robust against future data structure updates from Statistics Finland.
* **Yle-Inspired UX/UI:** Designed with a clean, mobile-first layout prioritizing scannability and accessibility. It features a custom auto-suggest search field and an intuitive visual horizontal bar chart.
* **Smart Baseline Alignment:** Automatically isolates the national baseline (using the `"SSS"` code representing "Koko maa") to provide an immediate red indicator line for relative comparison.
* **Internal Data Watchdog:** Includes a lightweight diagnostic layer (`useEffect` logger) running on load. It monitors data integrity, logging total parsed entries and flagging any corrupted values (`NaN`) or missing localization names straight to the browser console.

---

## Data Source & Statistics

* **Source:** Statistics Finland (*Tilastokeskus*), early childhood education statistics.
* **Scope:** The app includes data for **293 municipalities**. 
* *Note: As explicitly stated in the official source metadata, this dataset represents mainland Finland and excludes the 16 municipalities of Åland ("Ei sisällä Ahvenanmaan tietoja") due to different local data collection practices.*

---

## Future Improvements

If this prototype were to be scaled further for production on Yle.fi, the next architectural milestones would be:
1. **Side-by-Side Comparison:** Expanding the state array to allow users to select and overlay two different municipalities (e.g., *Helsinki vs. Vantaa*) simultaneously on the graph, alongside the national average line.
2. **Time-Series Visualization:** Leveraging the historical year dimensions already present in the JSON-stat2 metadata to build a small line chart showing trends over recent years.

---

## How to Run Locally

Follow these steps to get the development environment running locally on your machine:

1. **Clone the repository:**
```bash
   git clone https://github.com/ZakariaBouzada/yle-style-search-app.git
   cd yle-style-search-app
# Install dependencies
   npm install
# Start local server
   npm run dev
# Build for production (Optional)
   npm run build
```
