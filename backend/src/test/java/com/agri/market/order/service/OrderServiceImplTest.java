package com.agri.market.order.service;

import com.agri.market.address.entity.Address;
import com.agri.market.address.mapper.AddressMapper;
import com.agri.market.address.repository.AddressRepository;
import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.delivery.repository.DeliveryRepository;
import com.agri.market.email.service.EmailService;
import com.agri.market.inventory.entity.Inventory;
import com.agri.market.inventory.repository.InventoryRepository;
import com.agri.market.order.dto.OrderResponseDto;
import com.agri.market.order.dto.OrderStatusUpdateRequestDto;
import com.agri.market.order.dto.PlaceOrderRequestDto;
import com.agri.market.order.entity.Order;
import com.agri.market.order.entity.OrderItem;
import com.agri.market.order.entity.OrderStatus;
import com.agri.market.order.mapper.OrderMapper;
import com.agri.market.order.repository.OrderAddressSnapshotRepository;
import com.agri.market.order.repository.OrderRepository;
import com.agri.market.payment.service.PaymentService;
import com.agri.market.product.entity.Product;
import com.agri.market.product.entity.ProductStatus;
import com.agri.market.product.repository.ProductRepository;
import com.agri.market.user.entity.User;
import com.agri.market.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderServiceImpl")
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderAddressSnapshotRepository orderAddressSnapshotRepository;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private AddressMapper addressMapper;

    @Mock
    private PaymentService paymentService;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Nested
    @DisplayName("placeOrder")
    class PlaceOrderTests {

        @Test
        void shouldPlaceOrderSuccessfullyWhenStockIsAvailable() {
            final String userId = "user-1";
            final String productId = "prod-1";
            final String addressId = "addr-1";

            final PlaceOrderRequestDto request = new PlaceOrderRequestDto();
            request.setProductId(productId);
            request.setAddressId(addressId);
            request.setQuantity(new BigDecimal("5.00"));

            final User user = User.builder().id(userId).build();
            final Product product = Product.builder()
                    .id(productId)
                    .status(ProductStatus.ACTIVE.name())
                    .price(new BigDecimal("100.00"))
                    .build();

            final Address address = Address.builder()
                    .addressLine1("123 Farm Way")
                    .city("Hubli")
                    .build();
            address.setId(addressId);

            final Inventory inventory = Inventory.builder()
                    .product(product)
                    .totalQuantity(new BigDecimal("20.00"))
                    .reservedQuantity(new BigDecimal("2.00"))
                    .build();

            final Order savedOrder = Order.builder().build();
            savedOrder.setId("order-100");
            final OrderResponseDto responseDto = OrderResponseDto.builder().id("order-100").build();

            given(userRepository.findById(userId)).willReturn(Optional.of(user));
            given(productRepository.findById(productId)).willReturn(Optional.of(product));
            given(addressRepository.findByIdAndUserId(addressId, userId)).willReturn(Optional.of(address));
            given(inventoryRepository.findByProductIdForUpdate(productId)).willReturn(Optional.of(inventory));
            given(orderRepository.save(any(Order.class))).willReturn(savedOrder);
            given(orderMapper.toResponseDto(savedOrder)).willReturn(responseDto);

            final OrderResponseDto result = orderService.placeOrder(request, userId);

            assertThat(result).isSameAs(responseDto);
            assertThat(inventory.getTotalQuantity()).isEqualByComparingTo("20.00");
            assertThat(inventory.getReservedQuantity()).isEqualByComparingTo("7.00");
            assertThat(inventory.getTotalQuantity().subtract(inventory.getReservedQuantity()))
                    .isEqualByComparingTo("13.00");
            then(inventoryRepository).should().save(inventory);
            then(orderRepository).should().save(any(Order.class));
        }

        @Test
        void shouldThrowExceptionWhenProductStockIsInsufficient() {
            final String userId = "user-1";
            final String productId = "prod-1";
            final String addressId = "addr-1";

            final PlaceOrderRequestDto request = new PlaceOrderRequestDto();
            request.setProductId(productId);
            request.setAddressId(addressId);
            request.setQuantity(new BigDecimal("25.00"));

            final User user = User.builder().id(userId).build();
            final Product product = Product.builder()
                    .id(productId)
                    .status(ProductStatus.ACTIVE.name())
                    .price(new BigDecimal("100.00"))
                    .build();

            final Address address = Address.builder().build();
            address.setId(addressId);
            final Inventory inventory = Inventory.builder()
                    .totalQuantity(new BigDecimal("20.00"))
                    .reservedQuantity(BigDecimal.ZERO)
                    .build();

            given(userRepository.findById(userId)).willReturn(Optional.of(user));
            given(productRepository.findById(productId)).willReturn(Optional.of(product));
            given(addressRepository.findByIdAndUserId(addressId, userId)).willReturn(Optional.of(address));
            given(inventoryRepository.findByProductIdForUpdate(productId)).willReturn(Optional.of(inventory));

            assertThatThrownBy(() -> orderService.placeOrder(request, userId))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.INVENTORY_INSUFFICIENT_STOCK);

            assertThat(inventory.getTotalQuantity()).isEqualByComparingTo("20.00");
            assertThat(inventory.getReservedQuantity()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        void shouldRejectOrderWhenStockIsFullyReserved() {
            final String userId = "user-1";
            final String productId = "prod-1";
            final String addressId = "addr-1";

            final PlaceOrderRequestDto request = new PlaceOrderRequestDto();
            request.setProductId(productId);
            request.setAddressId(addressId);
            request.setQuantity(new BigDecimal("1.00"));

            final User user = User.builder().id(userId).build();
            final Product product = Product.builder()
                    .id(productId)
                    .status(ProductStatus.ACTIVE.name())
                    .price(new BigDecimal("100.00"))
                    .build();

            final Address address = Address.builder().build();
            address.setId(addressId);
            final Inventory inventory = Inventory.builder()
                    .totalQuantity(new BigDecimal("65.00"))
                    .reservedQuantity(new BigDecimal("65.00"))
                    .build();

            given(userRepository.findById(userId)).willReturn(Optional.of(user));
            given(productRepository.findById(productId)).willReturn(Optional.of(product));
            given(addressRepository.findByIdAndUserId(addressId, userId)).willReturn(Optional.of(address));
            given(inventoryRepository.findByProductIdForUpdate(productId)).willReturn(Optional.of(inventory));

            assertThatThrownBy(() -> orderService.placeOrder(request, userId))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.INVENTORY_INSUFFICIENT_STOCK);

            assertThat(inventory.getTotalQuantity()).isEqualByComparingTo("65.00");
            assertThat(inventory.getReservedQuantity()).isEqualByComparingTo("65.00");
            assertThat(inventory.getTotalQuantity().subtract(inventory.getReservedQuantity()))
                    .isEqualByComparingTo("0.00");
        }

        @Test
        void shouldAccumulateMultipleReservationsWithoutModifyingTotalQuantity() {
            final String userId = "user-1";
            final String productId = "prod-1";
            final String addressId = "addr-1";

            final PlaceOrderRequestDto request1 = new PlaceOrderRequestDto();
            request1.setProductId(productId);
            request1.setAddressId(addressId);
            request1.setQuantity(new BigDecimal("5.00"));

            final PlaceOrderRequestDto request2 = new PlaceOrderRequestDto();
            request2.setProductId(productId);
            request2.setAddressId(addressId);
            request2.setQuantity(new BigDecimal("4.00"));

            final User user = User.builder().id(userId).build();
            final Product product = Product.builder()
                    .id(productId)
                    .status(ProductStatus.ACTIVE.name())
                    .price(new BigDecimal("100.00"))
                    .build();

            final Address address = Address.builder().addressLine1("123 Farm Way").city("Hubli").build();
            address.setId(addressId);

            final Inventory inventory = Inventory.builder()
                    .product(product)
                    .totalQuantity(new BigDecimal("20.00"))
                    .reservedQuantity(new BigDecimal("2.00"))
                    .build();

            final Order savedOrder = Order.builder().build();
            savedOrder.setId("order-100");
            final OrderResponseDto responseDto = OrderResponseDto.builder().id("order-100").build();

            given(userRepository.findById(userId)).willReturn(Optional.of(user));
            given(productRepository.findById(productId)).willReturn(Optional.of(product));
            given(addressRepository.findByIdAndUserId(addressId, userId)).willReturn(Optional.of(address));
            given(inventoryRepository.findByProductIdForUpdate(productId)).willReturn(Optional.of(inventory));
            given(orderRepository.save(any(Order.class))).willReturn(savedOrder);
            given(orderMapper.toResponseDto(savedOrder)).willReturn(responseDto);

            orderService.placeOrder(request1, userId);

            assertThat(inventory.getTotalQuantity()).isEqualByComparingTo("20.00");
            assertThat(inventory.getReservedQuantity()).isEqualByComparingTo("7.00");
            assertThat(inventory.getTotalQuantity().subtract(inventory.getReservedQuantity()))
                    .isEqualByComparingTo("13.00");

            orderService.placeOrder(request2, userId);

            assertThat(inventory.getTotalQuantity()).isEqualByComparingTo("20.00");
            assertThat(inventory.getReservedQuantity()).isEqualByComparingTo("11.00");
            assertThat(inventory.getTotalQuantity().subtract(inventory.getReservedQuantity()))
                    .isEqualByComparingTo("9.00");
        }

        @Test
        void shouldPropagateOptimisticLockExceptionWhenConcurrentUpdateDetected() {
            final String userId = "user-1";
            final String productId = "prod-1";
            final String addressId = "addr-1";

            final PlaceOrderRequestDto request = new PlaceOrderRequestDto();
            request.setProductId(productId);
            request.setAddressId(addressId);
            request.setQuantity(new BigDecimal("5.00"));

            final User user = User.builder().id(userId).build();
            final Product product = Product.builder()
                    .id(productId)
                    .status(ProductStatus.ACTIVE.name())
                    .price(new BigDecimal("100.00"))
                    .build();

            final Address address = Address.builder().build();
            address.setId(addressId);

            final Inventory inventory = Inventory.builder()
                    .product(product)
                    .totalQuantity(new BigDecimal("20.00"))
                    .reservedQuantity(BigDecimal.ZERO)
                    .version(1L)
                    .build();

            given(userRepository.findById(userId)).willReturn(Optional.of(user));
            given(productRepository.findById(productId)).willReturn(Optional.of(product));
            given(addressRepository.findByIdAndUserId(addressId, userId)).willReturn(Optional.of(address));
            given(inventoryRepository.findByProductIdForUpdate(productId)).willReturn(Optional.of(inventory));
            given(inventoryRepository.save(inventory))
                    .willThrow(new org.springframework.orm.ObjectOptimisticLockingFailureException(Inventory.class, "inv-1"));

            assertThatThrownBy(() -> orderService.placeOrder(request, userId))
                    .isInstanceOf(org.springframework.orm.ObjectOptimisticLockingFailureException.class);
        }

        @Test
        void shouldThrowExceptionWhenProductIsNotActive() {
            final String userId = "user-1";
            final String productId = "prod-1";
            final PlaceOrderRequestDto request = new PlaceOrderRequestDto();
            request.setProductId(productId);

            final User user = User.builder().id(userId).build();
            final Product product = Product.builder()
                    .id(productId)
                    .status(ProductStatus.INACTIVE.name())
                    .price(new BigDecimal("100.00"))
                    .build();

            given(userRepository.findById(userId)).willReturn(Optional.of(user));
            given(productRepository.findById(productId)).willReturn(Optional.of(product));

            assertThatThrownBy(() -> orderService.placeOrder(request, userId))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.PRODUCT_NOT_AVAILABLE);
        }
    }

    @Nested
    @DisplayName("getOrder and getMyOrders")
    class GetOrderTests {

        @Test
        void shouldGetOrderSuccessfully() {
            final String orderId = "order-1";
            final String userId = "user-1";
            final Order order = Order.builder().build();
            order.setId(orderId);
            final OrderResponseDto dto = OrderResponseDto.builder().id(orderId).build();

            given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.of(order));
            given(orderMapper.toResponseDto(order)).willReturn(dto);

            final OrderResponseDto result = orderService.getOrder(orderId, userId);

            assertThat(result).isSameAs(dto);
        }

        @Test
        void shouldReturnMyOrdersList() {
            final String userId = "user-1";
            final Order order = Order.builder().build();
            order.setId("order-1");
            final OrderResponseDto dto = OrderResponseDto.builder().id("order-1").build();

            given(orderRepository.findAllByUserIdOrderByCreatedDateDesc(userId)).willReturn(List.of(order));
            given(orderMapper.toResponseDto(order)).willReturn(dto);

            final List<OrderResponseDto> result = orderService.getMyOrders(userId);

            assertThat(result).containsExactly(dto);
        }
    }

    @Nested
    @DisplayName("updateOrderStatus")
    class UpdateOrderStatusTests {

        @Test
        void shouldUpdateOrderStatusSuccessfully() {
            final String orderId = "order-1";
            final String sellerId = "seller-1";
            final User seller = User.builder().id(sellerId).build();
            final Product product = Product.builder().farmer(seller).build();
            final OrderItem item = OrderItem.builder().product(product).build();

            final Order order = Order.builder()
                    .status(OrderStatus.CONFIRMED)
                    .items(new ArrayList<>(List.of(item)))
                    .build();
            order.setId(orderId);

            final OrderStatusUpdateRequestDto request = new OrderStatusUpdateRequestDto();
            request.setStatus(OrderStatus.PROCESSING);

            final OrderResponseDto dto = OrderResponseDto.builder().id(orderId).status(OrderStatus.PROCESSING).build();

            given(orderRepository.findById(orderId)).willReturn(Optional.of(order));
            given(orderRepository.save(order)).willReturn(order);
            given(orderMapper.toResponseDto(order)).willReturn(dto);

            final OrderResponseDto result = orderService.updateOrderStatus(orderId, sellerId, request);

            assertThat(result).isSameAs(dto);
            assertThat(order.getStatus()).isEqualTo(OrderStatus.PROCESSING);
        }

        @Test
        void shouldThrowExceptionWhenSellerDoesNotOwnItemsInOrder() {
            final String orderId = "order-1";
            final User actualSeller = User.builder().id("actual-seller").build();
            final Product product = Product.builder().farmer(actualSeller).build();
            final OrderItem item = OrderItem.builder().product(product).build();

            final Order order = Order.builder()
                    .status(OrderStatus.CONFIRMED)
                    .items(new ArrayList<>(List.of(item)))
                    .build();
            order.setId(orderId);

            final OrderStatusUpdateRequestDto request = new OrderStatusUpdateRequestDto();
            request.setStatus(OrderStatus.PROCESSING);

            given(orderRepository.findById(orderId)).willReturn(Optional.of(order));

            assertThatThrownBy(() -> orderService.updateOrderStatus(orderId, "wrong-seller", request))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.ORDER_ACCESS_DENIED);
        }

        @Test
        void shouldThrowExceptionWhenStatusTransitionIsInvalid() {
            final String orderId = "order-1";
            final String sellerId = "seller-1";
            final User seller = User.builder().id(sellerId).build();
            final Product product = Product.builder().farmer(seller).build();
            final OrderItem item = OrderItem.builder().product(product).build();

            final Order order = Order.builder()
                    .status(OrderStatus.DELIVERED)
                    .items(new ArrayList<>(List.of(item)))
                    .build();
            order.setId(orderId);

            final OrderStatusUpdateRequestDto request = new OrderStatusUpdateRequestDto();
            request.setStatus(OrderStatus.CONFIRMED);

            given(orderRepository.findById(orderId)).willReturn(Optional.of(order));

            assertThatThrownBy(() -> orderService.updateOrderStatus(orderId, sellerId, request))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.ORDER_INVALID_STATUS_TRANSITION);
        }
    }

    @Nested
    @DisplayName("cancelOrder")
    class CancelOrderTests {

        @Test
        void shouldCancelPendingPaymentOrderAndReleaseReservation() {
            final String orderId = "order-1";
            final String userId = "user-1";
            final User user = User.builder().id(userId).email("user@mail.com").build();
            final User farmer = User.builder().id("f1").email("farmer@mail.com").build();

            final Product product = Product.builder().id("p1").name("Rice").farmer(farmer).build();
            final OrderItem item = OrderItem.builder().product(product).quantity(new BigDecimal("5.00")).unitPrice(new BigDecimal("50.00")).build();

            final Order order = Order.builder()
                    .user(user)
                    .status(OrderStatus.PENDING_PAYMENT)
                    .items(new ArrayList<>(List.of(item)))
                    .build();
            order.setId(orderId);

            final Inventory inventory = Inventory.builder()
                    .totalQuantity(new BigDecimal("20.00"))
                    .reservedQuantity(new BigDecimal("5.00"))
                    .build();

            given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.of(order));
            given(inventoryRepository.findByProductIdForUpdate("p1")).willReturn(Optional.of(inventory));

            orderService.cancelOrder(orderId, userId);

            assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
            assertThat(inventory.getTotalQuantity()).isEqualByComparingTo("20.00");
            assertThat(inventory.getReservedQuantity()).isEqualByComparingTo("0.00");
            assertThat(inventory.getTotalQuantity().subtract(inventory.getReservedQuantity()))
                    .isEqualByComparingTo("20.00");
            then(inventoryRepository).should().save(inventory);
            then(emailService).should().sendOrderCancellationEmail(user.getEmail(), orderId, "250.00");
        }

        @Test
        void shouldCancelConfirmedOrderAndRefundPayment() {
            final String orderId = "order-1";
            final String userId = "user-1";
            final User user = User.builder().id(userId).email("user@mail.com").build();

            final Order order = Order.builder()
                    .user(user)
                    .status(OrderStatus.CONFIRMED)
                    .items(new ArrayList<>())
                    .build();
            order.setId(orderId);

            given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.of(order));

            orderService.cancelOrder(orderId, userId);

            assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
            then(paymentService).should().refundPayment(orderId, userId);
        }
    }
}
