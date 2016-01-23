google.load("visualization", "1.1", {packages:["wordtree"]});
google.setOnLoadCallback(drawChart);

var form = document.getElementById("myword")
var myword, mytype

form.onsubmit = function(){
  myword = form.elements[0].value || '';
  mytype = $('input[name="optradio"]:checked').val();
  drawChart();
  return false
}

function drawChart() {
  var merged = [];
  merged = merged.concat.apply(merged, loadData());  // loadData() from data.js
  var mydata = [['Phrases']].concat( [ [ merged.join(".") ] ] );
  var data = google.visualization.arrayToDataTable(mydata);

  var options = {
      maxFontSize: 14,
      colors: ['red', 'black', 'green'],
      fontName: 'HanWangMingMedium',

      wordtree: {
        format: 'implicit',
        sentenceRegex: /[^\+-,@#\$%\^&\*\(\):;\\\/\|<>'\s]/,
        wordRegex: /[^\+-\.,!\?@#\$%\^&\*\(\):;\\\/\|<>'\s]{1,2}/,
        type: mytype,
        word: myword
    }
  }; 

 	var chart = new google.visualization.WordTree(document.getElementById('wordtree_basic'));
	chart.draw(data, options);
}