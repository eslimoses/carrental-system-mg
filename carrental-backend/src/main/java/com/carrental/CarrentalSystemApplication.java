package com.carrental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CarrentalSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(CarrentalSystemApplication.class, args);
	}

}
