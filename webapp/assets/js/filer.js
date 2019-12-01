$.widget("custom.filer", {
    
    textarea: null,
    
    _create: function(){
    $("<h2>").html("File Utilities").appendTo(this.element);
    $("<button id='save'>").html("Save workflow").click(function(e){
        workflow_executor.save_workflow();
    }).appendTo(this.element);
    $("<button id='create_new'>").html("Create new workflow").click(function(e){
        workflow_executor.create_new_template();
    }).appendTo(this.element);
    }



});