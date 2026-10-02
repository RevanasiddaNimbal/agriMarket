package com.agri.market.product.service;

import com.agri.market.address.dto.AddressResponseDto;
import com.agri.market.address.entity.Address;
import com.agri.market.address.entity.AddressType;
import com.agri.market.address.entity.LocationType;
import com.agri.market.address.mapper.AddressMapper;
import com.agri.market.address.repository.AddressRepository;
import com.agri.market.category.entity.Category;
import com.agri.market.category.repository.CategoryRepository;
import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.inventory.entity.Inventory;
import com.agri.market.inventory.repository.InventoryRepository;
import com.agri.market.location.entity.Taluk;
import com.agri.market.location.repository.TalukRepository;
import com.agri.market.product.dto.NewLocationRequestDto;
import com.agri.market.product.dto.ProductRequestDto;
import com.agri.market.product.dto.ProductResponseDto;
import com.agri.market.product.entity.Product;
import com.agri.market.product.entity.ProductLocationSnapshot;
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
    private final AddressMapper addressMapper;
    private final AddressRepository addressRepository;
    private final InventoryRepository inventoryRepository;
    private final TalukRepository talukRepository;

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
        final Category category = getCategory(request.getCategoryId());
        final ProductLocationSnapshot locationSnapshot = buildLocationSnapshot(request, userId);

        final Product product = Product.builder()
                .farmer(user)
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .unit(request.getUnit())
                .locationSnapshot(locationSnapshot)
                .status(ProductStatus.ACTIVE.name())
                .build();

        final Product savedProduct = productRepository.save(product);

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
    public AddressResponseDto getProductLocation(
            final String productId
    ) {
        log.debug(
                "Fetching location snapshot for product: {}",
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

        return addressMapper.toSnapshotResponse(product.getLocationSnapshot());
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

        final Category category = getCategory(request.getCategoryId());
        product.setCategory(category);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit());

        final boolean hasLocationInfo = (request.getSavedAddressId() != null && !request.getSavedAddressId().isBlank())
                || request.getNewLocation() != null
                || (request.getLocation() != null && !request.getLocation().isBlank());

        if (hasLocationInfo) {
            final ProductLocationSnapshot newSnapshot = buildLocationSnapshot(request, userId);
            product.setLocationSnapshot(newSnapshot);
        }

        final Product updatedProduct = productRepository.save(product);

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

    private ProductLocationSnapshot buildLocationSnapshot(
            final ProductRequestDto request,
            final String userId
    ) {
        final boolean hasSavedAddressId = request.getSavedAddressId() != null && !request.getSavedAddressId().isBlank();
        final boolean hasNewLocation = request.getNewLocation() != null;
        final boolean hasLegacyLocation = request.getLocation() != null && !request.getLocation().isBlank();

        if (hasSavedAddressId && hasNewLocation) {
            log.warn("Both savedAddressId and newLocation provided");
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }

        if (hasSavedAddressId) {
            final Address address = addressRepository.findByIdAndUserId(request.getSavedAddressId(), userId)
                    .orElseThrow(() -> {
                        log.warn("Address not found or does not belong to user: {}", request.getSavedAddressId());
                        return new BusinessException(ErrorCode.ADDRESS_NOT_FOUND);
                    });

            return ProductLocationSnapshot.builder()
                    .addressLine1(address.getAddressLine1() != null ? address.getAddressLine1() : (address.getCity() != null ? address.getCity() : "Location"))
                    .addressLine2(address.getAddressLine2())
                    .village(address.getVillage())
                    .city(address.getCity() != null ? address.getCity() : "Unknown")
                    .district(address.getDistrict() != null ? address.getDistrict() : "Unknown")
                    .state(address.getState() != null ? address.getState() : "Karnataka")
                    .pincode(address.getPincode() != null ? address.getPincode() : "580001")
                    .country(address.getCountry() != null ? address.getCountry() : "India")
                    .latitude(address.getLatitude())
                    .longitude(address.getLongitude())
                    .locationType(address.getLocationType() != null ? address.getLocationType() : LocationType.MANUAL)
                    .addressType(address.getAddressType() != null ? address.getAddressType() : AddressType.FARM)
                    .taluk(address.getTaluk())
                    .build();
        }

        if (hasNewLocation) {
            final NewLocationRequestDto dto = request.getNewLocation();
            final String addr1 = dto.getAddressLine1() != null && !dto.getAddressLine1().isBlank()
                    ? dto.getAddressLine1()
                    : (dto.getCity() != null ? dto.getCity() : "Location");
            final String city = dto.getCity() != null && !dto.getCity().isBlank() ? dto.getCity() : "Unknown";
            final String district = dto.getDistrict() != null && !dto.getDistrict().isBlank() ? dto.getDistrict() : "Unknown";
            final String state = dto.getState() != null && !dto.getState().isBlank() ? dto.getState() : "Karnataka";

            Taluk taluk = null;
            if (dto.getCity() != null && !dto.getCity().isBlank()) {
                final String norm = normalizeLocation(dto.getCity());
                final List<Taluk> taluks = talukRepository.findActiveByNormalizedName(norm);
                if (!taluks.isEmpty()) {
                    taluk = taluks.getFirst();
                }
            }

            return ProductLocationSnapshot.builder()
                    .addressLine1(addr1)
                    .addressLine2(dto.getAddressLine2())
                    .village(dto.getVillage())
                    .city(city)
                    .district(district)
                    .state(state)
                    .pincode(dto.getPincode() != null ? dto.getPincode() : "580001")
                    .country(dto.getCountry() != null ? dto.getCountry() : "India")
                    .latitude(dto.getLatitude())
                    .longitude(dto.getLongitude())
                    .locationType(dto.getLocationType() != null ? dto.getLocationType() : LocationType.MAP)
                    .addressType(dto.getAddressType() != null ? dto.getAddressType() : AddressType.FARM)
                    .taluk(taluk)
                    .build();
        }

        if (hasLegacyLocation) {
            final String locStr = request.getLocation().trim();
            Taluk taluk = null;
            final String norm = normalizeLocation(locStr);
            final List<Taluk> taluks = talukRepository.findActiveByNormalizedName(norm);
            if (!taluks.isEmpty()) {
                taluk = taluks.getFirst();
            }

            final String district = taluk != null && taluk.getDistrict() != null ? taluk.getDistrict().getName() : "Unknown";
            final String state = taluk != null && taluk.getDistrict() != null && taluk.getDistrict().getState() != null ? taluk.getDistrict().getState().getName() : "Karnataka";

            return ProductLocationSnapshot.builder()
                    .addressLine1(locStr)
                    .city(taluk != null ? taluk.getName() : locStr)
                    .district(district)
                    .state(state)
                    .pincode("580001")
                    .country("India")
                    .locationType(LocationType.MANUAL)
                    .addressType(AddressType.FARM)
                    .taluk(taluk)
                    .build();
        }

        log.warn("No location provided in product request");
        throw new BusinessException(ErrorCode.VALIDATION_ERROR);
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

    private String normalizeLocation(
            final String location
    ) {
        if (location == null) {
            return "";
        }

        return location.trim()
                .toLowerCase()
                .replace(" ", "")
                .replace("-", "")
                .replace("_", "");
    }
}