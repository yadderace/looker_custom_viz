var IS_MULTIDIMENSIONAL = true;

const DIV_ID = 'chart';


const validate_errors = function(queryResponse){

  var result = {
    error: false,
    title: null,
    message: null,
    qty_no_hidden_dimensions: 0,
    qty_no_hidden_measures: 0
  };

  queryResponse.fields.dimensions.forEach(function(dimension){
    if(!dimension.hidden) result.qty_no_hidden_dimensions++;
  });

  queryResponse.fields.measures.forEach(function(measure){
    if(!measure.hidden) result.qty_no_hidden_measures++;
  });

  queryResponse.fields.table_calculations.forEach(function(calculation){
    if(!calculation.hidden && calculation.type == 'number') result.qty_no_hidden_measures++;
  });

  if(result.qty_no_hidden_dimensions ==  0){
    result.error = true;
    result.title = 'One Dimension Required';
    result.message = 'This chart requires at least one dimension';
    return result;
  }

  if(result.qty_no_hidden_measures ==  0){
    result.error = true;
    result.title = 'One Measure Required';
    result.message = 'This chart requires at least one measure';
    return result;
  }

  return result;
}


const transform_data_to_treemap = function (data, measure_name, dimension_color, dimension_label){

  var series = {};
  data.forEach(row => {

    var dim_color_value = (dimension_label == null) ? 'null' : String(row[dimension_color].value);
    var data_point = {
      x: String(row[dimension_label || dimension_color].value),
      y: row[measure_name].value,
      links: null
    };

    if(typeof row[measure_name].links != undefined) data_point.links = row[measure_name].links

    if(!(dim_color_value in series)) {
      series[dim_color_value] = {
        name: dim_color_value,
        data: [data_point]
      };
    }
    else{
      series[dim_color_value].data.push(data_point);
    }

  });

  if(dimension_label == null) delete series['null'].name;

  return Object.values(series);

}

const create_dynamic_options = function(queryResponse){

  var options = create_fixed_options();

  var no_hidden_dimensions = [];
  queryResponse.fields.dimensions.forEach(function(dimension){
    if(!dimension.hidden){
      var obj = {};
      obj[dimension.label] = dimension.name;
      no_hidden_dimensions.push(obj);
    }
  });

  var no_hidden_measures = [];
  queryResponse.fields.measures.forEach(function(measure){
    if(!measure.hidden){
      var obj = {};
      obj[measure.label] = measure.name;
      no_hidden_measures.push(obj);
    }
  });

  queryResponse.fields.table_calculations.forEach(function(calculation){
    if(!calculation.hidden && calculation.type == 'number'){
      var obj = {};
      obj[calculation.label] = calculation.name;
      no_hidden_measures.push(obj);
    }
  });

  options['area_measure'] = {
    label: 'Area Measure',
    type: 'string',
    order: 1,
    display: 'select',
    section: 'Data',
    values: no_hidden_measures,
    default: Object.values(no_hidden_measures[0])[0]
  }

  options['category_dimension'] = {
    label: 'Category Dimension',
    type: 'string',
    order: 2,
    display: 'select',
    section: 'Data',
    values: no_hidden_dimensions,
    default: Object.values(no_hidden_dimensions[0])[0]
  }

  if(IS_MULTIDIMENSIONAL){
    options['subcategory_dimension'] = {
      label: 'Sub-Category Dimension',
      type: 'string',
      order: 3,
      display: 'select',
      section: 'Data',
      values: no_hidden_dimensions,
      default: Object.values(no_hidden_dimensions[0])[1]
    }
  }

  return options;
}


const update_config_options = function(options, config){
  if( !'area_measure' in config || !'category_dimension' in config || (IS_MULTIDIMENSIONAL && !'subcategory_dimension' in config)) return;

  // If any of dimensions/measure selected in config is not available in options then it updates it to default.

  if(!options.area_measure.values.flatMap(option => Object.values(option)).includes(config.area_measure)){
    config.area_measure = options.area_measure.default
  }

  if(!options.category_dimension.values.flatMap(option => Object.values(option)).includes(config.category_dimension)){
    config.category_dimension = options.category_dimension.default
  }

  if(IS_MULTIDIMENSIONAL && !options.subcategory_dimension.values.flatMap(option => Object.values(option)).includes(config.subcategory_dimension)){
    config.subcategory_dimension = options.subcategory_dimension.default
  }
}


const on_click_chart = function(event, chartContext, config, lookerchart){
  data = chartContext.w.globals.initialSeries[config.seriesIndex].data[config.dataPointIndex]
  if(data.links != null){
    lookerchart.Utils.openDrillMenu(
      {
        links: data.links,
        event: event
      }
    );
  }
}

// ================================================================

const create_div = function(element){
  element.innerHTML = "";

  // Create a style tag
  var style = document.createElement('style');
  style.innerHTML = `@import url('https://cdn.jsdelivr.net/gh/yadderace/funnel-graph-js@feature/percentage-mode/dist/css/funnel-graph.min.css');`;
  document.head.appendChild(style);

  // Create second style tag
  var style2 = document.createElement('style');
  style2.innerHTML = `@import url('https://cdn.jsdelivr.net/gh/yadderace/funnel-graph-js@feature/percentage-mode/dist/css/main.css');`;

  document.head.appendChild(style2);

  // Create a container element for the graph
  this.container = element.appendChild(document.createElement("div"));
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
      type: "array",
      label: "Measures Colors",
      display: "colors",
      order: 7,
      default: ["#dd3333", "#80ce5d", "#f78131", "#369dc1", "#c572d3", "#36c1b3", "#b57052", "#ed69af"],
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

const generateGradients = function (color, gradients) {
  // Helper function to lighten a color
  function lightenColor(hex, factor) {
    const lighten = (channel) => Math.min(255, Math.floor(channel + (255 - channel) * factor));
    const r = lighten(parseInt(hex.substring(1, 3), 16));
    const g = lighten(parseInt(hex.substring(3, 5), 16));
    const b = lighten(parseInt(hex.substring(5, 7), 16));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Validate input
  if (!/^#[0-9A-F]{6}$/i.test(color) || gradients < 1) {
    return [color];
  }

  const result = [];
  for (let i = 0; i < gradients; i++) {
    const factor = i / (gradients - 1);
    result.push(lightenColor(color, factor));
  }

  return result;
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

      // Creating options
      const options = create_fixed_options();
      this.trigger('registerOptions', options);

      // Transforming data
      const dimension_stages = queryResponse.fields.dimensions[0].name;
      const measures = queryResponse.fields.measures;
      const visible_measures = measures.filter(measure => !measure.hidden).map(measure => measure.name);
      const funnel_data = transorm_data_to_funnel(queryResponse, data, dimension_stages, visible_measures);

      // Generating gradient colors
      const colors = config.measures_colors;
      const color_gradients = colors.map(color => generateGradients(color, funnel_data.measures.length));


      const funnel_viz_data = {
            labels: funnel_data.stages,
            subLabels: funnel_data.measures,
            colors: color_gradients,
            values: funnel_data.values,
      };

      const graph = new FunnelGraph({
        container: ".funnel",
        direction: config.layout || "vertical",

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
            margin: { top: 120, right: 60, bottom: 60, left: 60, text: 10 },
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
