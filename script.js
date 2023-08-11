const mainListContainer = document.getElementById("main");
const mainTableBody = document.getElementById("tablesBody");
const formElement = document.getElementById('quotationForm');
const quotationElement = document.getElementById('quotationNumber');
const searchForm = document.getElementById('form');
const total_value = document.getElementById('total-value');
const addButton = document.getElementById('addButton');
const SERVER_URL = "http://192.168.0.132:1337/api/quotations";
var newQueryUrl = '';
let quotationNumberForForm;
getDropdownValue();

// to increament quotation number based on previous number
addButton.addEventListener("click", function (){
    quotationElement.value = "E1-Q-2023-"+quotationNumberForForm;
})

document.getElementById("saveButton").addEventListener("click", async function (e) {
    e.preventDefault();
    const formElements = formElement.elements;
    // Get the file input element
    const fileInput = document.getElementById('fileInput');
    const data = {};
    const erroMessages = [];
    for (let i = 0; i < formElements.length; i++) {
        const currentElement = formElements[i];
        if (!['submit', 'file'].includes(currentElement.type)) {
            if (!currentElement.value) {
                const msg = currentElement.name;
                erroMessages.push(msg);
            }
            else {

                data[currentElement.name] = currentElement.value;
            }

        }
    }

    if (erroMessages.length > 0) {
        const errorMsg = erroMessages.join(', ');
        formAlertFunction(errorMsg + " cannot be empty");
    }


    try {

        // Check if a file is selected before proceeding with the upload
        if (fileInput.files.length > 0) {
            const createResponse = await fetch('http://192.168.0.132:1337/api/quotations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: data,
                }),
            });

            if (createResponse.ok) {
                const createdEntry = await createResponse.json();
                console.log('createdEntry:', createdEntry.data.id);
                const refId = createdEntry.data.id;



                // Create a new FormData object
                const formData = new FormData();

                // Append the file to the FormData object
                for (let i = 0; i < fileInput.files.length; i++) {
                    const file = fileInput.files[i];
                    formData.append(`files`, file, file.name);
                }

                formData.append('ref', 'api::quotation.quotation');
                formData.append('refId', refId);
                formData.append('field', 'file');
                console.log('refId:', refId);

                const uploadResponse = await fetch('http://192.168.0.132:1337/api/upload/', {
                    method: 'POST',
                    body: formData,
                });

                if (uploadResponse.ok) {
                    mainTableBody.innerHTML = '';
                    console.log('File uploaded and linked to the entry successfully!');
                    $('#exampleModalCenter').modal('hide');
                    getQuotationList(SERVER_URL, false);
                } else {
                    const errorData = await uploadResponse.json();
                    console.log('Failed to upload file:', errorData);
                }

            } else {
                const errorData = await createResponse.json();
                console.log('Failed to create the entry:', errorData);
            }
        } else {
            const msg = 'No file selected for upload.';
            formAlertFunction(msg);

        }
    } catch (error) {
        console.error('Error:', error);
    }
});

const getQuotationList = (queryUrl, searching, selectedValue) => {
    mainListContainer.innerHTML = "";
    let options = {
        method: "GET",
    };
    if (searching == false) {
        newQueryUrl = queryUrl + '?populate=*';

    } else {
        newQueryUrl = queryUrl + '&populate=*';

    }
    fetch(newQueryUrl, options)
        .then(response => response.json())
        .then(result => {

            if (result.data.length != 0) {
                let total_v = 0;
                const filteredRows = []; // Array to store the filtered rows
                const quoteArray = [];
                result.data.forEach((element, index) => {
                    
                    const { clientName, status, quotationNumber, issueDate, file, creater, value } = element.attributes;
                    quoteArray.push(parseInt(quotationNumber.slice(10,)));

                    if (!selectedValue || creater.includes(selectedValue)) {

                        total_v += value;
                        const row = document.createElement('tr');
                        //changing inner html of table and pushing values
                        row.innerHTML = `
                        <th scope="row">${index + 1}</th>
                        <td>${clientName}</td>
                        <td>${quotationNumber}</td>
                        <td>${status}</td>
                        <td>${issueDate}</td>
                        <td>${creater}</td>
                        <td>${value}</td>
                        <td><a href="http://192.168.0.132:1337${file.data.attributes.url}" target="_blank">View</a></td>
                    `;
                        filteredRows.push(row);

                    }

                });
                total_value.textContent = "AED  " + total_v;
                mainTableBody.innerHTML = '';
                const tableBody = document.querySelector('#tablesBody');
                filteredRows.forEach(row => {
                    tableBody.appendChild(row);

                });
                
                quotationNumberForForm = Math.max(...quoteArray)+1;
            }


        })
        .catch(error => console.log('error', error));
}


// this is for searching functionality you can search any item based on searchItem
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchItem = search.value;
    console.log(searchItem);
    // mainTableBody.innerHTML = '';
    if (searchItem) {

        //    this is calling getQuataion with filter query from strapi v4,
        //      using boolean values to seggregate searching functionality and normal functionality
        getQuotationList(SERVER_URL + '?filters[clientName][$containsi]=' + searchItem, true);
    }
    else {
        getQuotationList(SERVER_URL, false);
    }
});


getQuotationList(SERVER_URL, false);


function getDropdownValue() {
    // Get all the dropdown items (anchors) inside the dropdown menu
    const dropdownItems = document.querySelectorAll(".dropdown-item");

    // Add a click event listener to each dropdown item
    dropdownItems.forEach(item => {
        item.addEventListener("click", () => {
            // Get the selected value from the "data-value" attribute
            const selectedValue = item.getAttribute("data-value");


            if (selectedValue === "salah") {
                mainListContainer.innerHTML = '';
                console.log("Selected value:", selectedValue);
                getQuotationList(SERVER_URL, false, "salah");
            }
            else if (selectedValue === "zeeshan") {
                mainListContainer.innerHTML = '';
                console.log("Selected value:", selectedValue);
                getQuotationList(SERVER_URL, false, "zeeshan");
            }
            else if (selectedValue === "zaheer") {
                mainListContainer.innerHTML = '';
                console.log("Selected value:", "zaheer");
                getQuotationList(SERVER_URL, false, selectedValue);
            }
            else {
                mainListContainer.innerHTML = '';
                console.log("Selected value:", "all");
                getQuotationList(SERVER_URL, false);
            }

        });
    });

}

function formAlertFunction(alertMsg) {
    console.log(alertMsg);
    const formAlert = document.getElementById('form-alert');
    formAlert.textContent = alertMsg;
    formAlert.style.display = 'block'; // Show the alert
}