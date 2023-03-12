looker.plugins.visualizations.add({
    // Id and Label are legacy properties that no longer have any function besides documenting
    // what the visualization used to have. The properties are now set via the manifest
    // form within the admin/visualizations page of Looker
    id: "treemap_apexcharts",
    label: "Treemap Apexcharts",
    options: {
      font_size: {
        type: "string",
        label: "Font Size",
        values: [
          {"Large": "large"},
          {"Small": "small"}
        ],
        display: "radio",
        default: "large"
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
        show: false
      },
      chart: {
        height: 350,
        type: 'treemap'
      },
      title: {
        text: 'Multi-dimensional Treemap',
        align: 'center'
      }
      };

      var chart = new ApexCharts(element.querySelector("#chart"), options);
      chart.render();
      doneRendering()
    }
  });
  
