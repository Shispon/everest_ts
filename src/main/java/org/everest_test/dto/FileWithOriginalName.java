package org.everest_test.dto;

import lombok.Data;
import org.springframework.core.io.Resource;

/**
 * ДТО для отображения оригинального имени файла
 *
 * @author Vladimir Shpakov
 * @since 12.03.2026
 */
@Data
public class FileWithOriginalName {
    private String originalName;
    private Resource resource;
}
