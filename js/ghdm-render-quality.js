// Generic Health Data Module (GHDM)
//
// Module: Render Quality Report
// 
// Copyright (C) 2023-2024 - BIH Medical Informatics Group
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
 * @module
 * CrossSectionalAnalysisPlugin / Render Quality Report
 */

/**
 * Analyze tables
 * @param {*} tables 
 * @returns 
 */
function analyzeTables(tables) {

  // For each table
  const qualityReports = tables.map((table, i) => {

    // Get header
    const columnHeader = table[0];

    // Skip the PatientID, Age, and Sex columns if present
    const skipColumns = columnHeader.filter(col => ["Age", "Sex"].includes(col)).length + 1;
    const observationColumns = columnHeader.slice(skipColumns);

    // Prepare
    const numRows = table.length - 1; // Exclude the header row
    const numColumns = observationColumns.length;
    const indicators = {};
    let missingValues = 0;

    // For each column
    observationColumns.forEach((obsColumn, colIndex) => {

      // Prepare
      let nonEmptyCount = 0;
      let uniqueCount = 0;
      const uniqueValues = new Set();
      const uniqueUnits = new Set ();
      const uniqueDataTypes = new Set ();

      // Go through rows
      for (let i = 1; i < table.length; i++) {

        // Skip the PatientID, Age, and Sex columns if present
        const value = table[i][colIndex + skipColumns];
        if (value && value.value) {
          // Check for uniquness in values
          nonEmptyCount++;

          if (!uniqueValues.has(JSON.stringify(value))) {
            uniqueValues.add(JSON.stringify(value));
            uniqueCount++;
          }
        }
        // Check for data types
        if (value && !value.isNumeric) {
          uniqueDataTypes.add("Categorical");
        } else if (value && value.isNumeric) {
          if (Number.isInteger(parseFloat(value.value))) {
            uniqueDataTypes.add("Integer");
          } else {
            uniqueDataTypes.add("Decinmal");
          }
        }
        // Check for units
        if (value && value.unit) {
          uniqueUnits.add(value.unit);
        }
      }

      // Calculate
      const completeness = (nonEmptyCount / numRows) * 100;
      const uniqueness = nonEmptyCount === 0 ? 0 : (uniqueCount / nonEmptyCount) * 100;
      const columnMissingValues = numRows - nonEmptyCount;
      missingValues += columnMissingValues;
      const unitResult = uniqueUnits.size === 1 ? Array.from(uniqueUnits)[0] :
                 uniqueUnits.size > 1 ? "Mixed" : "Unknown";
      const dataTypeResult = uniqueDataTypes.size === 1 ? Array.from(uniqueDataTypes)[0] :
                 uniqueDataTypes.has("Categorical") ? "Mixed" : "Decimal"

      // Store
      indicators[colIndex] = {
        label: obsColumn,
        completeness: completeness.toFixed(2),
        missingValues: ((columnMissingValues / numRows) * 100).toFixed(2),
        uniqueness: uniqueness.toFixed(2),
        dataType: dataTypeResult,
        unit: unitResult
      };
    });

    // Overall missigness
    const missingRate = (missingValues / (numRows * numColumns)) * 100;

    // Done
    return {
      tableIndex: i + 1,
      rowCount: numRows,
      columnCount: numColumns,
      missingValues: missingValues,
      missingRate: missingRate.toFixed(2),
      indicators,
    };
  });

  // Done
  return qualityReports;
}

/**
 * Render quality reports
 * @param {*} cohortLabels 
 * @param {*} tables 
 * @param {*} outputDivId 
 */
function renderQualityReport(cohortLabels, tables, outputDivId) {

  // Clear
  const outputDiv = document.getElementById(outputDivId);
  outputDiv.innerHTML = "";
  
  // Analze
  const reports = analyzeTables(tables);

  // Render
  reports.forEach((report, i) => {
    const reportDiv = document.createElement("div");

    const cohortLabel = document.createElement("h3");
    cohortLabel.textContent = `Data quality report for Cohort ${cohortLabels[i]}`;
    reportDiv.appendChild(cohortLabel);

    // Observation indicators table
    const indicatorsTable = document.createElement("table");
    indicatorsTable.classList.add("table", "table-bordered", "table-striped");

    const indicatorsHeaderRow = document.createElement("tr");
    const indicatorHeaders = ["Label", "Completeness (%)", "Missing rate (%)", "Uniqueness (%)", "Data Type", "Unit"];
    indicatorHeaders.forEach((header) => {
      const columnHeader = document.createElement("th");
      columnHeader.scope = "col";
      columnHeader.textContent = header;
      indicatorsHeaderRow.appendChild(columnHeader);
    });
    indicatorsTable.appendChild(indicatorsHeaderRow);

    Object.values(report.indicators).forEach((indicator) => {
      const indicatorRow = document.createElement("tr");

      [indicator.label, indicator.completeness, indicator.missingValues, indicator.uniqueness, indicator.dataType, indicator.unit].forEach((value) => {
        const dataCell = document.createElement("td");
        dataCell.textContent = value;
        indicatorRow.appendChild(dataCell);
      });

      indicatorsTable.appendChild(indicatorRow);
    });

    reportDiv.appendChild(indicatorsTable);

    // Append report to the output div
    outputDiv.appendChild(reportDiv);
  });
}
