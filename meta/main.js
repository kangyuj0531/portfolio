let data = [];
let brushSelection = null;
let xScale, yScale = null;
let commits = d3.groups(data, (d) => d.commit);
let selectedCommits = [];
let commitProgress = 100;
let timeScale;
let commitMaxTime;
let NUM_ITEMS = 100; // Ideally, let this value be the length of your commit history
let ITEM_HEIGHT = 70; // Feel free to change
let VISIBLE_COUNT = 10; // Feel free to change as well
let totalHeight = (NUM_ITEMS - 1) * ITEM_HEIGHT;
const scrollContainer = d3.select('#scroll-container');
const spacer = d3.select('#spacer');
spacer.style('height', `${totalHeight}px`);
const itemsContainer = d3.select('#items-container');
scrollContainer.on('scroll', () => {
  const scrollTop = scrollContainer.property('scrollTop');
  let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
  startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
  renderItems(startIndex);
});

let FILE_VISIBLE_COUNT = 10;  
let FILE_ITEM_HEIGHT = 70; 
const fileScrollContainer = d3.select('#file-scroll-container');
const fileSpacer = d3.select('#file-spacer');
const fileTotalHeight = (NUM_ITEMS - 1) * FILE_ITEM_HEIGHT;  
fileSpacer.style('height', `${fileTotalHeight}px`);
const fileContainer = d3.select('#file-items-container');
fileScrollContainer.on('scroll', () => {
  const scrollTop = fileScrollContainer.property('scrollTop');
  let startIndex = Math.floor(scrollTop / FILE_ITEM_HEIGHT);
  startIndex = Math.max(0, Math.min(startIndex, commits.length - FILE_VISIBLE_COUNT));
  renderFileSizes(startIndex);
});

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: true,
        writable: true,
        enumerable: true
      });

      return ret;
    });
}

async function loadData() {
  // original function as before
  data = await d3.csv("loc.csv", (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + "T00:00" + row.timezone),
    datetime: new Date(row.datetime),
}));

  processCommits();
  displayStats();

  timeScale = d3.scaleTime()
    .domain([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)])
    .range([0, 100]);
  commitMaxTime = timeScale.invert(commitProgress);
}

function displayCommitFiles(filteredCommits) {
  const lines = filteredCommits.flatMap((d) => d.lines);
  let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
  let files = d3.groups(lines, (d) => d.file).map(([name, lines]) => {
    return {name, lines};
  });
  files = d3.sort(files, (d) => -d.lines.length);
  d3.select('.files').selectAll('div').remove();
  let filesContainer = d3.select('.files').selectAll('div').data(files).enter().append('div');
  filesContainer.append('dt').html(d => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);
  filesContainer.append('dd')
                .selectAll('div')
                .data(d => d.lines)
                .enter()
                .append('div')
                .attr('class', 'line')
                .style('background', d => fileTypeColors(d.type));
}

function renderFileSizes(startIndex) {
  fileContainer.selectAll('div').remove();
  const endIndex = Math.min(startIndex + FILE_VISIBLE_COUNT, commits.length);
  let newFileSlice = commits.slice(startIndex, endIndex);
  displayCommitFiles(newFileSlice);
    
  fileContainer.selectAll('div')
                .data(newFileSlice)
                .enter()
                .append('div')
                .html((commit, idx) => {
                  return `<p>
                    In commit ${commit.id} (on ${commit.datetime.toLocaleString("en", {dateStyle: "full", timeStyle: "short"})}), I edited ${commit.totalLines} lines.
                  </p>`;
                })
                .style('position', 'absolute')
                .style('top', (_, idx) => `${idx * FILE_ITEM_HEIGHT}px`);
                
}

function renderItems(startIndex) {
  // Clear things off
  itemsContainer.selectAll('div').remove();
  const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
  let newCommitSlice = commits.slice(startIndex, endIndex);

  updateScatterplot(newCommitSlice);

  // Re-bind the commit data to the container and represent each using a div
  itemsContainer.selectAll('div')
                .data(newCommitSlice)
                .enter()
                .append('div')
                .html((commit, idx) => {
                  return `<p>
                  On ${commit.datetime.toLocaleString("en", {dateStyle: "full", timeStyle: "short"})}, I made 
                    ${idx > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'}
                  </a>. I edited ${commit.totalLines} lines across ${d3.rollups(commit.lines, D => D.length, d => d.file).length} files. Then I looked over all I had made, and I saw that it was very good.
                </p>`;
                })
                .style('position', 'absolute')
                .style('top', (_, idx) => `${idx * ITEM_HEIGHT}px`)
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
    updateScatterplot(commits);
    updateTooltipVisibility(false); // Hide the tooltip when the page loads
    displayCommitFiles(commits);
});

function displayStats() {
  // Process commits first
  processCommits();

  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add more stats as needed...
  // Number of files in the codebase
  dl.append('dt').text('Number of files');
  dl.append('dd').text(d3.rollup(data, v => v.length, d => d.file).size);

  // Average file length (in lines)
  dl.append('dt').text('Average file length');
  dl.append('dd').text(d3.mean(d3.rollup(data, v => v.length, d => d.file), d => d[1]).toFixed(2));

  // Day of the week that most work is done
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mostActiveDayIndex = Array.from(d3.rollup(data, v => v.length, d => d.date.getDay())).sort((a, b) => b[1] - a[1])[0][0];
  const mostActiveDay = daysOfWeek[mostActiveDayIndex];
  dl.append('dt').text('Most active day of the week');
  dl.append('dd').text(mostActiveDay);

}

function updateScatterplot(filteredCommits){

  const width = 1000;
  const height = 600;

  d3.select('svg').remove();
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3
    .scaleTime()
    .domain(d3.extent(filteredCommits, (d) => d.datetime))
    .range([0, width])
    .nice();

  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  svg.selectAll('g').remove(); // clear the scatters in order to re-draw the filtered ones
  const dots = svg.append('g').attr('class', 'dots');
  const [minLines, maxLines] = d3.extent(filteredCommits, (d) => d.totalLines);
  const rScale = d3
                  .scaleSqrt() // Change only this line
                  .domain([minLines, maxLines])
                  .range([2, 30]);

  dots.selectAll('circle').remove(); 
  dots
    .selectAll('circle')
    .data(filteredCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', function (event, d, i) {
      d3.select(event.currentTarget).classed('selected', isCommitSelected(d)).style('fill-opacity', 1); // Full opacity on hover
      updateTooltipContent(d);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mousemove', function (event) {
      updateTooltipPosition(event);
    })
    .on('mouseleave', function (event, d) {
      d3.select(event.currentTarget).classed('selected', isCommitSelected(d)).style('fill-opacity', 0.7); // Restore transparency    updateTooltipContent({});
      updateTooltipVisibility(false);
    });

  const margin = { top: 0, right: 10, bottom: 0, left: 20 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };
  
  // Update scales with new ranges
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  // Create the axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  // Add X axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  // Add Y axis
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  // Add gridlines BEFORE the axes
  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  brushSelector();
  
}

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
  time.textContent = commit.datetime?.toLocaleString('en', {
    timeStyle: 'short',
  });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function brushSelector() {
  const svg = document.querySelector('svg');
  // Create brush
  d3.select(svg).call(d3.brush());

  // Raise dots and everything after overlay
  d3.select(svg).selectAll('.dots, .overlay ~ *').raise();

  // Update brush initialization to listen for events
  d3.select(svg).call(d3.brush().on('start brush end', brushed));
}

function brushed(evt) {
  let brushSelection = evt.selection;
  selectedCommits = !brushSelection
    ? []
    : commits.filter((commit) => {
        let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
        let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
        let x = xScale(commit.date);
        let y = yScale(commit.hourFrac);

        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
      });
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  return selectedCommits.includes(commit);
}

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {

  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function updateLanguageBreakdown() {
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }

  return breakdown;
}