project_name: "test_looker_custom_visualizations"

constant: TREEMAP_APEXCHART_LABEL {
  value: "Test Treemap (Apexchart)"
  export: override_optional
}

constant: TREEMAP_APEXCHART_ID {
  value: "test-treemap-apexchart"
  export: override_optional
}

visualization: {
  id: "@{TREEMAP_APEXCHART_ID}"
  file: "treemap_apexchart/treemap_apexchart.js"
  label: "@{TREEMAP_APEXCHART_LABEL}"
  dependencies: ["https://cdn.jsdelivr.net/npm/apexcharts"]
}


constant: FUNNEL_D3_LABEL {
  value: "Test Funnel (D3)"
  export: override_optional
}

constant: FUNNEL_D3_ID {
  value: "test-funnel-d3"
  export: override_optional
}

visualization: {
  id: "@{FUNNEL_D3_ID}}"
  file: "funnel_d3/funnel_d3.js"
  label: "@{FUNNEL_D3_LABEL}"
  dependencies: ["https://cdn.jsdelivr.net/gh/yadderace/funnel-graph-js@feature/percentage-mode/dist/js/funnel-graph.min.js",
    "https://unpkg.com/funnel-graph-js@1.3.9/dist/css/theme.min.css",
    "https://unpkg.com/funnel-graph-js@1.3.9/dist/css/main.min.css"]
}
