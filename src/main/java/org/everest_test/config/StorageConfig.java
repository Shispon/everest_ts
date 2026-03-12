package org.everest_test.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * TODO Class Description
 *
 * @author Vladimir Shpakov
 * @since 11.03.2026
 */
@Setter
@Getter
@Configuration
@ConfigurationProperties(prefix = "storage")
public class StorageConfig {

    private String location;
}
