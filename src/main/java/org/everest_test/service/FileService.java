package org.everest_test.service;

import org.everest_test.dto.FileWithOriginalName;
import org.springframework.core.io.Resource;
import org.everest_test.dto.FileMetaDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Прослойка над сервисом
 *
 * @author Vladimir Shpakov
 * @since 10.03.2026
 */
public interface FileService {

    List<FileMetaDTO> getAllFiles();

    List<FileMetaDTO> uploadFiles(MultipartFile[] files);

    FileWithOriginalName downloadFile(Long id);

    void deleteFiles(List<Long> ids);


}
