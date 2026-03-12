package org.everest_test.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.everest_test.dto.FileWithOriginalName;
import org.springframework.core.io.Resource;
import org.everest_test.dto.FileMetaDTO;
import org.everest_test.service.FileService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Контроллер, где описаны конечные точки из ТЗ
 *
 * @author Vladimir Shpakov
 * @since 10.03.2026
 */
@RestController
@RequestMapping("/api/files")
@Tag(name = "Файлы", description = "API для управления файлами")
public class FileController {

    private final FileService service;

    public FileController(FileService service) {
        this.service = service;
    }

    @Operation(summary = "Получить список файлов")
    @GetMapping
    public List<FileMetaDTO> getFiles() {
        return service.getAllFiles();
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Загрузить файлы")
    public ResponseEntity<List<FileMetaDTO>> upload(@RequestPart("files") MultipartFile[] files) {

        List<FileMetaDTO> result = service.uploadFiles(files);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(result);
    }

    @Operation(summary = "Скачать файл")
    @GetMapping(value = "/download/{id}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<Resource> download(@PathVariable Long id) {

        FileWithOriginalName file = service.downloadFile(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.getOriginalName() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file.getResource());
    }

    @Operation(summary = "Удалить файлы")
    @DeleteMapping
    public void delete(@RequestBody List<Long> ids) {
        service.deleteFiles(ids);
    }
}