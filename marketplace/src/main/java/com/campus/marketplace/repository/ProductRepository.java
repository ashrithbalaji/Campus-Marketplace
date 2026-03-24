package com.campus.marketplace.repository;

import com.campus.marketplace.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAllByOrderByIdDesc();
    List<Product> findBySellerIdOrderByIdDesc(Long sellerId);
    
    // For Rule-Based Recommendation System
    List<Product> findTop4ByCategoryAndIdNotOrderByIdDesc(String category, Long id);
}