package com.agri.market.product.service;

import com.agri.market.address.dto.AddressResponseDto;
import com.agri.market.product.dto.ProductRequestDto;
import com.agri.market.product.dto.ProductResponseDto;

import java.util.List;

public interface ProductService {

    ProductResponseDto createProduct(
            ProductRequestDto request,
            String userId
    );

    List<ProductResponseDto> getAllProducts();

    ProductResponseDto getProductById(
            String productId
    );

    AddressResponseDto getProductLocation(
            String productId
    );

    List<ProductResponseDto> getMyProducts(
            String userId
    );

    ProductResponseDto updateProduct(
            String productId,
            ProductRequestDto request,
            String userId
    );

    void deleteProduct(
            String productId,
            String userId
    );
}