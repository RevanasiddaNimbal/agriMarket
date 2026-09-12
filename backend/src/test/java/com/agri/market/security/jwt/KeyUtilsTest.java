package com.agri.market.security.jwt;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.security.PrivateKey;
import java.security.PublicKey;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("KeyUtils")
class KeyUtilsTest {

    @Test
    void shouldLoadPrivateKeyFromPemResource() throws Exception {
        PrivateKey privateKey = KeyUtils.loadPrivateKey("keys/local-only/private_key.pem");

        assertThat(privateKey).isNotNull();
        assertThat(privateKey.getAlgorithm()).isEqualTo("RSA");
    }

    @Test
    void shouldLoadPublicKeyFromPemResource() throws Exception {
        PublicKey publicKey = KeyUtils.loadPublicKey("keys/local-only/public_key.pem");

        assertThat(publicKey).isNotNull();
        assertThat(publicKey.getAlgorithm()).isEqualTo("RSA");
    }


    @Test
    void shouldRejectMissingKeyResource() {

        final String missingKeyPath =
                "keys/local-only/missing.pem";

        assertThatThrownBy(
                () -> KeyUtils.loadPrivateKey(missingKeyPath)
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage(
                        "Key file not found: " + missingKeyPath
                );
    }


}

