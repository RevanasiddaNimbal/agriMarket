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

//@Component
@RequiredArgsConstructor
@Slf4j
public class TemporarySeedsProductSeeder {

    private static final String CATEGORY_NAME = "Seeds";

    private static final String FARMER_EMAIL =
            "revanasiddanimbal82@gmail.com";

    private static final int MAX_PRODUCTS = 20;

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;

//    implements CommandLineRunner
//    @Override
//    public void run(String... args) {
//        seedSeeds();
//    }

    @Transactional
    protected void seedSeeds() {

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

        final List<SeedData> seeds = List.of(

                new SeedData(
                        "Paddy Seeds",
                        "Quality paddy seeds suitable for rice cultivation and agricultural crop production.",
                        "kg",
                        new BigDecimal("85.00"),
                        new BigDecimal("100"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSk6pn0rcpm1Y0ymH8i15tYmyWG54GYHGCloKhyZS22Iw&s"
                ),

                new SeedData(
                        "Maize Seeds",
                        "Maize seeds suitable for agricultural maize cultivation and grain production.",
                        "kg",
                        new BigDecimal("95.00"),
                        new BigDecimal("100"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKWSm-cofOWtEktPZBE-_u97OEP08VSCXL8cBYH2xwEw&s=10"
                ),

                new SeedData(
                        "Wheat Seeds",
                        "Wheat seeds suitable for wheat cultivation and agricultural grain production.",
                        "kg",
                        new BigDecimal("75.00"),
                        new BigDecimal("100"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfDM2eJGUtT2wJYMpilYm-iZow5DcN2dSDncwvJsBm1Q&s=10"
                ),

                new SeedData(
                        "Ragi Seeds",
                        "Finger millet seeds suitable for ragi cultivation and agricultural production.",
                        "kg",
                        new BigDecimal("110.00"),
                        new BigDecimal("80"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsDmyibcLCW_QrkeqXwik1ce-YYguR9cM-aHQo3tb0Jw&s=10"
                ),

                new SeedData(
                        "Jowar Seeds",
                        "Sorghum seeds suitable for agricultural cultivation and grain production.",
                        "kg",
                        new BigDecimal("90.00"),
                        new BigDecimal("90"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQl9ZNZ_be4yVx1hiO1hk7KZaxWA7ZdWegoc5lR56kDA&s=10"
                ),

                new SeedData(
                        "Bajra Seeds",
                        "Pearl millet seeds suitable for agricultural cultivation in suitable growing conditions.",
                        "kg",
                        new BigDecimal("95.00"),
                        new BigDecimal("90"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMyFxDSPkJQGISk8947BOYJFw9SNvc7vM5I1NmhnjLHA&s=10"
                ),

                new SeedData(
                        "Groundnut Seeds",
                        "Groundnut seeds suitable for peanut cultivation and agricultural oilseed production.",
                        "kg",
                        new BigDecimal("120.00"),
                        new BigDecimal("80"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT98fufSNK5MJVIoKJyFHoV-GFOn-1EJHWUQrh9Qlia-g&s=10"
                ),

                new SeedData(
                        "Soybean Seeds",
                        "Soybean seeds suitable for soybean cultivation and agricultural oilseed production.",
                        "kg",
                        new BigDecimal("100.00"),
                        new BigDecimal("90"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwgFJ_ir9epEEer3u3HftD1o06iIhjWNVsCaoTxdCGDg&s=10"
                ),

                new SeedData(
                        "Cotton Seeds",
                        "Cotton seeds suitable for agricultural cotton cultivation and fibre production.",
                        "kg",
                        new BigDecimal("650.00"),
                        new BigDecimal("50"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRU2Ff5odpsue6EU-2dcLu7Vn3TetodKGONQz2EFC7Jrg&s=10"
                ),

                new SeedData(
                        "Chickpea Seeds",
                        "Chickpea seeds suitable for gram cultivation and agricultural pulse production.",
                        "kg",
                        new BigDecimal("105.00"),
                        new BigDecimal("90"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPSQeIDOR4Qpp9Xr4peafo3eJ_hIenBkXYiskZDMyXmw&s=10"
                ),

                new SeedData(
                        "Pigeon Pea Seeds",
                        "Pigeon pea seeds suitable for pulse cultivation and agricultural crop production.",
                        "kg",
                        new BigDecimal("120.00"),
                        new BigDecimal("80"),
                        "Karnataka, India",
                        "REPLACE_WITH_REAL_PIGEON_PEA_SEEDS_IMAGE_URL"
                ),

                new SeedData(
                        "Green Gram Seeds",
                        "Green gram seeds suitable for moong bean cultivation and pulse production.",
                        "kg",
                        new BigDecimal("130.00"),
                        new BigDecimal("80"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSo5o4_0TG2G2QYBjX9Nr5mLHCTIdy5c-zXOjY52iPF7w&s=10"
                ),

                new SeedData(
                        "Black Gram Seeds",
                        "Black gram seeds suitable for urad cultivation and agricultural pulse production.",
                        "kg",
                        new BigDecimal("125.00"),
                        new BigDecimal("80"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRls0cuhzjkTQ6AAubOz23dh4DiiPExPJkM0EdkT2YC5w&s=10"
                ),

                new SeedData(
                        "Mustard Seeds",
                        "Mustard seeds suitable for agricultural mustard cultivation and oilseed production.",
                        "kg",
                        new BigDecimal("90.00"),
                        new BigDecimal("75"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuAckQ08hoOJJpMa6Mw1C22qDzhiINC3lG41zzVtts4w&s=10"
                ),

                new SeedData(
                        "Sunflower Seeds",
                        "Sunflower seeds suitable for agricultural sunflower cultivation and oilseed production.",
                        "kg",
                        new BigDecimal("140.00"),
                        new BigDecimal("70"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJyVF2lKFr27R6EZ2bbW4pa7NlKLUeS_rdiwgST4hCfg&s=10"
                )
        );

        int createdCount = 0;

        for (SeedData seed : seeds) {

            if (createdCount >= MAX_PRODUCTS) {
                break;
            }

            if (productRepository
                    .existsByNameIgnoreCaseAndFarmer_Id(
                            seed.name(),
                            farmer.getId())) {

                log.info(
                        "Product already exists. Skipping: {}",
                        seed.name());

                continue;
            }

            final Product product =
                    Product.builder()
                            .farmer(farmer)
                            .category(category)
                            .name(seed.name())
                            .description(seed.description())
                            .price(seed.price())
                            .unit(seed.unit())
                            .quantity(seed.quantity())
                            .location(seed.location())
                            .status("ACTIVE")
                            .build();

            final Product savedProduct =
                    productRepository.save(product);

            final ProductImage productImage =
                    ProductImage.builder()
                            .product(savedProduct)
                            .imageUrl(seed.imageUrl())
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
                    "Created seed {}/{}: {} | Owner: {}",
                    createdCount,
                    MAX_PRODUCTS,
                    seed.name(),
                    farmer.getEmail());
        }

        log.info(
                "Seed seeding completed. Created: {}",
                createdCount);
    }

    private record SeedData(
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