google.load("visualization", "1.1", {packages:['sankey']});
google.setOnLoadCallback(drawChart);

function drawChart() {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'From');
  data.addColumn('string', 'To');
  data.addColumn('number', 'Weight');
  data.addRows( loadSankeyData() );    // loadSankeyData from data.js
  
  // Set chart options
  var options = {
      width: 800,
      heght: 800,
      sankey: {
          link: {
              color: {
                //  fill: '#efd',      // Color of the link.
                //  fillOpacity: 0.8, // Transparency of the link.
                //  stroke: 'black',     // Color of the link border.
                strokeWidth: 2        // Thickness of the link border (default 0).
              }
          },
          node: {
              label: {
                //  fontName: 'Times-Roman',
                fontSize: 16,
                //  color: '#000',
                //  bold: true,
                //  italic: false
              },
              labelPadding: 6, // Horizontal distance between the label and the node.
              nodePadding: 12, // Vertical distance between nodes.
              width: 10               // Thickness of the node.
          }
      }
  };

  // Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.Sankey(document.getElementById('sankey_basic'));
  chart.draw(data, options);
}