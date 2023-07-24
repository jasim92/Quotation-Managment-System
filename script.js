const mainListContainer = document.getElementById("main");
const mainTableBody = document.getElementById("tablesBody");
const formElement = document.getElementById('quotationForm');
const searchForm = document.getElementById('form');
const SERVER_URL = "http://192.168.0.137:1337/api/quotations";


document.getElementById("saveButton").addEventListener("click", async function () {
    const formElements = formElement.elements;
    const data = {};
  
    for (let i = 0; i < formElements.length; i++) {
        const currentElement = formElements[i];
        if (!['submit', 'file'].includes(currentElement.type)) {
            data[currentElement.name] = currentElement.value;
        }
    }
  
    try {
        const createResponse = await fetch('http://192.168.0.137:1337/api/quotations', {
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
  
            // Get the file input element
            const fileInput = document.getElementById('fileInput');
  
            // Check if a file is selected before proceeding with the upload
            if (fileInput.files.length > 0) {
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
  
                const uploadResponse = await fetch('http://192.168.0.137:1337/api/upload/', {
                    method: 'POST',
                    body: formData,
                });
  
                if (uploadResponse.ok) {
                    mainTableBody.innerHTML = '';
                    console.log('File uploaded and linked to the entry successfully!');
                    $('#exampleModalCenter').modal('hide');
                    getQuotationList(SERVER_URL);
                } else {
                    const errorData = await uploadResponse.json();
                    console.log('Failed to upload file:', errorData);
                }
            } else {
                console.log('No file selected for upload.');
            }
        } else {
            const errorData = await createResponse.json();
            console.log('Failed to create the entry:', errorData);
        }
    } catch (error) {
        console.error('Error:', error);
    }
  });

const getQuotationList = (queryUrl) => {
    mainListContainer.innerHTML = '';
    let options = {
        method: "GET",
    };

    fetch(queryUrl, options)
        .then(response => response.json())
        .then(result => {

            if (result.data.length != 0) {
                console.log(result.data);
                const tableBody = document.querySelector('#myTable tbody');
                result.data.forEach((element, index) => {
                    const { clientName, status, quotationNumber, issueDate } = element.attributes;
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <th scope="row">${index + 1}</th>
                        <td>${clientName}</td>
                        <td>${quotationNumber}</td>
                        <td>${status}</td>
                        <td>${issueDate}</td>
                        <td>download</td>
                    `;
                    tableBody.appendChild(row);
                });

            }


        })
        .catch(error => console.log('error', error));
}

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchItem = search.value;
    console.log(searchItem);
    mainTableBody.innerHTML = '';
    if (searchItem) {

        getQuotationList(SERVER_URL + '?filters[clientName][$containsi]=' + searchItem);
    }
    else {
        getQuotationList(SERVER_URL);
    }
});

  
getQuotationList(SERVER_URL);