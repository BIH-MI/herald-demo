/******/ (() => { // webpackBootstrap
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
// Human-Centric Extraction for Research and Analysis of Longitudinal Data (HERALD)
//
// Module: Query Editor
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
 * herald-ui / Modals
 */


let fieldValueResolve = null;
let fieldSelectionModal = null;

// Create node
function createFieldSelectionNode(parent, label, field, value, nodeValue) {

    const node = document.createElement("div");
    node.classList.add("tree-node");
  
    // Add the field and value as data attributes
    node.dataset.field = field;
    node.dataset.value = value;
    node.dataset.nodeValue = nodeValue;
  
    const nodeContent = document.createElement("div");
    nodeContent.classList.add("d-flex", "align-items-center");
    node.appendChild(nodeContent);
  
    const button = document.createElement("button");
    button.classList.add("btn", "btn-sm", "btn-toggle");
    button.textContent = "-";
    nodeContent.appendChild(button);
  
    const text = document.createElement("span");
    text.textContent = label;
    text.classList.add("clickable");
    nodeContent.appendChild(text);
  
    parent.appendChild(node);

    // Add event listener for node selection
    node.addEventListener("click", function (event) {   
      // Dont propagate
      event.stopPropagation();

      // Get data from tree
      let field = node.dataset.field;
      let value = node.dataset.value;

      // Get configuration for wildcard matching
      var includeSpecializations = document.getElementById('includeSpecializationsCheck').checked;
      var includeHomonyms = document.getElementById('includeHomonymsCheck').checked;

      // Apply wildcard matching parameters
      if (includeHomonyms) {
        value = "*" + node.dataset.nodeValue.trimStart();
      }
      if (includeSpecializations) {
        value = value.trimEnd() + "*";
      }

      // Hide
      fieldSelectionModal.hide();

      // Done
      fieldValueResolve({ field: field, 
                          value: value});
    });
  
    // Add event listener for collapse/expand button
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      const children = node.querySelectorAll(":scope > .tree-node");
  
      if (button.textContent === "+") {
        button.textContent = "-";
        children.forEach(child => child.style.display = "block");
      } else {
        button.textContent = "+";
        children.forEach(child => child.style.display = "none");
      }
    });
  
    return node;
}


// Open modal
async function openFieldSelectionModal(search = null) {

    // Store
    return new Promise((resolve) => {
      fieldSelectionModal = new bootstrap.Modal(document.getElementById("fieldSelectionTreeModal"), {
        backdrop: "static",
        keyboard: false
      });

      // Clear search
      document.getElementById("fieldSelectionTreeSearch").value = search ? search : "";
      document.getElementById("fieldSelectionTreeSearch").dispatchEvent(new Event("input"));

      // Show all nodes
      const treeNodes = document.querySelectorAll("#fieldSelectionTreeContainer .tree-node");
      for (const node of treeNodes) {
         node.style.display = "block";
         let button = node.querySelector('.btn-toggle');
         if (button && button.textContent === "+") {
          button.textContent = "-";
         }
      }

      // Store
      fieldValueResolve = resolve;
  
      // Show the modal
      fieldSelectionModal.show();
    });
}
  

/**
 * 
 * @param {*} cohorts 
 */
function initializeFieldSelectionTree(cohorts) {

    // Search function
    document.getElementById("fieldSelectionTreeSearch").addEventListener("input", function (event) {
      const keyword = event.target.value.toLowerCase();
      const treeNodes = document.querySelectorAll("#fieldSelectionTreeContainer .tree-node");
    
      for (const node of treeNodes) {
        if (node.textContent.toLowerCase().includes(keyword)) {
          node.style.display = "block";
        } else {
          node.style.display = "none";
        }
      }
    });

    // Cancel function
    document.getElementById("fieldSelectionTreeModal").querySelector(".modal-footer .btn-secondary").addEventListener("click", (event) => {
      event.stopPropagation();
      fieldSelectionModal.hide();
      fieldValueResolve({ field: null, value: null});
    });

    // Root element
    const treeContainer = document.getElementById("fieldSelectionTreeContainer");
  
    // Clear the existing tree
    while (treeContainer.firstChild) {
      treeContainer.removeChild(treeContainer.firstChild);
    }
    
    // Results
    const nodes = new Map();

    // Recursive function to collect
    function traverse(previousElement, concept, path) {

        // Prepare
        path = path === '' ? concept.label : path + ' > ' + concept.label;

        // Create node for concept
        let element = nodes.get(path);
        if (!element) {
            element = createFieldSelectionNode(previousElement, concept.label, "LABEL", path, concept.label);
            nodes.set(path, element);
        }

        // Create node for value and unit
        if (concept.observations.length != 0) {
            for (observation of concept.observations) {
                        
                if (!observation.isNumeric) {
                    let valuePath = path + " VALUE: " + observation.value;
                    let valueElement = nodes.get(valuePath);
                    if (!valueElement) {
                        valueElement = createFieldSelectionNode(element, "Value: " + observation.value, "VALUE", observation.value, observation.value);
                        nodes.set(valuePath, valueElement);
                    }
                }
                if (observation.unit) {
                    let unitPath = path + " UNIT: " + observation.unit;
                    let unitElement = nodes.get(unitPath);
                    if (!unitElement) {
                        unitElement = createFieldSelectionNode(element, "Unit: " + observation.unit, "UNIT", observation.unit, observation.unit);
                        nodes.set(unitPath, unitElement);
                    }
                }
            }
        }

        // Traverse
        for (subConcept of concept.subConcepts) {
            traverse(element, subConcept, path);
        }
    }

    // Call function
    cohorts.forEach(cohort => {
        cohort.patients.forEach(patient => {
            for (concept of patient.concepts) {
                traverse(treeContainer, concept, '');
            }
        });
    });


}


/**
 * Initializes the GHDM field selection modal
 */
function initHERALDFieldSelectionModal() {
    let newHTML = `
        <div class="modal fade" id="fieldSelectionTreeModal" tabindex="-1" aria-labelledby="fieldSelectionTreeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content modal-content-limited">
                    <div class="modal-header">
                        <h5 class="modal-title" id="fieldSelectionTreeModalLabel">Select field or value</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="container" id="GHDMFieldSelectionModalSearchBox">
                        <input type="text" class="form-control mb-2 mt-2" id="fieldSelectionTreeSearch" placeholder="Search...">
                    </div>

                    <div class="container">
                        <div class="card border rounded p-2 mb-3 mt-2">
                            <div class="row">
                                <div class="col">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" value="" id="includeHomonymsCheck" checked>
                                        <label class="form-check-label" for="includeHomonymsCheck">
                                            Include homonyms
                                        </label>
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" value="" id="includeSpecializationsCheck" checked>
                                        <label class="form-check-label" for="includeSpecializationsCheck">
                                            Include specializations
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-body modal-body-scrollable">
                        <div id="fieldSelectionTreeContainer" class="tree-scroll-container">
                            <!-- Tree nodes will be created and appended here -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>`;
    GHDMUI.appendToMainDiv(newHTML);
}

/** Start initializing the modal. */
initHERALDFieldSelectionModal();



/**
 * Namespace object and export
 */
var HeraldUI = window.HeraldUI || {};
Object.assign(HeraldUI, {
  initializeFieldSelectionTree: initializeFieldSelectionTree,
  openFieldSelectionModal: openFieldSelectionModal
});
window.HeraldUI = HeraldUI;



})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
// Human-Centric Extraction for Research and Analysis of Longitudinal Data (HERALD)
//
// Module: Utility and Helper Functions
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
 * herald-ui / Utility and Helper Functions
 */

/**
 * Registers an event listener for the auto-complete feature in field boxes
 */
function addListenerAutocomplete() {
	document.addEventListener("keydown", async function (event) {
			
		// Define key combination for triggering auto-complete
		const triggerKeyCombination = {
			code : "Space",
			ctrlKey: true
		};
		
		// Check if the key combination is pressed and the target element has the specified class
		if (event.code === triggerKeyCombination.code &&
			event.ctrlKey === triggerKeyCombination.ctrlKey &&
			event.target.classList.contains("herald-auto-complete")) {
			event.preventDefault(); // Prevent the default action (inserting a space)
			
			// Open modal
			const {value, field} = await HeraldUI.openFieldSelectionModal();

			// If value set
			if (value && field) {
				// Text to set
				let text = field + ' = "' + value.replace(/"/g, '\\"') + '"';
				// Get the current cursor position
				const startPos = event.target.selectionStart;
				const endPos = event.target.selectionEnd;
				// Insert the text at the cursor position
				event.target.value = event.target.value.substring(0, startPos) + text + event.target.value.substring(endPos);
				// Set the cursor position after the inserted text
				event.target.selectionStart = event.target.selectionEnd = startPos + text.length;
				event.target.focus();
			}
		}
	});
}


/**
 * Registers event listeners to show and hide the tool-tip for autocomplete fields
 */
function addListenerTooltip() {
    let tooltipTimeout;
	document.addEventListener('focusin', (event) => {
		if (event.target.classList.contains('herald-auto-complete')) {
			let tooltipInstance = new bootstrap.Tooltip(event.target, {
				title: 'Press [Ctrl + Space] for auto-complete',
				placement: 'bottom',
				customClass: 'tooltip-nowrap',
				trigger: 'focus'
			});
			tooltipInstance.show();

			// Automatically hide the tooltip after 3 seconds
			tooltipTimeout = setTimeout(() => {
				if (tooltipInstance) {
					tooltipInstance.dispose();
				}
			}, 3000);
		}
	});

	// Event listener: Hide tool-tip for autocomplete fields
	document.addEventListener('focusout', (event) => {
		if (event.target.classList.contains('herald-auto-complete')) {
			let tooltipInstance = bootstrap.Tooltip.getInstance(event.target);
			if (tooltipInstance) {
				tooltipInstance.dispose();
				if (tooltipTimeout) {
					clearTimeout(tooltipTimeout);
				}
			}
		}
	});
}


/**
 * Registers an event listener for the query action menu and its items.
 */
function addListenerQueryAction() {
    document.addEventListener('click', async function(event) {

		// Only actions for herald queries
		if (!event.target.classList.contains('herald-query-action')) {
		  return;
		}
	  
		// Get the action from the data attribute
		const action = event.target.getAttribute('data-action');
		// Find the closest ancestor with the 'heraldQueryRow' class
		const queryRow = event.target.closest('.heraldQueryRow');
		// Check
		if (!queryRow) {
		  return;
		}
	  
		// Elements
		const labelInput = queryRow.querySelector('.heraldQueryLabel');
		const queryInput = queryRow.querySelector('.heraldQuery');

		// Implement different actions for row
		switch (action) {
		  case 'editor':
			const {name, query} = await HeraldUI.showHeraldQueryModal(labelInput.value, queryInput.value);
			if (name && query) {
				labelInput.value = name;
				queryInput.value = query;
			}
			break;
		  case 'up':
			const previousRow = queryRow.previousElementSibling;
			if (previousRow) {
			  queryRow.parentNode.insertBefore(queryRow, previousRow);
			} 
			break;
		  case 'down':
			const nextRow = queryRow.nextElementSibling;
			if (nextRow) {
				queryRow.parentNode.insertBefore(nextRow, queryRow);
			}
			break;
		  case 'clear':
			labelInput.value = '';
			queryInput.value = '';
			break;
		  case 'delete':
			const allRows = document.querySelectorAll('.heraldQueryRow');
			if (allRows.length > 1) {
			  queryRow.remove();
			}
			break;
		  case 'clone':
			const clonedRow = queryRow.cloneNode(true);
			clonedRow.querySelector('.heraldQueryLabel').value = "C" + queryRow.querySelector('.heraldQueryLabel').value;
  			queryRow.parentNode.insertBefore(clonedRow, queryRow.nextSibling);
			break;
		  default:
			console.error(`Unknown action: ${action}`);
		}
    });
}


/**
 * Registers an event listener for the quick add function.
 */
function addListenerQuickAdd() {
	document.addEventListener('click', async function(event) {

		// Only actions for herald queries
		if (!event.target.classList.contains('herald-quick-add')) {
		  return;
		}
	  
		// Get the keyword from the data attribute
		const keyword = event.target.getAttribute('data-action');
		
		// Open modal
	    const {value, field} = await HeraldUI.openFieldSelectionModal();
		if (value && field) {

			// Find the closest ancestor with the 'heraldQueryRow' class
			const queryRow = document.querySelector('.heraldQueryRow:last-child');

			// Get labels
			let labelInput = queryRow.querySelector('.heraldQueryLabel');
			let queryInput = queryRow.querySelector('.heraldQuery');

			// Check if both inputs are empty
			if (labelInput.value.trim() !== '' || queryInput.textContent.trim() !== '') {

				// If not, clone the row
				const clonedRow = queryRow.cloneNode(true);
				clonedRow.querySelector('.heraldQueryLabel').value = "C" + labelInput.value;
				queryRow.parentNode.insertBefore(clonedRow, queryRow.nextSibling);

				// Update the labelInput and queryInput to the ones in the cloned row
				labelInput = clonedRow.querySelector('.heraldQueryLabel');
				queryInput = clonedRow.querySelector('.heraldQuery');
			}

			// Assign
			let query = keyword + ' (' + field + ' = "' + value.replace(/"/g, '\\"') + '")';
			labelInput.value = HeraldUI.renderQueryName(query);
			queryInput.value = query;
		}
    });

}


/**
 * Function to build the cross-sectional table and highlight query status in the UI
 */
function checkSpecBuildTables(cohorts) {

    // Get selected cohorts
    const checkedBoxes = document.querySelectorAll('#cohortSelect .form-check-input:checked');
    const selectedCohorts = Array.from(checkedBoxes).map(checkbox => checkbox.value);

    // Prepare
    const queryRows = document.querySelectorAll('.heraldQueryRow');
    const observationLabels = [];
    const observationQueries = [];
    const observationLabelsInput = [];
    const observationQueriesInput = [];
    const includeAge = document.getElementById("ageCheckbox").checked;
    const includeSex = document.getElementById("sexCheckbox").checked;
    
    // Collect info
    queryRows.forEach((queryRow) => {
        observationLabelsInput.push(queryRow.querySelector('.heraldQueryLabel'));
        observationQueriesInput.push(queryRow.querySelector('.heraldQuery'));
        observationLabels.push(queryRow.querySelector('.heraldQueryLabel').value);
        observationQueries.push(queryRow.querySelector('.heraldQuery').value);
    });

    // Execute
    let {tables, labelSuccesses, querySuccesses} = GHDM.getCrossSectionalTables(cohorts, 
                                                                            selectedCohorts, 
                                                                            includeAge,
                                                                            includeSex,
                                                                            observationLabels,
                                                                            observationQueries);

    // Mark input fields
    for (let i = 0; i < labelSuccesses.length; i++) {
        if (labelSuccesses[i]) {
            observationLabelsInput[i].classList.add('border-green');
        } else {
            observationLabelsInput[i].classList.add('border-red');
        }
        if (querySuccesses[i]) {
            observationQueriesInput[i].classList.add('border-green');
        } else {
            observationQueriesInput[i].classList.add('border-red');
        }
    }

    // Done
    return tables;

}


/**
 * Initializes the Herald query boxes and its functions
 */
function initHeraldQueryBoxes(cohorts) {

    // Reset input borders
    function removeColoredBorders(inputs) {
        const colors = ['border-green', 'border-orange', 'border-red'];
        inputs.forEach(input => {
            colors.forEach(color => {
                input.classList.remove(color);
            });
        });
    }
    // Event listener for input borders
    window.addEventListener('click', () => {
        removeColoredBorders(document.querySelectorAll('.heraldQueryLabel'));
        removeColoredBorders(document.querySelectorAll('.heraldQuery'));
    });
    window.addEventListener('focusin', () => {
        removeColoredBorders(document.querySelectorAll('.heraldQueryLabel'));
        removeColoredBorders(document.querySelectorAll('.heraldQuery'));
    });


    // Event listener: Handle build table & specificaiton checking
	document.getElementById('buildTable').addEventListener('click', (event) => {
	
		// Prevent colors from being removed immediately
		event.stopPropagation();

		// Run test
		checkSpecBuildTables(cohorts);
	});

}

/**
 * Inject label and query text manually into Herald query boxes
 */
function setLabelAndQueryManually(labelText, queryText) {
    const queryRows = document.querySelectorAll('.heraldQueryRow');
    let rowFound = false;

    for (let queryRow of queryRows) {
        const labelInput = queryRow.querySelector('.heraldQueryLabel');
        const queryInput = queryRow.querySelector('.heraldQuery');

        // Check if the current row is empty
        if (labelInput.value === '' && queryInput.value === '') {
            labelInput.value = labelText;
            queryInput.value = queryText;
            rowFound = true;
            break; // Exit after filling the first empty row
        }
    }

    // If no empty row is found, clone the last row and set its values
    if (!rowFound && queryRows.length > 0) {
        const lastRow = queryRows[queryRows.length - 1];
        const nextRow = lastRow.cloneNode(true);
        lastRow.parentNode.appendChild(nextRow);

        // Clear the cloned row's values and set them to the new values
        const labelInput = nextRow.querySelector('.heraldQueryLabel');
        const queryInput = nextRow.querySelector('.heraldQuery');
        labelInput.value = labelText;
        queryInput.value = queryText;
    }
}

/**
 * Initializes the Herald query entry form
 */
function initHeraldQueryEntryForm() {
    newHTML = ` <div class="container full-width-container">
        <div class="row mt-3">
            <div class="col">
                <label for="conceptSelect" class="form-label">Specify observation(s) to analyze</label>
                <div class="d-flex flex-column position-relative border rounded">
                    <div id="conceptOptions" class="flex-grow-1">
                        <div class="row heraldQueryRow d-flex align-items-center flex-nowrap my-2 mx-1">
                            <div class="col-auto">
                                <input type="text" class="form-control heraldQueryLabel" placeholder="Label">
                            </div>
                            <div class="col px-0 d-flex">
                                <div class="flex-grow-1">
                                    <input type="text" class="form-control w-100 heraldQuery herald-auto-complete" placeholder="Query">
                                </div>
                            </div>
                            <div class="col-auto">
                                <div class="btn-group">
                                    <button type="button" class="btn btn-sm btn-secondary dropdown-toggle" id="queryEdit" data-bs-toggle="dropdown" aria-expanded="false">Edit</button>
                                    <div class="dropdown-menu" aria-labelledby="queryEdit">
                                        <button class="dropdown-item herald-query-action" data-action="editor" id="buttonEditor">Editor</button>
                                        <button class="dropdown-item herald-query-action" data-action="up" id="buttonUp">Up</button>
                                        <button class="dropdown-item herald-query-action" data-action="down" id="buttonDown">Down</button>
                                        <button class="dropdown-item herald-query-action" data-action="clear" id="buttonClear">Clear</button>
                                        <button class="dropdown-item herald-query-action" data-action="delete" id="buttonDelete">Delete</button>
                                        <button class="dropdown-item herald-query-action" data-action="clone" id="buttonClone">Clone</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-3 mb-3">
            <div class="col-auto">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="age" id="ageCheckbox" checked>
                    <label class="form-check-label" for="ageCheckbox">Patient age</label>
                </div>
            </div>
            <div class="col-auto">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="sex" id="sexCheckbox" checked>
                    <label class="form-check-label" for="sexCheckbox">Patient sex</label>
                </div>
            </div>
            <div class="col-auto">
                <div class="btn-group">
                    <button type="button" class="btn btn-sm btn-secondary dropdown-toggle" id="observationAdd" data-bs-toggle="dropdown" aria-expanded="false">Quick add</button>
                    <div class="dropdown-menu" aria-labelledby="observationAdd">
                        <button class="dropdown-item herald-quick-add" data-action="FIRST">FIRST</button>
                        <button class="dropdown-item herald-quick-add" data-action="LAST">LAST</button>
                        <button class="dropdown-item herald-quick-add" data-action="ANY">ANY</button>
                        <button class="dropdown-item herald-quick-add" data-action="EXISTS">EXISTS</button>
                        <button class="dropdown-item herald-quick-add" data-action="NOT EXISTS">NOT EXISTS</button>
                        <button class="dropdown-item herald-quick-add" data-action="AVERAGE">AVERAGE</button>
                        <button class="dropdown-item herald-quick-add" data-action="MEDIAN">MEDIAN</button>
                        <button class="dropdown-item herald-quick-add" data-action="COUNT">COUNT</button>
                        <button class="dropdown-item herald-quick-add" data-action="SUM">SUM</button>
                        <button class="dropdown-item herald-quick-add" data-action="MIN">MIN</button>
                        <button class="dropdown-item herald-quick-add" data-action="MOST FREQUENT">MOST FREQUENT</button>
                        <button class="dropdown-item herald-quick-add" data-action="MAX">MAX</button>
                    </div>
                </div>
            </div>
            <div class="col-auto">
            <button type="button" class="btn btn-sm btn-primary" id="buildTable">Check specification</button>
            </div>
        </div>`;


	// Due to the loading order of scripts, this div would be inserted last.
	// But it needs to be between cohort selection (see GHDM UI) and the plugins own selection and visualization options.
	const ghdmContent = document.querySelector('#ghdmContent');
	const firstDiv = ghdmContent.querySelector('div');
	if (firstDiv) {
		firstDiv.insertAdjacentHTML('afterend', newHTML);
	} else {
		ghdmContent.insertAdjacentHTML('beforeend', newHTML);
	}
}

function initializeHeraldUI(cohorts, callback) {

	HeraldUI.initializeFieldSelectionTree(cohorts);
    
	initHeraldQueryEntryForm();
	initHeraldQueryBoxes(cohorts);
	addListenerAutocomplete();
	addListenerQueryAction();
	addListenerQuickAdd();
	addListenerTooltip();
	
	if (callback) {
		callback();
	}
}


/**
 * Namespace object and export
 */
var HeraldUI = window.HeraldUI || {};
Object.assign(HeraldUI, {
  initializeHeraldUI: initializeHeraldUI,
  checkSpecBuildTables: checkSpecBuildTables,
  setLabelAndQueryManually: setLabelAndQueryManually
});
window.HeraldUI = HeraldUI;



})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
// Human-Centric Extraction for Research and Analysis of Longitudinal Data (HERALD)
//
// Module: UI Binding
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
 * herald-ui / UI Binding
 */

/**
 * Check if this is an aggregation query
 */
function isAggregationQuery(parsedResult) {
    return parsedResult.hasOwnProperty('aggregation');
}

/**
 * Check if this is a selection query
 */
function isSelectionQuery(parsedResult) {
    return parsedResult.hasOwnProperty('selection');
}

/**
 * Check if is a relationship query
 */
function isRelationshipQuery(parsedResult) {
    return parsedResult.hasOwnProperty('relationship');
}

/**
 * Check if it is an existence query
 */
function isExistenceQuery(parsedResult) {
    return parsedResult.hasOwnProperty('existence');
}

/**
 * Unwrap stuff
 */
function unwrapExpression(obj) {
    if (obj && Object.keys(obj).length === 1 && obj.hasOwnProperty("expression") && obj.expression !== null ) {
      return unwrapExpression(obj.expression);
    } else {
      return obj;
    }
  }

/**
 * Render filter string
*/
function renderFilterString(filter) {
    filter = unwrapExpression(filter);
    if (filter.left && filter.conjunction && filter.right) {
        return `(${renderFilterString(filter.left)} ${filter.conjunction.value} ${renderFilterString(filter.right)})`;
    } else if (filter.field && filter.comparator && filter.value) {
        return `${filter.field.value} ${filter.comparator.value} ${filter.value.value}`;
    } else if (filter.label && filter.comparator && filter.value) {
        return `LABEL = ${filter.label.value} AND VALUE ${filter.comparator.value} ${filter.value.value}`;
    } else if (filter.label) {
        return `LABEL = ${filter.label.value}`;
    } else {
        return '';
    }
}

/**
 * Parse filter
 */
function bindFilter(input, filter) {
    input.value = renderFilterString(filter);
}

/**
 * Parse temporal relationship
 */
function bindTemporalRelationship(modal, temporalRelationship) {

    if (!temporalRelationship) {
        return;
    }

    // Unwrap
    temporalRelationship = unwrapExpression(temporalRelationship);

    // Get UI elements
    const temporalRelationshipSelect = modal.querySelector('#temporalRelationshipSelect');
    const temporalRelationshipInput = modal.querySelector('#temporalRelationshipInput');
    const timeUnitSelect = modal.querySelector('#timeUnitSelect');
    const temporalRelationshipTypeSelect = modal.querySelector('#temporalRelationshipTypeSelect');
    const temporalRelationshipTypeInput = modal.querySelector('#temporalRelationshipTypeInput');
  
    // Set the temporal relationship type
    temporalRelationshipSelect.value = temporalRelationship.temporalRelationship.value;
    temporalRelationshipSelect.dispatchEvent(new Event('change'));
  
    // Set the time value and unit if available
    if (temporalRelationship.time && temporalRelationship.unit) {
      temporalRelationshipInput.value = temporalRelationship.time;
      let unit = temporalRelationship.unit.value;
      unit = unit.endsWith('S') ? unit : unit + 'S';
      timeUnitSelect.value = unit.toUpperCase();
      timeUnitSelect.dispatchEvent(new Event('change'));
    } else {
      temporalRelationshipInput.value = '';
      timeUnitSelect.value = 'NONE';
      timeUnitSelect.dispatchEvent(new Event('change'));
    }
  
    // Set the anchor type (date or observation) and its value
    if (temporalRelationship.date) {
      temporalRelationshipTypeSelect.value = 'date';
      temporalRelationshipTypeInput.value = temporalRelationship.date;
    } else if (temporalRelationship.filter) {
      temporalRelationshipTypeSelect.value = 'observation';
      bindFilter(temporalRelationshipTypeInput, temporalRelationship.filter);
    }
}

/**
 * Parse selection query
 */
function bindSelectionOrAggregationQuery(modal, query) {

    // Unwrap
    query = unwrapExpression(query);

    // Get UI elements
    const queryKeywordSelect = modal.querySelector('#queryKeywordSelect');
    const queryFilterInput = modal.querySelector('#queryFilterInput');
    
    // Update the query type
    if (query.selection) {
      queryKeywordSelect.value = query.selection.value;
    } else if (query.aggregation) {
      queryKeywordSelect.value = query.aggregation.value;
    } else {
      return;
    }

    // Parse filter
    bindFilter(queryFilterInput, query.filter);
    // Parse temporal relationship
    bindTemporalRelationship(modal, query.time);
}

/**
 * Parse relationship query
 */
function bindRelationshipQuery(modal, query) {

    // Unwrap
    query = unwrapExpression(query);

    // Get UI elements
    const queryKeywordSelect = modal.querySelector('#queryKeywordSelect');
    const queryFilterInput = modal.querySelector('#queryFilterInput');
    const relationshipQueryFilterRow = modal.querySelector('#relationshipQueryFilterRow');
    const relationshipQueryFilterInput = modal.querySelector('.relationshipQueryFilterInput');

    // Update the query type
    queryKeywordSelect.value = query.relationship.value;
    // Parse filter
    bindFilter(queryFilterInput, query.filter1);
    bindFilter(relationshipQueryFilterInput, query.filter2);
    // Parse temporal relationship
    bindTemporalRelationship(modal, query.time);

    // Show row
    relationshipQueryFilterRow.parentNode.style.display = 'block';
}

/**
 * Parse existence query
 */
function bindExistenceQuery(modal, query) {

    // Unwrap
    query = unwrapExpression(query);

    // Get UI elements
    const queryKeywordSelect = modal.querySelector('#queryKeywordSelect');
    const queryFilterInput = modal.querySelector('#queryFilterInput');
  
    // Recursive function for parsing the expression
    function parseExistenceStatement(existenceQuery, keywordElement, filterElement) {

      // Leaf
      if (existenceQuery.existence) {
        // Set keyword and filter
        keywordElement.value = existenceQuery.existence.value;
        bindFilter(filterElement, existenceQuery.filter);

      // Inner node
      } else if (existenceQuery.left && existenceQuery.conjunction) {

        // Create new row
        const lastKeywordFilterRow = modal.querySelector('.keywordFilterRow:last-child');
        HeraldUI.addExistenceQueryRow(lastKeywordFilterRow);
        const newKeywordElement = lastKeywordFilterRow.querySelector('.existenceQueryKeywordSelect');
        const newFilterElement = lastKeywordFilterRow.querySelector('.existenceQueryFilterInput');

        // Recurse
        parseExistenceStatement(existenceQuery.left, keywordElement, filterElement);
        parseExistenceStatement(existenceQuery.right, newKeywordElement, newFilterElement);
      }
    }

    // Parse existence
    parseExistenceStatement(query.existence, queryKeywordSelect, queryFilterInput);
  
    // Parse temporal relationship
    bindTemporalRelationship(modal, query.time);
  }

/**
 * Bind the query type
 */
function bindQueryType(modal, type) {
  const queryTypeSelect = modal.querySelector('#queryTypeSelect');
  queryTypeSelect.value = type;
  queryTypeSelect.dispatchEvent(new Event('change'));
}
  
/**
 * Parse a query into the modal
 */
function bindQuery(modal, query) {

  let parsedQuery = getParseableSubset(query);
  parsedQuery = unwrapExpression(parsedQuery);
  if (parsedQuery) {
    if (isAggregationQuery(parsedQuery)) {
      bindQueryType(modal, 'aggregation');
      bindSelectionOrAggregationQuery(modal, parsedQuery);
    } else if (isSelectionQuery(parsedQuery)) {
      bindQueryType(modal, 'selection');
      bindSelectionOrAggregationQuery(modal, parsedQuery);
    } else if (isRelationshipQuery(parsedQuery)) {
      bindQueryType(modal, 'relationship');
      bindRelationshipQuery(modal, parsedQuery);
    } else if (isExistenceQuery(parsedQuery)) {
      bindQueryType(modal, 'existence');
      bindExistenceQuery(modal, parsedQuery);
    }
  }
}

/**
 * Try parsing with a certain sliding window size
 */
function tryWithSlidingWindow(tokens, windowSize) {

  // Generate each version with the sliding window
  outer: for (let start = 0; start <= tokens.length - windowSize; start++) {

    console.log("Sliding window " + start + " of size " + windowSize + " on " + tokens.length + " tokens");

    // Build query to parse
    let query = "";

    // Feed part before the window
    for (let index = 0; index < start; index++) {
      const token = tokens[index];
      const stringToken = token.text || token.value;
      query += (query.length > 0 ? ' ' : '') + stringToken;
    }
    
    // Feed part after the window
    for (let index = start + windowSize; index < tokens.length; index++) {
      const token = tokens[index];
      const stringToken = token.text || token.value;
      query += (query.length > 0 ? ' ' : '') + stringToken;
    }

    // Create parser
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Herald.grammar));
    try {
      // Parse
      parser.feed(query);
    } catch (err) {
      // We can directly move to the next window position
      continue outer;
    }

    // Check if we have a result
    if (parser.results[0]) {
      console.log("Number of available parses: " + parser.results.length);
      return parser.results[0];
    }

    // If window size is zero, we just need to do this once, because there is no window to skip
    if (windowSize == 0) break;
  }

  // No result
  return null;
}

/**
 * Returns a parseable subset
 */
function getParseableSubset(input) {

  // Lexer
  let lexer = Herald.getHeraldLexer(true);

  // Tokenize and filter out errors and whitespaces
  lexer.reset(input);
  const tokens = Array.from(lexer).filter((token) => token.type !== "error" && token.type !== "WS");

  // Iterate over window sizes
  const maxWindowSize = Math.min(tokens.length - 1, 10);
  for (let windowSize = 0; windowSize <= maxWindowSize; windowSize++) {

    // Try with this window size
    let partialParse = tryWithSlidingWindow(tokens, windowSize);

    // If we found something, it is the largest parseable subset
    if (partialParse) {
      return partialParse;
    }
  }

  // We couldn't find a parse
  return null;
}

/**
 * Add parentheses
 */
function addParentheses(str) {
    if (!str.startsWith("(")) {
      str = "(" + str;
    }
  
    if (!str.endsWith(")")) {
      str = str + ")";
    }
  
    return str;
}

/**
 * Abbrevitation function
 */
function abbreviateKeyword(keyword) {
  const abbreviations = {
    "MONTH": "M",
    "YEAR": "Y",
    "AVERAGE": "Avg",
    "MEDIAN": "Med",
    "AND": "And",
    "OR": "Or",
    "LABEL": "Lbl",
    "VALUE": "Val",
    "UNIT": "Unt",
    "START": "St",
    "END": "Ed",
    "NUMERIC": "Num",
    "COUNT": "Cnt",
    "SUM": "Sum",
    "MIN": "Min",
    "MAX": "Max",
    "MOST": "Mst",
    "FREQUENT": "Frqt",
    "FIRST": "Fst",
    "LAST": "Lst",
    "ANY": "Any",
    "RATIO": "Rat",
    "BETWEEN": "Btw",
    "DIFFERENCE": "Diff", 
    "EQUALITY": "Eq",
    "EXISTS": "Ex",
    "NOT": "Nt",
    "BEFORE": "Bf",
    "AFTER": "Af",
    "APART": "Ap",
    "CLOSE": "Cl",
    "FROM" : "Frm",
    "TO": "To",
    "BEFORE": "Bf",
    "CLOSE": "Cls",
    "AFTER": "Aft",
    "BY": "By",
    "DAYS": "D",
    "WEEKS": "W",
    "MONTHS": "M",
    "YEARS": "Y",
    "DAY": "D",
    "WEEK": "W"
  };
  let str = abbreviations[keyword] || keyword;
  if (!str || typeof str !== 'string') {
    return '';
  }
  // Capitalize
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Map for query names
const queryNameCount = new Map();

/**
 * Render query name
 */
function renderQueryName(query) {

  // Prepare
  const maxLength = 30;
  const allowedChars = /[^a-zA-Z0-9-_]/g;
  const keywords = query.match(/\b\w+\b/g);
  let name = ""

  // Collect words
  for (let i = 0; i < keywords.length ; i++) {

    // Clean and combine
    const keyword = abbreviateKeyword(keywords[i]);
    const cleanedKeyword = keyword.replace(allowedChars, '');
    name = name + cleanedKeyword;

    // Truncate the name if it exceeds maxLength
    if (name.length > maxLength) {
      name = name.substring(0, maxLength);
      break;
    }
  }

  // Ensure uniqueness
  if (queryNameCount.has(name)) {
    const count = queryNameCount.get(name);
    queryNameCount.set(name, count + 1);
    name = name + count;
  } else {
    queryNameCount.set(name, 1);
  }

  // Done
  return name;
}

/**
 * Renders a query from the modal
 */
function renderQuery(modal) {

    // Get UI elements
    const queryTypeSelect = modal.querySelector("#queryTypeSelect");
    const queryKeywordSelect = modal.querySelector("#queryKeywordSelect");
    const queryFilterInput = modal.querySelector("#queryFilterInput");
    const temporalRelationshipSelect = modal.querySelector("#temporalRelationshipSelect");
    const temporalRelationshipInput = modal.querySelector("#temporalRelationshipInput");
    const timeUnitSelect = modal.querySelector("#timeUnitSelect");
    const temporalRelationshipTypeInput = modal.querySelector("#temporalRelationshipTypeInput");
  
    // Define values
    let queryType = queryTypeSelect.value.toUpperCase();
    let keyword = queryKeywordSelect.value.toUpperCase();
    let filter = queryFilterInput.value;
    let temporalRelationship = temporalRelationshipSelect.value.toUpperCase();
    let temporalValue = temporalRelationshipInput.value;
    let timeUnit = timeUnitSelect.value.toUpperCase();
    let temporalAnchorValue = temporalRelationshipTypeInput.value;
  
    // Build temporal relationship
    let temporalRelationshipString = undefined;
    if (temporalRelationship && temporalRelationship !== 'NO TEMPORAL RESTRICTION') {
      if (timeUnit && timeUnit !== 'NONE') {
        temporalRelationshipString = `${temporalRelationship} ${addParentheses(temporalAnchorValue)} BY ${temporalValue} ${timeUnit}`;
      } else {
        temporalRelationshipString = `${temporalRelationship} ${addParentheses(temporalAnchorValue)}`;
      }
    }

    // Build query
    if (queryType === "SELECTION" || queryType === "AGGREGATION") {
      return `${keyword} ${addParentheses(filter)}` + (temporalRelationshipString ? ' ' + temporalRelationshipString : '');

    // Relationship query
    } else if (queryType === "RELATIONSHIP") {
      const relationshipQueryFilterInput = modal.querySelector(".relationshipQueryFilterInput");
      let relationshipFilter = relationshipQueryFilterInput.value;
      return `${keyword} ${addParentheses(filter)} AND ${addParentheses(relationshipFilter)}` + (temporalRelationshipString ? ' ' + temporalRelationshipString : '');
    
    // Existence query
    } else if (queryType === "EXISTENCE") {
      const existenceRows = Array.from(modal.querySelectorAll(".keywordFilterRow"));
      existenceRows.pop();
      let existenceFilters = existenceRows.map(row => {
        const keywordSelect = row.querySelector(".existenceQueryKeywordSelect");
        const filterInput = row.querySelector(".existenceQueryFilterInput");
        return `AND ${keywordSelect.value.toUpperCase()} ${addParentheses(filterInput.value)}`;
      }).join(" ");
      return `${keyword} ${addParentheses(filter)}` + (existenceFilters ? ' ' + existenceFilters : '') + (temporalRelationshipString ? ' ' + temporalRelationshipString : '');
    } 
    
    // No result
    return "";
}


/**
 * Namespace object and export
 */
var HeraldUI = window.HeraldUI || {};
Object.assign(HeraldUI, {
  renderQueryName: renderQueryName,
  renderQuery: renderQuery,
  bindQuery: bindQuery
});
window.HeraldUI = HeraldUI;

})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
// Human-Centric Extraction for Research and Analysis of Longitudinal Data (HERALD)
//
// Module: Query Editor
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
 * herald-ui / Query Editor
 */

/**
 * Map query types to their keywords
 */ 
const queryTypeKeywords = {
  selection: ['FIRST', 'LAST', 'ANY'],
  aggregation: ['AVERAGE', 'MEDIAN', 'COUNT', 'SUM', 'MIN', 'MAX', 'MOST FREQUENT'],
  existence: ['EXISTS', 'NOT EXISTS'],
  relationship: ['RATIO BETWEEN', 'DIFFERENCE BETWEEN', 'EQUALITY OF'],
};

/**
 * Map time units
 */
const timeUnits = ['DAYS', 'WEEKS', 'MONTHS', 'YEARS'];

/**
 * Operators
 */
const operators = [
  { type: 'equal', label: '=' },
  { type: 'less', label: '<' },
  { type: 'greater', label: '>' },
  { type: 'less_or_equal', label: '<=' },
  { type: 'greater_or_equal', label: '>=' },
];

/**
 * Get the list of operator types
 */
const operatorTypes = operators.map(operator => operator.type);

/**
 * Filters for query builder
 */
const filters = [
  { id: 'LABEL', label: 'LABEL', type: 'string', operators: operatorTypes, sql: { field: 'field_label' } },
  { id: 'VALUE', label: 'VALUE', type: 'string', operators: operatorTypes, sql: { field: 'field_value' } },
  { id: 'UNIT', label: 'UNIT', type: 'string', operators: operatorTypes, sql: { field: 'field_unit' } },
  { id: 'GHDM_FIELD_START', label: 'START', type: 'date', operators: operatorTypes, sql: { field: 'field_start' } },
  { id: 'GHDM_FIELD_END', label: 'END', type: 'date', operators: operatorTypes, sql: { field: 'field_end' } },
  { id: 'NUMERIC', label: 'NUMERIC', type: 'boolean', sql: { field: 'field_numeric' } },
];

/**
 * Keep track of active filter used in query builder
 */
let activeFilterInput = null;
/** 
 * The current clone of the modal 
 */
let queryModal = null;
/**
 * Current flatpickr instance
 */
let flatpickrInstance = null;

/**
 * Bring up the builder
 */
function showQueryBuilder(filterInput) {

  activeFilterInput = filterInput;

  $(queryModal.querySelector('#queryBuilder')).off('rulesChanged.queryBuilder')
                                              .off('afterUpdateRuleFilter.queryBuilder')
                                              .off('afterUpdateRuleOperator.queryBuilder')
                                              .off('afterUpdateRuleValue.queryBuilder');
  $(queryModal.querySelector('#queryBuilder')).queryBuilder('destroy');
  $(queryModal.querySelector('#queryBuilder')).queryBuilder({
    operators: operators,
    filters: filters,
  });

  // Load the filter string into the Query Builder
  try {

    // Work around conflicts with SQL keywords
    let filterString = filterInput.value;
    filterString = filterString.replace(/(\bEND\b)(?=(?:[^"\\]*(?:\\.|"(?:[^"\\]*\\.)*[^"\\]*"))*[^"]*$)/g, 'GHDM_FIELD_END');
    filterString = filterString.replace(/(\bSTART\b)(?=(?:[^"\\]*(?:\\.|"(?:[^"\\]*\\.)*[^"\\]*"))*[^"]*$)/g, 'GHDM_FIELD_START');

    // Load into builder
    $(queryModal.querySelector('#queryBuilder')).queryBuilder('setRulesFromSQL', filterString);
    
    // Valid
    $(filterInput).removeClass('is-invalid');

  } catch (e) {
    // Invalid
    $(filterInput).addClass('is-invalid');
  }

  // Show
  $(queryModal.querySelector('#queryBuilder')).show();

  // Update the activeFilterInput value when the Query Builder's rules change
  function onQueryBuilderChanged(e) {
    const rules = $(queryModal.querySelector('#queryBuilder')).queryBuilder('getRules');
    if (rules) {

      // Get the SQL string from the Query Builder
      const sqlObj = $(queryModal.querySelector('#queryBuilder')).queryBuilder('getSQL', 'query-builder');
      let filterString = sqlObj.sql;

      // Replace placeholders with their respective values
      sqlObj.params.forEach((param, index) => {

        // Escape double quotes
        const escapedParam = param.replace(/(?<!\\)"/g, '\\"');
        filterString = filterString.replace('?', `"${escapedParam}"`);
      });

      // Work around conflicts with SQL keywords
      filterString = filterString.replace(/GHDM_FIELD_END/g, 'END');
      filterString = filterString.replace(/GHDM_FIELD_START/g, 'START');
      
      // Add parantheses
      if (!filterString.startsWith('(')) {
        filterString = '(' + filterString;
      }        
      if (!filterString.endsWith(')')) {
        filterString = filterString + ')';
      }
      
      if (activeFilterInput) {
        activeFilterInput.value = filterString;
      }
    }
  };    
  $(queryModal.querySelector('#queryBuilder'))
  .on('rulesChanged.queryBuilder', onQueryBuilderChanged)
  .on('afterUpdateRuleFilter.queryBuilder', onQueryBuilderChanged)
  .on('afterUpdateRuleOperator.queryBuilder', onQueryBuilderChanged)
  .on('afterUpdateRuleValue.queryBuilder', onQueryBuilderChanged);
}

/**
 * Open modal
 */
async function showHeraldQueryModal(name, query) {

  // Register listeners on document just once
  if (!queryModal) {
    
    // Close query builder
    document.addEventListener('click', function (event) {
      const queryBuilder = queryModal.querySelector('#queryBuilder');
      if (!queryBuilder.contains(event.target) && event.target !== activeFilterInput) {
        $(activeFilterInput).removeClass('is-invalid');
        hideQueryBuilder();
      }
    });

    // Existence query row cloning
    document.addEventListener('click', function (event) {

      // Prepare
      const target = event.target;
      const keywordFilterRow = target.closest('.keywordFilterRow');
      if (!keywordFilterRow) {
        return;
      }
      
      // Add row
      if (target.classList.contains('existenceAddButton')) {
          addExistenceQueryRow(keywordFilterRow);
      // Remove row
      } else if (target.classList.contains('existenceRemoveButton')) {
        if (keywordFilterRow.parentNode.querySelectorAll('.keywordFilterRow').length > 1) {
          removeExistenceQueryRow(keywordFilterRow);
        }
      }
    });

    // Auto-complete for query builder
    document.addEventListener("keydown", async function (event) {

      // Define key combination for triggering auto-complete
      const triggerKeyCombination = {
        code : "Space",
        ctrlKey: true
      };
      
      // Check if the key combination is pressed and the target element is input in query builder
      if (event.code === triggerKeyCombination.code &&
          event.ctrlKey === triggerKeyCombination.ctrlKey &&
          event.target.tagName.toLowerCase() === 'input' && 
          event.target.closest('.rule-value-container')) {
            
        // Open modal
        const {value, field} = await HeraldUI.openFieldSelectionModal();
  
        // If value set
        if (value && field) {
          // Get the current cursor position
          const startPos = event.target.selectionStart;
          const endPos = event.target.selectionEnd;
          // Insert the text at the cursor position
          event.target.value = event.target.value.substring(0, startPos) + value + event.target.value.substring(endPos);
          // Set the cursor position after the inserted text
          event.target.selectionStart = event.target.selectionEnd = startPos + value.length;
          event.target.focus();
          event.target.dispatchEvent(new Event('change'));
        }
      }
    });
  }
  // Create a new instance of the modal by cloning queryModal
  queryModal = document.getElementById('queryModal').cloneNode(true);
  document.getElementById('queryModal').insertAdjacentElement('afterend', queryModal);

  // Set up the modal
  const modal = new bootstrap.Modal(queryModal, {
    backdrop: 'static',
    keyboard: false,
  });

  // Set name
  if (name) {
    queryModal.querySelector('#observationLabelInput').value = name;
  }

  // Add event listeners
  queryModal.querySelector('#observationLabelInput').addEventListener('keypress', function (event) {
    // Allowed characters: letters, numbers, hyphens, and underscores
    const allowedCharacters = /^[a-zA-Z0-9-_]$/;
    // If the pressed key doesn't match the allowed characters, prevent the input
    if (!allowedCharacters.test(event.key)) {
      event.preventDefault();
    }
  });
  
  queryModal.querySelector('#queryTypeSelect').addEventListener('change', (event) => {
    const queryType = event.target.value;
    updateQueryConfiguration(queryType);
  });
  queryModal.querySelector('#temporalRelationshipSelect').addEventListener('change', (event) => {
    const temporalRelationship = event.target.value;
    updateTemporalRelationshipInput();
  });
  queryModal.querySelector('#timeUnitSelect').addEventListener('change', (event) => {
    const timeUnitSelect = event.target.value;
    updateTemporalRelationshipInput();
  });
  const existenceQueryFilterInput = queryModal.querySelectorAll('.existenceQueryFilterInput')[0];
  existenceQueryFilterInput.addEventListener('focus', function () {
    showQueryBuilder(this);
  });
  existenceQueryFilterInput.addEventListener('input', function () {
    showQueryBuilder(this);
  });
  existenceQueryFilterInput.addEventListener('blur', function () {
    $(existenceQueryFilterInput).removeClass('is-invalid');
  });
  const relationshipQueryFilterInput = queryModal.querySelector('.relationshipQueryFilterInput');
  relationshipQueryFilterInput.addEventListener('focus', function () {
    showQueryBuilder(this);
  });
  relationshipQueryFilterInput.addEventListener('input', function () {
    showQueryBuilder(this);
  });
  relationshipQueryFilterInput.addEventListener('blur', function () {
    $(relationshipQueryFilterInput).removeClass('is-invalid');
  });
  const queryFilterInput = queryModal.querySelector('#queryFilterInput');
  queryFilterInput.addEventListener('focus', function () {
    showQueryBuilder(this);
  });
  queryFilterInput.addEventListener('input', function () {
    showQueryBuilder(this);
  });
  queryFilterInput.addEventListener('blur', function () {
    $(queryFilterInput).removeClass('is-invalid');
  });
  const temporalRelationshipTypeInput = queryModal.querySelector('#temporalRelationshipTypeInput');
  temporalRelationshipTypeInput.addEventListener('focus', function () {
    if (queryModal.querySelector('#temporalRelationshipTypeSelect').value === 'observation') {
      if (flatpickrInstance) flatpickrInstance.destroy();
      showQueryBuilder(this);
    } else {
      hideQueryBuilder();
      if (flatpickrInstance) flatpickrInstance.destroy();
      flatpickrInstance = flatpickr($(temporalRelationshipTypeInput));
    }
  });
  temporalRelationshipTypeInput.addEventListener('input', function () {
    if (queryModal.querySelector('#temporalRelationshipTypeSelect').value === 'observation') {
      if (flatpickrInstance) flatpickrInstance.destroy();
      showQueryBuilder(this);
    } else {
      hideQueryBuilder();
      if (flatpickrInstance) flatpickrInstance.destroy();
      flatpickrInstance = flatpickr($(temporalRelationshipTypeInput));
    }
  });
  temporalRelationshipTypeInput.addEventListener('blur', function () {
    $(temporalRelationshipTypeInput).removeClass('is-invalid');
  });

  // Init
  updateQueryConfiguration('selection');

  // Parse query
  if (query) {
    HeraldUI.bindQuery(queryModal, query);
  }

  // Open the modal and wait for it to close
  return new Promise((resolve) => {

    // Show
    modal.show();

    // Remove the new instance from the DOM when the modal is hidden
    $(queryModal).on('hidden.bs.modal', function () {
      queryModal.remove();
    });

    // Wait for OK click
    queryModal.querySelector('#okButton').onclick = () => {
      let queryName = queryModal.querySelector('#observationLabelInput').value;
      let result = HeraldUI.renderQuery(queryModal);
      if (!queryName) {
        queryName = HeraldUI.renderQueryName(result);
      }
      modal.hide();
      resolve({name: queryName, query: result});
    };
    
    // Wait for cancel click
    queryModal.querySelector('#cancelButton').onclick = () => {
      modal.hide();
      resolve({name: null, query: null});
    };
  });
}

/**
 * Function to add an existence query row
 */
function addExistenceQueryRow(keywordFilterRow) {

  const existenceQueryAddButton = keywordFilterRow.querySelector('.existenceAddButton');
  const existenceQueryRemoveButton = keywordFilterRow.querySelector('.existenceRemoveButton');
  const existenceQueryKeywordSelect = keywordFilterRow.querySelector('.existenceQueryKeywordSelect');
  const existenceQueryFilterInput = keywordFilterRow.querySelector('.existenceQueryFilterInput');

  // Clone row
  const newRow = keywordFilterRow.cloneNode(true);
  keywordFilterRow.parentNode.insertBefore(newRow, keywordFilterRow.nextSibling);

  // Attach listeners to clone
  let newexistenceQueryFilterInput = newRow.getElementsByClassName('existenceQueryFilterInput')[0];
  newexistenceQueryFilterInput.addEventListener('focus', function () {
    showQueryBuilder(this);
  });
  newexistenceQueryFilterInput.addEventListener('input', function () {
    showQueryBuilder(this);
  });
  newexistenceQueryFilterInput.addEventListener('blur', function () {
    $(newexistenceQueryFilterInput).removeClass('is-invalid');
  });
  
  // Update buttons
  existenceQueryAddButton.parentNode.style.display = 'none';
  existenceQueryRemoveButton.parentNode.style.display = 'none';
  existenceQueryKeywordSelect.parentNode.style.display = 'block';
  existenceQueryFilterInput.parentNode.style.display = 'block';
  if (keywordFilterRow.parentNode.querySelectorAll('.keywordFilterRow').length > 1) {
    keywordFilterRow.parentNode.querySelectorAll('.existenceRemoveButton').forEach(btn => btn.removeAttribute('disabled'));
  }

  // Done
  return newRow;
}

/**
 * Removes an existence row
 */
function removeExistenceQueryRow(keywordFilterRow) {
  
  // Remove row
  const prevRow = keywordFilterRow.previousElementSibling;
  const parentNode = keywordFilterRow.parentNode;
  keywordFilterRow.remove();

  if (prevRow) {
    // Update buttons
    const prevAddButton = prevRow.querySelector('.existenceAddButton');
    const prevRemoveButton = prevRow.querySelector('.existenceRemoveButton');
    const prevQueryKeywordSelect = prevRow.querySelector('.existenceQueryKeywordSelect');
    const prevQueryFilterInput = prevRow.querySelector('.existenceQueryFilterInput');
    prevRemoveButton.parentNode.style.display = 'block';
    prevAddButton.parentNode.style.display = 'block';
    prevQueryKeywordSelect.parentNode.style.display = 'none';
    prevQueryFilterInput.parentNode.style.display = 'none';
  }

  if (parentNode.querySelectorAll('.keywordFilterRow').length === 1) {
    parentNode.querySelector('.existenceRemoveButton').setAttribute('disabled', true);
  }
}

/**
 * Update query configuration
 */
function updateQueryConfiguration(queryType) {
  const keywordSelect = queryModal.querySelector('#queryKeywordSelect');
  keywordSelect.innerHTML = '';
  if (queryTypeKeywords[queryType]) {
    for (const keyword of queryTypeKeywords[queryType]) {
      const option = document.createElement('option');
      option.value = keyword;
      option.text = keyword;
      keywordSelect.add(option);
    }
  }
  const existenceKeywordFilterRows = queryModal.querySelector('#existenceKeywordFilterRows');
  if (queryType === 'existence') {
    existenceKeywordFilterRows.style.display = 'block';
  } else {
    existenceKeywordFilterRows.style.display = 'none';
  }
  const relationshipQueryFilterRows = queryModal.querySelector('#relationshipQueryFilterRow');
  if (queryType === 'relationship') {
    relationshipQueryFilterRows.style.display = 'block';
  } else {
    relationshipQueryFilterRows.style.display = 'none';
  }
}

/**
 * Update input for temporal relationships
 */
function updateTemporalRelationshipInput() {

  const temporalRelationshipSelect = queryModal.querySelector('#temporalRelationshipSelect');
  const temporalRelationshipInput = queryModal.querySelector('#temporalRelationshipInput');
  const timeUnitSelect = queryModal.querySelector('#timeUnitSelect');
  const temporalRelationshipTypeSelect = queryModal.querySelector('#temporalRelationshipTypeSelect');
  const temporalRelationshipTypeInput = queryModal.querySelector('#temporalRelationshipTypeInput');
  const ofElement = queryModal.querySelector('.of-text');
  
  let show = function(element, weight) {
    element.parentNode.classList.add('d-flex', 'flex-grow-' + weight, 'px-1');
    element.parentNode.style.display = 'block';
  }
  let hide = function (element, weight) {
    element.parentNode.classList.remove('d-flex', 'flex-grow-' + weight, 'px-1');
    element.parentNode.style.display = 'none';
  }

  if (!temporalRelationshipSelect.value || (temporalRelationshipSelect.value === 'No temporal restriction')) {
    hide(temporalRelationshipInput, 1);
    hide(timeUnitSelect, 1);
    hide(temporalRelationshipTypeSelect, 1);
    hide(temporalRelationshipTypeInput, 1);
    hide(ofElement, 0);
  } else {
    if (timeUnitSelect.value && timeUnitSelect.value !== 'NONE') {
      show(temporalRelationshipInput, 1);
      show(ofElement, 0);
    } else {
      hide(temporalRelationshipInput, 1);
      hide(ofElement, 0);
    }
    show(timeUnitSelect, 1);
    show(temporalRelationshipTypeSelect, 1);
    show(temporalRelationshipTypeInput, 1);
  }
}

/**
 * Hide the query builder
 */
function hideQueryBuilder() {
  queryModal.querySelector('#queryBuilder').style.display = 'none';
  activeFilterInput = null;
}


/**
 * Initializes the Herald query builder modal (aka the editor)
 */
function initHeraldQueryBuilderModal() {
  newHTML = `
  <!-- Modal for building HERALD queries -->
  <div class="modal" tabindex="-1" id="queryModal">
      <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
              <div class="modal-header">
              <h5 class="modal-title small">Specify an observation to be used in the analysis</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
              <!-- Observation label input -->
              <div class="row mb-2">
                  <div class="col-auto px-1">
                  <label for="observationLabelInput" class="form-label small">Label:</label>
                  </div>
                  <div class="col px-1">
                  <input type="text" class="form-control small" id="observationLabelInput">
                  </div>
              </div>			  
              <!-- Select query type -->
              <div class="row mb-2">
                  <div class="col px-1">
                  <select class="form-select small" id="queryTypeSelect">
                      <option value="selection" selected>Selection</option>
                      <option value="aggregation">Aggregation</option>
                      <option value="relationship">Relationship</option>
                      <option value="existence">Existence</option>
                  </select>
                  </div>
              </div>
              <!-- Query keyword -->
              <div class="row mb-2">
                  <div class="col px-1">
                  <select class="form-select small" id="queryKeywordSelect">
                  </select>
                  </div>
                  <div class="col px-1">
                  <input type="text" class="form-control small herald-auto-complete" id="queryFilterInput" placeholder="Filter">
                  </div>
              </div>
              <!-- Additional rows for existence queries-->
              <div id="existenceKeywordFilterRows" style="display: none;">
                  <div class="keywordFilterRow">
                  <div class="row mb-2">
                      <div class="col px-1" style="display: none;">
                      <select class="form-select small existenceQueryKeywordSelect">
                          <option value="EXISTS" selected>AND EXISTS</option>>
                          <option value="NOT EXISTS">AND NOT EXISTS</option>
                      </select>
                      </div>
                      <div class="col px-1" style="display: none;">
                      <input type="text" class="form-control small existenceQueryFilterInput herald-auto-complete" placeholder="Filter">
                      </div>
                      <div class="col px-1">
                      <button type="button" class="btn btn-primary btn-sm w-100 existenceAddButton">Add</button>
                      </div>
                      <div class="col px-1">
                      <button type="button" class="btn btn-danger btn-sm w-100 existenceRemoveButton" disabled>Remove</button>
                      </div>
                  </div>
                  </div>
              </div>
              <!-- Additional row for relationship queries-->
              <div id="relationshipQueryFilterRow" style="display: none;">
                  <div class="relationshipFilterRow">
                  <div class="row mb-2 px-1">
                      <div class="col d-flex justify-content-end px-1">
                          <span class="small">AND</span>
                      </div>
                      <div class="col px-1">
                      <input type="text" class="form-control small relationshipQueryFilterInput herald-auto-complete" placeholder="Filter">
                      </div>
                  </div>
                  </div>
              </div>
              <!-- Temporal relationship -->
              <div class="row mb-2 d-flex">
                  <div class="col d-flex flex-grow-1 px-1">
                      <select class="form-select small flex-grow-1" id="temporalRelationshipSelect">
                          <option value="No temporal restriction" selected>No temporal restriction</option>
                          <option value="BEFORE">BEFORE</option>
                          <option value="AFTER">AFTER</option>
                          <option value="APART FROM">APART FROM</option>
                          <option value="CLOSE TO">CLOSE TO</option>
                          <option value="BEFORE AND CLOSE TO">BEFORE AND CLOSE TO</option>
                          <option value="AFTER AND CLOSE TO">AFTER AND CLOSE TO</option>
                      </select>
                  </div>
                  <div class="col" style="display: none;">
                      <select class="form-select small flex-grow-1" id="temporalRelationshipTypeSelect">
                          <option value="date" selected>Date</option>
                          <option value="observation">Observation</option>
                      </select>
                  </div>
                  <div class="col" style="display: none;">
                      <input type="text" class="form-control small flex-grow-1 herald-auto-complete" id="temporalRelationshipTypeInput" placeholder="Date or filter">
                  </div>
                  <div class="col" style="display: none;">
                      <div class="col of-text text-center flex-grow-0">
                          <span class="small">BY</span>
                      </div>
                  </div>
                  <div class="col" style="display: none;">
                      <input type="number" class="form-control small flex-grow-1" id="temporalRelationshipInput" placeholder="Time" min="0">
                  </div>
                  <div class="col" style="display: none;">
                      <select class="form-select small flex-grow-1" id="timeUnitSelect">
                          <option value="NONE">Without offset</option>
                          <option value="DAYS">DAY(S)</option>
                          <option value="WEEKS">WEEK(S)</option>
                          <option value="MONTHS">MONTH(S)</option>
                          <option value="YEARS">YEAR(S)</option>
                      </select>
                  </div>
              </div>
              <!-- jQuery query builder component -->
              <div id="queryBuilder" style="display: none;"></div>
              <!-- Footer -->
              <div class="modal-footer">
              <button type="button" class="btn btn-secondary small" id="cancelButton" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary small" id="okButton">OK</button>  
              </div>
          </div>
      </div>
  </div>
  </div>`;
  GHDMUI.prependToMainDiv(newHTML);
}

initHeraldQueryBuilderModal();

/**
 * Namespace object and export
 */
var HeraldUI = window.HeraldUI || {};
Object.assign(HeraldUI, {
  showHeraldQueryModal: showHeraldQueryModal,
  addExistenceQueryRow: addExistenceQueryRow
});
window.HeraldUI = HeraldUI;




})();

// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin

})();

// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin

})();

window["herald-ui"] = __webpack_exports__;
/******/ })()
;