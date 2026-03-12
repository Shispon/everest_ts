package org.everest_test.repository;

import org.everest_test.entity.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Репозиторий - автоматически фрмирует с помощью Hibernate базовые запросы или запросы по синтаксису.
 * Также можно форировать запросы по нужде
 *
 * @author Vladimir Shpakov
 * @since 10.03.2026
 */
@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, Long> {
}