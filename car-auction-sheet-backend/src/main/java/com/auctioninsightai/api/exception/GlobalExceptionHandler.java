package com.auctioninsightai.api.exception;

import com.auctioninsightai.api.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Translates exceptions into the project {@link ApiResponse} JSON envelope so the client never sees
 * Spring's Whitelabel HTML error page, a default ProblemDetail body, or a leaked stack trace.
 *
 * <p>Extends {@link ResponseEntityExceptionHandler} so the framework's standard exceptions keep
 * their correct status codes — unmapped paths stay 404 (via {@code NoHandlerFoundException}, which
 * the two MVC flags in {@code application.yml} enable), unsupported methods 405, unreadable or
 * invalid request bodies 400, and so on — instead of all collapsing to 500. The single
 * {@link #handleExceptionInternal} funnel re-wraps every framework-handled body in the project
 * envelope; the {@code Exception.class} handler remains the genuine catch-all 500 for anything the
 * framework superclass does not recognise.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @Override
  protected ResponseEntity<Object> handleExceptionInternal(
      Exception ex,
      Object body,
      HttpHeaders headers,
      HttpStatusCode statusCode,
      WebRequest request) {
    String message = reasonPhrase(statusCode);
    if (statusCode.is5xxServerError()) {
      log.error("Framework-handled server error ({})", message, ex);
    } else {
      log.warn("Framework-handled client error: {} [{}]", message, ex.getClass().getSimpleName());
    }
    return super.handleExceptionInternal(
        ex, ApiResponse.error(message), headers, statusCode, request);
  }

  /** Genuine catch-all for exceptions the framework superclass does not handle → 500. */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Object>> handleUnexpected(Exception ex) {
    log.error("Unhandled exception", ex);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResponse.error("Internal Server Error"));
  }

  private static String reasonPhrase(HttpStatusCode statusCode) {
    HttpStatus resolved = HttpStatus.resolve(statusCode.value());
    return resolved != null ? resolved.getReasonPhrase() : "Error";
  }
}
