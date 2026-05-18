package com.aibh.controller;

import com.aibh.service.DocumentIngestionService;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/aibh/documents")
public class DocumentController {

    @Autowired(required = false)
    private VectorStore vectorStore;

    @Autowired
    private DocumentIngestionService documentIngestionService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadDocument(@RequestParam("file") MultipartFile file) throws IOException {
        if (vectorStore == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                Map.of("message", "Document training is not available because no embedding/vector provider is configured.")
            );
        }

        String filename = file.getOriginalFilename() == null ? "document" : file.getOriginalFilename();
        String content;
        try {
            content = documentIngestionService.extractText(file);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }

        List<Document> documents = List.of(new Document(content, Map.of(
            "filename", filename,
            "contentType", file.getContentType() == null ? "text/plain" : file.getContentType()
        )));
        vectorStore.add(documents);

        return ResponseEntity.ok(Map.of(
            "message", "Document indexed successfully. The assistant can now use it as project context.",
            "filename", filename
        ));
    }
}
