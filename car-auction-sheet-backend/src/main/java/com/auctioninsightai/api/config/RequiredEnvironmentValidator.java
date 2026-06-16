package com.auctioninsightai.api.config;

import com.auctioninsightai.api.exception.MissingEnvironmentVariableException;
import java.util.List;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;

/**
 * Validates that every mandatory environment variable is present and non-blank.
 *
 * <p>This is a plain unit (it depends only on Spring's {@link Environment} abstraction, not on a
 * running application context) so the fail-fast contract is testable without booting Spring. It is
 * invoked by {@link EnvironmentValidationPostProcessor} before the context refreshes.
 *
 * <p>The mandatory set is the full env contract established at the shell (FS-001 spec Rev 1):
 * datasource vars consumed now, plus {@code AWS_REGION} (FS-006 SQS / FS-010 S3) and the JWT key
 * pair (FS-008 auth) mandated up front so later slices add no startup-validation surprises.
 */
public class RequiredEnvironmentValidator {

    /** Mandatory variables, in validation order. Public so tests can parameterize over all six. */
    public static final List<String> REQUIRED_VARIABLES = List.of(
            "DB_URL",
            "DB_USERNAME",
            "DB_PASSWORD",
            "AWS_REGION",
            "JWT_PRIVATE_KEY",
            "JWT_PUBLIC_KEY");

    /**
     * Throws {@link MissingEnvironmentVariableException} naming the first variable that is absent
     * or blank. Returns normally when all required variables are present.
     *
     * @param environment the Spring environment to read variables from
     */
    public void validate(Environment environment) {
        for (String name : REQUIRED_VARIABLES) {
            String value = environment.getProperty(name);
            if (!StringUtils.hasText(value)) {
                throw new MissingEnvironmentVariableException(name);
            }
        }
    }
}
