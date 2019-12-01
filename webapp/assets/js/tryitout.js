$.widget("custom.tryitout", {

    textarea: null,

    _create: function(){

        //dummy_text = "The city is one of Germany's 16 federal states. It is surrounded by the state of Brandenburg, and contiguous with Potsdam, Brandenburg's capital. The two cities are at the center of the Berlin-Brandenburg capital region, which is, with about six million inhabitants and an area of more than 30,000 kilometers-square, Germany's third-largest metropolitan region after the Rhine-Ruhr and Rhine-Main regions.";
        dummy_text = "";
        textarea = $("<textarea id='tryitarea'>").html(dummy_text).appendTo(this.element);
        this.element.append(textarea);

        var button = $("<button>").attr("id", "startBtn").html("Try it out").attr("class", "button").appendTo(this.element);
        $('<img id="loader" src="data/icons/ajax-loader.gif" alt="Loading" display="inline" height="20" width="20" >').appendTo(this.element).hide();
        //modified click function with callback
        button.click(function(event){
            $("#workflow-definition").highlightWithinTextarea({});
            $("#error_message").hide()
            $("#dialog").html('');
            $(".error_message").hide();
            $(".result").hide();
            var text = textarea.val();
            if( text.trim() == ""){
                $("#error_tryitout").html("Error: Please provide a text that will be processed by the API.").show();       
                $("#loader").hide();
                return;    
            } else{
                $("#loader").show(function(){workflow_executor.do_api_call(text);});
                
            }  
        });
        $("<div>").attr("id", "error_tryitout").addClass("error_message").appendTo(this.element);
        //loading spinner end
        $("<div>").addClass("result").appendTo(this.element);
    }
});