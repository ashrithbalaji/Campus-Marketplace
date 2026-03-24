package com.campus.marketplace.controller;

import com.campus.marketplace.dto.ProductRequest;
import com.campus.marketplace.model.Product;
import com.campus.marketplace.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return new ResponseEntity<>(productService.getAllProducts(), HttpStatus.OK);
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Product>> getProductsBySeller(@PathVariable Long sellerId) {
        return new ResponseEntity<>(productService.getProductsBySeller(sellerId), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        try {
            return new ResponseEntity<>(productService.getProductById(id), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}/similar")
    public ResponseEntity<List<Product>> getSimilarProducts(@PathVariable Long id) {
        try {
            return new ResponseEntity<>(productService.getSimilarProducts(id), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> addProduct(
            @ModelAttribute ProductRequest request,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        try {
            Product product = productService.addProduct(request, images);
            return new ResponseEntity<>(product, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while adding the product", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @ModelAttribute ProductRequest request,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        try {
            Product product = productService.updateProduct(id, request, images);
            return new ResponseEntity<>(product, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while updating the product", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, @RequestParam Long sellerId) {
        try {
            productService.deleteProduct(id, sellerId);
            return new ResponseEntity<>("Product deleted successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while deleting the product", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/sold")
    public ResponseEntity<?> markAsSold(@PathVariable Long id, @RequestParam Long sellerId) {
        try {
            productService.markAsSold(id, sellerId);
            return new ResponseEntity<>("Product marked as sold successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while marking product as sold", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}