package com.auctioninsightai.api.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;

/**
 * Runs {@link RequiredEnvironmentValidator} before the application context refreshes, so a missing
 * mandatory environment variable aborts startup early with a named-variable error.
 *
 * <p>Registered via {@code META-INF/spring.factories}. {@link EnvironmentPostProcessor}s execute
 * during environment preparation — before bean creation — which is exactly the fail-fast window
 * the FS-001 contract requires.
 */
public class EnvironmentValidationPostProcessor implements EnvironmentPostProcessor {

    private final RequiredEnvironmentValidator validator = new RequiredEnvironmentValidator();

    @Override
    public void postProcessEnvironment(
            ConfigurableEnvironment environment, SpringApplication application) {
        validator.validate(environment);
    }
}
