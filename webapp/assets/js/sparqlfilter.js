$.widget("custom.sparqlfilter", {

    textarea: null,

    _create: function(){
        console.log("HERE WE GO AGAIN");
        $('<div class="popup" id="popdiv">').appendTo(this.element);
        $('<span class="popuptext" id="pop">').html("The CSV conversion template has been added to your workflow").click(function(event) {
        this.classList.toggle("show")
        }).appendTo("#popdiv");
        
        $("<h2>").html("CSV conversion templates").appendTo(this.element);
        
        $("<p>").html("Use the CSV conversion templates to convert the data from the internal NIF data format to CSV. Click on a template to add it to your workflow.").appendTo(this.element);
        $("<ul>").addClass("sparqlfilter").appendTo(this.element);
        var that = this;
        $.get(
            "https://api.freme-project.eu/current/toolbox/convert/manage",
            function(data){
                data = that.enrich_descriptions(data);
                that.show_filter(data);
            }
        );
    },

    enrich_descriptions: function(data){
        for( var i=0; i<data.length; i++){
            var f = data[i];

            if( f["name"] == "dkt-temp-output-as-web-annotation"){
            } else if( f["name"] == "entities-detailed-info"){
                f["description"] = "Extract detailed infos about Named Entities in the text.";
            } else if( f["name"] == "extract-entities-only"){
                f["description"] = "Extract named entity labels.";
            } else if( f["name"] == "freme-workflow-editor-terminology"){
                f["description"] = "Simplify output of the terminology service.";
            } else if( f["name"] == "gender-name"){
                f["description"] = "Extract all names of persons and their gender from the input text";
            } else if( f["name"] == "museums-nearby"){
                f["description"] = "Show all museums contained in the input data.";
            } else if( f["name"] == "original-and-translation"){
                f["description"] = "Extract originals and their translation. Only useful for input data that contains machine translation information.";
            } else if( f["name"] == "place-and-lat-long"){
                f["description"] = "Extract all places and their latitude / longitude";
            } else if( f["name"] == "sourcelang-targetlang"){
            } else if( f["name"] == "terminology-terms-only"){
                f["description"] = "Show all terms extracted by the terminology annotation service";
            } else if( f["name"] == "terms-basic-infos"){
                f["description"] = "Show basic information about terms.";
            } 
        }
        return data;
    },

    show_filter: function(data){
        var ul = $(this.element).children(".sparqlfilter");
        ul.html("");
        for( var i=0; i<data.length; i++){
            var f = data[i];
            var li = $("<li>").appendTo(ul);
            d = f["description"];
            if( d == undefined ) d = "No description available";
            var name = f["name"];
            $('<a href="#">').attr("id", name).html(name).css("font-weight", "bold")
            .click(function(event) { //Function to add filter

        var newFilter = "https://api.freme-project.eu/current/toolbox/convert/documents/".concat(this.innerHTML);
        var text = $("#workflow-definition").val();
        //Popup
        var popup = document.getElementById("pop");
        popup.classList.toggle("show", true);
        setTimeout((function(){
            if(popup.classList[1] === "show") popup.classList.toggle("show")}
            ), 5000)
        //popup.classList.toggle("show", false)
        // setTimeout(popup.classList.toggle("show"), 5000);
        text = text.trimEnd();
        var lines = text.split("\n");
        console.log(lines[lines.length-1]);

        //check if last line is SPARQL filter or no
        if(lines[lines.length-1].includes('/toolbox/convert/documents/')){
            lines[lines.length-1] = newFilter;
            $("#workflow-definition").val(lines.join("\n"));
        }else{
            text = text.concat("\n\n", newFilter);
            $("#workflow-definition").val(text);}
   
            }).appendTo(li);
            $("<br>").appendTo(li);
            $("<span>").html(d).appendTo(li);
        }
    }
  })