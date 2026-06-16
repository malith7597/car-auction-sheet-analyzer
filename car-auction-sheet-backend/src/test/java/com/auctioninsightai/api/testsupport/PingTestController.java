package com.auctioninsightai.api.testsupport;

import com.auctioninsightai.api.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Test-only controller (component-scanned under the base package) exposing a single GET route, so
 * integration tests can exercise the framework's 4xx handling — e.g. a POST to it yields a 405 that
 * must flow through {@code GlobalExceptionHandler} as the project envelope. No production route.
 */
@RestController
public class PingTestController {

  /**
   * Returns a trivial success envelope on GET.
   *
   * @return an OK {@link ApiResponse}
   */
  @GetMapping("/test-ping")
  public ApiResponse<String> ping() {
    return ApiResponse.ok("pong");
  }
}
