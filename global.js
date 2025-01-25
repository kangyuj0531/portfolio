console.log('IT’S ALIVE!');

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

let pages = [
    {url: 'portfolio/', title: 'Home'},
    {url: 'portfolio/projects/', title: 'Projects'},
    // add the rest of your pages here
    {url: 'portfolio/contact/', title: 'Contact'},
    {url: 'https://github.com/kangyuj0531', title: 'Profile'},
    {url: 'portfolio/resume/', title: 'Resume'}
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