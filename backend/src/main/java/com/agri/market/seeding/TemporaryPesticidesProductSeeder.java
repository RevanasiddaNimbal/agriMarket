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
public class TemporaryPesticidesProductSeeder {

    private static final String CATEGORY_NAME = "Pesticides";

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
//        seedPesticides();
//    }

    @Transactional
    protected void seedPesticides() {

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

        final List<PesticideData> pesticides = List.of(

                new PesticideData(
                        "Neem Oil Pesticide",
                        "Neem-based agricultural pesticide used for crop pest management.",
                        "litre",
                        new BigDecimal("450.00"),
                        new BigDecimal("50"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYcwHVLwTZWntvyUS_7ArK5EoP5fmlqWWKTXTi02BKMA&s=10"
                ),

                new PesticideData(
                        "Azadirachtin Pesticide",
                        "Botanical pesticide containing azadirachtin for agricultural pest management.",
                        "litre",
                        new BigDecimal("650.00"),
                        new BigDecimal("45"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXqH1b6I5pV3QEg1_4rFJuoAIh2S9XZ0cZ1ZpNVBcBhQ&s=10"
                ),

                new PesticideData(
                        "Imidacloprid Insecticide",
                        "Systemic insecticide used for managing insect pests in agricultural crops.",
                        "litre",
                        new BigDecimal("850.00"),
                        new BigDecimal("40"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqj8jWRud7cUaWzl4ErheqvUFi625dbwyqy6Yr_QxFWA&s=10"
                ),

                new PesticideData(
                        "Thiamethoxam Insecticide",
                        "Systemic insecticide used for agricultural crop pest management.",
                        "kg",
                        new BigDecimal("1200.00"),
                        new BigDecimal("35"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkiIMaNi3REFP5UgX3rSM0o3FdYU6x6bgF2zBPoTzr_A&s=10"
                ),

                new PesticideData(
                        "Acetamiprid Insecticide",
                        "Insecticide used to control sucking and other insect pests affecting agricultural crops.",
                        "kg",
                        new BigDecimal("950.00"),
                        new BigDecimal("40"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOfv3r6Pw3c7xR9t9ZpMRM6GUYWP5EuM7BR-wx3xg-0Q&s=10"
                ),

                new PesticideData(
                        "Chlorpyrifos Insecticide",
                        "Agricultural insecticide used for managing specified crop insect pests.",
                        "litre",
                        new BigDecimal("700.00"),
                        new BigDecimal("45"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcwky4cAiwBO9JwW6F_pOCRtUPGhIQ8ILGmYSNluCDNA&s=10"
                ),

                new PesticideData(
                        "Lambda Cyhalothrin Insecticide",
                        "Agricultural insecticide used for management of various insect pests.",
                        "litre",
                        new BigDecimal("780.00"),
                        new BigDecimal("40"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrrW5sDJv8kiQSwFVRub8v3iLICt-zHeRO-CW1Gm_EEQ&s=10"
                ),

                new PesticideData(
                        "Cypermethrin Insecticide",
                        "Agricultural insecticide used for controlling selected insect pests in crops.",
                        "litre",
                        new BigDecimal("620.00"),
                        new BigDecimal("50"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgp2r5_oEVerns1qkRVjZGt0SUyJ4lllS79BLMDhYx6g&s=10"
                ),

                new PesticideData(
                        "Spinosad Insecticide",
                        "Biologically derived insecticide used in agricultural pest management.",
                        "litre",
                        new BigDecimal("1450.00"),
                        new BigDecimal("30"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK3KYwOEQtEg4Sz6L0o548wt9e-G6MI43ctyA4ovZETw&s=10"
                ),

                new PesticideData(
                        "Emamectin Benzoate Insecticide",
                        "Insecticide used for agricultural management of selected caterpillar and insect pests.",
                        "kg",
                        new BigDecimal("1100.00"),
                        new BigDecimal("35"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjMXJQjRJaENu2-kDVKib7wNiQAh67EmpynOnmk7VITg&s=10"
                ),

                new PesticideData(
                        "Mancozeb Fungicide",
                        "Protective fungicide used for managing fungal diseases in agricultural crops.",
                        "kg",
                        new BigDecimal("650.00"),
                        new BigDecimal("60"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmAjt6k3yjAn56WpJm4fnlLeJ7ij00HeI9p7tDqZtHjA&s=10"
                ),

                new PesticideData(
                        "Carbendazim Fungicide",
                        "Systemic fungicide used for management of selected fungal diseases in crops.",
                        "kg",
                        new BigDecimal("720.00"),
                        new BigDecimal("50"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMmRXtj-4rb4AxWdaOoT6lFcnSI7tzbhT9mevlpQIseQ&s=10"
                ),

                new PesticideData(
                        "Copper Oxychloride Fungicide",
                        "Copper-based fungicide used for agricultural disease management.",
                        "kg",
                        new BigDecimal("580.00"),
                        new BigDecimal("55"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4zra8SgsH9YKeXzbyBq_IawaGeJVKwF8lOAztlNbBOw&s=10"
                ),

                new PesticideData(
                        "Sulphur Fungicide",
                        "Sulphur-based agricultural fungicide used for management of selected crop diseases.",
                        "kg",
                        new BigDecimal("420.00"),
                        new BigDecimal("70"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZSa1I6sT6IF4XnLb55svmSulJIL24x2FoXCkzyWzwbA&s=10"
                ),

                new PesticideData(
                        "Hexaconazole Fungicide",
                        "Systemic fungicide used for managing selected fungal diseases in agricultural crops.",
                        "litre",
                        new BigDecimal("900.00"),
                        new BigDecimal("40"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMI3WSswGnfATE8x7C5SckD0ozfoi1odVpvPXECPgwBA&s=10"
                ),

                new PesticideData(
                        "Glyphosate Herbicide",
                        "Herbicide used for weed management in agricultural production systems.",
                        "litre",
                        new BigDecimal("750.00"),
                        new BigDecimal("50"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6OmwDIOYMkBspB6c6DcS4ktwwTe20y6Do2nq4XSCq3g&s=10"
                ),

                new PesticideData(
                        "Atrazine Herbicide",
                        "Herbicide used for weed management in selected agricultural crops.",
                        "kg",
                        new BigDecimal("680.00"),
                        new BigDecimal("45"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNRUaBFRnVLBdcRUWf0ZzPpV24rQ_iF-kRj_4vCVE6og&s=10"
                ),

                new PesticideData(
                        "Pendimethalin Herbicide",
                        "Pre-emergence herbicide used for agricultural weed management.",
                        "litre",
                        new BigDecimal("850.00"),
                        new BigDecimal("40"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyQPyTAhy8a5pZxRPpq0CrA8ICaK4cQcvM6Pe-7tPdgw&s=10"
                ),

                new PesticideData(
                        "2,4-D Herbicide",
                        "Herbicide used for management of selected broadleaf weeds in agricultural crops.",
                        "litre",
                        new BigDecimal("550.00"),
                        new BigDecimal("55"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdlZ8r1BK0_oVbugNmhhLtwtGD0xIDW250VnAUQs8UUw&s=10"
                ),

                new PesticideData(
                        "Bacillus Thuringiensis Bio Pesticide",
                        "Microbial biological pesticide used for agricultural management of selected insect pests.",
                        "kg",
                        new BigDecimal("900.00"),
                        new BigDecimal("30"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcMFExmz2TUMG8yzezhl7ts0VmKQcnSU9hc1GJ3yWtBg&s=10"
                )
        );

        int createdCount = 0;

        for (PesticideData pesticide : pesticides) {

            if (createdCount >= MAX_PRODUCTS) {
                break;
            }

            if (productRepository
                    .existsByNameIgnoreCaseAndFarmer_Id(
                            pesticide.name(),
                            farmer.getId())) {

                log.info(
                        "Product already exists. Skipping: {}",
                        pesticide.name());

                continue;
            }

            final Product product =
                    Product.builder()
                            .farmer(farmer)
                            .category(category)
                            .name(pesticide.name())
                            .description(pesticide.description())
                            .price(pesticide.price())
                            .unit(pesticide.unit())
                            .quantity(pesticide.quantity())
                            .location(pesticide.location())
                            .status("ACTIVE")
                            .build();

            final Product savedProduct =
                    productRepository.save(product);

            final ProductImage productImage =
                    ProductImage.builder()
                            .product(savedProduct)
                            .imageUrl(pesticide.imageUrl())
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
                    "Created pesticide {}/{}: {} | Owner: {}",
                    createdCount,
                    MAX_PRODUCTS,
                    pesticide.name(),
                    farmer.getEmail());
        }

        log.info(
                "Pesticide seeding completed. Created: {}",
                createdCount);
    }

    private record PesticideData(
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