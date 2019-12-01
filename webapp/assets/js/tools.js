$.widget("custom.tools", {

    textarea: null,
    
    _create: function(){

        var div = $("#tab-file");
        //$("<h2>").html("Python Export").appendTo(div);
        var dia = $('<div id="dialog" title="Python">').appendTo(div);
        dia.dialog({
        autoOpen: false,
        width: "auto",  
        buttons: {
            "Copy to Clipboard": function(){
                
                var el = document.createElement('textarea');
                el.value = dia.html().replace('&amp;','&');
                document.body.appendChild(el);
                console.log(el.value);
                el.select();
                document.execCommand("copy");
                document.body.removeChild(el);
            },
            OK: function() {$(this).dialog("close");}
            
         },
         title: "Python Export"
     })
    
    dia.html("Before using the Python Export, please click the tryitout button in the Workflow-Tab.");
     $('<button id = "opener">').text('Export python code').click(function(){
         $("#dialog").dialog( "open" );
     }).appendTo(div);
        }})