package com.agri.market.security.jwt;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public final class KeyUtils {

    private static final String RSA_ALGORITHM = "RSA";

    private static final String PRIVATE_KEY_BEGIN =
            "-----BEGIN PRIVATE KEY-----";

    private static final String PRIVATE_KEY_END =
            "-----END PRIVATE KEY-----";

    private static final String PUBLIC_KEY_BEGIN =
            "-----BEGIN PUBLIC KEY-----";

    private static final String PUBLIC_KEY_END =
            "-----END PUBLIC KEY-----";

    private KeyUtils() {
        // Utility class.
    }

    public static PrivateKey loadPrivateKey(
            final String resourcePath
    ) throws GeneralSecurityException, IOException {

        final byte[] keyBytes = decodePemKey(
                resourcePath,
                PRIVATE_KEY_BEGIN,
                PRIVATE_KEY_END
        );

        final PKCS8EncodedKeySpec keySpec =
                new PKCS8EncodedKeySpec(keyBytes);

        return KeyFactory
                .getInstance(RSA_ALGORITHM)
                .generatePrivate(keySpec);
    }

    public static PublicKey loadPublicKey(
            final String resourcePath
    ) throws GeneralSecurityException, IOException {

        final byte[] keyBytes = decodePemKey(
                resourcePath,
                PUBLIC_KEY_BEGIN,
                PUBLIC_KEY_END
        );

        final X509EncodedKeySpec keySpec =
                new X509EncodedKeySpec(keyBytes);

        return KeyFactory
                .getInstance(RSA_ALGORITHM)
                .generatePublic(keySpec);
    }

    private static byte[] decodePemKey(
            final String resourcePath,
            final String beginMarker,
            final String endMarker
    ) throws IOException {

        final String pem = readKeyFromFile(resourcePath);

        final String encodedKey = pem
                .replace(beginMarker, "")
                .replace(endMarker, "")
                .replaceAll("\\s", "");

        if (encodedKey.isBlank()) {
            throw new IllegalArgumentException(
                    "Key content is empty: " + resourcePath
            );
        }

        try {
            return Base64.getDecoder().decode(encodedKey);
        } catch (final IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Invalid Base64 key content: " + resourcePath,
                    exception
            );
        }
    }

    private static String readKeyFromFile(
            final String filePath
    ) throws IOException {

        final Path path = Path.of(filePath);

        if (!Files.exists(path)) {
            throw new IllegalArgumentException(
                    "Key file not found: " + filePath
            );
        }

        return Files.readString(
                path,
                StandardCharsets.UTF_8
        );
    }
}

