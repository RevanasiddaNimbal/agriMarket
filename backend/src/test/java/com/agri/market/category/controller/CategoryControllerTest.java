package com.agri.market.category.controller;

import com.agri.market.category.dto.CategoryResponseDto;
import com.agri.market.category.service.CategoryService;
import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.common.handler.ApplicationExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoryController")
class CategoryControllerTest {

    private static final String BASE_URL = "/api/v1/categories";

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private CategoryController categoryController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(categoryController)
                .setControllerAdvice(new ApplicationExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("getAllCategories")
    class GetAllCategoriesTests {

        @Test
        void shouldReturnAllCategoriesSuccessfully() throws Exception {
            final CategoryResponseDto dto = CategoryResponseDto.builder()
                    .id("cat-1")
                    .name("Seeds")
                    .build();

            given(categoryService.getAllCategories()).willReturn(List.of(dto));

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value("cat-1"))
                    .andExpect(jsonPath("$[0].name").value("Seeds"));
        }
    }

    @Nested
    @DisplayName("getCategoryById")
    class GetCategoryByIdTests {

        @Test
        void shouldReturnCategoryWhenFound() throws Exception {
            final String categoryId = "cat-123";
            final CategoryResponseDto dto = CategoryResponseDto.builder()
                    .id(categoryId)
                    .name("Seeds")
                    .build();

            given(categoryService.getCategoryById(categoryId)).willReturn(dto);

            mockMvc.perform(get(BASE_URL + "/{id}", categoryId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(categoryId))
                    .andExpect(jsonPath("$.name").value("Seeds"));
        }

        @Test
        void shouldReturnNotFoundWhenCategoryDoesNotExist() throws Exception {
            final String categoryId = "non-existent";
            given(categoryService.getCategoryById(categoryId))
                    .willThrow(new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));

            mockMvc.perform(get(BASE_URL + "/{id}", categoryId))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value(ErrorCode.CATEGORY_NOT_FOUND.getCode()));
        }
    }
}
