package com.foodredistribution.repository;

import com.foodredistribution.model.Organization;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface OrganizationRepository extends MongoRepository<Organization, String> {
    Optional<Organization> findByEmail(String email);
    boolean existsByEmail(String email);
}
