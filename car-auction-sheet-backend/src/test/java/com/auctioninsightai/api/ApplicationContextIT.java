package com.auctioninsightai.api;

import org.junit.jupiter.api.Test;

/** Verifies the application context loads and the app starts against a real Postgres (AC#1). */
class ApplicationContextIT extends AbstractIntegrationTest {

  @Test
  void contextLoads() {
    // Success is the context refreshing without error; no assertion needed.
  }
}
