package org.everest_test.service;

import org.everest_test.dto.FileWithOriginalName;
import org.springframework.core.io.Resource;
import org.everest_test.dto.FileMetaDTO;
import org.everest_test.entity.FileMetadata;
import org.everest_test.mapper.FileMapper;
import org.everest_test.repository.FileMetadataRepository;
import org.everest_test.service.storage.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Основная бизнес логика работы приложения
 *
 * @author Vladimir Shpakov
 * @since 10.03.2026
 */
@Service
public class FileServiceImpl implements FileService {

    private final FileMetadataRepository repository;
    private final FileStorageService storageService;

    public FileServiceImpl(FileMetadataRepository repository,
                           FileStorageService storageService) {
        this.repository = repository;
        this.storageService = storageService;
    }

    @Override
    public List<FileMetaDTO> getAllFiles() {

        return repository.findAll()
                .stream()
                .map(FileMapper::toDto)
                .toList();
    }

    @Override
    public List<FileMetaDTO> uploadFiles(MultipartFile[] files) {

        List<FileMetaDTO> result = new ArrayList<>();

        for (MultipartFile file : files) {

            String storedName = storageService.save(file);

            FileMetadata meta = new FileMetadata();
            meta.setOriginalFileName(file.getOriginalFilename());
            meta.setStoredFileName(storedName);
            meta.setFileSize(file.getSize());
            meta.setMimeType(file.getContentType());
            meta.setUploadDate(LocalDateTime.now());

            repository.save(meta);

            result.add(FileMapper.toDto(meta));
        }

        return result;
    }

    @Override
    public FileWithOriginalName downloadFile(Long id) {

        FileMetadata meta = repository.findById(id)
                .orElseThrow();
        FileWithOriginalName fileWithOriginalName = new FileWithOriginalName();
        fileWithOriginalName.setOriginalName(meta.getOriginalFileName());
        fileWithOriginalName.setResource(storageService.load(meta.getStoredFileName()));

        return fileWithOriginalName;
    }

    @Override
    public void deleteFiles(List<Long> ids) {

        for (Long id : ids) {

            repository.findById(id).ifPresent(meta -> {

                storageService.delete(meta.getStoredFileName());

                repository.delete(meta);
            });
        }
    }

}
