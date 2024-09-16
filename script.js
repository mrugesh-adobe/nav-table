// Base URLs
const BASE_JSON_URL = "https://btpx.frontify.com/api/document/page/-/";
const BASE_DOCUMENT_URL = "https://btpx.frontify.com/document/223120";

async function fetchNavContent() {
    try {
        // Fetch the nav content from the HTML file
        const response = await fetch('nav-content.html');
        const navContent = await response.text();

        // Insert the fetched content into the DOM
        document.getElementById('nav-container').innerHTML = navContent;

        // Generate the table after loading the nav content
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
                .join(', ');

            // Add a new row to the table
            table += `<tr>
                        <td>${count}</td>
                        <td><a href="${fullHref}" target="_blank">${fullHref}</a></td>
                        <td><a href="${jsonURL}" target="_blank">${jsonURL}</a></td>
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
}

// Fetch the nav content and generate the table
fetchNavContent();
