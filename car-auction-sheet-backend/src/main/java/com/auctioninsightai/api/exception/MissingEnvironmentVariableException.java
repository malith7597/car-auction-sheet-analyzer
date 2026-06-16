package com.auctioninsightai.api.exception;

/**
 * Thrown during startup when a mandatory environment variable is absent or blank.
 *
 * <p>The message always names the missing variable so the failure is actionable at the point
 * the application refuses to start (FS-001 AC: fail fast with a named-variable error).
 */
public class MissingEnvironmentVariableException extends RuntimeException {

    private final String variableName;

    public MissingEnvironmentVariableException(String variableName) {
        super("Required environment variable is missing or blank: " + variableName);
        this.variableName = variableName;
    }

    public String getVariableName() {
        return variableName;
    }
}
