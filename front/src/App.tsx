import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import axios, { AxiosProgressEvent } from 'axios';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FiDownload, FiTrash2, FiRefreshCw, FiUpload, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './App.css';

interface FileMetaDTO{
  id: number;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  mimeType: string;
}

interface UploadProgress {
  [key: string]: number;
}

type UploadStatus = 'uploading' | 'success' | 'error' | null;

const API_URL = process.env.REACT_APP_API_URL || '';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileMetaDTO[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get<FileMetaDTO[]>(`${API_URL}/api/files`);
      console.log('Получены файлы:', response.data); // Для отладки
      setFiles(response.data);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Ошибка при загрузке файлов:', error);
      alert('Ошибка при загрузке списка файлов');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      console.log('Выбраны файлы:', Array.from(selectedFiles));
      setUploadFiles(Array.from(selectedFiles));
      setUploadStatus(null);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (uploadFiles.length === 0) {
      alert('Выберите файлы для загрузки');
      return;
    }

    const formData = new FormData();

    uploadFiles.forEach(file => {
      formData.append('files', file);
    });

    setUploadStatus('uploading');
    const progressMap: UploadProgress = {};

    try {
      console.log('Загрузка файлов...');

      const response = await axios.post<FileMetaDTO[]>(`${API_URL}/api/files/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            uploadFiles.forEach(file => {
              progressMap[file.name] = percentCompleted;
            });
            setUploadProgress({...progressMap});
          }
        },
      });

      console.log('Ответ после загрузки:', response.data);

      setUploadStatus('success');
      setTimeout(() => setUploadStatus(null), 3000);
      setUploadFiles([]);
      setUploadProgress({});

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      await fetchFiles();
    } catch (error) {
      console.error('Ошибка при загрузке:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Ответ сервера:', error.response.data);
        alert(`Ошибка: ${error.response.data.message || 'Неизвестная ошибка'}`);
      } else {
        alert('Ошибка при загрузке файлов');
      }
      setUploadStatus('error');
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleDownload = async (id: number, fileName: string): Promise<void> => {
    try {
      console.log(`Скачивание файла ${id}...`);

      const response = await axios.get(`${API_URL}/api/files/download/${id}`, {
        responseType: 'blob',
      });

      // Декодируем имя файла для русских символов
      let downloadFileName = fileName;

      // Пробуем получить имя из заголовка Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches && matches[1]) {
          // Декодируем URL-кодированные русские символы
          downloadFileName = decodeURIComponent(matches[1].replace(/['"]/g, ''));
        }
      }

      console.log('Скачивание как:', downloadFileName);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при скачивании:', error);
      alert('Ошибка при скачивании файла');
    }
  };

  const handleDeleteSelected = async (): Promise<void> => {
    if (selectedFiles.length === 0) return;

    if (window.confirm(`Удалить ${selectedFiles.length} файл(ов)?`)) {
      try {
        await axios.delete(`${API_URL}/api/files`, {
          data: selectedFiles,
        });
        await fetchFiles();
      } catch (error) {
        console.error('Ошибка при удалении:', error);
        alert('Ошибка при удалении файлов');
      }
    }
  };

  const toggleFileSelection = (fileId: number): void => {
    setSelectedFiles(prev =>
        prev.includes(fileId)
            ? prev.filter(id => id !== fileId)
            : [...prev, fileId]
    );
  };

  const selectAllFiles = (): void => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(f => f.id));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) {
      return '0 Б';
    }

    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    if (i < 0 || i >= sizes.length) {
      return bytes + ' Б';
    }

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Неизвестно';
      }
      return format(date, 'dd MMMM yyyy, HH:mm', { locale: ru });
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return 'Неизвестно';
    }
  };

  // Функция для отладки (можно удалить после исправления)
  const debugFileData = (file: FileMetaDTO) => {
    console.log('Отладка файла:', {
      id: file.id,
      originalFileName: file.fileName,
      fileSize: file.fileSize,
      type: typeof file.fileSize,
      isNaN: isNaN(file.fileSize),
      uploadDate: file.uploadDate
    });
  };

  return (
      <div className="app">
        <header className="header">
          <h1>📁 Менеджер файлов</h1>
        </header>

        <main className="main">
          {/* Секция загрузки */}
          <section className="upload-section">
            <h2>Загрузка файлов</h2>
            <div className="upload-controls">
              <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="file-input"
              />
              <button
                  onClick={handleUpload}
                  disabled={uploadFiles.length === 0 || uploadStatus === 'uploading'}
                  className="upload-button"
              >
                <FiUpload /> Загрузить {uploadFiles.length > 0 && `(${uploadFiles.length})`}
              </button>
            </div>

            {uploadFiles.length > 0 && uploadStatus !== 'uploading' && (
                <div className="selected-files">
                  <h4>Выбрано файлов: {uploadFiles.length}</h4>
                  <ul>
                    {uploadFiles.map(file => (
                        <li key={file.name}>
                          {file.name} ({(file.size / 1024).toFixed(2)} КБ)
                        </li>
                    ))}
                  </ul>
                </div>
            )}

            {uploadStatus === 'uploading' && (
                <div className="upload-progress">
                  <h3>Загрузка...</h3>
                  {uploadFiles.map(file => (
                      <div key={file.name} className="progress-item">
                        <span>{file.name}</span>
                        <div className="progress-bar">
                          <div
                              className="progress-fill"
                              style={{width: `${uploadProgress[file.name] || 0}%`}}
                          />
                        </div>
                        <span>{uploadProgress[file.name] || 0}%</span>
                      </div>
                  ))}
                </div>
            )}

            {uploadStatus === 'success' && (
                <div className="status-message success">
                  <FiCheckCircle /> Файлы успешно загружены!
                </div>
            )}

            {uploadStatus === 'error' && (
                <div className="status-message error">
                  <FiXCircle /> Ошибка при загрузке файлов
                </div>
            )}
          </section>

          {/* Секция списка файлов */}
          <section className="files-section">
            <div className="files-header">
              <h2>Список файлов</h2>
              <div className="files-actions">
                <button onClick={fetchFiles} className="refresh-button" disabled={loading}>
                  <FiRefreshCw className={loading ? 'spin' : ''} /> Обновить
                </button>
                {selectedFiles.length > 0 && (
                    <button onClick={handleDeleteSelected} className="delete-button">
                      <FiTrash2 /> Удалить выбранные ({selectedFiles.length})
                    </button>
                )}
              </div>
            </div>

            {files.length === 0 ? (
                <div className="empty-state">
                  <p>Файлы не найдены</p>
                </div>
            ) : (
                <table className="files-table">
                  <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                          type="checkbox"
                          checked={selectedFiles.length === files.length && files.length > 0}
                          onChange={selectAllFiles}
                      />
                    </th>
                    <th>Имя файла</th>
                    <th style={{ width: '100px' }}>Размер</th>
                    <th style={{ width: '180px' }}>Дата загрузки</th>
                    <th style={{ width: '80px' }}>Действия</th>
                  </tr>
                  </thead>
                  <tbody>
                  {files.map(file => {
                    // Отладка для первого файла (можно удалить)
                    if (files.indexOf(file) === 0) {
                      debugFileData(file);
                    }

                    return (
                        <tr key={file.id} className={selectedFiles.includes(file.id) ? 'selected' : ''}>
                          <td>
                            <input
                                type="checkbox"
                                checked={selectedFiles.includes(file.id)}
                                onChange={() => toggleFileSelection(file.id)}
                            />
                          </td>
                          <td className="filename-cell" title={file.fileName}>
                            {file.fileName || 'Без имени'}
                          </td>
                          <td className="size-cell">
                            {formatFileSize(file.fileSize)}
                          </td>
                          <td className="date-cell">
                            {formatDate(file.uploadDate)}
                          </td>
                          <td>
                            <button
                                onClick={() => handleDownload(file.id, file.fileName)}
                                className="download-button"
                                title="Скачать"
                            >
                              <FiDownload />
                            </button>
                          </td>
                        </tr>
                    );
                  })}
                  </tbody>
                </table>
            )}
          </section>
        </main>
      </div>
  );
};

export default App;