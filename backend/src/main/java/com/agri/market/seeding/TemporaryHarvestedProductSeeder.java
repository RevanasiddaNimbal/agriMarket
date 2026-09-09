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
public class TemporaryHarvestedProductSeeder {

    private static final String CATEGORY_NAME = "Harvested Products";

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
//        seedHarvestedProducts();
//    }

    @Transactional
    protected void seedHarvestedProducts() {

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

        final List<HarvestedData> products = List.of(

                new HarvestedData(
                        "Tomato",
                        "Fresh tomatoes grown for agricultural and food market use.",
                        "kg",
                        new BigDecimal("45.00"),
                        new BigDecimal("250"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQutro4itUs0j6h25sUEQL-qduU5vjeHFLlptrkiclvyg&s=10"
                ),

                new HarvestedData(
                        "Onion",
                        "Fresh onions harvested from agricultural fields for food market supply.",
                        "kg",
                        new BigDecimal("35.00"),
                        new BigDecimal("300"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8-Rfd5snBJm_6Klj8M_H3xawf3JLYzvxf0TMTVScyKA&s"
                ),

                new HarvestedData(
                        "Potato",
                        "Fresh potatoes produced through agricultural cultivation and prepared for market sale.",
                        "kg",
                        new BigDecimal("32.00"),
                        new BigDecimal("250"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7oNjAeARN72bhJh7gUkQQPvSUbh33AOllDSm30wKzvQ&s=10"
                ),

                new HarvestedData(
                        "Green Chilli",
                        "Fresh green chilli produced through agricultural cultivation for food markets.",
                        "kg",
                        new BigDecimal("70.00"),
                        new BigDecimal("120"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmGeZVj509cwOmCR0gLtmZsJayeFC2yjtEfb28icI83w&s=10"
                ),

                new HarvestedData(
                        "Brinjal",
                        "Fresh brinjal harvested from agricultural farms for vegetable market supply.",
                        "kg",
                        new BigDecimal("40.00"),
                        new BigDecimal("150"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLtVbWj2xqaMP6U2qkbbpVwipB_7HMBMXYgnzFLbQRbQ&s=10"
                ),

                new HarvestedData(
                        "Okra",
                        "Fresh okra harvested from agricultural fields for vegetable market supply.",
                        "kg",
                        new BigDecimal("55.00"),
                        new BigDecimal("130"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgSU391YQGnb5IUAVCtgh7FytUDYAyow92vsrHohy6tg&s=10"
                ),

                new HarvestedData(
                        "Cabbage",
                        "Fresh cabbage produced through agricultural cultivation and supplied for food markets.",
                        "kg",
                        new BigDecimal("30.00"),
                        new BigDecimal("180"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqB-FyX9YZdbVcHmIbqaG_47oGJkFSs0fxWLMxopf7MA&s=10"
                ),

                new HarvestedData(
                        "Cauliflower",
                        "Fresh cauliflower harvested from agricultural farms for vegetable market supply.",
                        "kg",
                        new BigDecimal("45.00"),
                        new BigDecimal("160"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGAOyY1kxxMmiQCS9MPpIhqLjoFQ2SQ8cz-0DrweWDLg&s=10"
                ),

                new HarvestedData(
                        "Carrot",
                        "Fresh carrots produced through agricultural cultivation and prepared for market sale.",
                        "kg",
                        new BigDecimal("50.00"),
                        new BigDecimal("140"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUr5uhWDLp7Sr52wFxmtjB6GjkVQ7FH21AKbhUDbGVwQ&s=10"
                ),

                new HarvestedData(
                        "Beans",
                        "Fresh beans harvested from agricultural farms for vegetable market supply.",
                        "kg",
                        new BigDecimal("65.00"),
                        new BigDecimal("120"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMC3oYVyMjwnrBR5LXhoXphN1aYpg2OTjRZOi74XaQhg&s=10"
                )


        );

        int createdCount = 0;

        for (HarvestedData productData : products) {

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
                    "Created harvested product {}/{}: {} | Owner: {}",
                    createdCount,
                    MAX_PRODUCTS,
                    productData.name(),
                    farmer.getEmail());
        }

        log.info(
                "Harvested product seeding completed. Created: {}",
                createdCount);
    }

    private record HarvestedData(
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