package com.agri.market.admin.service;

import com.agri.market.admin.dto.AdminUserDetailResponseDto;
import com.agri.market.admin.dto.AdminUserSearchRequestDto;
import com.agri.market.admin.dto.AdminUserStatusResponseDto;
import com.agri.market.admin.dto.AdminUserSummaryResponseDto;
import com.agri.market.admin.mapper.AdminUserMapper;
import com.agri.market.common.exception.BusinessException;
import com.agri.market.common.exception.ErrorCode;
import com.agri.market.user.entity.User;
import com.agri.market.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final AdminUserMapper adminUserMapper;

    @Override
    public Page<AdminUserSummaryResponseDto> searchUsers(
            final AdminUserSearchRequestDto request
    ) {
        final Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize()
        );

        final Specification<User> specification =
                buildUserSpecification(request);

        log.debug(
                "Admin user search requested: page={}, size={}, search={}, role={}, enabled={}, accountLocked={}, emailVerified={}, phoneVerified={}",
                request.getPage(),
                request.getSize(),
                request.getSearch(),
                request.getRole(),
                request.getEnabled(),
                request.getAccountLocked(),
                request.getEmailVerified(),
                request.getPhoneVerified()
        );

        return userRepository.findAll(specification, pageable)
                .map(adminUserMapper::toSummaryResponseDto);
    }

    @Override
    public AdminUserDetailResponseDto getUserById(
            final String userId
    ) {
        final User user = findUserById(userId);

        log.debug(
                "Admin requested user details for userId={}",
                userId
        );

        return adminUserMapper.toDetailResponseDto(user);
    }

    @Override
    @Transactional
    public AdminUserStatusResponseDto activateUser(
            final String userId
    ) {
        final User user = findUserById(userId);

        if (user.isEnabled()) {
            throw new BusinessException(
                    ErrorCode.ADMIN_USER_ALREADY_ACTIVE
            );
        }

        user.setEnabled(true);
        userRepository.save(user);

        log.info(
                "Admin activated user account: userId={}",
                userId
        );

        return buildStatusResponse(
                user,
                "User account activated successfully."
        );
    }

    @Override
    @Transactional
    public AdminUserStatusResponseDto deactivateUser(
            final String userId
    ) {
        final User user = findUserById(userId);

        if (!user.isEnabled()) {
            throw new BusinessException(
                    ErrorCode.ADMIN_USER_ALREADY_INACTIVE
            );
        }

        user.setEnabled(false);
        userRepository.save(user);

        log.info(
                "Admin deactivated user account: userId={}",
                userId
        );

        return buildStatusResponse(
                user,
                "User account deactivated successfully."
        );
    }

    @Override
    @Transactional
    public AdminUserStatusResponseDto lockUser(
            final String userId
    ) {
        final User user = findUserById(userId);

        if (user.isAccountLocked()) {
            throw new BusinessException(
                    ErrorCode.ADMIN_USER_ALREADY_LOCKED
            );
        }

        user.setAccountLocked(true);
        userRepository.save(user);

        log.info(
                "Admin locked user account: userId={}",
                userId
        );

        return buildStatusResponse(
                user,
                "User account locked successfully."
        );
    }

    @Override
    @Transactional
    public AdminUserStatusResponseDto unlockUser(
            final String userId
    ) {
        final User user = findUserById(userId);

        if (!user.isAccountLocked()) {
            throw new BusinessException(
                    ErrorCode.ADMIN_USER_ALREADY_UNLOCKED
            );
        }

        user.setAccountLocked(false);
        userRepository.save(user);

        log.info(
                "Admin unlocked user account: userId={}",
                userId
        );

        return buildStatusResponse(
                user,
                "User account unlocked successfully."
        );
    }

    private User findUserById(final String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.debug(
                            "Admin requested non-existent user: userId={}",
                            userId
                    );

                    return new BusinessException(
                            ErrorCode.ADMIN_USER_NOT_FOUND
                    );
                });
    }

    private Specification<User> buildUserSpecification(
            final AdminUserSearchRequestDto request
    ) {

        Specification<User> specification =
                (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();

        if (request.getSearch() != null
                && !request.getSearch().isBlank()) {

            final String search = "%" +
                    request.getSearch().trim().toLowerCase() +
                    "%";

            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.or(
                                    criteriaBuilder.like(
                                            criteriaBuilder.lower(
                                                    root.get("fullName")
                                            ),
                                            search
                                    ),
                                    criteriaBuilder.like(
                                            criteriaBuilder.lower(
                                                    root.get("email")
                                            ),
                                            search
                                    )
                            )
            );
        }

        if (request.getRole() != null
                && !request.getRole().isBlank()) {

            final String role = request.getRole().trim();

            specification = specification.and(
                    (root, query, criteriaBuilder) -> {

                        final var rolesJoin = root.join("roles");

                        return criteriaBuilder.equal(
                                rolesJoin.get("name"),
                                role
                        );
                    }
            );
        }

        if (request.getEnabled() != null) {

            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("enabled"),
                                    request.getEnabled()
                            )
            );
        }

        if (request.getAccountLocked() != null) {

            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("accountLocked"),
                                    request.getAccountLocked()
                            )
            );
        }

        if (request.getEmailVerified() != null) {

            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("emailVerified"),
                                    request.getEmailVerified()
                            )
            );
        }

        if (request.getPhoneVerified() != null) {

            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("phoneVerified"),
                                    request.getPhoneVerified()
                            )
            );
        }

        return specification;
    }

    private AdminUserStatusResponseDto buildStatusResponse(
            final User user,
            final String message
    ) {
        return AdminUserStatusResponseDto.builder()
                .userId(user.getId())
                .enabled(user.isEnabled())
                .accountLocked(user.isAccountLocked())
                .message(message)
                .build();
    }
}