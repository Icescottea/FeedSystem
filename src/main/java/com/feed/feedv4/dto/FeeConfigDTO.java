package com.feed.feedv4.dto;

import lombok.Data;

@Data
public class FeeConfigDTO {
  private Long customerId;
  private String formulationFeeType; // per_batch / per_kg
  private Double formulationFee;
  private String pelletingFeeType;   // fixed / per_kg / percentage
  private Double pelletingFee;
  private Double rmMarkupPercent;
  private Double systemFeePercent;
  private Boolean active;
}

