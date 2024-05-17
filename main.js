async function fetchData() {
    try {
        const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}
function processData(data) {
    return data.features.map(earthquake => ({
        latitude: earthquake.geometry.coordinates[1],
        longitude: earthquake.geometry.coordinates[0],
        magnitude: earthquake.properties.mag,
        time: new Date(earthquake.properties.time),
        depth: earthquake.geometry.coordinates[2]
    }));
}

async function test() {
    // Récupérer les données
    const data = await fetchData();
    // Traiter les données
    const processedData = processData(data);
    // Afficher les données traitées
    console.log("Données traitées : ", processedData);
    // Afficher les visualisations
    plotWorldMap(processedData);
    plotMagnitudeHistogram(processedData);
    plotTimeSeries(processedData);
    plotMagnitudeDepthScatter(processedData);
}
// Appeler la fonction de test
test();

function plotWorldMap(data) {
    const mapData = data.map(earthquake => ({
        type: 'scattergeo',
        locationmode: 'ISO-3',
        lon: [earthquake.longitude],
        lat: [earthquake.latitude],
        marker: {
            size: earthquake.magnitude * 5, // Dimensionner les cercles par la magnitude
            color: 'red',
            opacity: 0.7,
            line: {
                color: 'black',
                width: 1
            }
        },
        name: `Magnitude: ${earthquake.magnitude}`,
        text: `Magnitude: ${earthquake.magnitude}, Depth: ${earthquake.depth}`
    }));
    const layout = {
        title: 'World Map of Earthquakes',
        geo: {
            projection: {
                type: 'natural earth'
            }
        }
    };
    Plotly.newPlot('world-map', mapData, layout);
}

function plotMagnitudeHistogram(data) {
    const magnitudes = data.map(earthquake => earthquake.magnitude);
    const trace = {
        x: magnitudes,
        type: 'histogram',
        marker: {
            color: 'blue'
        }
    };
    const layout = {
        title: 'Histogram of Earthquake Magnitudes',
        xaxis: {
            title: 'Magnitude'
        },
        yaxis: {
            title: 'Frequency'
        }
    };
    Plotly.newPlot('magnitude-histogram', [trace], layout);
}

function plotTimeSeries(data) {
    const dates = data.map(earthquake => earthquake.time);
    const frequency = {};
    dates.forEach(date => {
        const formattedDate = date.toDateString();
        if (frequency[formattedDate]) {
            frequency[formattedDate]++;
        } else {
            frequency[formattedDate] = 1;
        }
    });
    const x = Object.keys(frequency);
    const y = Object.values(frequency);
    const trace = {
        x: x,
        y: y,
        type: 'scatter',
        mode: 'lines+markers',
        marker: {
            color: 'green'
        }
    };
    const layout = {
        title: 'Earthquake Frequency Over Time',
        xaxis: {
            title: 'Date'
        },
        yaxis: {
            title: 'Number of Earthquakes'
        }
    };
    Plotly.newPlot('time-series', [trace], layout);
}

function plotMagnitudeDepthScatter(data) {
    const trace = {
        x: data.map(earthquake => earthquake.magnitude),
        y: data.map(earthquake => earthquake.depth),
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'orange',
            size: 8
        }
    };
    const layout = {
        title: 'Magnitude vs Depth Scatter Plot',
        xaxis: {
            title: 'Magnitude'
        },
        yaxis: {
            title: 'Depth (km)'
        }
    };
    Plotly.newPlot('magnitude-depth-scatter', [trace], layout);
}