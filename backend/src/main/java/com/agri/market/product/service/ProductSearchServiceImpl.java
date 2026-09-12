package com.agri.market.product.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.product.dto.ProductResponseDto;
import com.agri.market.product.dto.ProductSearchRequestDto;
import com.agri.market.product.dto.ProductSearchResponseDto;
import com.agri.market.product.entity.Product;
import com.agri.market.product.entity.ProductStatus;
import com.agri.market.product.mapper.ProductMapper;
import com.agri.market.product.repository.ProductRepository;
import com.agri.market.product.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductSearchServiceImpl
        implements ProductSearchService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional(readOnly = true)
    public ProductSearchResponseDto searchProducts(
            final ProductSearchRequestDto request
    ) {
        return searchProducts(request, true);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductSearchResponseDto searchProducts(
            final ProductSearchRequestDto request,
            final boolean activeOnly
    ) {
        log.info(
                "Searching products. Query: {}, Category: {}, MinPrice: {}, MaxPrice: {}, Unit: {}, Location: {}, Status: {}, ActiveOnly: {}",
                request.getQuery(),
                request.getCategoryId(),
                request.getMinPrice(),
                request.getMaxPrice(),
                request.getUnit(),
                request.getLocation(),
                request.getStatus(),
                activeOnly
        );

        final Specification<Product> specification =
                buildSpecification(
                        request,
                        null,
                        activeOnly
                );

        final Pageable pageable =
                buildPageable(request);

        final Page<Product> productPage =
                productRepository.findAll(
                        specification,
                        pageable
                );

        log.info(
                "Product search completed. Results: {}, Total: {}",
                productPage.getNumberOfElements(),
                productPage.getTotalElements()
        );

        return buildResponse(productPage);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductSearchResponseDto searchMyProducts(
            final ProductSearchRequestDto request,
            final String userId
    ) {
        log.info(
                "Searching products for authenticated user: {}",
                userId
        );

        if (userId == null || userId.isBlank()) {
            log.warn(
                    "Product search rejected because authenticated user ID is missing"
            );

            throw new BusinessException(
                    ErrorCode.USER_NOT_FOUND
            );
        }

        final Specification<Product> specification =
                buildSpecification(
                        request,
                        userId,
                        false
                );

        final Pageable pageable =
                buildPageable(request);

        final Page<Product> productPage =
                productRepository.findAll(
                        specification,
                        pageable
                );

        log.info(
                "User product search completed. User: {}, Results: {}, Total: {}",
                userId,
                productPage.getNumberOfElements(),
                productPage.getTotalElements()
        );

        return buildResponse(productPage);
    }

    private Specification<Product> buildSpecification(
            final ProductSearchRequestDto request,
            final String userId,
            final boolean activeOnly
    ) {
        Specification<Product> specification =
                (root, query, criteriaBuilder) -> null;

        if (request.getStatus() != null
                && !request.getStatus().isBlank()) {
            if (!"ALL".equalsIgnoreCase(request.getStatus().trim())) {
                specification = specification.and(
                        ProductSpecification.hasStatus(
                                parseStatus(request.getStatus())
                        )
                );
            }
        } else if (activeOnly) {
            specification = specification.and(
                    ProductSpecification.hasStatus(
                            ProductStatus.ACTIVE
                    )
            );
        }

        if (userId != null && !userId.isBlank()) {
            specification = specification.and(
                    ProductSpecification.belongsToUser(
                            userId
                    )
            );
        }

        specification = specification.and(
                ProductSpecification.hasCategory(
                        request.getCategoryId()
                )
        );

        specification = specification.and(
                ProductSpecification.search(
                        request.getQuery()
                )
        );

        specification = specification.and(
                ProductSpecification.priceGreaterThanOrEqualTo(
                        request.getMinPrice()
                )
        );

        specification = specification.and(
                ProductSpecification.priceLessThanOrEqualTo(
                        request.getMaxPrice()
                )
        );

        specification = specification.and(
                ProductSpecification.hasUnit(
                        request.getUnit()
                )
        );

        specification = specification.and(
                ProductSpecification.locationContains(
                        request.getLocation()
                )
        );

        return specification;
    }

    private ProductStatus parseStatus(
            final String status
    ) {
        try {
            return ProductStatus.valueOf(
                    status.trim().toUpperCase()
            );
        } catch (IllegalArgumentException exception) {
            log.warn(
                    "Invalid product status received: {}",
                    status
            );

            throw new BusinessException(
                    ErrorCode.INVALID_PRODUCT_STATUS
            );
        }
    }

    private Pageable buildPageable(
            final ProductSearchRequestDto request
    ) {
        final String sortField =
                resolveSortField(
                        request.getSortBy()
                );

        final Sort.Direction direction =
                resolveSortDirection(
                        request.getSortDirection()
                );

        return PageRequest.of(
                request.getPage(),
                request.getSize(),
                Sort.by(
                        direction,
                        sortField
                )
        );
    }

    private String resolveSortField(
            final String sortBy
    ) {
        if (sortBy == null || sortBy.isBlank()) {
            return "createdAt";
        }

        return switch (sortBy.trim()) {
            case "name" -> "name";
            case "price" -> "price";
            case "quantity" -> "quantity";
            case "createdAt" -> "createdAt";
            case "updatedAt" -> "updatedAt";
            default -> "createdAt";
        };
    }

    private Sort.Direction resolveSortDirection(
            final String sortDirection
    ) {
        if (sortDirection == null
                || sortDirection.isBlank()) {
            return Sort.Direction.DESC;
        }

        return "ASC".equalsIgnoreCase(
                sortDirection.trim()
        )
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
    }

    private ProductSearchResponseDto buildResponse(
            final Page<Product> productPage
    ) {
        final List<ProductResponseDto> products =
                productPage.getContent()
                        .stream()
                        .map(productMapper::toResponseDto)
                        .toList();

        return ProductSearchResponseDto.builder()
                .products(products)
                .page(productPage.getNumber())
                .size(productPage.getSize())
                .totalElements(
                        productPage.getTotalElements()
                )
                .totalPages(
                        productPage.getTotalPages()
                )
                .hasNext(
                        productPage.hasNext()
                )
                .hasPrevious(
                        productPage.hasPrevious()
                )
                .build();
    }
}