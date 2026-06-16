package com.auctioninsightai.api.config;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.auctioninsightai.api.exception.MissingEnvironmentVariableException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.mock.env.MockEnvironment;

class RequiredEnvironmentValidatorTest {

  private final RequiredEnvironmentValidator validator = new RequiredEnvironmentValidator();

  private static MockEnvironment environmentWithAllVars() {
    MockEnvironment env = new MockEnvironment();
    RequiredEnvironmentValidator.REQUIRED_VARIABLES.forEach(name -> env.setProperty(name, "value"));
    return env;
  }

  static List<String> requiredVariables() {
    return RequiredEnvironmentValidator.REQUIRED_VARIABLES;
  }

  @Test
  void passesWhenAllRequiredVariablesPresent() {
    assertThatCode(() -> validator.validate(environmentWithAllVars())).doesNotThrowAnyException();
  }

  @ParameterizedTest
  @MethodSource("requiredVariables")
  void throwsNamingTheMissingVariable(String missing) {
    MockEnvironment env = environmentWithAllVars();
    env.setProperty(missing, "");

    assertThatThrownBy(() -> validator.validate(env))
        .isInstanceOf(MissingEnvironmentVariableException.class)
        .hasMessageContaining(missing);
  }
}
