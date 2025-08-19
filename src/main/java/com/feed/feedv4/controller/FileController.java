package com.feed.feedv4.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/files")
public class FileController {

    // change if you want a different folder
    private static final Path UPLOAD_ROOT = Paths.get("uploads");

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file,
                                                      HttpServletRequest request) throws IOException {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file"));
        }

        Files.createDirectories(UPLOAD_ROOT);

        String original = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0) ext = original.substring(dot);

        String stored = UUID.randomUUID().toString().replace("-", "") + ext.toLowerCase();
        Path target = UPLOAD_ROOT.resolve(stored);

        // overwrite if somehow exists
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // public URL: /uploads/<stored>
        String base = getBaseUrl(request); // e.g. https://feedv4-backend.onrender.com
        String url = base + "/uploads/" + stored;

        return ResponseEntity.ok(Map.of("url", url));
    }

    private String getBaseUrl(HttpServletRequest req) {
        String scheme = req.getHeader("X-Forwarded-Proto");
        String host = req.getHeader("X-Forwarded-Host");
        if (scheme != null && host != null) return scheme + "://" + host;
        return req.getScheme() + "://" + req.getServerName() +
                ((req.getServerPort() == 80 || req.getServerPort() == 443) ? "" : ":" + req.getServerPort());
    }
}
