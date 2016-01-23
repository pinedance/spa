$(document).ready(function() {
	$('#example').dataTable( {
		"paging":   true,
		"ordering": true,
		"searching": true,
		"info":     true,
		"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
	} ); 
} );
