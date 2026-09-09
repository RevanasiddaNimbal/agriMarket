package com.agri.market.seeding;

import com.agri.market.category.entity.Category;
import com.agri.market.category.repository.CategoryRepository;
import com.agri.market.inventory.entity.Inventory;
import com.agri.market.inventory.repository.InventoryRepository;
import com.agri.market.product.entity.Product;
import com.agri.market.product.entity.ProductImage;
import com.agri.market.product.repository.ProductImageRepository;
import com.agri.market.product.repository.ProductRepository;
import com.agri.market.user.entity.User;
import com.agri.market.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

// @Component
@RequiredArgsConstructor
@Slf4j
public class TemporaryPreHarvestingProductSeeder {

    private static final String CATEGORY_NAME = "Pre-Harvested Products";

    private static final String FARMER_EMAIL =
            "rrx2038@gmail.com";

    private static final int MAX_PRODUCTS = 20;

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;

//    implements CommandLineRunner
//    @Override
//    public void run(String... args) {
//        seedPreHarvestedProducts();
//    }

    @Transactional
    protected void seedPreHarvestedProducts() {

        final Category category =
                categoryRepository.findAll()
                        .stream()
                        .filter(existingCategory ->
                                existingCategory.getName()
                                        .equalsIgnoreCase(CATEGORY_NAME))
                        .findFirst()
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Category not found: "
                                                + CATEGORY_NAME));

        final User farmer =
                userRepository.findByEmailIgnoreCase(FARMER_EMAIL)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "User not found: "
                                                + FARMER_EMAIL));

        final List<PreHarvestedData> products = List.of(

                new PreHarvestedData(
                        "Fresh Tomato",
                        "Fresh tomatoes grown for agricultural and food market use.",
                        "kg",
                        new BigDecimal("45.00"),
                        new BigDecimal("250"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm-KiybgEemuwKp15LkAmByNL7VW1wiWEW7o0l6T08pg&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Onion",
                        "Fresh onions harvested from agricultural fields for food market supply.",
                        "kg",
                        new BigDecimal("35.00"),
                        new BigDecimal("300"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJbw04qCDoJ8LE2-Ov2yPurnJ2G_8MfghXjKTyOZEKAw&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Potato",
                        "Fresh potatoes produced through agricultural cultivation and prepared for market sale.",
                        "kg",
                        new BigDecimal("32.00"),
                        new BigDecimal("250"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZjhgo4rjnSN0BO6sQNNYtbgkJx9-KqIZPlYbTrU7BEA&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Green Chilli",
                        "Fresh green chilli produced through agricultural cultivation for food markets.",
                        "kg",
                        new BigDecimal("70.00"),
                        new BigDecimal("120"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQltvD4a5grRdezhF2DMLRtizqFbg_M3Snrd9XaSihPrg&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Brinjal",
                        "Fresh brinjal harvested from agricultural farms for vegetable market supply.",
                        "kg",
                        new BigDecimal("40.00"),
                        new BigDecimal("150"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRkF-LnxChf_85JHv9FHWrTfEC5JqaYp5EzTIe1E87-w&s"
                ),

                new PreHarvestedData(
                        "Fresh Okra",
                        "Fresh okra harvested from agricultural fields for vegetable market supply.",
                        "kg",
                        new BigDecimal("55.00"),
                        new BigDecimal("130"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgvuZJAFxX0tdsYqZfNONIJydx-g0NHW2kDD2b_OLsSw&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Cabbage",
                        "Fresh cabbage produced through agricultural cultivation and supplied for food markets.",
                        "kg",
                        new BigDecimal("30.00"),
                        new BigDecimal("180"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl9B0cIedtcaa_Dj48nXSsRQe4M4pgPlQp9U1t0wbpJA&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Cauliflower",
                        "Fresh cauliflower harvested from agricultural farms for vegetable market supply.",
                        "kg",
                        new BigDecimal("45.00"),
                        new BigDecimal("160"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6h0E9mvvRPIfSqIEPp8F5xay34IRhBKs3YlPeewH6og&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Carrot",
                        "Fresh carrots produced through agricultural cultivation and prepared for market sale.",
                        "kg",
                        new BigDecimal("50.00"),
                        new BigDecimal("140"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGL4kzlE3gyWEGnZhs-lnwmpv424k-meNqAr8ipzwmRQ&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Beans",
                        "Fresh beans harvested from agricultural farms for vegetable market supply.",
                        "kg",
                        new BigDecimal("65.00"),
                        new BigDecimal("120"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0FdXHWHz1PLlzhpmqN6DEACuMowL5q27bNTY4ThIXVw&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Green Peas",
                        "Fresh green peas produced through agricultural cultivation for food markets.",
                        "kg",
                        new BigDecimal("80.00"),
                        new BigDecimal("100"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5AzOSsBH0lmd4PAPXBxjykR4eDNsJCSVdTRwWezBq6w&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Cucumber",
                        "Fresh cucumber harvested from agricultural fields for vegetable market supply.",
                        "kg",
                        new BigDecimal("38.00"),
                        new BigDecimal("150"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTss3QwfEx8v7LHTuNfoIhWiFr6jXXihjkS8Bk0XdZVQ&s"
                ),

                new PreHarvestedData(
                        "Fresh Pumpkin",
                        "Fresh pumpkin produced through agricultural cultivation and prepared for market sale.",
                        "kg",
                        new BigDecimal("35.00"),
                        new BigDecimal("180"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-Owf_dJikbgAS9-m-_oDtJs8uxHkgyaP6mwiKARVq5Q&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Bitter Gourd",
                        "Fresh bitter gourd harvested from agricultural farms for vegetable market supply.",
                        "kg",
                        new BigDecimal("60.00"),
                        new BigDecimal("110"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT058JmTaR99dEJOQnAdS-79w95H34684_rvJ2NHLfDdQ&s"
                ),

                new PreHarvestedData(
                        "Fresh Bottle Gourd",
                        "Fresh bottle gourd produced through agricultural cultivation for food market supply.",
                        "kg",
                        new BigDecimal("35.00"),
                        new BigDecimal("150"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUCClQ6X1dyvQ6boePaBX3qoam3H5XryXWo3XafMdjlQ&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Ridge Gourd",
                        "Fresh ridge gourd harvested from agricultural fields for vegetable markets.",
                        "kg",
                        new BigDecimal("50.00"),
                        new BigDecimal("120"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSR_V_QwZ4Jy8omblOzMnSqyMF7YSBd4jDylHXjDGJHw&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Spinach",
                        "Fresh spinach grown and harvested as an agricultural leafy vegetable crop.",
                        "kg",
                        new BigDecimal("45.00"),
                        new BigDecimal("100"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUY7oetVaF3rNdzr54gVQtKCon50eeRm2PysVvrrBXiA&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Coriander",
                        "Fresh coriander harvested from agricultural farms for food and vegetable markets.",
                        "kg",
                        new BigDecimal("60.00"),
                        new BigDecimal("90"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4ITUxsWLBRnd5BdyqJss4UhyNETN5dXzl0Cac3td6nw&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Drumstick",
                        "Fresh drumstick pods harvested from agricultural farms for food market supply.",
                        "kg",
                        new BigDecimal("75.00"),
                        new BigDecimal("100"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyEjmv25pCORJLjQGDE1VUpGZp6Ly-Y6lsA-429pFhCA&s=10"
                ),

                new PreHarvestedData(
                        "Fresh Sweet Corn",
                        "Fresh sweet corn harvested from agricultural maize cultivation for food markets.",
                        "kg",
                        new BigDecimal("55.00"),
                        new BigDecimal("120"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRet6i4hYD6SBm2g3CHTF1Z4zQaMFcslk2yccjN4eBTnw&s=10"
                )
        );

        int createdCount = 0;

        for (PreHarvestedData productData : products) {

            if (createdCount >= MAX_PRODUCTS) {
                break;
            }

            if (productRepository
                    .existsByNameIgnoreCaseAndFarmer_Id(
                            productData.name(),
                            farmer.getId())) {

                log.info(
                        "Product already exists. Skipping: {}",
                        productData.name());

                continue;
            }

            final Product product =
                    Product.builder()
                            .farmer(farmer)
                            .category(category)
                            .name(productData.name())
                            .description(productData.description())
                            .price(productData.price())
                            .unit(productData.unit())
                            .quantity(productData.quantity())
                            .location(productData.location())
                            .status("ACTIVE")
                            .build();

            final Product savedProduct =
                    productRepository.save(product);

            final ProductImage productImage =
                    ProductImage.builder()
                            .product(savedProduct)
                            .imageUrl(productData.imageUrl())
                            .primary(true)
                            .displayOrder(0)
                            .build();

            productImageRepository.save(productImage);

            final Inventory inventory =
                    Inventory.builder()
                            .product(savedProduct)
                            .reservedQuantity(BigDecimal.ZERO)
                            .build();

            inventoryRepository.save(inventory);

            createdCount++;

            log.info(
                    "Created pre-harvested product {}/{}: {} | Owner: {}",
                    createdCount,
                    MAX_PRODUCTS,
                    productData.name(),
                    farmer.getEmail());
        }

        log.info(
                "Pre-harvested product seeding completed. Created: {}",
                createdCount);
    }

    private record PreHarvestedData(
            String name,
            String description,
            String unit,
            BigDecimal price,
            BigDecimal quantity,
            String location,
            String imageUrl
    ) {
    }
}