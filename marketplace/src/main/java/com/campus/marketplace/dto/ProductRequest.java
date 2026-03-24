package com.campus.marketplace.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private Long sellerId; // Expected to be populated from the authenticated context ideally, but for now we accept it as per basic requirements
}
