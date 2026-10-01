package com.agri.market.category.service;

import com.agri.market.category.dto.CategoryResponseDto;
import com.agri.market.category.entity.Category;
import com.agri.market.category.mapper.CategoryMapper;
import com.agri.market.category.repository.CategoryRepository;
import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoryServiceImpl")
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    @Nested
    @DisplayName("getAllCategories")
    class GetAllCategoriesTests {

        @Test
        void shouldReturnAllCategoriesSuccessfully() {
            final Category category = Category.builder()
                    .id("cat-1")
                    .name("Seeds")
                    .build();

            final CategoryResponseDto responseDto = CategoryResponseDto.builder()
                    .id("cat-1")
                    .name("Seeds")
                    .build();

            given(categoryRepository.findAll()).willReturn(List.of(category));
            given(categoryMapper.toResponseDto(category)).willReturn(responseDto);

            final List<CategoryResponseDto> result = categoryService.getAllCategories();

            assertThat(result).containsExactly(responseDto);
            then(categoryRepository).should().findAll();
            then(categoryMapper).should().toResponseDto(category);
        }

        @Test
        void shouldReturnEmptyListWhenNoCategoriesExist() {
            given(categoryRepository.findAll()).willReturn(List.of());

            final List<CategoryResponseDto> result = categoryService.getAllCategories();

            assertThat(result).isEmpty();
            then(categoryRepository).should().findAll();
        }
    }

    @Nested
    @DisplayName("getCategoryById")
    class GetCategoryByIdTests {

        @Test
        void shouldReturnCategoryWhenFound() {
            final String categoryId = "cat-123";
            final Category category = Category.builder()
                    .id(categoryId)
                    .name("Grains")
                    .build();

            final CategoryResponseDto responseDto = CategoryResponseDto.builder()
                    .id(categoryId)
                    .name("Grains")
                    .build();

            given(categoryRepository.findById(categoryId)).willReturn(Optional.of(category));
            given(categoryMapper.toResponseDto(category)).willReturn(responseDto);

            final CategoryResponseDto result = categoryService.getCategoryById(categoryId);

            assertThat(result).isSameAs(responseDto);
            then(categoryRepository).should().findById(categoryId);
            then(categoryMapper).should().toResponseDto(category);
        }

        @Test
        void shouldThrowExceptionWhenCategoryNotFound() {
            final String categoryId = "non-existent";
            given(categoryRepository.findById(categoryId)).willReturn(Optional.empty());

            assertThatThrownBy(() -> categoryService.getCategoryById(categoryId))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.CATEGORY_NOT_FOUND);

            then(categoryRepository).should().findById(categoryId);
        }
    }
}
