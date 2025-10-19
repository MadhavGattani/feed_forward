package com.foodredistribution;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FoodRedApplication {
    public static void main(String[] args) {
        SpringApplication.run(FoodRedApplication.class, args);
    }
}
