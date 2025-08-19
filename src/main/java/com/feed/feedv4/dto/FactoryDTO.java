package com.feed.feedv4.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FactoryDTO {

    private Long id;                 // For updates / responses
    private String name;
    private String registrationNumber;
    private String address;
    private String contactNumber;
    private String email;
    private String logoUrl;          // Stored as image URL or path
}
