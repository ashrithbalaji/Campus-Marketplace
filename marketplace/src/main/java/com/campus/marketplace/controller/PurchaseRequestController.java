package com.campus.marketplace.controller;

import com.campus.marketplace.dto.CreateRequestDto;
import com.campus.marketplace.model.PurchaseRequest;
import com.campus.marketplace.service.PurchaseRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PurchaseRequestController {

    private final PurchaseRequestService requestService;

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody CreateRequestDto dto) {
        try {
            PurchaseRequest request = requestService.createRequest(dto);
            return new ResponseEntity<>(request, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while sending the request.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<PurchaseRequest>> getRequestsForSeller(@PathVariable Long sellerId) {
        return new ResponseEntity<>(requestService.getRequestsForSeller(sellerId), HttpStatus.OK);
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<PurchaseRequest>> getMyPurchases(@PathVariable Long buyerId) {
        return new ResponseEntity<>(requestService.getMyPurchases(buyerId), HttpStatus.OK);
    }

    @PutMapping("/{requestId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long requestId,
            @RequestParam Long sellerId,
            @RequestBody Map<String, String> statusMap) {
        try {
            String newStatus = statusMap.get("status");
            if (newStatus == null) {
                return new ResponseEntity<>("Status is required.", HttpStatus.BAD_REQUEST);
            }
            PurchaseRequest request = requestService.updateRequestStatus(requestId, sellerId, newStatus);
            return new ResponseEntity<>(request, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while updating the status.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
