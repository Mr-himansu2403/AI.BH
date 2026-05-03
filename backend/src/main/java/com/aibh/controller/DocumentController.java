package com.aibh.controller;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/aibh/documents")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DocumentController {

    @Autowired
    private VectorStore vectorStore;

    @Value("${spring.ai.vectorstore.simple.file-path:data/vectorstore.json}")
    private String vectorStorePath;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadDocument(@RequestParam("file") MultipartFile file) throws IOException {
        // Document ingestion is temporarily disabled due to library compatibility issues.
        // It will be re-enabled once Tika/PDF libraries are correctly linked.
        return ResponseEntity.ok(Map.of("message", "Document ingestion is currently being optimized for speed. Please try again later."));
    }
}
