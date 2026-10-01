package com.agri.market.product.service;

import com.agri.market.cloudinary.service.CloudinaryService;
import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.product.dto.ProductImageRequestDto;
import com.agri.market.product.dto.ProductImageResponseDto;
import com.agri.market.product.entity.Product;
import com.agri.market.product.entity.ProductImage;
import com.agri.market.product.mapper.ProductImageMapper;
import com.agri.market.product.repository.ProductImageRepository;
import com.agri.market.product.repository.ProductRepository;
import com.agri.market.role.entity.Role;
import com.agri.market.support.UserTestFactory;
import com.agri.market.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductImageServiceImpl")
class ProductImageServiceImplTest {

    @Mock
    private ProductImageRepository productImageRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private ProductImageMapper productImageMapper;

    @InjectMocks
    private ProductImageServiceImpl productImageService;

    private User createAdminUser() {
        return User.builder()
                .id("admin-id")
                .roles(List.of(Role.builder().name("ADMIN").build()))
                .build();
    }

    @Nested
    @DisplayName("uploadImage")
    class UploadImageTests {

        @Test
        void shouldUploadImageSuccessfully() {
            final User farmer = UserTestFactory.activeUser();
            final Product product = Product.builder().id("p1").farmer(farmer).build();
            final MockMultipartFile imageFile = new MockMultipartFile("image", "test.jpg", "image/jpeg", new byte[]{1, 2, 3});
            final ProductImageRequestDto request = ProductImageRequestDto.builder()
                    .image(imageFile)
                    .primary(true)
                    .displayOrder(1)
                    .build();

            final ProductImage savedImage = ProductImage.builder().id("img-1").build();
            final ProductImageResponseDto responseDto = ProductImageResponseDto.builder().id("img-1").build();

            given(productRepository.findById("p1")).willReturn(Optional.of(product));
            given(cloudinaryService.uploadProductImage(imageFile)).willReturn("https://cloud.com/test.jpg");
            given(productImageRepository.findByProduct_IdAndPrimaryTrue("p1")).willReturn(Optional.empty());
            given(productImageRepository.save(any(ProductImage.class))).willReturn(savedImage);
            given(productImageMapper.toResponseDto(savedImage)).willReturn(responseDto);

            final ProductImageResponseDto result = productImageService.uploadImage("p1", request, farmer);

            assertThat(result).isSameAs(responseDto);
            then(productImageRepository).should().findByProduct_IdAndPrimaryTrue("p1");
        }

        @Test
        void shouldThrowExceptionWhenUserDoesNotOwnProductAndNotAdmin() {
            final User farmer = User.builder().id("owner").build();
            final User anotherUser = User.builder().id("stranger").roles(List.of(Role.builder().name("USER").build())).build();
            final Product product = Product.builder().id("p1").farmer(farmer).build();

            given(productRepository.findById("p1")).willReturn(Optional.of(product));

            final MockMultipartFile imageFile = new MockMultipartFile("image", "test.jpg", "image/jpeg", new byte[]{1, 2, 3});
            final ProductImageRequestDto request = ProductImageRequestDto.builder().image(imageFile).build();

            assertThatThrownBy(() -> productImageService.uploadImage("p1", request, anotherUser))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.PRODUCT_NOT_FOUND);
        }

        @Test
        void shouldAllowAdminToUploadImageForAnyProduct() {
            final User farmer = User.builder().id("owner").build();
            final User admin = createAdminUser();
            final Product product = Product.builder().id("p1").farmer(farmer).build();

            final MockMultipartFile imageFile = new MockMultipartFile("image", "test.jpg", "image/jpeg", new byte[]{1, 2, 3});
            final ProductImageRequestDto request = ProductImageRequestDto.builder()
                    .image(imageFile)
                    .primary(false)
                    .displayOrder(1)
                    .build();

            final ProductImage savedImage = ProductImage.builder().id("img-1").build();
            final ProductImageResponseDto responseDto = ProductImageResponseDto.builder().id("img-1").build();

            given(productRepository.findById("p1")).willReturn(Optional.of(product));
            given(cloudinaryService.uploadProductImage(imageFile)).willReturn("https://cloud.com/test.jpg");
            given(productImageRepository.save(any(ProductImage.class))).willReturn(savedImage);
            given(productImageMapper.toResponseDto(savedImage)).willReturn(responseDto);

            final ProductImageResponseDto result = productImageService.uploadImage("p1", request, admin);

            assertThat(result).isSameAs(responseDto);
        }

        @Test
        void shouldThrowExceptionWhenProductNotFound() {
            final User user = UserTestFactory.activeUser();
            final MockMultipartFile imageFile = new MockMultipartFile("image", "test.jpg", "image/jpeg", new byte[]{1, 2, 3});
            final ProductImageRequestDto request = ProductImageRequestDto.builder().image(imageFile).build();

            given(productRepository.findById("p1")).willReturn(Optional.empty());

            assertThatThrownBy(() -> productImageService.uploadImage("p1", request, user))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.PRODUCT_NOT_FOUND);
        }

        @Test
        void shouldThrowExceptionWhenFileIsInvalid() {
            final User farmer = UserTestFactory.activeUser();
            final Product product = Product.builder().id("p1").farmer(farmer).build();
            final MockMultipartFile emptyFile = new MockMultipartFile("image", "", "image/jpeg", new byte[0]);
            final ProductImageRequestDto request = ProductImageRequestDto.builder().image(emptyFile).build();

            given(productRepository.findById("p1")).willReturn(Optional.of(product));

            assertThatThrownBy(() -> productImageService.uploadImage("p1", request, farmer))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.INVALID_PRODUCT_IMAGE);
        }
    }

    @Nested
    @DisplayName("getProductImages")
    class GetProductImagesTests {

        @Test
        void shouldReturnImagesForProduct() {
            final Product product = Product.builder().id("p1").build();
            final ProductImage image = ProductImage.builder().id("img-1").build();
            final ProductImageResponseDto dto = ProductImageResponseDto.builder().id("img-1").build();

            given(productRepository.findById("p1")).willReturn(Optional.of(product));
            given(productImageRepository.findAllByProduct_IdOrderByDisplayOrderAsc("p1")).willReturn(List.of(image));
            given(productImageMapper.toResponseDto(image)).willReturn(dto);

            final List<ProductImageResponseDto> result = productImageService.getProductImages("p1");

            assertThat(result).containsExactly(dto);
        }

        @Test
        void shouldThrowExceptionWhenProductDoesNotExist() {
            given(productRepository.findById("p1")).willReturn(Optional.empty());

            assertThatThrownBy(() -> productImageService.getProductImages("p1"))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.PRODUCT_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("deleteImage")
    class DeleteImageTests {

        @Test
        void shouldDeleteImageSuccessfully() {
            final User farmer = UserTestFactory.activeUser();
            final Product product = Product.builder().id("p1").farmer(farmer).build();
            final ProductImage image = ProductImage.builder().id("img-1").product(product).imageUrl("https://cloud.com/test.jpg").build();

            given(productRepository.findById("p1")).willReturn(Optional.of(product));
            given(productImageRepository.findByIdAndProduct_Id("img-1", "p1")).willReturn(Optional.of(image));

            productImageService.deleteImage("p1", "img-1", farmer);

            then(productImageRepository).should().delete(image);
        }

        @Test
        void shouldThrowExceptionWhenImageNotFound() {
            final User farmer = UserTestFactory.activeUser();
            final Product product = Product.builder().id("p1").farmer(farmer).build();

            given(productRepository.findById("p1")).willReturn(Optional.of(product));
            given(productImageRepository.findByIdAndProduct_Id("img-1", "p1")).willReturn(Optional.empty());

            assertThatThrownBy(() -> productImageService.deleteImage("p1", "img-1", farmer))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.PRODUCT_IMAGE_NOT_FOUND);
        }
    }
}
