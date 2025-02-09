import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

function renderPieChart(projectsGiven) {
  // re-calculate rolled data
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );
    
    // re-calculate data
    let newData = newRolledData.map(([year, count]) => {
        return { label: year, value: count };
    });
    
    // re-calculate slice generator, arc data, arc, etc.
    let newSliceGenerator = d3.pie().value(d => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map(slice => arcGenerator(slice));
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    // TODO: clear up paths and legends
    d3.select('svg').selectAll('path').remove();
    d3.select('.legend').selectAll('li').remove();
    
    // Update the paths for the pie chart using the updated arc data
    newArcs.forEach((slice, idx) => {
        d3.select('svg')
        .append('path')
        .attr('d', slice)
        .attr('fill', colors(idx)); 
    });
    
    // Update the legend with the new data
    let legend = d3.select('.legend');
    newData.forEach((d, idx) => {
        legend.append('li')
        .attr('style', `--color:${colors(idx)}`) 
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

renderPieChart(projects);

let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
    // Update query value and filter projects
    let query = event.target.value;
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
    
    // Optionally re-render other project elements
    renderProjects(filteredProjects, document.querySelector('.projects'), 'h2');
    
    // Re-render pie chart with the filtered projects
    // renderPieChart(filteredProjects);

    updatePieChartSearch(filteredProjects);

});

let selectedIndex = -1;

let svg = d3.select('svg');
let legend = d3.select('.legend');
let colors = d3.scaleOrdinal(d3.schemeTableau10);

function updatePieChart(projects) {
    let rolledData = d3.rollups(
        projects,
        (v) => v.length,
        (d) => d.year,
    );
    
    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));
  
    svg.selectAll('path').remove();
    arcs.forEach((arc, i) => {
      svg
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(i))
        .on('click', () => {
          selectedIndex = selectedIndex === i ? -1 : i;
          
          svg
            .selectAll('path')
            .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''));
          
          legend
            .selectAll('li')
            .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''));
          
          if (selectedIndex === -1) {
            renderProjects(projects, projectsContainer, 'h2');
          } else {
            let selectedYear = data[selectedIndex].label;
            let filteredProjects = projects.filter(project => project.year === selectedYear);
            renderProjects(filteredProjects, projectsContainer, 'h2');
          }
        });
    });
  }

updatePieChart(projects);


function updatePieChartSearch(projectsGiven) {
    // re-calculate rolled data
      let newRolledData = d3.rollups(
          projectsGiven,
          (v) => v.length,
          (d) => d.year
      );
      
      // re-calculate data
      let newData = newRolledData.map(([year, count]) => {
          return { label: year, value: count };
      });
      
      // re-calculate slice generator, arc data, arc, etc.
      let newSliceGenerator = d3.pie().value(d => d.value);
      let newArcData = newSliceGenerator(newData);
      let newArcs = newArcData.map(slice => arcGenerator(slice));
      let colors = d3.scaleOrdinal(d3.schemeTableau10);
  
      // TODO: clear up paths and legends
      d3.select('svg').selectAll('path').remove();
      d3.select('.legend').selectAll('li').remove();
      
      // Update the paths for the pie chart using the updated arc data
      newArcs.forEach((slice, idx) => {
          d3.select('svg')
          .append('path')
          .attr('d', slice)
          .attr('fill', colors(idx)); 
      });
      
      // Update the legend with the new data
      let legend = d3.select('.legend');
      newData.forEach((d, idx) => {
          legend.append('li')
          .attr('style', `--color:${colors(idx)}`) 
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
      });

    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );
    
    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));
  
    svg.selectAll('path').remove();
    arcs.forEach((arc, i) => {
      svg
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(i))
        .on('click', () => {
          selectedIndex = selectedIndex === i ? -1 : i;
          
          svg
            .selectAll('path')
            .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''));
          
          legend
            .selectAll('li')
            .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''));
          
          if (selectedIndex === -1) {
            renderProjects(projectsGiven, projectsContainer, 'h2');
          } else {
            let selectedYear = data[selectedIndex].label;
            let filteredProjects = projectsGiven.filter(project => project.year === selectedYear);
            renderProjects(filteredProjects, projectsContainer, 'h2');
          }
        });
    });
  }