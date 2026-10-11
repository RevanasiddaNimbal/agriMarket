package com.agri.market.product.service;

import com.agri.market.product.dto.ProductSearchRequestDto;
import com.agri.market.product.dto.ProductSearchResponseDto;
import com.agri.market.product.entity.Product;
import com.agri.market.product.mapper.ProductMapper;
import com.agri.market.product.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductSearchServiceImpl")
class ProductSearchServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductSearchServiceImpl productSearchService;

    @Nested
    @DisplayName("searchProducts")
    class SearchProducts {

        @Test
        @DisplayName("should map sortBy createdAt to entity property createdDate")
        void shouldMapSortByCreatedAtToCreatedDate() {
            final ProductSearchRequestDto request = ProductSearchRequestDto.builder()
                    .sortBy("createdAt")
                    .sortDirection("DESC")
                    .page(0)
                    .size(20)
                    .build();

            final Page<Product> emptyPage = new PageImpl<>(Collections.emptyList());
            given(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .willReturn(emptyPage);

            final ProductSearchResponseDto response = productSearchService.searchProducts(request);

            assertThat(response).isNotNull();

            final ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
            then(productRepository).should().findAll(any(Specification.class), pageableCaptor.capture());

            final Pageable capturedPageable = pageableCaptor.getValue();
            assertThat(capturedPageable.getSort().getOrderFor("createdDate")).isNotNull();
            assertThat(capturedPageable.getSort().getOrderFor("createdDate").getDirection())
                    .isEqualTo(Sort.Direction.DESC);
        }

        @Test
        @DisplayName("should map sortBy updatedAt to entity property lastModifiedDate")
        void shouldMapSortByUpdatedAtToLastModifiedDate() {
            final ProductSearchRequestDto request = ProductSearchRequestDto.builder()
                    .sortBy("updatedAt")
                    .sortDirection("ASC")
                    .page(0)
                    .size(10)
                    .build();

            final Page<Product> emptyPage = new PageImpl<>(Collections.emptyList());
            given(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .willReturn(emptyPage);

            productSearchService.searchProducts(request);

            final ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
            then(productRepository).should().findAll(any(Specification.class), pageableCaptor.capture());

            final Pageable capturedPageable = pageableCaptor.getValue();
            assertThat(capturedPageable.getSort().getOrderFor("lastModifiedDate")).isNotNull();
            assertThat(capturedPageable.getSort().getOrderFor("lastModifiedDate").getDirection())
                    .isEqualTo(Sort.Direction.ASC);
        }

        @Test
        @DisplayName("should support price sorting directly")
        void shouldSupportPriceSorting() {
            final ProductSearchRequestDto request = ProductSearchRequestDto.builder()
                    .sortBy("price")
                    .sortDirection("ASC")
                    .page(0)
                    .size(10)
                    .build();

            final Page<Product> emptyPage = new PageImpl<>(Collections.emptyList());
            given(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .willReturn(emptyPage);

            productSearchService.searchProducts(request);

            final ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
            then(productRepository).should().findAll(any(Specification.class), pageableCaptor.capture());

            final Pageable capturedPageable = pageableCaptor.getValue();
            assertThat(capturedPageable.getSort().getOrderFor("price")).isNotNull();
        }
    }
}
