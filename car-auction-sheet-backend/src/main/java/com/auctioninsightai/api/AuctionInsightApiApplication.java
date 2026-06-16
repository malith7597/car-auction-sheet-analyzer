package com.auctioninsightai.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Application entry point for the AuctionInsightAI Spring Boot API.
 *
 * <p>This is the app shell (FS-001): a runnable Spring Boot 3 / Java 21 service exposing a public
 * health endpoint, fail-fast environment validation, Flyway migration tooling, and a
 * structured-JSON global exception handler. Feature slices (auth, GraphQL, WebSocket, credits)
 * build on this substrate.
 */
@SpringBootApplication
public class AuctionInsightApiApplication {

  /**
   * Boots the Spring application context.
   *
   * @param args command-line arguments passed through to Spring Boot
   */
  public static void main(String[] args) {
    SpringApplication.run(AuctionInsightApiApplication.class, args);
  }
}
