
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

      var options = create_options(queryResponse);

      // Validating fields
      if(queryResponse.fields.dimensions.length != 2){
        this.addError({
          title: "Two Dimensions Required",
          message: "This visualization requires two dimensions"
        });
        return;
      } else if(queryResponse.fields.measures.length != 1){
        this.addError({
          title: "One Measure Required",
          message: "This visualization requires one measure"
        });
        return;
      }

      // Creating options from data
      var options = create_options(queryResponse);
      this.trigger('registerOptions', options);
      
      // Transforming data
      const measure_name = queryResponse.fields.measures[0].name;
      const dimension_color = queryResponse.fields.dimensions[0].name;
      const dimension_label = queryResponse.fields.dimensions[1].name;
      var series_apexchart = transform_data_to_treemap(data, measure_name, dimension_color, dimension_label);


      // Setting data and configuration for the chart
      var options = {
        
        series: series_apexchart,

        colors: config.color_range,
        
        legend: {
          show: config.show_legend
        },
        
        chart: {
          height: 350,
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
      var chart = new ApexCharts(element.querySelector("#chart"), options);
      chart.render();
      done();
    }
  }
);

const DIV_ID = 'chart';

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
  var options = {};

  var no_hidden_measures = [];
  queryResponse.fields.measures.forEach(function(measure){
    if(!measure.hidden){
      var obj = {};
      obj[measure.label] = measure.name; 
      no_hidden_measures.push(obj);
    }
  });

  options['area_measure'] = {
    label: 'Area Measure',
    type: 'string',
    order: 4,
    display: 'select',
    section: 'Plot',
    values: no_hidden_measures,
    default: no_hidden_measures[0].label
  }
  
  return options;
}