package com.campus.marketplace.service;

import com.campus.marketplace.dto.ProductRequest;
import com.campus.marketplace.model.Product;
import com.campus.marketplace.model.User;
import com.campus.marketplace.repository.ProductRepository;
import com.campus.marketplace.repository.PurchaseRequestRepository;
import com.campus.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;

    @Value("${file.upload-dir:uploads/products}")
    private String uploadDir;

    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByIdDesc();
    }

    public Product addProduct(ProductRequest request, MultipartFile image) throws IOException {
        User seller = userRepository.findById(request.getSellerId())
                .orElseThrow(() -> new IllegalArgumentException("Seller not found"));

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setSeller(seller);

        if (image != null && !image.isEmpty()) {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            
            // Save file
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Set URL (assuming we'll expose the uploads directory statically)
            product.setImageUrl("/uploads/products/" + fileName);
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

        // Delete associated image file if it exists
        if (product.getImageUrl() != null) {
            String fileName = product.getImageUrl().substring(product.getImageUrl().lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir).resolve(fileName);
            Files.deleteIfExists(filePath);
        }

        // Finally, delete the product entity
        productRepository.delete(product);
    }
}