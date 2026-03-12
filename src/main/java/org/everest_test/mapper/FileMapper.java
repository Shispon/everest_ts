package org.everest_test.mapper;

import org.everest_test.dto.FileMetaDTO;
import org.everest_test.entity.FileMetadata;

/**
 * Маппер для удобства работы с ДТО и сущностью
 *
 * @author Vladimir Shpakov
 * @since 10.03.2026
 */
public class FileMapper {
    public static FileMetaDTO toDto(FileMetadata entity) {

        FileMetaDTO dto = new FileMetaDTO();

        dto.setId(entity.getId());
        dto.setFileName(entity.getOriginalFileName());
        dto.setFileSize(entity.getFileSize());
        dto.setUploadDate(entity.getUploadDate());
        dto.setMimeType(entity.getMimeType());

        return dto;
    }
}
