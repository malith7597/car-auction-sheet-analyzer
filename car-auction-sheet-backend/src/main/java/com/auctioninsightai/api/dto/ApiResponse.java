package com.auctioninsightai.api.dto;

/**
 * The project-wide API response envelope: {@code {success, error, data}}.
 *
 * <p>Every API response — success or failure — is wrapped in this record (backend CLAUDE.md Key
 * Patterns; FS-001 spec Rev 1). It is immutable per the coding-style immutability rule. Jackson
 * serializes the components in declaration order, so a failure renders as
 * {@code {"success":false,"error":"…","data":null}}.
 *
 * @param <T> the payload type on success
 */
public record ApiResponse<T>(boolean success, String error, T data) {

    /** Success envelope carrying a payload and no error. */
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, null, data);
    }

    /** Failure envelope carrying an error message and no payload. */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
