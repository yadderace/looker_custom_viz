
looker.plugins.visualizations.add({
    // Id and Label are legacy properties that no longer have any function besides documenting
    // what the visualization used to have. The properties are now set via the manifest
    // form within the admin/visualizations page of Looker
    id: "treemap_apexcharts",
    label: "Treemap Apexcharts",
    
    options: {
      show_legend: {
        type: "boolean",
        label: "Show Legend",
        default: "false",
        section: "Plot"
      }
    },


    // Set up the initial state of the visualization
    create: function(element, config) {
  
        element.innerHTML = "<div id='chart'></div>";
  
    },
    // Render in response to the data or settings changing
    updateAsync: function(data, element, config, queryResponse, details, done) {
  
      // Clear any errors from previous updates
      this.clearErrors();

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
      
      // Transforming data
      const measure_name = queryResponse.fields.measures[0].name;
      const dimension_color = queryResponse.fields.dimensions[0].name;
      const dimension_label = queryResponse.fields.dimensions[1].name;
      var series_apexchart = transform_data_to_treemap(data, measure_name, dimension_color, dimension_label);

      var options = {
        series: series_apexchart,
        legend: {
          show: config.show_legend
        },
        chart: {
          height: 350,
          type: 'treemap',
          toolbar: {
            show: false
          }
        }
      };

      var chart = new ApexCharts(element.querySelector("#chart"), options);
      chart.render();
      console.log(chart);
      done();
    }
  });


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
  
