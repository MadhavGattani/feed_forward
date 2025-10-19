package com.foodredistribution.config;

import com.foodredistribution.model.Admin;
import com.foodredistribution.model.Organization;
import com.foodredistribution.model.FoodDonation;
import com.foodredistribution.repository.AdminRepository;
import com.foodredistribution.repository.OrganizationRepository;
import com.foodredistribution.repository.FoodDonationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;
import java.util.Calendar;

@Configuration
public class DataInitializer {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private FoodDonationRepository foodDonationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Initialize admin if not exists
            if (!adminRepository.findByUsername("Inder_Kukreja").isPresent()) {
                Admin admin = new Admin();
                admin.setUsername("Inder_Kukreja");
                admin.setPassword(passwordEncoder.encode("Apple@12345"));
                adminRepository.save(admin);
                System.out.println("Admin account created successfully");
            }

            // Initialize test organizations if none exist
            if (organizationRepository.count() == 0) {
                Organization org1 = new Organization();
                org1.setName("Food Bank Organization");
                org1.setType("Non-Profit");
                org1.setEmail("foodbank@example.com");
                org1.setPhone("123-456-7890");
                org1.setAddress("123 Main St, City");
                organizationRepository.save(org1);

                Organization org2 = new Organization();
                org2.setName("Community Kitchen");
                org2.setType("Charity");
                org2.setEmail("kitchen@example.com");
                org2.setPhone("987-654-3210");
                org2.setAddress("456 Oak St, City");
                organizationRepository.save(org2);

                Organization org3 = new Organization();
                org3.setName("Homeless Shelter");
                org3.setType("Non-Profit");
                org3.setEmail("shelter@example.com");
                org3.setPhone("555-555-5555");
                org3.setAddress("789 Pine St, City");
                organizationRepository.save(org3);

                System.out.println("Test organizations created successfully");
            }
        };
    }

	public FoodDonationRepository getFoodDonationRepository() {
		return foodDonationRepository;
	}

	public void setFoodDonationRepository(FoodDonationRepository foodDonationRepository) {
		this.foodDonationRepository = foodDonationRepository;
	}
} 