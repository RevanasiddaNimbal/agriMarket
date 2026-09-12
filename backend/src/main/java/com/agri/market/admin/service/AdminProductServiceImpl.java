package com.agri.market.admin.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.product.dto.ProductResponseDto;
import com.agri.market.product.dto.ProductSearchRequestDto;
import com.agri.market.product.dto.ProductSearchResponseDto;
import com.agri.market.product.entity.Product;
import com.agri.market.product.entity.ProductStatus;
import com.agri.market.product.mapper.ProductMapper;
import com.agri.market.product.repository.ProductRepository;
import com.agri.market.product.service.ProductSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminProductServiceImpl implements AdminProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final ProductSearchService productSearchService;

    @Override
    @Transactional(readOnly = true)
    public ProductSearchResponseDto searchProducts(
            final ProductSearchRequestDto request
    ) {
        log.info("Admin searching all products");

        final ProductSearchRequestDto searchRequest =
                ProductSearchRequestDto.builder()
                        .query(request.getQuery())
                        .categoryId(request.getCategoryId())
                        .minPrice(request.getMinPrice())
                        .maxPrice(request.getMaxPrice())
                        .unit(request.getUnit())
                        .location(request.getLocation())
                        .status(request.getStatus())
                        .page(request.getPage())
                        .size(request.getSize())
                        .sortBy(request.getSortBy())
                        .sortDirection(request.getSortDirection())
                        .build();

        final ProductSearchResponseDto response =
                productSearchService.searchProducts(searchRequest, false);

        log.info(
                "Admin product search completed. Total products: {}",
                response.getTotalElements()
        );

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDto getProductById(
            final String productId
    ) {
        log.info(
                "Admin fetching product: {}",
                productId
        );

        final Product product =
                productRepository.findById(productId)
                        .orElseThrow(() -> {
                            log.warn(
                                    "Product not found: {}",
                                    productId
                            );

                            return new BusinessException(
                                    ErrorCode.PRODUCT_NOT_FOUND
                            );
                        });

        return productMapper.toResponseDto(product);
    }

    @Override
    @Transactional
    public ProductResponseDto updateProductStatus(
            final String productId,
            final String status
    ) {
        log.info(
                "Admin updating product status. Product: {}, Status: {}",
                productId,
                status
        );

        final Product product =
                productRepository.findById(productId)
                        .orElseThrow(() -> {
                            log.warn(
                                    "Product not found: {}",
                                    productId
                            );

                            return new BusinessException(
                                    ErrorCode.PRODUCT_NOT_FOUND
                            );
                        });

        final ProductStatus productStatus;

        try {
            productStatus = ProductStatus.valueOf(
                    status.trim().toUpperCase()
            );
        } catch (IllegalArgumentException exception) {
            log.warn(
                    "Invalid product status: {}",
                    status
            );

            throw new BusinessException(
                    ErrorCode.INVALID_PRODUCT_STATUS
            );
        }

        product.setStatus(productStatus.name());

        final Product updatedProduct =
                productRepository.save(product);

        log.info(
                "Product status updated successfully. Product: {}, Status: {}",
                productId,
                productStatus
        );

        return productMapper.toResponseDto(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(
            final String productId
    ) {
        log.info(
                "Admin deleting product: {}",
                productId
        );

        final Product product =
                productRepository.findById(productId)
                        .orElseThrow(() -> {
                            log.warn(
                                    "Product not found: {}",
                                    productId
                            );

                            return new BusinessException(
                                    ErrorCode.PRODUCT_NOT_FOUND
                            );
                        });

        productRepository.delete(product);

        log.info(
                "Product deleted successfully by admin: {}",
                productId
        );
    }
}