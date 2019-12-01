$.widget( "custom.select_workflow", {

    _create: function(){
        var leftControls = $("<div>").addClass("controls_left").appendTo(this.element);
        
        var select = $("<select>");
        $("<option>").attr("value", "null").html("Please select workflow").appendTo(select);
        var url = baseUrl + "/api/workflow/";
        jData = ($.get(url, function(data){
            for(i of data){
                var val = i.title;
     
                htmlval= val.replace('.txt', '');
                $("<option>").attr("value", val).html(htmlval).appendTo(select);
            }
        }));

        leftControls.html("Load workflow: ").append(select);
        select.change(function(){
            var workflow = select.val();
            $("#error_message").hide()
            $(".result").hide();
            console.log(workflow);
            $("#workflow-definition").highlightWithinTextarea({});
            if( workflow == "null"){
                workflow_executor.create_new_template();
                return;
            }
            // workflow= workflow.replace('.txt', '');
            var url = baseUrl + "/api/workflow/" + workflow;
            $("#wflow_name").html(workflow);
            // $('#wflow_name').remove();
            // $("<h5 id='wflow_name' style='display:inline-block'>").html(workflow).appendTo("#wflow_title");
            
            $.get(url, function(data){
                $("#workflow-definition").val(data.originalDefinition);
                $("#tryitarea").val(data.example);
            });
        });


    }
});
