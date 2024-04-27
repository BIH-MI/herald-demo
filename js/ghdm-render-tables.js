// Generic Health Data Module (GHDM)
//
// Module: Render Tables
// 
// Copyright (C) 2023 - BIH Medical Informatics Group
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//       http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Render table preview
 * @param {*} cohortLabels 
 * @param {*} tables 
 * @param {*} outputDivId 
 */
function renderTables(cohortLabels, tables, outputDivId) {
  const outputDiv = document.getElementById(outputDivId);
  outputDiv.innerHTML = "";

  tables.forEach((table, i) => {
    const label = document.createElement("h3");
    label.textContent = `Table for ${cohortLabels[i]}`;
    outputDiv.appendChild(label);

    const tableElem = document.createElement("table");
    tableElem.classList.add("table", "table-bordered", "table-striped", "tiny-font");

    // Create table header row
    const headerRow = document.createElement("tr");

    table[0].forEach((concept) => {
      const columnHeader = document.createElement("th");
      columnHeader.scope = "col";
      columnHeader.innerHTML = sanitizeHTML(`${concept}`) + `<br> (Missing Rate: ${calculateMissingRate(concept, table)}%)`;
      headerRow.appendChild(columnHeader);
    });

    tableElem.appendChild(headerRow);

    // Create table data rows
    let numRows = table.length > 11 ? 11 : table.length; // add limit to 10 rows + header

    for (let i = 1; i < numRows; i++) {
      const dataRow = document.createElement("tr");
      const patientId = document.createElement("td");
      patientId.textContent = table[i][0];
      dataRow.appendChild(patientId);

      for (let j = 1; j < table[i].length; j++) {
        const dataCell = document.createElement("td");
        if (table[i][j]) {
          dataCell.textContent = formatCellContent(table[i][j]);
        } else {
          dataCell.textContent = "";
        }
        dataRow.appendChild(dataCell);
      }

      tableElem.appendChild(dataRow);
    }

    if (table.length > 11) {
      const moreDataRow = document.createElement("tr");
      const moreDataCell = document.createElement("td");
      moreDataCell.colSpan = table[0].length;
      moreDataCell.textContent = "...";
      moreDataRow.appendChild(moreDataCell);
      tableElem.appendChild(moreDataRow);
    }

    const tableContainer = document.createElement("div");
    tableContainer.classList.add("table-container");
    tableContainer.appendChild(tableElem);
    outputDiv.appendChild(tableContainer);
  });
}

/**
 * Utility function to calculate missing rate
 */
function calculateMissingRate(concept, table) {

  // Get the index of the concept in the header row
  let conceptIndex = table[0].indexOf(concept);

  // Concept does not exist in the table
  if (conceptIndex === -1) {
    return undefined;
  }

  // Count the number of missing values for the concept
  let missingCount = 0;
  for (let i = 1; i < table.length; i++) {
    if (table[i][conceptIndex] === null || table[i][conceptIndex] === undefined) {
      missingCount++;
    }
  }

  // Calculate the missing rate as a percentage
  let missingRate = (missingCount / (table.length - 1)) * 100;  // subtract 1 to exclude header row

  // Round to 2 decimal places
  return missingRate.toFixed(2);
}

/**
 * Utility function to format cell content
 */
function formatCellContent(content) {
  if (typeof content === 'object' && content !== null) {
    if (content.isNumeric && content.unit !== "Unknown") {
      let output = `${content.value}`;
      if (content.unit) {
        output += ` ${content.unit}`;
      }
      return output;
    } else {
      return `${content.value}`;
    }
  } else {
    return content;
  }
}

/**
 * Sanitize HTML
 */
function sanitizeHTML(text) {
  var element = document.createElement('div');
  element.textContent = text;
  return element.innerHTML;
}