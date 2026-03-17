package com.campus.marketplace.repository;

import com.campus.marketplace.model.PurchaseRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, Long> {
    List<PurchaseRequest> findByProductSellerId(Long sellerId);
    List<PurchaseRequest> findByBuyerId(Long buyerId);
    boolean existsByProductIdAndBuyerId(Long productId, Long buyerId);
    void deleteByProductId(Long productId);
}
