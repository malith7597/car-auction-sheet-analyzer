package com.auctioninsightai.api;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/** Verifies an unmapped path returns the JSON project envelope, not the Whitelabel page (AC#6). */
class GlobalExceptionHandlerIT extends AbstractIntegrationTest {

  @Autowired private TestRestTemplate restTemplate;

  @Test
  void unmappedPathReturnsJsonNotFoundEnvelope() {
    ResponseEntity<String> response =
        restTemplate.getForEntity("/no-such-endpoint", String.class);

    String expected = "{\"success\":false,\"error\":\"Not Found\",\"data\":null}";
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    assertThat(response.getBody()).isEqualTo(expected);
  }
}
