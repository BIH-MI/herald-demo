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

// Generic Health Data Module (GHDM)
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
 * ghdm-ui / Utility and Helper Functions
 */
 

/**
 * Helper function to append some string to the main GHDM content div.
 * @param {String} htmlString 
 */
function appendToMainDiv(htmlString) {
    let previousContent = document.getElementById("ghdmContent").innerHTML;
    document.getElementById("ghdmContent").innerHTML = previousContent + htmlString;
}


/**
 * Helper function to prepend some string to the main GHDM content div.
 * @param {String} htmlString 
 */
function prependToMainDiv(htmlString) {
    let previousContent = document.getElementById("ghdmContent").innerHTML;
    document.getElementById("ghdmContent").innerHTML = htmlString + previousContent;
}


/**
 * Initializes the cohort selection checkboxes
 */
function initCohortSelection(cohorts) {
    newHTML = `<div class="container full-width-container">
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="d-flex justify-content-between">
							<label for="cohortSelect" class="form-label">Select cohort(s)</label>
							<button type="button" class="btn btn-primary small mb-3" id="exportPDF">Export to PDF</button>
                        </div>
                        <div class="d-flex flex-column position-relative border rounded">
                            <div id="cohortSelect" class="mb-3 my-2 mx-2"></div>
                        </div>
                    </div>
                 </div>
                </div>`;
    prependToMainDiv(newHTML);

    const cohortSelect = document.getElementById("cohortSelect");
	
	cohorts.forEach(cohort => {
	  const cohortName = cohort.label;
	    
	  	// Get the cohort select container
		const cohortSelect = document.getElementById('cohortSelect');
		
		// Create a new div element for the form-check
		const newDiv = document.createElement('div');
		newDiv.classList.add('form-check');
		
		// Create a new checkbox
		const newCheckbox = document.createElement('input');
		newCheckbox.classList.add('form-check-input');
		newCheckbox.type = 'checkbox';
		newCheckbox.value = cohortName;
		newCheckbox.checked = true;
		newCheckbox.id = cohortName;
		
		// Create a new label
		const newLabel = document.createElement('label');
		newLabel.classList.add('form-check-label');
		newLabel.htmlFor = cohortName;
		newLabel.textContent = cohortName;
		
		// Append the new checkbox and label to the div
		newDiv.appendChild(newCheckbox);
		newDiv.appendChild(newLabel);
		
		// Append the new div to the cohort select container
		cohortSelect.appendChild(newDiv);
	});

}


/**
 * Initialize and add functions for the PDF export.
 */
function initPDFExport() {

	document.getElementById('exportPDF').addEventListener('click', () => {
		const outputDiv = document.getElementById('ghdmContent');
	  
		window.jsPDF = window.jspdf.jsPDF;
	
		html2canvas(outputDiv, {
		  scale: 1, // You can adjust the scale to fit the content
		  useCORS: true,
		  scrollY: 0,
		}).then((canvas) => {
		  const imgData = canvas.toDataURL('image/png');
		  const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
		  const imgProps = pdf.getImageProperties(imgData);
		  const pdfWidth = pdf.internal.pageSize.getWidth();
		  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
	  
		  const pageHeight = pdf.internal.pageSize.getHeight();
	  
		  let yPos = 0;
	  
		  while (yPos < pdfHeight) {
			if (yPos !== 0) {
			  pdf.addPage(); // Add a new page if the content doesn't fit on the current page
			}
			pdf.addImage(imgData, 'PNG', 0, -yPos, pdfWidth, pdfHeight);
			yPos += pageHeight;
		  }

		  pdf.save('output.pdf');
		  
		});
	  });
}


/**
 * Initializes tooltips
 */
function initGHDMUtils(cohorts, callback) {

	initCohortSelection(cohorts);
	initPDFExport();

	if (callback) {
		callback();
	}
}


/**
 * Function returning a "no data" alert div
 * @returns 
 */
function createNoDataAlert() {
    let alert = document.createElement('div');
    alert.className = 'alert alert-primary';
    alert.role = 'alert';
    alert.innerHTML = '<h4 class="alert-heading">No or not enough data available</h4>' +
                      '<p>Make sure to specify (enough) observations and to select at least one cohort.</p>';
    return alert;
}


/**
 * Namespace object and export
 */
var GHDMUI = window.GHDMUI || {};
Object.assign(GHDMUI, {
  appendToMainDiv: appendToMainDiv,
  prependToMainDiv: prependToMainDiv,
  initGHDMUtils: initGHDMUtils,
  createNoDataAlert: createNoDataAlert
});
window.GHDMUI = GHDMUI;



})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
// Generic Health Data Module (GHDM)
//
// Module: Modals and Modal Helpers
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
 * ghdm-ui / Modals and Modal Helpers
 */

/**
 * Show a blocking alert modal (i.e. the modal has to be closed before proceeding)
 * @param {*} text The text to be displayed inside the alert modal.
 */
function showAlert(text) {
    const messageElement = document.getElementById('blocking-alert-message');
    messageElement.innerText = text;
  
    const modal = new bootstrap.Modal(document.getElementById('blocking-alert-modal'));
    modal.show();
}
  
/**
 * Shows the concept selection modal, a dropdown box offering all concepts defined in tables
 * @param {*} message Message to be displayed in the modal
 * @param {*} tables Contains the concepts offered for selection in the modal 
 * @returns Promise for selected concept or undefined if cancelled.
 */
function showConceptSelectionModal(message, tables) {
    return new Promise((resolve) => {
        const uniqueConceptLabels = GHDM.getUniqueConceptLabels(tables);

        // Set the message content
        const conceptSelectionMessage = document.getElementById("conceptSelectionMessage");
        conceptSelectionMessage.textContent = message;

        // Populate the concept options
        const conceptSelect = document.getElementById("conceptSelect");
        conceptSelect.innerHTML = '';
        uniqueConceptLabels.forEach((label) => {
        const option = document.createElement("option");
        option.textContent = label;
        option.value = label;
        conceptSelect.appendChild(option);
        });

        // Display the modal
        const modal = new bootstrap.Modal(document.getElementById('conceptSelectionModal'), {
        backdrop: 'static',
        keyboard: false
        });
        modal.show();

        // Handle the concept selection
        document.getElementById("conceptSelectConfirmButton").addEventListener("click", () => {
        const selectedConcept = conceptSelect.value;
        modal.hide();
        resolve(selectedConcept);
        });

        // Handle the concept cancellation
        document.getElementById("conceptSelectCancelButton").addEventListener("click", () => {
        modal.hide();
        resolve(undefined);
        });
});
}
  
 /**
   * Shows the feature and target selection modal.
   * @param {*} message 
   * @param {*} tables 
   * @returns List of selected features and selected target
   */
function showFeatureTargetSelectionModal(message, tables) {
    return new Promise((resolve) => {
        const uniqueConceptLabels = GHDM.getUniqueConceptLabels(tables);

        // Check if "Age" and "Sex" are present in the tables
        const patientProperties = ['Age', 'Sex'].filter((property) => {
        const propertyIndex = tables[0][0].indexOf(property);
        return propertyIndex !== -1;
        });

        // Set the message content
        const featureTargetMessage = document.getElementById("featureTargetMessage");
        featureTargetMessage.textContent = message;

        // Populate the features options
        const featuresSelect = document.getElementById("featuresSelect");
        featuresSelect.innerHTML = '';
        patientProperties.concat(uniqueConceptLabels).forEach((label) => {
        const option = document.createElement("option");
        option.textContent = label;
        option.value = label;
        featuresSelect.appendChild(option);
        });

        // Populate the target options
        const targetSelect = document.getElementById("targetSelect");
        targetSelect.innerHTML = '';
        patientProperties.concat(uniqueConceptLabels).forEach((label) => {
        const option = document.createElement("option");
        option.textContent = label;
        option.value = label;
        targetSelect.appendChild(option);
        });

        // Display the modal
        const modal = new bootstrap.Modal(document.getElementById('featureTargetModal'), {
        backdrop: 'static',
        keyboard: false
        });
        modal.show();

        // Handle the selections
        document.getElementById("featureTargetConfirmButton").addEventListener("click", () => {
        const selectedFeatures = Array.from(featuresSelect.selectedOptions).map(option => option.value);
        const selectedTarget = targetSelect.value;
        modal.hide();
        resolve({ features: selectedFeatures, target: selectedTarget });
        });

        // Handle the cancellation
        document.getElementById("featureTargetCancelButton").addEventListener("click", () => {
        modal.hide();
        resolve({ features: [], target: undefined });
        });
    });
}
  

/**
 * Initializes the GHDM alert modal
 */
function initGHDMAlertModal() {
    let newHTML = `<div class="modal" tabindex="-1" id="">
                  <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Attention</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p id="blocking-alert-message"></p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                  </div>
                </div>`;
    GHDMUI.appendToMainDiv(newHTML);
}


/**
 * Initialize GHDM concept selection modal
 */
function initGHDMConceptSelectionModal() {
    let newHTML = `
        <div class="modal fade" id="conceptSelectionModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Select Concept</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                <!-- will be filled later -->
                <p id="conceptSelectionMessage"></p>
                <form id="conceptSelectionForm">
                    <div class="mb-3">
                    <label for="conceptSelect" class="form-label">Choose Concept:</label>
                    <select class="form-select" id="conceptSelect">
                    </select>
                    </div>
                </form>
                </div>
                <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="conceptSelectCancelButton" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="conceptSelectConfirmButton">Select</button>
                </div>
            </div>
            </div>
        </div>`;
    GHDMUI.appendToMainDiv(newHTML); 
}

/** 
 * Helper function to initialize all GHDM UI elements
 */
function initGHDMModals() {
    initGHDMAlertModal();
    initGHDMConceptSelectionModal();
}

/**
 * Namespace object and export
 */
var GHDMUI = window.GHDMUI || {};
Object.assign(GHDMUI, {
  showConceptSelectionModal: showConceptSelectionModal
});
window.GHDMUI = GHDMUI;

initGHDMModals();

})();

// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin

})();

window["ghdm-ui"] = __webpack_exports__;
/******/ })()
;