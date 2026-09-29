package com.agri.market.order.controller;

import com.agri.market.address.dto.AddressResponseDto;
import com.agri.market.order.dto.OrderResponseDto;
import com.agri.market.order.dto.OrderStatusUpdateRequestDto;
import com.agri.market.order.dto.OrderTrackingResponseDto;
import com.agri.market.order.dto.PlaceOrderRequestDto;
import com.agri.market.order.service.OrderService;
import com.agri.market.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(
        name = "Orders",
        description = "APIs for order management"
)
public class OrderController {

    private final OrderService orderService;

    @Operation(
            summary = "Place an order",
            description = "Creates an order after validating the selected product, quantity and delivery address."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Order placed successfully"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid order request"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "User is not authenticated"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Product or address not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Product unavailable or insufficient stock"
            )
    })
    @PostMapping
    public ResponseEntity<OrderResponseDto> placeOrder(
            @Valid @RequestBody final PlaceOrderRequestDto request,
            @AuthenticationPrincipal final User user
    ) {

        log.info(
                "Place order request received for user: {}, Product: {}",
                user.getId(),
                request.getProductId()
        );

        final OrderResponseDto response =
                orderService.placeOrder(
                        request,
                        user.getId()
                );

        log.info(
                "Order placed successfully. Order: {}, User: {}",
                response.getId(),
                user.getId()
        );

        return ResponseEntity
                .status(201)
                .body(response);
    }

    @Operation(
            summary = "Get current user's orders",
            description = "Returns all orders belonging to the authenticated user."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Orders retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "User is not authenticated"
            )
    })
    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getMyOrders(
            @AuthenticationPrincipal final User user
    ) {

        log.info(
                "Get orders request received for user: {}",
                user.getId()
        );

        final List<OrderResponseDto> response =
                orderService.getMyOrders(
                        user.getId()
                );

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get order by ID",
            description = "Returns an order belonging to the authenticated user."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Order retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "User is not authenticated"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Order not found"
            )
    })
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDto> getOrder(
            @PathVariable final String orderId,
            @AuthenticationPrincipal final User user
    ) {

        log.info(
                "Get order request received. Order: {}, User: {}",
                orderId,
                user.getId()
        );

        final OrderResponseDto response =
                orderService.getOrder(
                        orderId,
                        user.getId()
                );

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get order delivery address",
            description = "Returns the historical delivery address snapshot for the authenticated user's order."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Order address retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "User is not authenticated"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Order or snapshot address not found"
            )
    })
    @GetMapping("/{orderId}/address")
    public ResponseEntity<AddressResponseDto> getOrderAddress(
            @PathVariable final String orderId,
            @AuthenticationPrincipal final User user
    ) {

        log.info(
                "Get order address request received. Order: {}, User: {}",
                orderId,
                user.getId()
        );

        final AddressResponseDto response =
                orderService.getOrderAddress(
                        orderId,
                        user.getId()
                );

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Update order status",
            description = "Updates the status of an order for the authenticated seller."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Order status updated successfully"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid order status transition"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "User is not authenticated"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "User does not have access to the order"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Order not found"
            )
    })
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable final String orderId,
            @Valid @RequestBody final OrderStatusUpdateRequestDto request,
            @AuthenticationPrincipal final User user
    ) {

        log.info(
                "Order status update request received. Order: {}, User: {}",
                orderId,
                user.getId()
        );

        final OrderResponseDto response =
                orderService.updateOrderStatus(
                        orderId,
                        user.getId(),
                        request
                );

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Cancel order",
            description = "Cancels an order belonging to the authenticated user."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "Order cancelled successfully"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Order cannot be cancelled"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "User is not authenticated"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Order not found"
            )
    })
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable final String orderId,
            @AuthenticationPrincipal final User user
    ) {

        log.info(
                "Order cancellation request received. Order: {}, User: {}",
                orderId,
                user.getId()
        );

        orderService.cancelOrder(
                orderId,
                user.getId()
        );

        return ResponseEntity.noContent().build();
    }


    @Operation(
            summary = "Track my order",
            description = "Returns the current status and delivery information of an order belonging to the authenticated user."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Order tracking information retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "User is not authenticated"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Order not found"
            )
    })
    @GetMapping("/{orderId}/track")
    public ResponseEntity<OrderTrackingResponseDto> trackMyOrder(
            @PathVariable final String orderId,
            @AuthenticationPrincipal final User user
    ) {

        log.info(
                "Order tracking request received. Order: {}, User: {}",
                orderId,
                user.getId()
        );

        final OrderTrackingResponseDto response =
                orderService.trackMyOrder(
                        orderId,
                        user.getId()
                );

        return ResponseEntity.ok(response);
    }

}