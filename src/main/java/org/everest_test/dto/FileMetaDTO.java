package org.everest_test.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * ДТО для работы с метой файла
 *
 * @author Vladimir Shpakov
 * @since 10.03.2026
 */
@Setter
@Getter
public class FileMetaDTO {
    private Long id;
    private String fileName;
    private Long fileSize;
    private LocalDateTime uploadDate;
    private String mimeType;
}
