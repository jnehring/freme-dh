package de.jn.freme.workfloweditor.web;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

import javax.persistence.EntityManager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import de.jn.freme.workfloweditor.data.Workflow;
import de.jn.freme.workfloweditor.data.WorkflowRepository;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class RestAPI {

	@Autowired
	WorkflowRepository workflowRepository;

	@Autowired
	EntityManager em;

	@PostMapping("/api/workflow")
	public ResponseEntity newWorkflow(@RequestBody Workflow newWorkflow) {
		if (workflowRepository.findById(newWorkflow.getTitle()).isPresent()) {
			return new ResponseEntity("Workflow with title \"" + newWorkflow.getTitle() + "\" already exists in the database.", HttpStatus.BAD_REQUEST);
		}
		else{
			Workflow workflow = workflowRepository.save(newWorkflow);
			return new ResponseEntity(workflow, HttpStatus.OK);
		}
	}

	@PutMapping("/api/workflow/{title}")
	public ResponseEntity updateWorkflow(@PathVariable(required=true) String title, @RequestBody Workflow newWorkflow) {
		
		Optional<Workflow> workflowOpt = workflowRepository.findById(newWorkflow.getTitle());
		if( !workflowOpt.isPresent()) {
			return new ResponseEntity("Cannot find workflow with title \"" + newWorkflow.getTitle() + "\"", HttpStatus.NOT_FOUND);			
		}
		
		Workflow workflow = workflowOpt.get();
		workflow.setOriginalDefinition(newWorkflow.getOriginalDefinition());
		workflow.setJsonDefinition(newWorkflow.getJsonDefinition());
		workflow.setDescription(newWorkflow.getDescription());
		workflow.setTitle(newWorkflow.getTitle());
		workflow.setExample(newWorkflow.getExample());

		workflowRepository.save(workflow);

		return new ResponseEntity(workflow, HttpStatus.OK);
	}

	@GetMapping("/api/workflow/{title}")
	public ResponseEntity getOneWorkflow(@PathVariable(required = true) String title) {
		Optional<Workflow> workflow = workflowRepository.findById(title);
		if( !workflow.isPresent()) {
			return new ResponseEntity("Cannot find workflow with title \"" + title + "\"", HttpStatus.NOT_FOUND);			
		} else {
			return new ResponseEntity(workflow.get(),HttpStatus.OK);
		}
	}

	@GetMapping("/api/workflow")
	public List<Workflow> getWorkflows() {
		Iterator<Workflow> itr = workflowRepository.findAll().iterator();
		List<Workflow> list = new ArrayList<Workflow>();
		while (itr.hasNext()) {
			list.add(itr.next());
		}
		return list;
	}
	
	@DeleteMapping("/api/workflow/{title}")
	public ResponseEntity deleteWorkflow(@PathVariable(required = true) String title) {
		Optional<Workflow> workflow = workflowRepository.findById(title);
		if( !workflow.isPresent()) {
			return new ResponseEntity("Cannot find workflow with title \"" + title + "\"", HttpStatus.NOT_FOUND);			
		} else {
			workflowRepository.delete(workflow.get());
			return new ResponseEntity(workflow.get(),HttpStatus.OK);
		}
	}

}
