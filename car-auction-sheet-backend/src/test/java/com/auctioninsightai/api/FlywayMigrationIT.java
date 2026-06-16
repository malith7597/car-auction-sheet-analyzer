package com.auctioninsightai.api;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

/** Verifies Flyway ran on startup (AC#5): its history table exists and no migration failed. */
class FlywayMigrationIT extends AbstractIntegrationTest {

  @Autowired private JdbcTemplate jdbcTemplate;

  @Test
  void flywaySchemaHistoryTableExists() {
    Integer tableCount =
        jdbcTemplate.queryForObject(
            "SELECT count(*) FROM information_schema.tables "
                + "WHERE table_name = 'flyway_schema_history'",
            Integer.class);

    assertThat(tableCount).isEqualTo(1);
  }

  @Test
  void noMigrationFailed() {
    Integer failedCount =
        jdbcTemplate.queryForObject(
            "SELECT count(*) FROM flyway_schema_history WHERE success = false", Integer.class);

    assertThat(failedCount).isZero();
  }
}
