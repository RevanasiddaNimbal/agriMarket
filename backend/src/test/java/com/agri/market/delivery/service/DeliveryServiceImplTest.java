package com.agri.market.delivery.service;

import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.delivery.dto.DeliveryOtpRequestDto;
import com.agri.market.delivery.dto.DeliveryOtpVerificationRequestDto;
import com.agri.market.delivery.dto.DeliveryResponseDto;
import com.agri.market.delivery.entity.Delivery;
import com.agri.market.delivery.mapper.DeliveryMapper;
import com.agri.market.delivery.repository.DeliveryRepository;
import com.agri.market.email.service.EmailService;
import com.agri.market.order.entity.Order;
import com.agri.market.order.entity.OrderItem;
import com.agri.market.order.entity.OrderStatus;
import com.agri.market.order.repository.OrderRepository;
import com.agri.market.product.entity.Product;
import com.agri.market.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
@DisplayName("DeliveryServiceImpl")
class DeliveryServiceImplTest {

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private DeliveryMapper deliveryMapper;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private DeliveryServiceImpl deliveryService;

    @Nested
    @DisplayName("getDelivery")
    class GetDeliveryTests {

        @Test
        void shouldGetDeliverySuccessfully() {
            final String orderId = "order-1";
            final String userId = "user-1";
            final Order order = Order.builder().build();
            order.setId(orderId);
            final Delivery delivery = Delivery.builder().id("del-1").order(order).build();
            final DeliveryResponseDto responseDto = DeliveryResponseDto.builder().id("del-1").build();

            given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.of(order));
            given(deliveryRepository.findByOrderId(orderId)).willReturn(Optional.of(delivery));
            given(deliveryMapper.toResponseDto(delivery)).willReturn(responseDto);

            final DeliveryResponseDto result = deliveryService.getDelivery(orderId, userId);

            assertThat(result).isSameAs(responseDto);
        }

        @Test
        void shouldThrowExceptionWhenOrderNotFound() {
            given(orderRepository.findByIdAndUserId("order-1", "user-1")).willReturn(Optional.empty());

            assertThatThrownBy(() -> deliveryService.getDelivery("order-1", "user-1"))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.ORDER_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("createDelivery")
    class CreateDeliveryTests {

        @Test
        void shouldCreateDeliverySuccessfully() {
            final Order order = Order.builder().build();
            order.setId("order-1");
            final Delivery savedDelivery = Delivery.builder().id("del-1").order(order).build();
            final DeliveryResponseDto responseDto = DeliveryResponseDto.builder().id("del-1").build();

            given(deliveryRepository.existsByOrderId("order-1")).willReturn(false);
            given(deliveryRepository.save(any(Delivery.class))).willReturn(savedDelivery);
            given(deliveryMapper.toResponseDto(savedDelivery)).willReturn(responseDto);

            final DeliveryResponseDto result = deliveryService.createDelivery(order);

            assertThat(result).isSameAs(responseDto);
        }

        @Test
        void shouldThrowExceptionWhenDeliveryAlreadyExists() {
            final Order order = Order.builder().build();
            order.setId("order-1");
            given(deliveryRepository.existsByOrderId("order-1")).willReturn(true);

            assertThatThrownBy(() -> deliveryService.createDelivery(order))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.DELIVERY_ALREADY_EXISTS);
        }
    }

    @Nested
    @DisplayName("generateDeliveryOtp and verifyDeliveryOtp")
    class OtpTests {

        @Test
        void shouldGenerateDeliveryOtpSuccessfully() {
            final String orderId = "order-1";
            final String userId = "user-1";
            final User user = User.builder().id(userId).email("user@mail.com").build();
            final Order order = Order.builder().user(user).status(OrderStatus.OUT_FOR_DELIVERY).build();
            order.setId(orderId);
            final Delivery delivery = Delivery.builder().id("del-1").order(order).otpVerified(false).build();

            final DeliveryOtpRequestDto request = new DeliveryOtpRequestDto();
            request.setOrderId(orderId);

            given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.of(order));
            given(deliveryRepository.findByOrderId(orderId)).willReturn(Optional.of(delivery));

            deliveryService.generateDeliveryOtp(request, userId);

            assertThat(delivery.getOtp()).isNotNull();
            assertThat(delivery.getOtpExpiresAt()).isAfter(LocalDateTime.now());
            then(deliveryRepository).should().save(delivery);
            then(emailService).should().sendDeliveryOtpEmail(eq("user@mail.com"), any());
        }

        @Test
        void shouldVerifyDeliveryOtpSuccessfully() {
            final String orderId = "order-1";
            final String userId = "user-1";
            final User user = User.builder().id(userId).email("user@mail.com").build();
            final User farmer = User.builder().id("farmer-1").email("farmer@mail.com").build();
            final Product product = Product.builder().farmer(farmer).build();
            final OrderItem item = OrderItem.builder().product(product).build();
            final Order order = Order.builder()
                    .user(user)
                    .status(OrderStatus.OUT_FOR_DELIVERY)
                    .items(List.of(item))
                    .build();
            order.setId(orderId);
            final Delivery delivery = Delivery.builder()
                    .id("del-1")
                    .order(order)
                    .otp("123456")
                    .otpExpiresAt(LocalDateTime.now().plusMinutes(5))
                    .otpVerified(false)
                    .build();

            final DeliveryOtpVerificationRequestDto request = new DeliveryOtpVerificationRequestDto();
            request.setOrderId(orderId);
            request.setOtp("123456");

            final DeliveryResponseDto responseDto = DeliveryResponseDto.builder().id("del-1").otpVerified(true).build();

            given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.of(order));
            given(deliveryRepository.findByOrderId(orderId)).willReturn(Optional.of(delivery));
            given(deliveryRepository.save(delivery)).willReturn(delivery);
            given(deliveryMapper.toResponseDto(delivery)).willReturn(responseDto);

            final DeliveryResponseDto result = deliveryService.verifyDeliveryOtp(request, userId);

            assertThat(result).isSameAs(responseDto);
            assertThat(delivery.isOtpVerified()).isTrue();
            assertThat(order.getStatus()).isEqualTo(OrderStatus.DELIVERED);
        }
    }
}
