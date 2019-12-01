package de.jn.freme.workfloweditor.web;
import static org.junit.Assert.*;
import org.junit.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;

import de.jn.freme.workfloweditor.WorkflowEditorBackend;

public class RestAPITest {

	String baseurl = "http://localhost:8080/api";
	
	@Test
	public void testWrite() throws UnirestException {
		
		ConfigurableApplicationContext context = new SpringApplication(WorkflowEditorBackend.class).run();

		JsonNode node = Unirest.get(baseurl + "/workflow").asJson().getBody();
		assertTrue(node.getArray().length() == 0);
		
		Unirest.post(baseurl + "/workflow").field("title", "hey title").field("description", "hey descrpition").asString().getBody();
		
		node = Unirest.get(baseurl + "/workflow").asJson().getBody();
		assertTrue(node.getArray().length() == 1);
		
		context.stop();
	}
}
