// lines charts
async function loadChartData(dataFile, titleText, subtitleText, chartId, chartVarName) {
  try {
    const response = await fetch(dataFile);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const rawData = await response.json();

    const highlightCountries = ["China", "United States"];
    const highlightColors = { "China": "#db0404", "United States": "#031040" };
    const defaultColor = "#d3d3d3";

    const datasets = Object.keys(rawData).map(country => {
      const color = highlightCountries.includes(country) ? highlightColors[country] : defaultColor;

      return {
        label: country,
        data: rawData[country].map(item => ({
          x: new Date(item.Date),
          y: item.Value / 1e9
        })),
        fill: false,
        borderColor: color,
        backgroundColor: color,
        pointRadius: 0,
        borderWidth: 1,
        tension: 0.4
      };
    });

    const ctx = document.getElementById(chartId).getContext('2d');

    if (window[chartVarName] instanceof Chart) {
      window[chartVarName].destroy();
    }

    window[chartVarName] = new Chart(ctx, {
      type: 'line',
      data: { datasets: datasets },
      options: getChartOptions(titleText, subtitleText, highlightCountries)
    });
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

function getChartOptions(title, subtitle, highlightCountries) {
  return {
    responsive: true,
    layout: {
      padding: {
        left: 20
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'year',
          displayFormats: {
            year: 'yyyy'
          }
        },
        grid: { display: false },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
          font: { family: 'Instrument Sans', size: 10 },
          color: "#000000"
        },
        border: { color: "#000000" }
      },
      y: {
        position: 'right',
        ticks: {
          callback: value => value.toFixed(0),
          maxTicksLimit: 5,
          font: { family: 'Instrument Sans', size: 10 },
          color: "#000000",
          major: {
            enabled: true
          }
        },
        grid: {
          drawOnChartArea: false,
          drawTicks: true,
          color: "#000000"
        },
        border: { color: "#FFFFFF" },
      }
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          filter: item => highlightCountries.includes(item.text),
          usePointStyle: true,
          pointStyle: 'rect',
          boxWidth: 8,
          boxHeight: 8,
          color: "#000000",
          font: { family: 'Instrument Sans', size: 12 }
        },
        position: 'top',
        align: 'start',
        padding: 0
      },
      tooltip: { enabled: false },
      title: {
        display: true,
        text: title,
        align: 'start',
        font: { family: 'Instrument Sans', size: 18 },
        color: "#000000",
        padding: { top: 0, bottom: 0 }
      },
      subtitle: {
        display: true,
        text: subtitle,
        align: 'start',
        font: { family: 'Instrument Sans', size: 14 },
        color: "#000000",
        padding: { top: 0, bottom: 0 }
      }
    }
  };
}

// bubble chart
async function loadBubbleChart(dataFile, containerId) {
  try {
    const response = await fetch(dataFile);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const groupColors = {
      "Agricultural Products": "#64c878",
      "Energy Products": "#fb5607",
      "Minerals and Metals": "#ffc403",
      "Manufactured Goods": "#05aeff"
    };

    const groups = {
      "Soybeans": "Agricultural Products",
      "Coffee": "Agricultural Products",
      "Beef": "Agricultural Products",
      "Soymeal": "Agricultural Products",
      "Raw cane sugar": "Agricultural Products",
      "Corn": "Agricultural Products",
      "Poultry": "Agricultural Products",
      "Cotton": "Agricultural Products",
      "Crude oil": "Energy Products",
      "Refined oil": "Energy Products",
      "Iron ore": "Minerals and Metals",
      "Copper ore": "Minerals and Metals",
      "Gold": "Minerals and Metals",
      "Steel": "Minerals and Metals",
      "Cars": "Manufactured Goods",
      "Wood pulp": "Manufactured Goods"
    };

    const width = 600;
    const height = width;
    const margin = 10;

    const pack = d3.pack()
      .size([width - margin * 2, height - margin * 2])
      .padding(2);

    const root = pack(d3.hierarchy({ children: data })
      .sum(d => d.value / 1e6)); 

    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();

    const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height + 50) 
      .attr("viewBox", [-margin, -margin, width, height + 50])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
      .attr("text-anchor", "middle");

    svg.append("text")
      .attr("x", 20)
      .attr("y", 20)
      .attr("text-anchor", "start")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .attr("fill", "#000")
      .text("Brazil's Exports in 2024");

    const node = svg.append("g")
      .attr("transform", `translate(0, 50)`) 
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("fill-opacity", 1)
      .attr("fill", d => groupColors[groups[d.data.name]])
      .attr("r", d => d.r);

    node.append("text")
      .selectAll("tspan")
      .data(d => [d.data.name, `U$${d3.format(",.0f")(d.value)}M`])
      .join("tspan")
      .attr("x", 0)
      .attr("y", (d, i) => `${i * 1.2}em`)
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .attr("font-weight", (d, i) => i === 0 ? "bold" : null)
      .text(d => d);

      const legend = svg.append("g")
      .attr("transform", `translate(20, 30)`); 
    
    let currentX = 0;
    
    Object.entries(groupColors).forEach(([key, color]) => {
      const group = legend.append("g")
        .attr("transform", `translate(${currentX}, 0)`);
    
      group.append("circle")
        .attr("cx", 10)
        .attr("cy", 10)
        .attr("r", 5)
        .attr("fill", color);
    
      const text = group.append("text")
        .attr("x", 20)
        .attr("y", 14)
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .text(key)
        .attr("text-anchor", "start");
    
      const groupWidth = group.node().getBBox().width; 
      currentX += groupWidth + 10; 
    });
    
  } catch (error) {
    console.error("Error loading bubble chart data:", error);
  }
}


// map
const width = 600;
const height = width;
const margin = 10;

const svg = d3.select("#map")
  .append("svg")
  .style("color", "#000")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [-margin, -margin, width, height])
  .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
  .attr("text-anchor", "middle");

svg.append("text")
  .attr("x", 20)
  .attr("y", 20)
  .attr("text-anchor", "start")
  .attr("font-size", "18px")
  .attr("font-weight", "bold")
  .attr("fill", "#000")
  .text("Brazil's Exports to China by States");

svg.append("text")
  .attr("x", 20)
  .attr("y", 40)
  .attr("text-anchor", "start")
  .attr("font-size", "14px")
  .attr("fill", "#000")
  .text("Exports during January and October 2024");

const tooltip = d3.select("body").append("div")
 .attr("class", "tooltip")
 .style("position", "absolute")
 .style("background", "white")
 .style("border", "1px solid #ddd")
 .style("border-radius", "5px")
 .style("padding", "10px")
 .style("font-family", "'Instrument Sans', sans-serif")
 .style("font-size", "12px")
 .style("color", "#000")
 .style("opacity", 0)
 .style("box-shadow", "2px 2px 6px rgba(0, 0, 0, 0.2)");

const projection = d3.geoMercator()
  .center([-50, -13])
  .translate([width / 2, height / 2])
  .scale(600);

const path = d3.geoPath().projection(projection);

Promise.all([
  d3.json("brazil-states.json"), 
  d3.csv("data.csv")             
]).then(([topoData, exportData]) => {
  const exportMap = new Map(
    exportData.map(d => {
      const uf = d.UF.trim().toUpperCase();
      const value = parseFloat(d.Exportação);
      return [uf, value];
    })
  );

  const states = topojson.feature(topoData, topoData.objects.estados);

  const colorScale = d3.scaleLinear()
    .domain([0, 15000000000])
    .range(["rgb(145, 247, 193)", "rgb(26, 123, 74)"]);

  svg.selectAll("path")
    .data(states.features)
    .join("path")
    .attr("d", path)
    .attr("fill", d => {
      const stateUF = d.id.trim().toUpperCase();
      const value = exportMap.get(stateUF);
      return value ? colorScale(value) : "#ccc"; 
    })
    .attr("stroke", "#000")
    .attr("stroke-width", 0.5)
    .on("mouseover", (event, d) => {
      const stateUF = d.id.trim().toUpperCase();
      const value = exportMap.get(stateUF) || "Sem dados";
      tooltip.style("opacity", 1)
        .html(`<strong>${d.properties.nome}</strong><br>Exportação: US$${value !== "Sem dados" ? value.toLocaleString() : value}`);
    })
    .on("mousemove", event => {
      tooltip.style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });
}).catch(error => console.error("Erro ao carregar os dados do mapa:", error));

//map2
async function loadRouteMap(dataFile, containerId) {
  try {
    const response = await fetch(dataFile);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const geoJson = await response.json();
    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select(`#${containerId}`)
      .attr("width", width)
      .attr("height", height);

    const projection = d3.geoNaturalEarth1();
    const path = d3.geoPath().projection(projection);

    const world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
    const countries = topojson.feature(world, world.objects.countries);

    projection.fitSize([width, height], countries);

    svg.append("g")
      .selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#eaeaea")
      .attr("stroke", "#ccc");

    svg.append("g")
      .selectAll("line")
      .data(geoJson.features)
      .enter()
      .append("line")
      .attr("x1", d => projection(d.geometry.coordinates[0])[0])
      .attr("y1", d => projection(d.geometry.coordinates[0])[1])
      .attr("x2", d => projection(d.geometry.coordinates[1])[0])
      .attr("y2", d => projection(d.geometry.coordinates[1])[1])
      .attr("stroke", d => d.properties.destino === "CHINA" ? '#db0404' : '#031040')
      .attr("stroke-width", d => Math.sqrt(d.properties.volume) * 0.0007)
      .attr("stroke-opacity", 0.8);

    geoJson.features.forEach((feature) => {
      const start = projection(feature.geometry.coordinates[0]);
      const end = projection(feature.geometry.coordinates[1]);

      if (start && end) {
        const lineLength = Math.sqrt(
          Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
        );

        const animationDuration = Math.max(2000, lineLength * 10);

        const circle = svg.append("circle")
          .attr("r", 1)
          .attr("fill", feature.properties.destino === "CHINA" ? '#db0404' : '#031040')
          .attr("cx", start[0])
          .attr("cy", start[1]);

        const animate = () => {
          circle
            .transition()
            .duration(animationDuration)
            .ease(d3.easeLinear)
            .attr("cx", end[0])
            .attr("cy", end[1])
            .on("end", () => {
              circle.attr("cx", start[0]).attr("cy", start[1]);
              animate();
            });
        };

        animate();
      }
    });
  } catch (error) {
    console.error("Error loading route map data:", error);
  }
}

// load charts
loadChartData('top_exp.json', 'Exports', 'FOB Value in Billion Dollars', 'myChartExports', 'chartExports');
loadChartData('top_imp.json', 'Imports', 'FOB Value in Billion Dollars', 'myChartImports', 'chartImports');
loadBubbleChart('prod_exp.json', 'bubbleChartContainer');
loadRouteMap('routes_with_volumes.geojson', 'routeMap');
