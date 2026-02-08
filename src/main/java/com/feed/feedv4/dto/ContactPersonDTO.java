package com.feed.feedv4.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactPersonDTO {
    
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String mobile;
    private String designation;
    private Integer sequence;
}