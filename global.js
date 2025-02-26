// console.log('IT’S ALIVE!');

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

let pages = [
    {url: '', title: 'Home'},
    {url: 'projects/', title: 'Projects'},
    // add the rest of your pages here
    {url: 'resume/', title: 'Resume'},
    {url: 'contact/', title: 'Contact'},
    {url: 'meta/', title: 'Meta'},
    {url: 'https://github.com/kangyuj0531', title: 'Profile'}
];

let nav = document.createElement('nav');
document.body.prepend(nav);

const ARE_WE_HOME = document.documentElement.classList.contains('home');

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    // TODO create link and add it to nav
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

    // Create link element
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }

    // Open external links in a new tab
    if (url.startsWith('http')) {
        a.target = '_blank';
    }

    nav.append(a);
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
        Theme: 
        <select>
                <option value="light dark">Automatic</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
        </select>
    </label>`
);

const select = document.querySelector('.color-scheme select');

if ("colorScheme" in localStorage) {
    const savedScheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', savedScheme);
    select.value = savedScheme;
}

select.addEventListener('input', function (event) {
    const newScheme = event.target.value;
    console.log('color scheme changed to', newScheme);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = newScheme; 
});

export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);
        // console.log(response);

        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        const data = await response.json();
        // console.log(data);
        return data; 

    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

fetchJSON('../lib/projects.json')

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    console.log('Rendering projects:', projects);
    containerElement.innerHTML = '';

    // Render each project
    for (let project of projects) {
        const article = document.createElement('article');

        // Create the project title element based on the headingLevel
        const projectTitle = document.createElement(headingLevel);
        projectTitle.textContent = project.title;
        article.appendChild(projectTitle);
        
        // Append the rest of the project details
        const projectImage = document.createElement('img');
        projectImage.src = project.image;
        projectImage.alt = project.title;
        projectImage.style.width = '200px'; // Set the width
        projectImage.style.height = 'auto'; // Set the height
        article.appendChild(projectImage);

        // Create a container for project details
        const projectDetails = document.createElement('div');
        projectDetails.className = 'project-details';

        // Append the project description
        const projectDescription = document.createElement('p');
        projectDescription.textContent = project.description;
        projectDetails.appendChild(projectDescription);

        // Append the project year using a <time> element
        const projectYear = document.createElement('time');
        projectYear.dateTime = project.year; // Set the datetime attribute
        projectYear.textContent = `Year: ${project.year}`;
        projectDetails.appendChild(projectYear);

        // Append the project details container to the article
        article.appendChild(projectDetails);

        // Append the article to the container element
        containerElement.appendChild(article);
    }
}

export async function fetchGitHubData(username) {
    // return statement here
    return fetchJSON(`https://api.github.com/users/${username}`);
  }