# FREME workflow editor

Overview projects in this repository

* **webapp/** stores the frontend
* **WorkflowEditorBackend/** stores the backend

**How to start the frontend**

```
cd webapp/
php -S localhost:3000
```

Then open localhost:3000 in web browser

**How to start the backend**

* Import project in eclipse (import as Maven project)
* Configure MySQL database connection in src/main/resources/application.properties
    * Create a database (name for example "next-workflow-editor")
    * Enter username and password in application.properties
* Execute main Class: de.jn.freme.workfloweditor.WorkflowEditorBackend