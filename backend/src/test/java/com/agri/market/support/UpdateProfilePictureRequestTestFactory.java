package com.agri.market.support;

import com.agri.market.user.dto.UpdateProfilePictureRequestDto;
import org.springframework.mock.web.MockMultipartFile;

public final class UpdateProfilePictureRequestTestFactory {

    private UpdateProfilePictureRequestTestFactory() {
    }

    public static UpdateProfilePictureRequestDto validRequest() {

        MockMultipartFile profilePicture = new MockMultipartFile(
                "profilePicture",
                "profile.jpg",
                "image/jpeg",
                "test-image-content".getBytes()
        );

        return UpdateProfilePictureRequestDto.builder()
                .profilePicture(profilePicture)
                .build();
    }

    public static UpdateProfilePictureRequestDto invalidRequest() {

        MockMultipartFile profilePicture = new MockMultipartFile(
                "profilePicture",
                "profile.jpg",
                "image/jpeg",
                new byte[0]
        );

        return UpdateProfilePictureRequestDto.builder()
                .profilePicture(profilePicture)
                .build();
    }
}