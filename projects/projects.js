import { fetchJSON, renderProjects } from '../global.js';

async function loadAndRenderProjects() {
    const projects = await fetchJSON('../lib/projects.json');
    const projectsContainer = document.querySelector('.projects');
    renderProjects(projects, projectsContainer, 'h2');

    // Update the projects count
    const projectsTitle = document.querySelector('.projects-title');
    projectsTitle.textContent = `${projects.length} Projects`;
}

loadAndRenderProjects();