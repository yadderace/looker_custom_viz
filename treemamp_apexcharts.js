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
      } else if(queryResponse.length != 1){
        this.addError({
          title: "One Measure Required",
          message: "This visualization requires one measure"
        });
        return;
      }
      

      var options = {
        series: [
        {
          name: 'Desktops',
          data: [
            {
              x: 'ABC',
              y: 10
            },
            {
              x: 'DEF',
              y: 60
            },
            {
              x: 'XYZ',
              y: 41
            }
          ]
        },
        {
          name: 'Mobile',
          data: [
            {
              x: 'ABCD',
              y: 10
            },
            {
              x: 'DEFG',
              y: 20
            },
            {
              x: 'WXYZ',
              y: 51
            },
            {
              x: 'PQR',
              y: 30
            },
            {
              x: 'MNO',
              y: 20
            },
            {
              x: 'CDE',
              y: 30
            }
          ]
        }
      ],
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
  
