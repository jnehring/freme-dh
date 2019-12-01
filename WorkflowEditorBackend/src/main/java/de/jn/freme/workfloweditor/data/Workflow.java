package de.jn.freme.workfloweditor.data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class Workflow {

	@Column(columnDefinition = "TEXT")
	String originalDefinition;

	@Column(columnDefinition = "TEXT")
	String jsonDefinition;

	@Id
	String title;

	@Column(columnDefinition = "TEXT")
	String description;

	@Column(columnDefinition = "TEXT")
	String example;
	
	public String getOriginalDefinition() {
		return originalDefinition;
	}

	public void setOriginalDefinition(String originalDefinition) {
		this.originalDefinition = originalDefinition;
	}

	public String getJsonDefinition() {
		return jsonDefinition;
	}

	public void setJsonDefinition(String jsonDefinition) {
		this.jsonDefinition = jsonDefinition;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getExample() {
		return example;
	}

	public void setExample(String example) {
		this.example = example;
	}
	
	
}
