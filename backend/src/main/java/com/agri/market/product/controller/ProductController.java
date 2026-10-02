package com.agri.market.product.controller;

import com.agri.market.address.dto.AddressResponseDto;
import com.agri.market.product.dto.ProductRequestDto;
import com.agri.market.product.dto.ProductResponseDto;
import com.agri.market.product.service.ProductService;
import com.agri.market.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Slf4j
@Tag(
        name = "Products",
        description = "APIs for product management and marketplace products"
)
public class ProductController {

    private final ProductService productService;

    @Operation(
            summary = "Create a product",
            description = "Creates a product for the authenticated user."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Product created successfully"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid product data"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "User is not authenticated"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Category not found"
            )
    })
    @PostMapping
    public ResponseEntity<ProductResponseDto> createProduct(
            @Valid @RequestBody final ProductRequestDto request,
            @AuthenticationPrincipal final User user
    ) {

        log.info(
                "Product creation request received for user: {}",
                user.getId()
        );

        final ProductResponseDto response =
                productService.createProduct(
                        request,
                        user.getId()
                );

        log.info(
                "Product created successfully for user: {}",
                user.getId()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @Operation(
            summary = "Get all products",
            description = "Returns all active products available in the marketplace."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Products retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "User is not authenticated"
            )
    })
    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getAllProducts() {

        log.info("Request received to fetch all active products");

        final List<ProductResponseDto> response =
                productService.getAllProducts();

        log.info(
                "Successfully fetched {} active products",
                response.size()
        );

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get product by ID",
            description = "Returns a product using its unique identifier."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Product retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Product not found"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "User is not authenticated"
            )
    })
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponseDto> getProductById(
            @PathVariable final String productId
    ) {

        log.info(
                "Request received to fetch product: {}",
                productId
        );

        final ProductResponseDto response =
                productService.getProductById(productId);

        log.info(
                "Successfully fetched product: {}",
                productId
        );

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get my products",
            description = "Returns products belonging only to the authenticated user."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User products retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "User is not authenticated"
            )
    })
    @GetMapping("/me")
    public ResponseEntity<List<ProductResponseDto>> getMyProducts(
            @AuthenticationPrincipal final User user
    ) {

        log.info(
                "Request received to fetch products for user: {}",
                user.getId()
        );

        final List<ProductResponseDto> response =
                productService.getMyProducts(
                        user.getId()
                );

        log.info(
                "Successfully fetched {} products for user: {}",
                response.size(),
                user.getId()
        );

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Update my product",
            description = "Updates a product only when it belongs to the authenticated user."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Product updated successfully"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid product data"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "User is not authenticated"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Product or category not found"
            )
    })
    @PatchMapping("/{productId}")
    public ResponseEntity<ProductResponseDto> updateProduct(
            @PathVariable final String productId,
            @Valid @RequestBody final ProductRequestDto request,
            @AuthenticationPrincipal final User user
    ) {

        log.info(
                "Product update request received for product: {} by user: {}",
                productId,
                user.getId()
        );

        final ProductResponseDto response =
                productService.updateProduct(
                        productId,
                        request,
                        user.getId()
                );

        log.info(
                "Product updated successfully: {}",
                productId
        );

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Delete my product",
            description = "Deletes a product only when it belongs to the authenticated user."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "Product deleted successfully"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "User is not authenticated"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Product not found or does not belong to the user"
            )
    })
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable final String productId,
            @AuthenticationPrincipal final User user
    ) {

        log.info(
                "Product deletion request received for product: {} by user: {}",
                productId,
                user.getId()
        );

        productService.deleteProduct(
                productId,
                user.getId()
        );

        log.info(
                "Product deleted successfully: {}",
                productId
        );

        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Get product location snapshot",
            description = "Returns location snapshot details for a specific product."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Product location retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Product not found"
            )
    })
    @GetMapping("/{productId}/location")
    public ResponseEntity<AddressResponseDto> getProductLocation(
            @PathVariable final String productId
    ) {

        log.info(
                "Request received to fetch location for product: {}",
                productId
        );

        final AddressResponseDto response =
                productService.getProductLocation(productId);

        log.info(
                "Successfully fetched location for product: {}",
                productId
        );

        return ResponseEntity.ok(response);
    }
}