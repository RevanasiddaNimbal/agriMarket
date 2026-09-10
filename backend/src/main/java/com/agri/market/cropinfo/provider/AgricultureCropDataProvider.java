package com.agri.market.cropinfo.provider;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Component
public class AgricultureCropDataProvider {

    private final Map<String, AgricultureData> cropData = new HashMap<>();

    public AgricultureCropDataProvider() {
        register(
                new String[]{"rice", "paddy"},
                "Seed → Germination → Seedling → Tillering → Flowering → Grain Filling → Maturity",
                "Sow healthy seeds in well-prepared soil during the suitable local planting season.",
                "120-150 days",
                "Harvest when most grains are mature and the crop reaches the recommended maturity stage.",
                "20-35°C",
                "Blast, bacterial leaf blight, sheath blight",
                "Food, processing and other agricultural uses"
        );

        register(
                new String[]{"wheat"},
                "Seed → Germination → Seedling → Tillering → Stem Elongation → Flowering → Grain Filling → Maturity",
                "Sow healthy seed in well-prepared soil during the suitable local growing season.",
                "110-150 days",
                "Harvest when the crop reaches maturity and grains are sufficiently developed.",
                "15-25°C",
                "Rust, powdery mildew, loose smut",
                "Food, flour, processing and animal feed"
        );

        register(
                new String[]{"maize", "corn"},
                "Seed → Germination → Seedling → Vegetative Growth → Tasseling → Silking → Grain Filling → Maturity",
                "Sow quality seed in well-prepared soil with suitable moisture.",
                "80-120 days",
                "Harvest when cobs and grains reach the maturity required for the intended use.",
                "18-32°C",
                "Fall armyworm, stem borer, leaf blight",
                "Food, animal feed, starch and industrial products"
        );

        register(
                new String[]{"tomato"},
                "Seed → Seedling → Vegetative Growth → Flowering → Fruit Development → Ripening → Harvest",
                "Raise healthy seedlings and transplant them into well-prepared, well-drained soil.",
                "90-150 days",
                "Harvest fruits at the maturity stage suitable for fresh consumption or processing.",
                "18-30°C",
                "Early blight, late blight, bacterial wilt",
                "Fresh consumption, cooking, sauces and processing"
        );

        register(
                new String[]{"potato"},
                "Seed Tuber → Sprouting → Vegetative Growth → Tuber Formation → Tuber Bulking → Maturity",
                "Plant healthy seed tubers in loose, well-drained soil during the suitable growing season.",
                "80-120 days",
                "Harvest when plants mature and tuber skins become sufficiently firm.",
                "15-25°C",
                "Late blight, early blight, aphids",
                "Food, chips, starch and processed products"
        );

        register(
                new String[]{"onion"},
                "Seed → Germination → Seedling → Bulb Formation → Bulb Maturation → Harvest",
                "Sow seeds or transplant healthy seedlings into well-prepared, well-drained soil.",
                "100-150 days",
                "Harvest when bulbs mature and the tops begin to fall.",
                "13-25°C",
                "Thrips, purple blotch, downy mildew",
                "Cooking, fresh consumption and processing"
        );

        register(
                new String[]{"chilli", "chili", "green chilli"},
                "Seed → Seedling → Vegetative Growth → Flowering → Fruit Development → Ripening → Harvest",
                "Raise healthy seedlings and transplant them into fertile, well-drained soil.",
                "120-180 days",
                "Harvest green or mature fruits according to the intended market and maturity stage.",
                "20-30°C",
                "Thrips, aphids, fruit borer and leaf curl disease",
                "Spice, fresh vegetables, drying and processing"
        );

        register(
                new String[]{"groundnut", "peanut"},
                "Seed → Germination → Vegetative Growth → Flowering → Peg Formation → Pod Development → Maturity",
                "Sow quality seed in loose, well-drained soil with suitable moisture.",
                "100-140 days",
                "Harvest when pods are mature and kernels have developed sufficiently.",
                "20-30°C",
                "Leaf miner, aphids, tikka disease and rust",
                "Oil, food, snacks and animal feed"
        );

        register(
                new String[]{"cotton"},
                "Seed → Germination → Seedling → Vegetative Growth → Squaring → Flowering → Boll Development → Boll Opening",
                "Sow quality seed in suitable soil after proper field preparation.",
                "150-210 days",
                "Harvest mature opened bolls when cotton is sufficiently dry.",
                "21-30°C",
                "Bollworm, aphids, whitefly and leaf curl disease",
                "Textile fibre, cottonseed oil and related products"
        );

        register(
                new String[]{"sugarcane"},
                "Planting → Germination → Tillering → Grand Growth → Maturity → Harvest",
                "Plant healthy setts in prepared fertile soil during the suitable planting period.",
                "10-18 months",
                "Harvest when the crop reaches maturity and the required quality is achieved.",
                "20-35°C",
                "Early shoot borer, top borer and red rot",
                "Sugar, jaggery, ethanol and related products"
        );

        register(
                new String[]{"soybean"},
                "Seed → Germination → Seedling → Vegetative Growth → Flowering → Pod Formation → Seed Filling → Maturity",
                "Sow quality seed in well-prepared soil with suitable moisture.",
                "90-130 days",
                "Harvest when pods mature and leaves have largely fallen.",
                "20-30°C",
                "Stem fly, girdle beetle and rust",
                "Oil, food products and animal feed"
        );

        register(
                new String[]{"gram", "chickpea", "chana"},
                "Seed → Germination → Seedling → Branching → Flowering → Pod Formation → Seed Filling → Maturity",
                "Sow quality seed in well-prepared, well-drained soil during the suitable growing season.",
                "100-150 days",
                "Harvest when plants dry and pods become mature.",
                "15-25°C",
                "Pod borer, wilt and root rot",
                "Food, flour and animal feed"
        );

        register(
                new String[]{"banana"},
                "Planting → Vegetative Growth → Leaf Development → Flowering → Bunch Development → Maturity",
                "Plant healthy planting material in fertile, well-drained soil with adequate water.",
                "9-15 months",
                "Harvest bunches when fruits reach the appropriate maturity stage.",
                "20-35°C",
                "Banana weevil, aphids and sigatoka disease",
                "Fresh fruit, processing and food products"
        );

        register(
                new String[]{"mango"},
                "Flowering → Fruit Set → Fruit Development → Maturity → Harvest",
                "Plant healthy grafted plants in suitable, well-drained soil with adequate spacing.",
                "Several years to first commercial harvest; seasonal fruit development thereafter.",
                "Harvest fruits at the recommended maturity stage for the intended market.",
                "24-30°C",
                "Mango hopper, mealybug, powdery mildew and anthracnose",
                "Fresh fruit, juice, pulp, pickles and processing"
        );

        register(
                new String[]{"okra", "lady finger", "bhindi"},
                "Seed → Germination → Seedling → Vegetative Growth → Flowering → Pod Development → Harvest",
                "Sow quality seed directly in well-prepared fertile soil.",
                "50-70 days",
                "Harvest tender pods regularly before they become fibrous.",
                "24-32°C",
                "Shoot and fruit borer, jassids and yellow vein mosaic",
                "Fresh vegetable and processing"
        );

        register(
                new String[]{"brinjal", "eggplant", "aubergine"},
                "Seed → Seedling → Vegetative Growth → Flowering → Fruit Development → Harvest",
                "Raise healthy seedlings and transplant them into fertile, well-drained soil.",
                "100-150 days",
                "Harvest fruits when they reach marketable size and suitable maturity.",
                "22-30°C",
                "Shoot and fruit borer, aphids and bacterial wilt",
                "Fresh vegetable, cooking and processing"
        );
    }

    public AgricultureData find(String cropName) {
        if (!StringUtils.hasText(cropName)) {
            return AgricultureData.empty();
        }

        String normalized = normalize(cropName);

        AgricultureData data = cropData.get(normalized);

        if (data != null) {
            return data;
        }

        return AgricultureData.empty();
    }

    private void register(
            String[] names,
            String growthStages,
            String sowingInfo,
            String growingDuration,
            String harvestingInfo,
            String temperatureRequirements,
            String commonDiseases,
            String uses
    ) {
        AgricultureData data = new AgricultureData(
                growthStages,
                sowingInfo,
                growingDuration,
                harvestingInfo,
                temperatureRequirements,
                commonDiseases,
                uses
        );

        for (String name : names) {
            cropData.put(normalize(name), data);
        }
    }

    private String normalize(String value) {
        return value
                .trim()
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);
    }

    public record AgricultureData(
            String growthStages,
            String sowingInfo,
            String growingDuration,
            String harvestingInfo,
            String temperatureRequirements,
            String commonDiseases,
            String uses
    ) {
        public static AgricultureData empty() {
            return new AgricultureData(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
            );
        }
    }
}