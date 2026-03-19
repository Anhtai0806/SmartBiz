package com.smartbiz.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartbizBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartbizBackendApplication.class, args);
	}

}
