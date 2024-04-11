/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
// Generic Health Data Module (GHDM)
//
// Module: Data Wrangling Functions
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
 * ghdm-data / Data Wrangling Functions
 */

/**
 * Returns queryable observations
 */
function getQueryableObservations(patient) {

    function traverse(concepts, path) {
      let array = [];
      concepts.forEach(concept => {
        let localPath = path === '' ? concept.label : path + ' > ' + concept.label;
        if (concept.observations.length != 0) {
          for (observation of concept.observations) {
            array.push(new Herald.QueryableObservation(localPath, observation.start, observation.end, observation.isNumeric, observation.value, observation.unit));
          }
        } else {
          let subArray = traverse(concept.subConcepts, localPath);
          array.push(...subArray);
        }
      });
      return array;
    }

    return traverse(patient.concepts, '');
}

/**
 * Returns the value of the first observation found that complies with the given path
 */
function getObservationValueForPath(patient, targetPath) {
  function traverse(concepts, path) {
      for (let concept of concepts) {
          let localPath = path === '' ? concept.label : path + ' > ' + concept.label;
          if (concept.observations.length != 0) {
              for (let observation of concept.observations) {
                  if (localPath === targetPath) {
                      return observation.value;
                  }
              }
          } else {
              let result = traverse(concept.subConcepts, localPath);
              if (result) {
                  return result;
              }
          }
      }
      return undefined;
  }

  return traverse(patient.concepts, '');
}

/**
 * Return the labels of all present observations
 */
function getObservationLabels(cohorts, selectedCohorts = null) {
  
  const observationLabels = new Set();

  function extractLeafConcepts(concepts, path) {
    concepts.forEach(concept => {
      if (concept.observations.length != 0) {
        observationLabels.add(path === '' ? concept.label : path + ' > ' + concept.label);
      } else {
        extractLeafConcepts(concept.subConcepts, path === '' ? concept.label : path + ' > ' + concept.label);
      }
    });
  }

  cohorts.forEach(cohort => {
    if (selectedCohorts === null || selectedCohorts.includes(cohort.label)) {
      cohort.patients.forEach(patient => {
        extractLeafConcepts(patient.concepts, '');
      });
    }
  });

  // Sort the labels
  return Array.from(observationLabels).sort();
}

/**
 * Given a forest of concepts and an observation label, will return the matching concept
 */
function getConceptFromObservationLabel(concepts, observationLabel) {
  let result = undefined;
  function findConcept(concepts, path) {
    concepts.every(concept => {
      if (concept.observations.length != 0) {
        const label = path === '' ? concept.label : path + ' > ' + concept.label;
        if (label === observationLabel) {
          result = concept;
        }
        return result === undefined;
      } else {
        findConcept(concept.subConcepts, path === '' ? concept.label : path + ' > ' + concept.label);
        return result === undefined;
      }
    });
  }
  findConcept(concepts, '');
  return result;
}

/**
 * Returns all numeric or non-numeric observations for the given concept
 */
function getAllObservations(concept, isNumeric = true) {
  let allObservations = [];
  if (concept.observations.length > 0) {
    allObservations = allObservations.concat(concept.observations.filter(observation => observation.isNumeric === isNumeric));
  }
  if (concept.subConcepts.length > 0) {
    concept.subConcepts.forEach(subConcept => {
      allObservations = allObservations.concat(getAllObservations(subConcept, isNumeric));
    });
  }
  return allObservations;
}

/**
 * Returns a list of maps containing parse (observation label -> all observations in cohort)
 */
function getObservationsAsMaps(cohorts, selectedCohorts, selectedConcepts) {
	
  // Create a list which contains for each cohort a map from all observation labels to all associated observations
  const cohortObservationsList = selectedCohorts.map((cohortLabel) => {

    const cohort = cohorts.find(cohort => cohort.label === cohortLabel);

    // Prepare map
    const cohortObservationsMap = new Map();
    selectedConcepts.forEach((observationLabel) => {
      cohortObservationsMap.set(observationLabel, []);
    });

    // Add all observations
    cohort.patients.forEach((patient) => {
      selectedConcepts.forEach((observationLabel) => {
        let concept = getConceptFromObservationLabel(patient.concepts, observationLabel);
        if (concept) {
          let observationsNumeric = getAllObservations(concept, true);
          let observationsCategorical = getAllObservations(concept, false);
          if (observationsNumeric) {
            cohortObservationsMap.get(observationLabel).push(...observationsNumeric);
          }
          if (observationsCategorical) {
            cohortObservationsMap.get(observationLabel).push(...observationsCategorical);
          }
        }
      });
    });
    return cohortObservationsMap;
  });

  // Return list
  return cohortObservationsList;
}

/**
 * Function to build a cross-sectional table
 */
function getCrossSectionalTables(cohorts, selectedCohorts, includeAge, includeSex, observationLabels, observationQueries) {

    // Results
    const tables = [];
    const labelSuccesses = [];
    const querySuccesses = [];

    // Prepare header row
    const headerRow = [];
    headerRow.push("Patient ID");
    if (includeAge) {
      headerRow.push("Age");
    }
    if (includeSex) {
      headerRow.push("Sex");
    }

    // Check each query
    for (let i = 0; i < observationLabels.length; i++) {

      // Check
      let labelOK = true;
      observationLabels[i] = observationLabels[i].trim();
      if (observationLabels[i] === '') {
        labelOK = false;
      }

      // Check
      let queryOK = true;
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Herald.grammar));
      try {

        // Parse
        parser.feed(observationQueries[i]);
        observationQueries[i] = parser.results[0];
        
        // Execute on a single observation
        let array = [];
        array.push(new Herald.QueryableObservation("Test", Date(), Date(), true, 1, "Test"));
        Herald.executeCompiledHERALD(observationQueries[i], array);

      } catch (e) {
        queryOK = false;
      }
      queryOK = queryOK && (observationQueries[i] !== null && observationQueries[i] !== undefined);

      // Store
      labelSuccesses.push(labelOK);
      querySuccesses.push(queryOK);

      // Add to header row
      if (labelOK && queryOK) {
        headerRow.push(observationLabels[i]);
      // Set to null to ignore
      } else {
        observationLabels[i] = null;
        observationQueries[i] = null;
      }
    }

    // Perform queries for each cohort
		cohorts.forEach(cohort => {

      // If cohort selected
			if (selectedCohorts === null || selectedCohorts.includes(cohort.label)) {

        // Prepare        
        const table = [];
        table.push(headerRow);
        tables.push(table);

        // Process each patient
				cohort.patients.forEach(patient => {
					
					// Get observations for this patient
					let observations = getQueryableObservations(patient);

          // Prepare row
					let patientRow = [];
          patientRow.push(patient.id);
          if (includeAge) {
            patientRow.push(patient.age);
          }
          if (includeSex) {
            patientRow.push(patient.sex);
          }

					// Perform each HERALD query
					for (let i = 0; i < observationLabels.length; i++) {

						// Check
						if (observationLabels[i] && observationQueries[i]) {
							let result = Herald.executeCompiledHERALD(observationQueries[i], observations);
							if (result.value !== undefined && result.value !== null) {
								result = result.clone();
								result.label = observationLabels[i];
								observations.push(result);
								patientRow.push(result);
							} else {
								patientRow.push(null);
							}
						}
					}
          
          // Store row
          table.push(patientRow);
				});
			}
		});

  // Done
  return {tables: tables, labelSuccesses: labelSuccesses, querySuccesses: querySuccesses};
}

/**
 * Extract unique concept labels from tables
 */ 
function getUniqueConceptLabels(tables) {
  const conceptLabelsSet = new Set();
  tables.forEach((table) => {
    table[0].forEach((header) => {
      if (!["Patient ID", "Age", "Sex"].includes(header)) {
        conceptLabelsSet.add(header);
      }
    });
  });
  return Array.from(conceptLabelsSet);
}

/**
 * Namespace object and export
 */
var GHDM = window.GHDM || {};
Object.assign(GHDM, {
  getCrossSectionalTables: getCrossSectionalTables,
  getUniqueConceptLabels: getUniqueConceptLabels
});
window.GHDM = GHDM;

})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
// Generic Health Data Module (GHDM)
//
// Module: Data Model
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
 * ghdm-data / Data Model
 */

class Observation {
    constructor(start, end, isNumeric, value, unit = null) {
        this.start = new Date(start);
        this.end = new Date(end);
        this.isNumeric = isNumeric.toLowerCase() === 'true';
        this.value = value;
        this.unit = unit;
    }
}

class Concept {
    constructor(label, subConcepts = [], observations = []) {
        this.label = label;
        this.subConcepts = subConcepts;
        this.observations = observations;
    }
}

class Patient {
    constructor(id, dob, age, sex, concepts = []) {
        const sexMap = {
        'DEM|SEX:m': 'M',
        'DEM|SEX:f': 'F',
        'DEM|SEX:u': 'U',
        };
        this.id = id;
        this.dob = dob;
        this.age = parseInt(age);
        this.sex = sexMap[sex] || sex;
        this.concepts = concepts;
    }
}

class Cohort {
    constructor(label, patients = []) {
        this.label = label;
        this.patients = patients;
    }
}

})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
// Generic Health Data Module (GHDM)
//
// Module: Data and Ressource Loading Functions
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
 * ghdm-data / Data and Ressource Loading Functions
 */


/**
 * Helper function to parse JSON data types.
 * Assumes specific data model represented in JSON format and adds native datatyptes to certain properties.
 */
 function parseJSONDataTypes(data) {
	
	// Function to make sure we have the correct data types
  	let parseDataTypes = function(obj) {

    // Find observations
    if (obj.hasOwnProperty('start') && obj.hasOwnProperty('end')) {

      // Make sure dates are dates
      obj.start = new Date(obj.start);
      obj.end = new Date(obj.end);
      // Make sure isNumeric is a boolean
      if (typeof obj.isNumeric === 'string') {
        obj.isNumeric = obj.isNumeric.toLowerCase() === 'true';
      }
    }
    // Find patients
    if (obj.hasOwnProperty('age')) {
      // Make sure age is an int
      obj.age = parseInt(obj.age);
    }
    // Iterate over the properties of the object
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (Array.isArray(value)) {
          // Call recursively for elements in arrays
          value.forEach(element => parseDataTypes(element));
        } else if (typeof value === 'object' && value !== null) {
          // Call recursively for objects
          parseDataTypes(value);
        }
      }
    }
  }
  
  // Parse
  parseDataTypes(data);
  return data;
}

/**
 * Load all scripts in order
 */
async function loadScripts(urls, callback) {
	try {
	  for (const url of urls) {
		await new Promise((resolve, reject) => {
		  const script = document.createElement('script');
		  script.type = 'text/javascript';
		  script.src = url;
		  script.onload = () => resolve();
		  script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
		  document.head.appendChild(script);
		});
	  }
  
	  if (callback) {
		callback();
	  }
	} catch (error) {
	  console.error(error);
	}
}

/**
 * Load all styles in order
 */
async function loadStyles(urls, callback) {
	try {
		for (const url of urls) {
		  await new Promise((resolve, reject) => {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.href = url;
			link.onload = () => resolve();
			link.onerror = () => reject(new Error(`Failed to load stylesheet: ${url}`));
			document.head.appendChild(link);
		  });
		}
	
		if (callback) {
		  callback();
		}
	} catch (error) {
		console.error(error);
	}
}

/**
 * Namespace object and export
 */
var GHDM = window.GHDM || {};
Object.assign(GHDM, {
  loadStyles: loadStyles,
  loadScripts: loadScripts,
  parseJSONDataTypes: parseJSONDataTypes
});
window.GHDM = GHDM;



})();

window["ghdm-data"] = __webpack_exports__;
/******/ })()
;