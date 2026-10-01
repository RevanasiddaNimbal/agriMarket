package com.agri.market.product.service;

import com.agri.market.category.entity.Category;
import com.agri.market.category.repository.CategoryRepository;
import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.inventory.entity.Inventory;
import com.agri.market.inventory.repository.InventoryRepository;
import com.agri.market.product.dto.ProductRequestDto;
import com.agri.market.product.dto.ProductResponseDto;
import com.agri.market.product.entity.Product;
import com.agri.market.product.entity.ProductStatus;
import com.agri.market.product.mapper.ProductMapper;
import com.agri.market.product.repository.ProductRepository;
import com.agri.market.product.specification.ProductSpecification;
import com.agri.market.user.entity.User;
import com.agri.market.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public ProductResponseDto createProduct(
            final ProductRequestDto request,
            final String userId
    ) {
        log.info(
                "Creating product for authenticated user: {}",
                userId
        );

        final User user = getUser(userId);
        final Category category = getCategory(
                request.getCategoryId()
        );

        final Product product = Product.builder()
                .farmer(user)
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .unit(request.getUnit())
                .location(request.getLocation())
                .status(ProductStatus.ACTIVE.name())
                .build();

        final Product savedProduct =
                productRepository.save(product);

        final Inventory inventory = Inventory.builder()
                .product(savedProduct)
                .totalQuantity(request.getQuantity() != null ? request.getQuantity() : java.math.BigDecimal.ZERO)
                .reservedQuantity(java.math.BigDecimal.ZERO)
                .build();

        inventoryRepository.save(inventory);

        log.info(
                "Inventory created successfully for product: {}",
                savedProduct.getId()
        );

        log.info(
                "Product created successfully: {}",
                savedProduct.getId()
        );

        return productMapper.toResponseDto(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDto> getAllProducts() {
        log.debug("Fetching all active products");

        final Specification<Product> specification =
                ProductSpecification.hasStatus(
                        ProductStatus.ACTIVE
                );

        return productRepository.findAll(specification)
                .stream()
                .map(productMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDto getProductById(
            final String productId
    ) {
        log.debug(
                "Fetching product: {}",
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
    @Transactional(readOnly = true)
    public List<ProductResponseDto> getMyProducts(
            final String userId
    ) {
        log.debug(
                "Fetching products for authenticated user: {}",
                userId
        );

        final Specification<Product> specification =
                ProductSpecification.belongsToUser(userId);

        return productRepository.findAll(specification)
                .stream()
                .map(productMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public ProductResponseDto updateProduct(
            final String productId,
            final ProductRequestDto request,
            final String userId
    ) {
        log.info(
                "Updating product: {} for authenticated user: {}",
                productId,
                userId
        );

        final Product product =
                productRepository
                        .findByIdAndFarmer_Id(
                                productId,
                                userId
                        )
                        .orElseThrow(() -> {
                            log.warn(
                                    "Product not found or not owned by user: {}",
                                    productId
                            );

                            return new BusinessException(
                                    ErrorCode.PRODUCT_NOT_FOUND
                            );
                        });

        final Category category =
                getCategory(request.getCategoryId());

        product.setCategory(category);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit());
        product.setLocation(request.getLocation());

        final Product updatedProduct =
                productRepository.save(product);

        if (request.getQuantity() != null) {
            final Inventory inventory = inventoryRepository.findByProductId(productId)
                    .orElseGet(() -> Inventory.builder()
                            .product(updatedProduct)
                            .reservedQuantity(java.math.BigDecimal.ZERO)
                            .build());
            inventory.setTotalQuantity(request.getQuantity());
            inventoryRepository.save(inventory);
        }

        log.info(
                "Product updated successfully: {}",
                productId
        );

        return productMapper.toResponseDto(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(
            final String productId,
            final String userId
    ) {
        log.info(
                "Deleting product: {} for authenticated user: {}",
                productId,
                userId
        );

        final Product product =
                productRepository
                        .findByIdAndFarmer_Id(
                                productId,
                                userId
                        )
                        .orElseThrow(() -> {
                            log.warn(
                                    "Product not found or not owned by user: {}",
                                    productId
                            );

                            return new BusinessException(
                                    ErrorCode.PRODUCT_NOT_FOUND
                            );
                        });

        productRepository.delete(product);

        log.info(
                "Product deleted successfully: {}",
                productId
        );
    }

    private User getUser(final String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn(
                            "Authenticated user not found: {}",
                            userId
                    );

                    return new BusinessException(
                            ErrorCode.USER_NOT_FOUND
                    );
                });
    }

    private Category getCategory(
            final String categoryId
    ) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> {
                    log.warn(
                            "Category not found: {}",
                            categoryId
                    );

                    return new BusinessException(
                            ErrorCode.CATEGORY_NOT_FOUND
                    );
                });
    }
}