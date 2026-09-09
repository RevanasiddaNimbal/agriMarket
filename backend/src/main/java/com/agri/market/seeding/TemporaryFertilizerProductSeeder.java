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
public class TemporaryFertilizerProductSeeder {

    private static final String CATEGORY_NAME = "Fertilizers";

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
//        seedFertilizers();
//    }

    @Transactional
    protected void seedFertilizers() {

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

        final List<FertilizerData> fertilizers = List.of(


                new FertilizerData(
                        "NPK 10-26-26 Fertilizer",
                        "Compound fertilizer supplying nitrogen, phosphorus and potassium for crop nutrition.",
                        "kg",
                        new BigDecimal("1250.00"),
                        new BigDecimal("110"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt8Hl040smbOjzQmfE4uqgdA7bpE8qI9pCU58bN-PORw&s=10"
                ),

                new FertilizerData(
                        "NPK 12-32-16 Fertilizer",
                        "Compound NPK fertilizer formulated to provide nitrogen, phosphorus and potassium nutrients.",
                        "kg",
                        new BigDecimal("1280.00"),
                        new BigDecimal("105"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW6VD23RdCah_4mp-G3A7JpeyyfI6GYRm3TzTiKczqoQ&s=10"
                ),

                new FertilizerData(
                        "NPK 19-19-19 Fertilizer",
                        "Balanced NPK fertilizer used for general agricultural crop nutrient management.",
                        "kg",
                        new BigDecimal("1450.00"),
                        new BigDecimal("100"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa15EEtCqCFjoq4SPtHDw71WuMPYzLf340PBBEs2B_lg&s=10"
                ),

                new FertilizerData(
                        "NPK 20-20-20 Fertilizer",
                        "Water-soluble balanced fertilizer providing nitrogen, phosphorus and potassium for crops.",
                        "kg",
                        new BigDecimal("1550.00"),
                        new BigDecimal("90"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVhSDm6-CMCVVTfVQUfMNxxCzGVyoWOAizvzSfhVME6w&s=10"
                ),

                new FertilizerData(
                        "Potassium Sulphate Fertilizer",
                        "Potassium and sulphur fertilizer used in agricultural crop nutrient management.",
                        "kg",
                        new BigDecimal("1750.00"),
                        new BigDecimal("80"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-1d2qFPjFD7lJEwF7xAZmPr6Noh32UmtabIdXgKNmRg&s=10"
                ),

                new FertilizerData(
                        "Potassium Nitrate Fertilizer",
                        "Water-soluble fertilizer supplying potassium and nitrogen to agricultural crops.",
                        "kg",
                        new BigDecimal("2100.00"),
                        new BigDecimal("75"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBJ1oB_F9UQ4vjkvOaaX8gcL04RATfsLdxgsle76xy-A&s=10"
                ),

                new FertilizerData(
                        "Calcium Nitrate Fertilizer",
                        "Water-soluble nitrogen and calcium fertilizer used for agricultural crop nutrition.",
                        "kg",
                        new BigDecimal("1800.00"),
                        new BigDecimal("85"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEgj7TptStq3rgtrZpFg9EnPhVQsi7PPWIQgwxdAMZPw&s=10"
                ),

                new FertilizerData(
                        "Ammonium Sulphate Fertilizer",
                        "Nitrogen and sulphur fertilizer used for agricultural crop nutrient management.",
                        "kg",
                        new BigDecimal("650.00"),
                        new BigDecimal("125"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdGu5ILKsKx7z3mEOVjuyLuzZye-Vt-sXeDR_fqhy80w&s=10"
                ),

                new FertilizerData(
                        "Magnesium Sulphate Fertilizer",
                        "Magnesium and sulphur fertilizer used to support agricultural crop nutrient requirements.",
                        "kg",
                        new BigDecimal("700.00"),
                        new BigDecimal("100"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJkfHl9wmPBv7lEwFlnqm4KvVFDsNxnlwduO0pEA0TfQ&s=10"
                ),

                new FertilizerData(
                        "Zinc Sulphate Fertilizer",
                        "Micronutrient fertilizer supplying zinc for agricultural crop production.",
                        "kg",
                        new BigDecimal("850.00"),
                        new BigDecimal("95"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOW-6b9VzKFPC03uGgDHJ1P_a8egZGqM6PzkneQ1fBWQ&s=10"
                ),

                new FertilizerData(
                        "Ferrous Sulphate Fertilizer",
                        "Micronutrient fertilizer supplying iron for agricultural crop nutrient management.",
                        "kg",
                        new BigDecimal("600.00"),
                        new BigDecimal("90"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSmyXG4XkI_yKr5YhiiAIIyy_u4NlKJ25qEzySR3lUNA&s=10"
                ),

                new FertilizerData(
                        "Boron Fertilizer",
                        "Micronutrient fertilizer used to supply boron to agricultural crops.",
                        "kg",
                        new BigDecimal("950.00"),
                        new BigDecimal("70"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWgSrRFcStnMNKU25yGI2luLifb49KepdhTuF7ECForg&s=10"
                ),

                new FertilizerData(
                        "Organic Compost",
                        "Organic soil amendment used to improve soil organic matter and support agricultural crop production.",
                        "kg",
                        new BigDecimal("300.00"),
                        new BigDecimal("200"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGqTsHsGJTK9v2xd6bjaZZWL30Mz4RBn_FHwTxXJPMKg&s=10"
                ),

                new FertilizerData(
                        "Vermicompost",
                        "Organic fertilizer produced using earthworms and used for agricultural soil improvement.",
                        "kg",
                        new BigDecimal("350.00"),
                        new BigDecimal("180"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGxfIr3R0Xg6JZImwuv-B75hHNpMIGauZA1Qym0QW3uw&s=10"
                ),

                new FertilizerData(
                        "Neem Cake Fertilizer",
                        "Organic fertilizer derived from neem seed cake and used in agricultural soil management.",
                        "kg",
                        new BigDecimal("450.00"),
                        new BigDecimal("150"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCao1BSfKSiaswZagcWisJceotqwjEnppHOKDZWosX-Q&s=10"
                ),

                new FertilizerData(
                        "Rhizobium Bio Fertilizer",
                        "Microbial biofertilizer associated with biological nitrogen fixation in suitable agricultural crops.",
                        "kg",
                        new BigDecimal("550.00"),
                        new BigDecimal("60"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDqBre6Kdn10DCn3NJgqeACE2YYiDyvAFTUxaTkh8jyw&s=10"
                )
        );

        int createdCount = 0;

        for (FertilizerData fertilizer : fertilizers) {

            if (createdCount >= MAX_PRODUCTS) {
                break;
            }

            if (productRepository
                    .existsByNameIgnoreCaseAndFarmer_Id(
                            fertilizer.name(),
                            farmer.getId())) {

                log.info(
                        "Product already exists. Skipping: {}",
                        fertilizer.name());

                continue;
            }

            final Product product =
                    Product.builder()
                            .farmer(farmer)
                            .category(category)
                            .name(fertilizer.name())
                            .description(fertilizer.description())
                            .price(fertilizer.price())
                            .unit(fertilizer.unit())
                            .quantity(fertilizer.quantity())
                            .location(fertilizer.location())
                            .status("ACTIVE")
                            .build();

            final Product savedProduct =
                    productRepository.save(product);

            final ProductImage productImage =
                    ProductImage.builder()
                            .product(savedProduct)
                            .imageUrl(fertilizer.imageUrl())
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
                    "Created fertilizer {}/{}: {} | Owner: {}",
                    createdCount,
                    MAX_PRODUCTS,
                    fertilizer.name(),
                    farmer.getEmail());
        }

        log.info(
                "Fertilizer seeding completed. Created: {}",
                createdCount);
    }

    private record FertilizerData(
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