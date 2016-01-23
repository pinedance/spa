// ref: http://www.html5rocks.com/en/tutorials/file/dndfiles/


// Check for the various File API support.
(function(){
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      // Great success! All the File APIs are supported.
    } else {
      alert('The File APIs are not fully supported in this browser.');
    }
}());


function readBlob(myfile, opt) {  // opt Object

    var file = myfile;
    var result = {
        readStart : ( parseInt(opt.startByte) || 0 ),
        readStop : ( parseInt(opt.stopByte) || file.size - 1 ),
        blob : file.slice(this.readStart, this.readStop + 1),    
    }
    
    var reader = new FileReader();
    reader.readAsBinaryString(result.blob);
    reader.onloadend = function(evt) {
        // If we use onloadend, we need to check the readyState.
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        result.name = escape(file.name);
        result.type = file.type || 'n/a';
        result.size = file.size;  // bytes
        result.lastModifiedDate = (file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'n/a');
        result.content = evt.target.result;
    };

    return result;
}


// Read Local Files
function handleFileSelect(evt, opt) {

    /* HTML
    <input type="file" id="files" name="files[]" multiple />
    <output id="list"></output>
    */
    
    var files = evt.target.files; 
    
    if (!files.length) { 
          alert('Please select a file!'); return;
    }
    
    for (var i = 0, f; f = files[i]; i++) {
        
            readBlob(f, opt)

      });
     
        
        
        
        
    }
    
}
