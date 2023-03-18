
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
    if(!calculation.hidden && calculation.type == 'number') qty_no_hidden_measures++;
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
    
    var dim_color_value = String(row[dimension_color].value)
    var data_point = {
      x: String(row[dimension_label].value),
      y: row[measure_name].value
    };
    
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
  
  return Object.values(series);

}

const create_div = function(element){
  element.innerHTML = "";
  element.innerHTML = "<div id='" + DIV_ID + "'></div>";
}

const create_fixed_options = function(){
  return {
    show_legend: {
      type: "boolean",
      label: "Show Legend",
      default: "false",
      order: 1,
      section: "Plot"
    },

    fill_color_as_stroke: {
      type: "boolean",
      label: "Fill Color As Stroke",
      default: "false",
      order: 2,
      section: "Plot"
    },

    color_range: {
      type: 'array',
      label: 'Color Range',
      display: 'colors',
      order: 3,
      default: ['#dd3333', '#80ce5d', '#f78131', '#369dc1', '#c572d3', '#36c1b3', '#b57052', '#ed69af'],
      section: "Plot"
    }
  };
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
      obj['(TC)' + calculation.label] == calculation.name;
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

  options['subcategory_dimension'] = {
    label: 'Sub-Category Dimension',
    type: 'string',
    order: 3,
    display: 'select',
    section: 'Data',
    values: no_hidden_dimensions,
    default: Object.values(no_hidden_dimensions[0])[1]
  }

  return options;
}


looker.plugins.visualizations.add({
    // Id and Label are legacy properties that no longer have any function besides documenting
    // what the visualization used to have. The properties are now set via the manifest
    // form within the admin/visualizations page of Looker
    id: "treemap_apexcharts",
    label: "Treemap Apexcharts",
    
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

      
      const validation_result = validate_errors(queryResponse);
      // Validating fields
      if(validation_result.error){
        this.addError({
          title: validation_result.title,
          message: validation_result.message
        });
        return;
      }

      // Creating options from data
      var options = create_dynamic_options(queryResponse);
      this.trigger('registerOptions', options);
      
      // Transforming data
      const measure_name = config.area_measure || queryResponse.fields.measures[0].name;
      const dimension_color = config.category_dimension || queryResponse.fields.dimensions[0].name;
      const dimension_label = config.subcategory_dimension || queryResponse.fields.dimensions[1].name;
      var series_apexchart = transform_data_to_treemap(data, measure_name, dimension_color, dimension_label);


      // Setting data and configuration for the chart
      var options = {
        
        series: series_apexchart,

        colors: config.color_range,
        
        legend: {
          show: config.show_legend
        },
        
        chart: {
          height: element.offsetHeight,
          type: 'treemap',
          toolbar: {
            show: false
          }
        },

        plotOptions: {
          treemap:{
            useFillColorAsStroke: config.fill_color_as_stroke
          }
        }
      };

      // Rendering the chart
      var chart = new ApexCharts(element.querySelector("#" + DIV_ID), options);
      chart.render();
      done();
    }
  }
);