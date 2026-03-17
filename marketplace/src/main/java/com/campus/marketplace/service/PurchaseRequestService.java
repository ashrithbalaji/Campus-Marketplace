package com.campus.marketplace.service;

import com.campus.marketplace.dto.CreateRequestDto;
import com.campus.marketplace.model.Product;
import com.campus.marketplace.model.PurchaseRequest;
import com.campus.marketplace.model.User;
import com.campus.marketplace.repository.ProductRepository;
import com.campus.marketplace.repository.PurchaseRequestRepository;
import com.campus.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseRequestService {

    private final PurchaseRequestRepository requestRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public PurchaseRequest createRequest(CreateRequestDto dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        User buyer = userRepository.findById(dto.getBuyerId())
                .orElseThrow(() -> new IllegalArgumentException("Buyer not found"));
                
        if (product.getSeller().getId().equals(buyer.getId())) {
             throw new IllegalArgumentException("You cannot buy your own product.");
        }

        if (requestRepository.existsByProductIdAndBuyerId(product.getId(), buyer.getId())) {
             throw new IllegalArgumentException("You have already requested this item.");
        }

        PurchaseRequest request = new PurchaseRequest();
        request.setProduct(product);
        request.setBuyer(buyer);
        request.setStatus(PurchaseRequest.RequestStatus.PENDING);

        return requestRepository.save(request);
    }

    public List<PurchaseRequest> getRequestsForSeller(Long sellerId) {
        return requestRepository.findByProductSellerId(sellerId);
    }

    public List<PurchaseRequest> getMyPurchases(Long buyerId) {
        return requestRepository.findByBuyerId(buyerId);
    }

    public PurchaseRequest updateRequestStatus(Long requestId, Long sellerId, String status) {
        PurchaseRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        // Verify that the person updating the status is actually the seller of the product
        if (!request.getProduct().getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Only the seller can update the request status.");
        }

        try {
            PurchaseRequest.RequestStatus newStatus = PurchaseRequest.RequestStatus.valueOf(status.toUpperCase());
            request.setStatus(newStatus);
            return requestRepository.save(request);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status provided.");
        }
    }
}
