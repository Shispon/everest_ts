package org.everest_test.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * SWAGGER для более удобной отладки конечных точек
 *
 * @author Vladimir Shpakov
 * @since 11.03.2026
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI fileStorageOpenAPI() {

        return new OpenAPI()
                .info(new Info()
                        .title("File Storage API")
                        .description("API для загрузки и хранения файлов")
                        .version("1.0"));
    }
}
