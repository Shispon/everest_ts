package org.everest_test.service.storage;


import org.everest_test.config.StorageConfig;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Основная логика работы файла и хранилища
 *
 * @author Vladimir Shpakov
 * @since 10.03.2026
 */
@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path root;

    public FileStorageServiceImpl(StorageConfig config) {

        root = Paths.get(config.getLocation());

        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String save(MultipartFile file) {

        String uuid = UUID.randomUUID().toString();
        String storedName = uuid + "_" + file.getOriginalFilename();

        Path destination = root.resolve(storedName);

        try {
            Files.copy(file.getInputStream(), destination);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return storedName;
    }

    @Override
    public Resource load(String filename) {
        try {

            Path file = root.resolve(filename);

            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            }

            throw new RuntimeException("Файл не найден");

        } catch (MalformedURLException e) {
            throw new RuntimeException("Ошибка загрузки файла", e);
        }
    }

    @Override
    public void delete(String filename) {
        try {

            Path file = root.resolve(filename);

            Files.deleteIfExists(file);

        } catch (IOException e) {
            throw new RuntimeException("Ошибка удаления файла", e);
        }
    }


}
