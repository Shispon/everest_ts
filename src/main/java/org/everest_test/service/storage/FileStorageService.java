package org.everest_test.service.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/**
 * Прослойка над сервисом
 *
 * @author Vladimir Shpakov
 * @since 10.03.2026
 */
public interface FileStorageService {

    String save(MultipartFile file);

    Resource load(String filename);

    void delete(String filename);

}
