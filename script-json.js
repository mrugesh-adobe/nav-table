// Base URLs
const BASE_JSON_URL = "https://btpx.frontify.com/api/document/page/-/";
const DOCUMENT_ID = "223029";
const BASE_DOCUMENT_URL = `https://btpx.frontify.com/document/${DOCUMENT_ID}`;
const COOKIE = "intercom-device-id-df8660455b31e47204fef88f8e5f5f5d5efcbcbf=fd24acbc-9312-4188-9f5b-e768ebecf485; PHPSESSID=2523qqhjsss00jinkbutvo8fciu0kqdb; intercom-session-df8660455b31e47204fef88f8e5f5f5d5efcbcbf=UVhJOHZZMUM5T2FvTWhINHhLNFJhMlpGZ0dCbTRNV3B1NTQ0eHF3UGIzdThsK2toMW4xV1JTRlpFV1F0Ukk0SS0tTlJQejM4ZmREUGFncTRCdktIRHhZdz09--ec46280ae508567c313cb2977d726a5d7bf09212; AMP_899c7e29a9=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjIxYzkzYzkwZi03MTQ2LTRiMzMtYjVhYy01ZWQwZmFhY2YyNjglMjIlMkMlMjJ1c2VySWQlMjIlM0ElMjI0MDAwMTE2LTMyMDIzMSUyMiUyQyUyMnNlc3Npb25JZCUyMiUzQTE3Mjg0OTQ4NzUxMDklMkMlMjJvcHRPdXQlMjIlM0FmYWxzZSUyQyUyMmxhc3RFdmVudFRpbWUlMjIlM0ExNzI4NDk0ODc1ODI3JTJDJTIybGFzdEV2ZW50SWQlMjIlM0ExMjc0JTJDJTIycGFnZUNvdW50ZXIlMjIlM0EwJTdE; AWSALB=QhqRJ5ALywUixKNj0SEnIb5MOQwlO+cQmIF09nlBtOf4p6QafrzMe1lhABkpeHS7/cmMB5XdcuNbAdLiYTQ9IXWu0Dbhr8bDKuSu0+U2I/cbZlenSRz4I9hAnXQd; AWSALBCORS=QhqRJ5ALywUixKNj0SEnIb5MOQwlO+cQmIF09nlBtOf4p6QafrzMe1lhABkpeHS7/cmMB5XdcuNbAdLiYTQ9IXWu0Dbhr8bDKuSu0+U2I/cbZlenSRz4I9hAnXQd"

async function fetchNavContent() {
    try {
        // Fetch the nav content from the HTML file
        const response = await fetch('nav-content.html');
        const navContent = await response.text();

        // Insert the fetched content into the DOM
        document.getElementById('nav-container').innerHTML = navContent;

        // Generate the first table
        generateTableFromNav();
    } catch (error) {
        console.error('Error fetching nav content:', error);
    }
}

function generateTableFromNav() {
    // Get the <nav> tag innerHTML
    const navElement = document.querySelector('nav');
    if (!navElement) return;

    const navContent = navElement.innerHTML;

    // Create a DOM parser to parse the nav content
    const parser = new DOMParser();
    const doc = parser.parseFromString(navContent, 'text/html');

    // Get all the category divs
    const categories = doc.querySelectorAll('.js-category');
    
    // Create the table structure
    let table = '<table><tr><th>Number</th><th>URL</th><th>JSON</th><th>Title</th><th>Title Second</th><th>Children</th></tr>';

    let count = 1;

    // Loop through each category
    categories.forEach((category) => {
        // Get the h4 category title
        const title = category.querySelector('.js-category-title').textContent.trim();

        // Find all internal links (li items with internal links)
        const internalLinks = category.querySelectorAll('.js-item-link-internal');

        internalLinks.forEach((item) => {
            const dataPage = item.getAttribute('data-page');
            const jsonURL = `${BASE_JSON_URL}${dataPage}`; // JSON URL

            const linkAnchor = item.querySelector('a.js-item-link-anchor');
            const href = linkAnchor.getAttribute('href');
            const titleSecond = linkAnchor.querySelector('.js-item-link-text').textContent.trim();

            // If href starts with '#', construct the full clickable link
            const fullHref = href.startsWith('#') ? `${BASE_DOCUMENT_URL}${href}` : href;

            // Get comma-separated children texts
            const childrenTexts = Array.from(item.querySelectorAll('ul > li > ul > li > a:first-child'))
                .map(child => child.textContent.trim())
                .join('\n');

            // Add a new row to the table
            table += `<tr>
                        <td>${count}</td>
                        <td><a href="${fullHref}" target="_blank">${fullHref}</a></td>
                        <td><a href="${jsonURL}" target="_blank" class="json-url" data-json="${jsonURL}">${jsonURL}</a></td>
                        <td>${title}</td>
                        <td>${titleSecond}</td>
                        <td>${childrenTexts}</td>
                      </tr>`;
            count++;
        });
    });

    // Close the table
    table += '</table>';

    // Add the table to the DOM (for example inside a div with id "table-container")
    document.getElementById('table-container').innerHTML = table;

    // Add event listeners to the JSON URLs
    addJsonUrlListeners();
}

function addJsonUrlListeners() {
    // Get all the JSON URL links
    const jsonLinks = document.querySelectorAll('.json-url');

    // Add click event listeners to each link
    jsonLinks.forEach(link => {
        link.addEventListener('click', async (event) => {
            event.preventDefault();  // Prevent default link behavior
            const jsonUrl = link.getAttribute('data-json');

            // Fetch and process the JSON data from the URL
            await fetchJsonData(jsonUrl);
        });
    });
}

async function fetchJsonData(jsonUrl) {
    try {
        const response = await fetch(jsonUrl, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Cookie': `cookie=${COOKIE}`,
              'Access-Control-Allow-Origin': '*'
          }
        });
        const data = await response.json();

        // Process the JSON response and generate the new table
        generateJsonTable(jsonUrl, data);
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}

function generateJsonTable(jsonUrl, jsonData) {
  console.log(jsonData, jsonUrl);
    // Extract values from the JSON response
    const title = jsonData.result.page.title;
    const slug = jsonData.result.page.slug;

    // Extract block types (comma-separated)
    const blockTypes = jsonData.result.page.sections.flatMap(section =>
        section.blocks.map(block => block.block_type)
    ).join(', ');

    // Create the table structure for JSON data
    let table = '<table><tr><th>JSON URL</th><th>Title</th><th>Slug</th><th>Block Types</th></tr>';
    table += `<tr>
                <td><a href="${jsonUrl}" target="_blank">${jsonUrl}</a></td>
                <td>${title}</td>
                <td>${slug}</td>
                <td>${blockTypes}</td>
              </tr>`;
    table += '</table>';

    // Add the table to the DOM (inside a div with id "json-table-container")
    document.getElementById('json-table-container').innerHTML = table;
}

// Fetch the nav content and generate the table
fetchNavContent();
