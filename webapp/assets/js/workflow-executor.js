/**
 * Parse and execute workflows.
 */

workflow_executor = {
    /**
     * display an error and highlight this number in the workflow definition
     */
    show_error: function(lineNumber, text){
        $("#error_message").show().html(text);
        var lineSpanStart = 0;
        var lines = $("#workflow-definition").val().split("\n");
        for( var j=0; j<lineNumber; j++){
            lineSpanStart += lines[j].length +1;
        }
        var lineSpanEnd = lineSpanStart + lines[lineNumber].length;

        $("#workflow-definition").highlightWithinTextarea({
            highlight: [lineSpanStart, lineSpanEnd]
        }); 
    },

    /**
     * parse workflow, display error if something goes wrong
     */
    parse: function(){
        $("#error_message").hide();
        var text = $("#workflow-definition").val();
        var lines = text.split("\n");
        var workflow = [];
        var STATE_OUTSIDE = 0;
        var STATE_PARAMETER = 1;
        var state = STATE_OUTSIDE;
        var current_service = null;
    
        if( text.trim() == ""){
            this.show_error(0, "Workflow definition cannot be empty.");
            return false;
        }
        for(var i=0; i<lines.length; i++){
        var line = lines[i].trim();
        if(line.includes('#')){
            lines[i] = line.slice(0,line.indexOf('#'));
            console.log(lines[i]);}
        }

        for(var i=0; i<lines.length; i++){
            var line = lines[i].trim();
              if(line.startsWith('/')){
                    line = "https://api.freme-project.eu/current".concat(line);
                }
            if( line.length == 0 ){
                
                if( current_service != null && state == STATE_PARAMETER){
                    workflow.push(current_service);
                    current_service = {"parameters": {}};
                }
                state = STATE_OUTSIDE;
            } else if( state == STATE_OUTSIDE ){

                var urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
                if( !urlRegex.test(line)){
                    this.show_error(i, "Error in line " + (i+1) + ": This is not a valid URL.");
                    return false;
                }

                current_service = {"parameters": {}};
                current_service["endpoint"] = line;
                state = STATE_PARAMETER;
            } else if( state == STATE_PARAMETER ){
                var index = line.indexOf("=");
                if( index<0 ){

                    this.show_error(i, "Syntax error in line " + (i+1) + ": This is not the correct way to denote a parameter. Parameter names are always written as &quot;Paramtername=Parametervalue&quot;, e.g. &quot;language=en&quot;");
                    return false;
                }
                var parameter = line.substr(0,index).trim();
                var value = line.substr(index+1).trim();
                current_service["parameters"][parameter] = value;
            }
        }   
        if( current_service["endpoint"] != undefined ){
            workflow.push(current_service);
        }   

        $("#workflow-definition").highlightWithinTextarea({});
        var json_object = {
            "state": "success",
            "workflow": workflow
        };
        return json_object; 
    },

    /**
     * execute workflow
     */
    do_api_call: function(){
        $("#loader").show();
        var workflow = this.parse();
        if( workflow === false || workflow["state"] == "error"){
            $("#loader").hide();
            return;
        }
        workflow = workflow["workflow"];
        
        var text = $(".tryitout textarea").val();
        if( text.trim() == ""){
            this.display_error(0, "Please provide a text that will be processed by the API.");
            $("#loader").hide();
            return;
        }

        data = text;
        $(".tryitout .result").html("");
        this.call_service(data, workflow, 0);
    },

    /**
     * execute a single service of a workflow
     */
    call_service: function(data, workflow, index){
       
        var div = $(".tryitout .result");
        //div.html("");
        service = workflow[index];
        $("<h3>").html(service["endpoint"]).appendTo(div);
            
        var p = "";
        for( var key in service["parameters"]){
            if( p.length > 0 ){
                p += "&";
            }
            p += key + "=" + encodeURIComponent(service["parameters"][key]);
        }
        var url = service.endpoint;
        if(p.length>0){
            url += "?" + p;
        }
        var that = this;

        accept = "text/turtle";
        if(service["endpoint"].startsWith("https://api.freme-project.eu/current/toolbox/convert/documents/")){
            accept = "text/comma-separated-values";
        } 
        that.add_to_python_template(url,data,accept, index);
        var contentType = "text/turtle";
        if( index == 0 ){
            contentType =" text/plain";
        }
        $.ajax({
            "method": "post",
            "url": url,
            "data": data,
            "error": function(jqXHR, textStatus, errorThrown){
                that.display_error(jqXHR, service);
            },
            async: false,
            headers: {
                "content-type": contentType,
                "accept": accept
            }
            
        }).done(function(data, textStatus, jqXHR){
            that.add_result_display(data, service, jqXHR.getResponseHeader("content-type"));
            if(index+1 < workflow.length){
                that.call_service(data, workflow, index+1);
            } else{
                // show end result of pipeline
                $("#loader").hide();
                index = $(".tryitout .result .response").length-1;
                that.toggle_response(index);
            }
        });
    },

    display_error: function(jqXHR, service){
        $(".result").show();
        if(jqXHR["status"] == 0){
            var div = $(".tryitout .result");
            div.html("");
    
            $("<h3>").html("Response").appendTo(div);
    
            var response = $("<div>").html("No response from API. Are you sure that the url &quot" + service.endpoint + "\" is correct?");
            response.appendTo(div);            
        } else{
            var div = $(".tryitout .result");
            div.html("");
            $("<h3>").attr("style", "color:red").html("Error:").appendTo(div);
            $("<p>").text(jqXHR.responseJSON.message).appendTo(div);
            //$("<p>").html("The API endpoint failed with status " + jqXHR.status + ", " + jqXHR.statusText).appendTo(div);
            var response = $("<div>").addClass("response").appendTo(div);
            var json_object = jqXHR.responseJSON;
            $("<pre>").text(JSON.stringify(json_object, null, 2)).appendTo(response);
                JSON.stringify(json_object)

        }
        $("#loader").hide();
    },

    /**
     * open or close a response in the try it out area
     */
    toggle_response: function(responseid){
        $(".tryitout .response[responseid=" + responseid + "]").toggle("slow");
        

        var a = $("a[responseid=" + responseid+ "]");
        var text = "show response";
        if(a.html() == "show response"){
            text = "hide response";
        }
        a.html(text);
        return false;
    },

    add_result_display: function(data, service, contentType){
        $(".result").show();
        var div = $(".tryitout .result")
        //div.html("");

        index = div.children(".response").length;
        var that = this;
        $("<p>").html("The API endpoint returned status 200: OK").appendTo(div);
        var a = $("<a>").html("show response").attr("href", "#").attr("responseid", index).click(function(event){
            var index = $(this).attr("responseid");
            that.toggle_response(index);
            event.preventDefault();
        }).appendTo(div);


        if(contentType.toLowerCase().startsWith("text/comma-separated-values")){

            tableData = Papa.parse(data).data;
            var response = $("<table>").addClass("response").attr("responseid", index).appendTo(div);
            var tr = $("<tr>").appendTo(response);
            for( var i=0; i<tableData[0].length; i++){
                $("<th>").text(tableData[0][i]).appendTo(tr);
            }
            for( var i=1; i<tableData.length; i++){
                var tr = $("<tr>").appendTo(response);
                if( i%2==1){
                    tr.addClass("odd");
                }
                for( var j=0; j<tableData[i].length; j++){
                    $("<td>").text(tableData[i][j]).appendTo(tr);
                }
            }
        } else{
            var response = $("<div>").addClass("response").attr("responseid", index).appendTo(div);
            $("<pre>").text(data).appendTo(response);   
            response.hide();    
        }
        response.hide();
    },

    add_to_python_template: function(url, data, accept, index){
        t = $("#dialog").html();
        if(!t.startsWith("import requests")){
            //$("#dialog").dialog( "option", "width", 1000 );
            t = ("import requests\n\n".concat("#service ", index+1, "\nresponse = requests.post(\nurl=\"", url,
            "\",\ndata=\"\"\"", data,
            "\"\"\",\nheaders={'content-type': 'text/plain', 'accept': '", accept,
            "'}\n)\n", 
            "print(response.text)\nprint()\n\n"))
        }else{
        t = t.concat(
            "#service ", index+1, "\nresponse = requests.post(\nurl=\"", url,
             "\",\ndata=response.text.encode('utf-8'),",
             "\nheaders={'content-type': 'text/turtle', 'accept': '", accept, "', 'charset': 'utf-8'",
             "}\n)\n", 
             "print(response.text)\nprint()\n\n")}
        $("#dialog").html(t);
    },
    save_workflow: function(){
        var that = this;
        workflow = $("#workflow-definition").val();
        const originalWorkflow = workflow;
        
        // const jsonWorkflow = {
        //     workflow
        // };    
        // jsonWork = JSON.stringify(jsonWorkflow);
        example = $("#tryitarea").val();
        
        var parsedWorkflow = this.parse();
        if(parsedWorkflow === false){
            $("<div>").html("Your workflow still has errors. Please correct the errors before you save the workflow. Go go the workflow tab to see the errors.")
                .appendTo($("body")).
                dialog({
                    autoOpen: true,
                    title: "An error has occured",
                    buttons: {
                        "Close": function(){
                            $(this).dialog("close");
                        }
                    }
                });
            return;
        }
        console.log(parsedWorkflow);
        const title = $("#select-workflow select").val();
        if(title == "null"){
            var newDialog = $("<div>", {
                id: "dialog-form"
              });
            newDialog.append("<label style='display: block;'>Name of New Workflow:</label><input type='text' id='new_item' />");
            newDialog.dialog({
                resizable: false,
                modal: true,
                title: "Save workflow",
                autoOpen: false,
                buttons: [{
                  text: "Create",
                  click: function() {
                    var newTitle = $('#new_item').val();
                    $(this).dialog("close");
                    data = {
                        originalDefinition: workflow,
                        jsonWorkflow: parsedWorkflow["workflow"],
                        title: newTitle,
                        example: example
                    };
                    $.ajax({
                        type: "POST",
                        contentType: 'application/json',
                        url: baseUrl + "/api/workflow",
                        dataType: "json",
                        data: JSON.stringify(data),
                        success: function( data ) {
                            console.log( data );
                        },
                        error: function(xhr, status, error) {
                            that.okDialog("Error", "An error occured while saving the workflow.");
                            console.log(error);
                        }
                });
                        
                  }
                },
                {
                    text: "Cancel",
                    click: function(){
                        $(this).dialog("close");
                    }
                }
            ]
              });
              //$("body").append(newDialog);
              newDialog.dialog("open");
              return;
            }
            
        else{
        that.update_workflow(workflow,parsedWorkflow["workflow"],title, example);
        }
    },

    okDialog: function(title, text){
        $("<div>").html(text).appendTo($("body"))
            .dialog({
                modal: true,
                title: title,
                buttons: {
                    "Ok": function(){
                        $(this).dialog("close");
                    }
                }
            });
    },

    update_workflow: function(originalWorkflow,jsonWork,title, example){
        var that = this;
        $("<div>").html("You are about to change the workflow &quot;" + title + "&quot;. Are you sure you want to continue?").appendTo($("body"))
            .dialog({
                modal: true,
                title: "Confirm saving",
                buttons: {
                    "Proceed and save": function(){
                        data = {
                            originalDefinition: originalWorkflow,
                            jsonWorkflow: jsonWork,
                            title: title,
                            example: example
                        };
                        $.ajax({
                            type: "PUT",
                            contentType: 'application/json',
                            url: baseUrl + "/api/workflow/" + encodeURIComponent(title),
                            dataType: "json",
                            data: JSON.stringify(data),
                            success: function( data ) {
                                that.okDialog("Save complete", "You have saved the workflow");
                            },
                            error: function(xhr, status, error) {
                                that.okDialog("Error", "An error occured while saving the workflow.");
                                console.log(error);
                            }
                        });
                        $(this).dialog("close");
                    },
                    "Cancel": function(){
                        $(this).dialog("close");
                    }
                }
            });
    },
    create_new_template: function(){
        $("#workflow-definition").val('');
        $(".result").hide();
        $("#select-workflow select").val('null');
        $("#tryitarea").val('');
        $("#wflow_name").html("Untitled");
    },

    saveText: function(text, filename){
        var a = document.createElement('a');
        a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
        a.setAttribute('download', filename);encode
        a.click()
      }
      

}