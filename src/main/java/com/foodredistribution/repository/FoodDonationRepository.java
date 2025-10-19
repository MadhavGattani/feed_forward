package com.foodredistribution.repository;

import com.foodredistribution.model.FoodDonation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;

@Repository
public interface FoodDonationRepository extends MongoRepository<FoodDonation, String> {
    List<FoodDonation> findByOrganizationId(String organizationId);
    List<FoodDonation> findByStatus(String status);
    List<FoodDonation> findByExpiryDateBeforeAndStatus(Date date, String status);
    List<FoodDonation> findByExpiryDateBeforeAndStatusNot(Date date, String status);
} 