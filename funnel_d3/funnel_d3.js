
// ================================================================


// Color Source: https://www.b3multimedia.ie/beautiful-color-gradients-for-your-next-design-project/
const color_options = [
  { "name": "Ocean Blue", "color1": "#2E3192", "color2": "#1BFFFF" },
  { "name": "Sanguine", "color1": "#D4145A", "color2": "#FBB03B" },
  { "name": "Luscious Lime", "color1": "#009245", "color2": "#FCEE21" },
  { "name": "Purple Lake", "color1": "#662D8C", "color2": "#ED1E79" },
  { "name": "Piglet", "color1": "#EE9CA7", "color2": "#FFDDE1" },
  { "name": "Kashmir", "color1": "#614385", "color2": "#516395" },
  { "name": "Green Beach", "color1": "#02AABD", "color2": "#00CDAC" },
  { "name": "Bloody Mary", "color1": "#FF512F", "color2": "#DD2476" },
  { "name": "Sweet Morning", "color1": "#FF5F6D", "color2": "#FFC371" },
  { "name": "Quepal", "color1": "#11998E", "color2": "#38EF7D" }
];

const create_div = function(element){
  element.innerHTML = "";

  // Create a style tag for the first import
  var style = document.createElement('style');
  style.innerHTML = `@import url('https://cdn.jsdelivr.net/gh/yadderace/funnel-graph-js@feature/percentage-mode/dist/css/funnel-graph.min.css');`;
  document.head.appendChild(style);

  // Create a style tag for the second import
  var style2 = document.createElement('style');
  style2.innerHTML = `@import url('https://cdn.jsdelivr.net/gh/yadderace/funnel-graph-js@feature/percentage-mode/dist/css/main.css');`;
  document.head.appendChild(style2);

  // Create the outer container
  const outerDiv = element.appendChild(document.createElement("div"));
  outerDiv.style.width = "100%";

  // Create the funnel wrapper div
  const wrapperDiv = outerDiv.appendChild(document.createElement("div"));
  wrapperDiv.className = "flex funnel-wrapper col";

  // Create the funnel div
  this.container = wrapperDiv.appendChild(document.createElement("div"));
  this.container.className = "funnel";

}

const transorm_data_to_funnel = function(queryResponse, data, stages_field, measure_fields){

  const stages = data.map(item => item[stages_field]?.value || null);

  const measures = queryResponse.fields.measures
        .filter(measure => measure_fields.includes(measure.name))
        .map(measure => measure.label_from_parameter || measure.label_short);

  const values = data.map(item =>
        measure_fields.map(measure => item[measure]?.value || 0));

    return {
        stages: stages,
        measures: measures,
        values: values
    };
}

const create_fixed_options = function(){

  // Convert JSON to Looker options, serializing the colors as strings
  const measure_color_options = color_options.map(option => {
    return {
      label: option.name,
      value: JSON.stringify({color1: option.color1, color2: option.color2})
    };
  });

  return {
    funnel_orientation: {
      type: "string",
      label: "Funnel Orientation",
      display: "radio",
      values: [
        { "Vertical": "vertical" },
        { "Horizontal": "horizontal" }
      ],
      default: "vertical",
      order: 1,
      section: "Plot"
    },

    background_color: {
      type: "string",
      label: "Background Color",
      display: "color",
      order: 3,
      default: "transparent",
      section: "Plot"
    },

    label_color: {
      type: "string",
      label: "Value Color",
      display: "color",
      order: 4,
      default: "#000000",
      section: "Plot"
    },

    title_color: {
      type: "string",
      label: "Title Color",
      display: "color",
      order: 5,
      default: "#05df9d",
      section: "Plot"
    },

    percentage_color: {
      type: "string",
      label: "Percentage Color",
      display: "color",
      order: 6,
      default: "#9896dc",
      section: "Plot"
    },

    measures_colors: {
      type: "string",
      label: "Measures Colors",
      display: "select",
      order: 7,
      values: measure_color_options,
      default: measure_color_options[0].value,
      section: "Plot"
    },

    show_percent: {
      type: "boolean",
      label: "Show Percents",
      default: "true",
      order: 1,
      section: "Data"
    },

    pct_mode: {
      type: "string",
      label: "Percentage Mode",
      display: "radio",
      values: [
        { "Max": "max" },
        { "Previous": "previous" },
        { "First": "first" }
      ],
      default: "max",
      order: 2,
      section: "Data"
    }


  };
}


looker.plugins.visualizations.add({
    // Id and Label are legacy properties that no longer have any function besides documenting
    // what the visualization used to have. The properties are now set via the manifest
    // form within the admin/visualizations page of Looker
    id: "funnel_d3",
    label: "Funnel D3",

    options: create_fixed_options(),


    // Set up the initial state of the visualization
    create: function(element, config) {
      create_div(element);
    },

    // Render in response to the data or settings changing
    updateAsync: function(data, element, config, queryResponse, details, done) {

      // Clear any errors from previous updates
      this.clearErrors();
      create_div(element);

      // Transforming data
      const dimension_stages = queryResponse.fields.dimensions[0].name;
      const measures = queryResponse.fields.measures;
      const visible_measures = measures.filter(measure => !measure.hidden).map(measure => measure.name);
      const funnel_data = transorm_data_to_funnel(queryResponse, data, dimension_stages, visible_measures);

      // Create the balanced array
      const gradient_colors = new Array(measures.legth);

      // Fill the array with hex1 and hex2
      for (let i = 0; i < measures.length; i++) {
        gradient_colors[i] = [JSON.parse(config.measures_colors).color1, JSON.parse(config.measures_colors).color1];
      }



      const funnel_viz_data = {
            labels: funnel_data.stages,
            subLabels: funnel_data.measures,
            colors: gradient_colors,
            values: funnel_data.values,
      };

      const graph = new FunnelGraph({
        container: ".funnel",
        direction: config.funnel_orientation || "vertical",

        gradientDirection: "vertical",
        data: funnel_viz_data,
            displayPercent: true,
            width: 800,
            height: 300,
            subLabelValue: "raw",
            callbacks: {
                click: (event, metadata) => {
                    console.log("click handler", metadata);
                },
                // adding a tooltip handler instead of the ootb tooltip display
                // tooltip: (event, metadata) => {
                //     console.log("tooltip handler", metadata);
                // }
            },
            margin: { top: 10, right: 10, bottom: 10, left: 10, text: 10 },
            responsive: true,
            pctMode: config.pct_mode || "max",
            backgroundColor: config.background_color || "transparent",
            labelColor: config.label_color || "#000000",
            titleColor: config.title_color || "#05df9d",
            percentageColor: config.percentage_color || "#9896dc"
      });

      graph.draw();

      done();
    }
  }
);
