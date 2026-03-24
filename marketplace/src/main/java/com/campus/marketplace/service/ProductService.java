package com.campus.marketplace.service;

import com.campus.marketplace.dto.ProductRequest;
import com.campus.marketplace.model.Product;
import com.campus.marketplace.model.User;
import com.campus.marketplace.repository.ProductRepository;
import com.campus.marketplace.repository.PurchaseRequestRepository;
import com.campus.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final SpamDetectionService spamDetectionService;

    // uploadDir removed for Base64 image storage

    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByIdDesc();
    }

    public List<Product> getProductsBySeller(Long sellerId) {
        return productRepository.findBySellerIdOrderByIdDesc(sellerId);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    public Product addProduct(ProductRequest request, List<MultipartFile> images) throws IOException {
        User seller = userRepository.findById(request.getSellerId())
                .orElseThrow(() -> new IllegalArgumentException("Seller not found"));

        // AI Rule-Based Validation
        spamDetectionService.validateProductContent(request.getName(), request.getDescription());

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(request.getCategory());
        product.setSeller(seller);

        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile image : images) {
                if (image != null && !image.isEmpty()) {
                    String base64Image = java.util.Base64.getEncoder().encodeToString(image.getBytes());
                    imageUrls.add("data:" + image.getContentType() + ";base64," + base64Image);
                }
            }
            
            product.setImageUrls(imageUrls);
        }

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductRequest request, List<MultipartFile> images) throws IOException {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!product.getSeller().getId().equals(request.getSellerId())) {
            throw new IllegalArgumentException("You do not have permission to edit this product");
        }

        // AI Rule-Based Validation
        spamDetectionService.validateProductContent(request.getName(), request.getDescription());

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(request.getCategory());

        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile image : images) {
                if (image != null && !image.isEmpty()) {
                    String base64Image = java.util.Base64.getEncoder().encodeToString(image.getBytes());
                    imageUrls.add("data:" + image.getContentType() + ";base64," + base64Image);
                }
            }
            product.setImageUrls(imageUrls);
        }

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long productId, Long sellerId) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("You do not have permission to delete this product");
        }

        // Delete associated purchase requests first
        purchaseRequestRepository.deleteByProductId(productId);

        // Database deletion of cascade elements handled by Hibernate

        // Finally, delete the product entity
        productRepository.delete(product);
    }

    public void markAsSold(Long productId, Long sellerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("You do not have permission to modify this product");
        }

        product.setSold(true);
        productRepository.save(product);
    }

    public List<Product> getSimilarProducts(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        // Rule-Based "AI" Recommendation: Show up to 4 other items from the same category
        return productRepository.findTop4ByCategoryAndIdNotOrderByIdDesc(product.getCategory(), productId);
    }
}