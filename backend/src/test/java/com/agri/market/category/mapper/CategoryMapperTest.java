package com.agri.market.category.mapper;

import com.agri.market.category.dto.CategoryResponseDto;
import com.agri.market.category.entity.Category;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("CategoryMapper")
class CategoryMapperTest {

    private CategoryMapper categoryMapper;

    @BeforeEach
    void setUp() {
        categoryMapper = new CategoryMapper();
    }

    @Test
    void shouldMapCategoryToResponseDto() {
        final Category category = Category.builder()
                .id("cat-123")
                .name("Fertilizers")
                .build();

        final CategoryResponseDto dto = categoryMapper.toResponseDto(category);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo("cat-123");
        assertThat(dto.getName()).isEqualTo("Fertilizers");
    }
}
