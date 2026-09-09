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
public class TemporaryFarmEquipmentProductSeeder {
    private static final String CATEGORY_NAME = "Farm Equipment";

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
//        seedFarmEquipment();
//    }

    @Transactional
    protected void seedFarmEquipment() {

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

        final List<FarmEquipmentData> equipment = List.of(

                new FarmEquipmentData(
                        "Tractor",
                        "Agricultural tractor suitable for farm field preparation, cultivation, transportation and other farming operations.",
                        "unit",
                        new BigDecimal("650000.00"),
                        new BigDecimal("5"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY5Es2Fs91XXqU_RmBDwgGBTCFtEMjtdwfyMHazzvYtw&s"
                ),

                new FarmEquipmentData(
                        "Power Tiller",
                        "Compact agricultural power tiller suitable for field preparation, cultivation and small farm operations.",
                        "unit",
                        new BigDecimal("185000.00"),
                        new BigDecimal("8"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRltlKAENUcjBkjNTA_t5RElRCoNSB7En1_7DqWv-S9sQ&s=10"
                ),

                new FarmEquipmentData(
                        "Rotavator",
                        "Agricultural rotary tillage implement used for soil preparation and field cultivation.",
                        "unit",
                        new BigDecimal("125000.00"),
                        new BigDecimal("6"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjWa5GfBiCB3sq2cqBN0g7G58G0WWgqZZl9BayFXJf6w&s=10"
                ),

                new FarmEquipmentData(
                        "Cultivator",
                        "Farm cultivation implement used for soil preparation, weed control and field cultivation.",
                        "unit",
                        new BigDecimal("85000.00"),
                        new BigDecimal("8"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4kXD17-xa2iij01-4yiqDeLSDshMYIkFlnvUV0zcz_A&s=10"
                ),

                new FarmEquipmentData(
                        "Disc Plough",
                        "Agricultural tillage implement used for primary soil preparation and breaking hard soil.",
                        "unit",
                        new BigDecimal("95000.00"),
                        new BigDecimal("6"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYTWzSATvDkIk2ivkNxCTlgkUZI_uc3BXmjd6TtmS_PA&s=10"
                ),

                new FarmEquipmentData(
                        "Mouldboard Plough",
                        "Agricultural plough used for soil turning and primary field preparation.",
                        "unit",
                        new BigDecimal("78000.00"),
                        new BigDecimal("6"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9wYsGSlXSEueWQOcQyUseADik5cddWgCcJ7RfmxTtAA&s=10"
                ),

                new FarmEquipmentData(
                        "Seed Drill",
                        "Agricultural seeding equipment designed for uniform placement of seeds at suitable depth and spacing.",
                        "unit",
                        new BigDecimal("145000.00"),
                        new BigDecimal("5"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSylF_55eu_XBsvfjOouuC0X2b5aZvORBSkFxOHWh87zA&s=10"
                ),

                new FarmEquipmentData(
                        "Planter",
                        "Agricultural planting equipment used for accurate placement of seeds in prepared fields.",
                        "unit",
                        new BigDecimal("165000.00"),
                        new BigDecimal("5"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdJ2ozYxdshvIi8qu8NXXvfA3OtyqGflc6of5Kry8bug&s=10"
                ),

                new FarmEquipmentData(
                        "Paddy Transplanter",
                        "Agricultural machine designed for transplanting rice seedlings efficiently in paddy fields.",
                        "unit",
                        new BigDecimal("285000.00"),
                        new BigDecimal("4"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRP5lIFBy6LxqJrWlHRgj1NYs3vElsGOFVoRS7biSPmlA&s=10"
                ),

                new FarmEquipmentData(
                        "Sprayer Machine",
                        "Agricultural spraying equipment used for applying crop protection products and liquid agricultural inputs.",
                        "unit",
                        new BigDecimal("45000.00"),
                        new BigDecimal("10"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsB0cm9P1OOf_z_XllpBmtSsLIiZNEDOYRncLUYaMdQA&s=10"
                ),

                new FarmEquipmentData(
                        "Power Sprayer",
                        "Motorized agricultural sprayer suitable for applying liquid agricultural inputs to crops.",
                        "unit",
                        new BigDecimal("28000.00"),
                        new BigDecimal("12"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Iog_aOMl-r_V3eGVpm2G_XUl8VpisYzhqXSJbQ-L2A&s=10"
                ),

                new FarmEquipmentData(
                        "Knapsack Sprayer",
                        "Portable agricultural sprayer suitable for applying liquid agricultural inputs to crops.",
                        "unit",
                        new BigDecimal("4500.00"),
                        new BigDecimal("25"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbyBf9S_OIrBHwj0oJtWxbPQK3u-tjwVE7GNDqi5BEkg&s=10"
                ),

                new FarmEquipmentData(
                        "Water Pump",
                        "Agricultural water pumping equipment used for irrigation and farm water management.",
                        "unit",
                        new BigDecimal("32000.00"),
                        new BigDecimal("12"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHib_tL5S9KNZ5QDqd5Ms2xyZDB51KqayYRLc2NYTFNQ&s=10"
                ),

                new FarmEquipmentData(
                        "Submersible Pump",
                        "Water pumping equipment suitable for agricultural irrigation and groundwater extraction.",
                        "unit",
                        new BigDecimal("48000.00"),
                        new BigDecimal("10"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgO_uBpa_HghIb5a_1WulJOPWq5GLb62ohpQAVXxcnXA&s=10"
                ),

                new FarmEquipmentData(
                        "Chaff Cutter",
                        "Agricultural machine used for cutting fodder into smaller pieces for livestock feeding.",
                        "unit",
                        new BigDecimal("38000.00"),
                        new BigDecimal("8"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz4wllNSN2p_Q4X--1qpluHFfe85fm85ng1kAxsbcLyA&s=10"
                ),

                new FarmEquipmentData(
                        "Power Weeder",
                        "Agricultural machine used for weed control and soil cultivation between crop rows.",
                        "unit",
                        new BigDecimal("75000.00"),
                        new BigDecimal("8"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLtm_-tqilSq9IrTlAYH-XIHOPN4FY6f_i_6GVlsPNMg&s=10"
                ),

                new FarmEquipmentData(
                        "Reaper Machine",
                        "Agricultural harvesting machine used for cutting standing crops efficiently.",
                        "unit",
                        new BigDecimal("185000.00"),
                        new BigDecimal("5"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4M7DqBUk-npwn6r_vYOrflfDrlGOKLE_qSvCX2C3ACg&s=10"
                ),

                new FarmEquipmentData(
                        "Combine Harvester",
                        "Agricultural harvesting machine used for harvesting and processing grain crops in field operations.",
                        "unit",
                        new BigDecimal("1850000.00"),
                        new BigDecimal("2"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSYf__a0xyk5MBiBifMYfsDHiJ9vRUFGgupqwOYB0DxQ&s=10"
                ),

                new FarmEquipmentData(
                        "Thresher Machine",
                        "Agricultural machine used for separating grain from harvested crop material.",
                        "unit",
                        new BigDecimal("165000.00"),
                        new BigDecimal("5"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8lKk-n_WHrsglf_U64WUmUbUJGKDfLNB-aK0LA5uadQ&s=10"
                ),

                new FarmEquipmentData(
                        "Agricultural Trailer",
                        "Farm trailer used with tractors for transporting agricultural produce, inputs and farm materials.",
                        "unit",
                        new BigDecimal("175000.00"),
                        new BigDecimal("5"),
                        "Karnataka, India",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzGofF2MxON3sVzSVmTuoRSbDjBlWnHDviAOp3uqOGBw&s=10"
                )
        );

        int createdCount = 0;

        for (FarmEquipmentData equipmentData : equipment) {

            if (createdCount >= MAX_PRODUCTS) {
                break;
            }

            if (productRepository
                    .existsByNameIgnoreCaseAndFarmer_Id(
                            equipmentData.name(),
                            farmer.getId())) {

                log.info(
                        "Product already exists. Skipping: {}",
                        equipmentData.name());

                continue;
            }

            final Product product =
                    Product.builder()
                            .farmer(farmer)
                            .category(category)
                            .name(equipmentData.name())
                            .description(equipmentData.description())
                            .price(equipmentData.price())
                            .unit(equipmentData.unit())
                            .quantity(equipmentData.quantity())
                            .location(equipmentData.location())
                            .status("ACTIVE")
                            .build();

            final Product savedProduct =
                    productRepository.save(product);

            final ProductImage productImage =
                    ProductImage.builder()
                            .product(savedProduct)
                            .imageUrl(equipmentData.imageUrl())
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
                    "Created farm equipment {}/{}: {} | Owner: {}",
                    createdCount,
                    MAX_PRODUCTS,
                    equipmentData.name(),
                    farmer.getEmail());
        }

        log.info(
                "Farm equipment seeding completed. Created: {}",
                createdCount);
    }

    private record FarmEquipmentData(
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