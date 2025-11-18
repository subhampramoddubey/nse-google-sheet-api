import fetch from "node-fetch";

export default async function handler(req, res) {
  const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/1vAcm8Dvx9UQz4HvdUOuXppEHVF5TWaFdfkMcfVWrMuY/gviz/tq?tqx=out:csv";

  try {
    // 1. Fetch the Google Sheet CSV publicly
    const response = await fetch(SHEET_URL);
    const csv = await response.text();

    // 2. Convert CSV → JSON
    const rows = csv.split("\n").map(r => r.split(","));
    const headers = rows.shift().map(h => h.trim());

    let json = rows.map(row => {
      let obj = {};
      row.forEach((val, i) => {
        obj[headers[i]] = val.trim();
      });
      return obj;
    });

    // 3. Apply Filtering
    const filters = req.query; // e.g. ?symbol=TCS&date=2024-11-18

    for (const key in filters) {
      json = json.filter(row =>
        (row[key] || "").toLowerCase() === filters[key].toLowerCase()
      );
    }

    // 4. Return JSON
    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
