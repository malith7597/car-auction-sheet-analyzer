package com.auctioninsightai.api.exception;

import com.auctioninsightai.api.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

/**
 * Translates controller-level exceptions into the project {@link ApiResponse} JSON envelope so the
 * client never sees Spring's Whitelabel HTML error page or a leaked stack trace.
 *
 * <p>Unmapped paths reach this advice as {@link NoHandlerFoundException} because the application
 * sets {@code spring.mvc.throw-exception-if-no-handler-found=true} and
 * {@code spring.web.resources.add-mappings=false} (FS-001 plan Decision #4); without both flags the
 * default static-resource handler would swallow the 404 before the advice sees it.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  /** Unmapped path → 404 {@code {"success":false,"error":"Not Found","data":null}}. */
  @ExceptionHandler(NoHandlerFoundException.class)
  public ResponseEntity<ApiResponse<Object>> handleNotFound(NoHandlerFoundException ex) {
    log.warn("No handler for {} {}", ex.getHttpMethod(), ex.getRequestURL());
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Not Found"));
  }

  /** Catch-all → 500 with a generic message; the real cause is logged, never returned. */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Object>> handleUnexpected(Exception ex) {
    log.error("Unhandled exception", ex);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResponse.error("Internal Server Error"));
  }
}
