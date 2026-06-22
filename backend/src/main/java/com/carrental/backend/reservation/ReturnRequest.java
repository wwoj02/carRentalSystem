package com.carrental.backend.reservation;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReturnRequest {
    private String returnNotes;
    private String damageNotes;
    private Double extraCharges;
}
