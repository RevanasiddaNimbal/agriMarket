package com.agri.market.admin.service;

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
@DisplayName("AdminProductImageServiceImpl")
class AdminProductImageServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductImageRepository productImageRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private ProductImageMapper productImageMapper;

    @InjectMocks
    private AdminProductImageServiceImpl adminProductImageService;

    @Nested
    @DisplayName("uploadImage")
    class UploadImageTests {

        @Test
        void shouldUploadImageSuccessfully() {
            final Product product = Product.builder().id("p1").build();
            final MockMultipartFile imageFile = new MockMultipartFile("image", "test.jpg", "image/jpeg", new byte[]{1, 2, 3});
            final ProductImageRequestDto request = ProductImageRequestDto.builder()
                    .image(imageFile)
                    .primary(true)
                    .displayOrder(1)
                    .build();

            final ProductImage existingPrimary = ProductImage.builder().id("old-primary").primary(true).build();
            final ProductImage savedImage = ProductImage.builder().id("img-1").build();
            final ProductImageResponseDto responseDto = ProductImageResponseDto.builder().id("img-1").build();

            given(productRepository.findById("p1")).willReturn(Optional.of(product));
            given(cloudinaryService.uploadProductImage(imageFile)).willReturn("https://cloud.com/test.jpg");
            given(productImageRepository.findByProduct_IdAndPrimaryTrue("p1")).willReturn(Optional.of(existingPrimary));
            given(productImageRepository.save(any(ProductImage.class))).willReturn(savedImage);
            given(productImageMapper.toResponseDto(savedImage)).willReturn(responseDto);

            final ProductImageResponseDto result = adminProductImageService.uploadImage("p1", request);

            assertThat(result).isSameAs(responseDto);
            then(productImageRepository).should().findByProduct_IdAndPrimaryTrue("p1");
        }

        @Test
        void shouldThrowExceptionWhenProductNotFound() {
            final MockMultipartFile imageFile = new MockMultipartFile("image", "test.jpg", "image/jpeg", new byte[]{1, 2, 3});
            final ProductImageRequestDto request = ProductImageRequestDto.builder().image(imageFile).build();

            given(productRepository.findById("p1")).willReturn(Optional.empty());

            assertThatThrownBy(() -> adminProductImageService.uploadImage("p1", request))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.PRODUCT_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("getProductImages and deleteImage")
    class OtherOperationsTests {

        @Test
        void shouldReturnProductImages() {
            final Product product = Product.builder().id("p1").build();
            final ProductImage image = ProductImage.builder().id("img-1").build();
            final ProductImageResponseDto dto = ProductImageResponseDto.builder().id("img-1").build();

            given(productRepository.findById("p1")).willReturn(Optional.of(product));
            given(productImageRepository.findAllByProduct_IdOrderByDisplayOrderAsc("p1")).willReturn(List.of(image));
            given(productImageMapper.toResponseDto(image)).willReturn(dto);

            final List<ProductImageResponseDto> result = adminProductImageService.getProductImages("p1");

            assertThat(result).containsExactly(dto);
        }

        @Test
        void shouldDeleteImageSuccessfully() {
            final Product product = Product.builder().id("p1").build();
            final ProductImage image = ProductImage.builder().id("img-1").imageUrl("https://cloud.com/img.jpg").build();

            given(productRepository.findById("p1")).willReturn(Optional.of(product));
            given(productImageRepository.findByIdAndProduct_Id("img-1", "p1")).willReturn(Optional.of(image));

            adminProductImageService.deleteImage("p1", "img-1");

            then(productImageRepository).should().delete(image);
        }
    }
}
