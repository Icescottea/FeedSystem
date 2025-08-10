package com.feed.feedv4.dto;

import com.feed.feedv4.model.ChargesConfig;

public class FeeConfigDTO {

    private String pelletingFeeType; // "PER_KG" or "PERCENTAGE"
    private Double pelletingFee;

    private String formulationFeeType; // "PER_KG" or "PERCENTAGE"
    private Double formulationFee;

    private Double systemFeePercent; // Always percentage

    public FeeConfigDTO() {}

    public FeeConfigDTO(ChargesConfig config) {
        this.pelletingFeeType = config.getPelletingFeeType().name();
        this.pelletingFee = config.getPelletingFee();
        this.formulationFeeType = config.getFormulationFeeType().name();
        this.formulationFee = config.getFormulationFee();
        this.systemFeePercent = config.getSystemFeePercent();
    }

    public String getPelletingFeeType() {
        return pelletingFeeType;
    }

    public void setPelletingFeeType(String pelletingFeeType) {
        this.pelletingFeeType = pelletingFeeType;
    }

    public Double getPelletingFee() {
        return pelletingFee;
    }

    public void setPelletingFee(Double pelletingFee) {
        this.pelletingFee = pelletingFee;
    }

    public String getFormulationFeeType() {
        return formulationFeeType;
    }

    public void setFormulationFeeType(String formulationFeeType) {
        this.formulationFeeType = formulationFeeType;
    }

    public Double getFormulationFee() {
        return formulationFee;
    }

    public void setFormulationFee(Double formulationFee) {
        this.formulationFee = formulationFee;
    }

    public Double getSystemFeePercent() {
        return systemFeePercent;
    }

    public void setSystemFeePercent(Double systemFeePercent) {
        this.systemFeePercent = systemFeePercent;
    }
}
