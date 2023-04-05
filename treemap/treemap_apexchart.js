var IS_MULTIDIMENSIONAL = false;

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

  if(dimension_label == null) delete series['null'].name;

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
  console.log(event);
  console.log(chartContext);
  console.log(config);
  lookerchart.Utils.openDrillMenu(
    {
      links: ['/explore/dwh_salesdesk/xplr_salesdesk_chats?fields=vw_fct_salesdesk_chats.ticket_id,vw_fct_salesdesk_chats.assistance_id,vw_fct_salesdesk_chats.workflow_id,vw_fct_salesdesk_chats.user_id,vw_fct_salesdesk_chats.status,vw_fct_salesdesk_chats.agent_id,vw_fct_salesdesk_chats.agent_name,vw_fct_salesdesk_chats.start_time,vw_fct_salesdesk_chats.assign_time,vw_fct_salesdesk_chats.accept_time,vw_fct_salesdesk_chats.first_time,vw_fct_salesdesk_chats.close_time,vw_fct_salesdesk_chats.first_response_duration_time,vw_fct_salesdesk_chats.wait_duration_time,vw_fct_salesdesk_chats.assist_duration_time&f[vw_fct_salesdesk_chats.agent_name]=Everaldo+Santos&f[vw_fct_salesdesk_chats.department_name]=Suporte+produtos+energia+solar&f[vw_fct_salesdesk_chats.start_date]=15+days&f[vw_dim_workflow.bot_id]=wdcnet-wa-ng-br&f[vw_fct_salesdesk_chats.assign_date]=-NULL&dynamic_fields=%5B%7B%22category%22%3A%22measure%22%2C%22expression%22%3Anull%2C%22label%22%3A%22Custom+Abandoned%22%2C%22value_format%22%3Anull%2C%22value_format_name%22%3Anull%2C%22based_on%22%3A%22vw_fct_salesdesk_chats.chat_abandoned%22%2C%22_kind_hint%22%3A%22measure%22%2C%22measure%22%3A%22custom_abandoned%22%2C%22type%22%3A%22count_distinct%22%2C%22_type_hint%22%3A%22number%22%7D%2C%7B%22category%22%3A%22table_calculation%22%2C%22label%22%3A%22%25%22%2C%22value_format%22%3Anull%2C%22value_format_name%22%3A%22percent_2%22%2C%22calculation_type%22%3A%22percent_of_column_sum%22%2C%22table_calculation%22%3A%22calculation%22%2C%22args%22%3A%5B%22vw_fct_salesdesk_chats.count%22%5D%2C%22_kind_hint%22%3A%22measure%22%2C%22_type_hint%22%3A%22number%22%2C%22is_disabled%22%3Atrue%7D%5D&query_timezone=America%2FLos_Angeles&limit=500'],
      event: event
    }
  );
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

      IS_MULTIDIMENSIONAL = false;
      const validation_result = validate_errors(queryResponse);
      // Validating fields
      if(validation_result.error){
        this.addError({
          title: validation_result.title,
          message: validation_result.message
        });
        return;
      }

      IS_MULTIDIMENSIONAL = (validation_result.qty_no_hidden_dimensions > 1)

      // Creating options from data
      var options = create_dynamic_options(queryResponse);
      this.trigger('registerOptions', options);

      // Updating config
      update_config_options(options, config);
      this.trigger('updateConfig', config);

      // Transforming data
      const measure_name = config.area_measure || queryResponse.fields.measures[0].name;
      const dimension_color = config.category_dimension || queryResponse.fields.dimensions[0].name;
      const dimension_label = IS_MULTIDIMENSIONAL ? config.subcategory_dimension || queryResponse.fields.dimensions[1].name: null;
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
          },
          events: {
            click: function(event, chartContext, config) 
              { on_click_chart(event, chartContext, config, LookerCharts); }
          }
        },

        plotOptions: {
          treemap:{
            useFillColorAsStroke: config.fill_color_as_stroke,
            distributed: !IS_MULTIDIMENSIONAL // If it's unidimensional then we want a disitributed palette.
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
