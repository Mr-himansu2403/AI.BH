package com.aibh.service;

import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;

@Service
public class DocumentIngestionService {

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
    private static final Set<String> SUPPORTED_EXTENSIONS = Set.of(
        "txt", "md", "json", "csv", "pdf", "doc", "docx"
    );

    private final Tika tika = new Tika();

    public String extractText(MultipartFile file) throws IOException {
        validate(file);

        String extension = getExtension(file.getOriginalFilename());
        if (Set.of("txt", "md", "json", "csv").contains(extension)) {
            return new String(file.getBytes(), StandardCharsets.UTF_8).trim();
        }

        try {
            String content = tika.parseToString(file.getInputStream()).trim();
            if (!StringUtils.hasText(content)) {
                throw new IllegalArgumentException("The uploaded file has no readable text content.");
            }
            return content;
        } catch (org.apache.tika.exception.TikaException e) {
            throw new IOException("Failed to parse document content", e);
        }
    }

    public String supportedTypesMessage() {
        return "Supported document types: .txt, .md, .json, .csv, .pdf, .doc, .docx";
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please upload a non-empty file.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File size must be 10MB or less.");
        }

        if (!isSupported(file)) {
            throw new IllegalArgumentException(supportedTypesMessage());
        }
    }

    private boolean isSupported(MultipartFile file) {
        return SUPPORTED_EXTENSIONS.contains(getExtension(file.getOriginalFilename()));
    }

    private String getExtension(String filename) {
        if (!StringUtils.hasText(filename) || !filename.contains(".")) {
            return "";
        }

        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
